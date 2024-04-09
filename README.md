# Revideo Saas Template 💻

The Revideo Saas template demonstrates how you can build web-based video apps with Revideo. This example application lets users generate Youtube Shorts from a text description.

https://github.com/redotvideo/revideo-saas-template/assets/122226645/cf09941c-faa6-414b-bfb2-a22017ba15b2

<br/>

## Project Structure

The Saas Template consists of three main components:

### `/ui`: 
This folder contains the frontend code of our project, built as a NextJS project with the [NextJS App Router](https://nextjs.org/docs/app). It lets users define inputs such as a description of the video and communicates with the backend in `/websocket-server` to trigger actions such as the final export of the video.

Notably, the UI also uses the `@revideo/player` package to let users preview the video and make edits before exporting the video.


### `/revideo`:

This folder contains a revideo project that defines a template for Youtube Shorts. The template accepts the following variables:

- a list of background images (we use Dall-E generated images)
- an audio file containing a voiceover
- timestamps for each word in the voiceover to display subtitles

A web endpoint for rendering is exposed by running `npx revideo serve --projectFile vite.config.ts`.

### `/websocket-server`: 
This folder contains the main backend logic of our project. It has two main functionalities:

- When a user submits a description of their Youtube Short, the backend uses several AI services to generate assets (e.g. it writes a script with GPT-4 and generates background images with Dall-E). These assets are uploaded to an AWS bucket, as well as a json file containing the variables of the revideo project.
- When a user triggers a video export, the server redirects this request to the revideo service and uploads the finished video to the AWS bucket.

<br/>

## Getting Started

To run the project locally, execute the following commands:

### in `/ui`:
```
npm install
npm run dev
```

You can now view and edit an example video by visiting `localhost:3000/edit/191d7f6c-fefd-4045-96b5-718c73433a90`. To create and edit your own videos, you also have to set up your backend in `/websocket-server` and `/revideo`.


### in `/revideo`:
```
npm install
npx revideo serve --projectFile vite.config.ts
```

Note that this folder contains a normal revideo project. You can also simply open the editor by running `npm start`.


### in `/websocket-server`:

Create a public AWS bucket, add its name in `/websocket-server/src/globals.ts` and set up your keys in `/websocket-server/.env`.

```
OPENAI_API_KEY=<your-openai-key>
ELEVEN_API_KEY=<your-elevenlabs-key>
DEEPGRAM_API_KEY=<your-deepgram-key>

AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
```

Now, start the server:

```
npm install
npm run dev
```
