require('dotenv').config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import { getVideoScript, getImagePromptFromScript } from './ai/llm';
import { v4 as uuidv4 } from 'uuid';
import { generateAudio } from './ai/text-to-speech';
import { dalleGenerate } from './ai/sdxl';
import { uploadFileToBucket } from './storage/bucket';
import { writeFile } from 'fs/promises';
import { getWordTimestamps } from './ai/transcription'

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
      console.log("done with audio");
      
    // Generate and upload 5 images concurrently and collect the filenames
      const imagePromises = Array.from({ length: 5 }).map(async (_, index) => {
        const imagePrompt = await getImagePromptFromScript(script);
        const imageFileName = `${jobId}-image-${index}.png`;
        await dalleGenerate(imagePrompt, imageFileName);
        await uploadFileToBucket(imageFileName, `${jobId}/image-${index}.png`);
        return `https://revideo-example-assets.s3.amazonaws.com/${jobId}/image-${index}.png`; // Return the file path after upload
      });

      const words = await getWordTimestamps(`${jobId}-audio.wav`);
      const imageFileNames = await Promise.all(imagePromises);
  
  
      const metadata = {
        audioUrl: `https://revideo-example-assets.s3.amazonaws.com/${jobId}/audio.wav`,
        images: imageFileNames,
        words: words
      };
    
      const metadataContent = JSON.stringify(metadata);
      await writeFile(`${jobId}-metadata.json`, metadataContent);
      await uploadFileToBucket(`${jobId}-metadata.json`, `${jobId}/metadata.json`);
      console.log("uploaded metadata");

      socket.emit('taskCompleted', { 
        status: `success`,
        jobId: jobId,
        })
    });

    socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Add more event listeners as needed
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});