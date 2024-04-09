require('dotenv').config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import { getVideoScript, getImagePromptFromScript } from './ai/llm';
import { generateAudio } from './ai/text-to-speech';
import { dalleGenerate } from './ai/sdxl';
import { deleteLocalFile, uploadFileToBucket, uploadToBucketAndDeleteLocalFile } from './storage/bucket';
import { writeFile } from 'fs/promises';
import { getWordTimestamps } from './ai/transcription';
import axios from 'axios';
import express from 'express';
import { createWriteStream } from 'fs';
import { globals } from './globals';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/receive-video', async (req, res) => {
  const { jobId, status, downloadLink, error } = req.body;
  
    if (status === 'error') {
      console.error(`Error with job ${jobId}:`, error);
      res.status(200).send("Acknowledged error.");

      io.to(jobId).emit('videoExportDone', { 
        status: status, 
        message: error 
      });

    } else if (status === 'success') {
      res.status(200).send("Acknowledged success.");

      try {
        const response = await axios({
          method: 'get',
          url: downloadLink,
          responseType: 'stream'
        });
  
        const outputPath = `./${jobId}.mp4`;
        const writer = createWriteStream(outputPath);
  
        response.data.pipe(writer);
  
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
  
        console.log(`Video file downloaded as ${outputPath}`);
  
        const bucketPath = `result-${jobId}.mp4`; 
        await uploadToBucketAndDeleteLocalFile(outputPath, bucketPath);
  
        console.log(`Video file uploaded to bucket at ${bucketPath}`);
  
        io.to(jobId).emit('videoExportDone', { 
          status: status, 
          downloadLink: downloadLink 
        });
  
      } catch (err: any) {
        console.error('Error processing video file:', err);
        io.to(jobId).emit('videoExportDone', { 
          status: 'error', 
          message: err.message 
        });
      }
  
    } else {
      console.error(`Unknown status for job ${jobId}`);
      res.status(400).send('Unknown status received.');
    }
});


const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Be sure to restrict the origin in production
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('startTask', async (data) => {
      const prompt = data.textInput;
      const jobId = data.jobId;
      const voiceName = "Sarah";

      const script = await getVideoScript(prompt);
      console.log("script", script);
      
      await generateAudio(script, voiceName, `${jobId}-audio.wav`);
      await uploadFileToBucket(`${jobId}-audio.wav`, `${jobId}/audio.wav`);
      const words = await getWordTimestamps(`${jobId}-audio.wav`);
      await deleteLocalFile(`${jobId}-audio.wav`);
      
      const imagePromises = Array.from({ length: 5 }).map(async (_, index) => {
        const imagePrompt = await getImagePromptFromScript(script);
        const imageFileName = `${jobId}-image-${index}.png`;
        await dalleGenerate(imagePrompt, imageFileName);
        await uploadToBucketAndDeleteLocalFile(imageFileName, `${jobId}/image-${index}.png`);
        return `https://${globals.bucket.name}.s3.amazonaws.com/${jobId}/image-${index}.png`; // Return the file path after upload
      });

      const imageFileNames = await Promise.all(imagePromises);
  
      const metadata = {
        audioUrl: `https://${globals.bucket.name}.s3.amazonaws.com/${jobId}/audio.wav`,
        images: imageFileNames,
        words: words
      };
    
      const metadataContent = JSON.stringify(metadata);
      await writeFile(`${jobId}-metadata.json`, metadataContent);
      await uploadToBucketAndDeleteLocalFile(`${jobId}-metadata.json`, `${jobId}/metadata.json`);
      console.log("uploaded metadata");

      socket.emit('taskCompleted', { 
        status: `success`,
        jobId: jobId,
        })
    });

    socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('exportVideo', async (metadata) => {

    try {
      const response = await axios.post(`${globals.revideoServer.host}:${globals.revideoServer.port}/render`, {
        variables: metadata,
        callbackUrl: `${globals.expressServer.host}:${globals.expressServer.port}/receive-video`
      });

      socket.join(response.data.jobId); // Join a room for the jobId to communicate with this client specifically
  
    } catch (error) {
      console.error('Error sending render request:', error);
    }
  });

});

httpServer.listen(globals.socketServer.port, () => {
  console.log(`WebSocket server listening on port ${globals.socketServer.port}`);
});

app.listen(globals.expressServer.port, () => {
    console.log(`Express server running on port ${globals.expressServer.port}`);
});