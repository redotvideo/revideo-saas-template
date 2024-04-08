import * as AWS from "aws-sdk";
import * as fs from "fs";
import { unlink } from 'fs/promises';

const s3 = new AWS.S3();

export async function uploadFileToBucket(localPath: string, destinationPath: string) {
	const fileContent = await fs.promises.readFile(localPath);

	const params = {
		Bucket: "revideo-example-assets",
		Key: destinationPath,
		Body: fileContent,
	};

	try {
		const data = await s3.upload(params).promise();
		console.log(`File uploaded successfully. ${data.Location}`);
	} catch (err) {
		console.error("Error uploading file: ", err);
	}
}

export async function deleteLocalFile(localPath: string) {
	try {
	  await unlink(localPath);
	  console.log(`Local file deleted: ${localPath}`);
	} catch (error) {
	  console.error(`Error deleting local file: ${localPath}`, error);
	  throw error;
	}
  }
  
  // Now, update the uploadToBucketAndDeleteLocalFile function to use deleteLocalFile
  export async function uploadToBucketAndDeleteLocalFile(localPath: string, destinationPath: string) {
	try {
	  await uploadFileToBucket(localPath, destinationPath);
	  console.log(`File uploaded to bucket at ${destinationPath}`);
	  await deleteLocalFile(localPath); // Use the new deleteLocalFile function
	} catch (error) {
	  console.error('Error uploading to bucket or deleting local file:', error);
	  throw error;
	}
  }
  