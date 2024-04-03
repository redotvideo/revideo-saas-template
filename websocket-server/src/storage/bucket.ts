import * as AWS from "aws-sdk";
import * as fs from "fs";

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
