# Revideo Saas Template

The Revideo Saas template demonstrates how you can build web-based video apps with Revideo. This example application lets users generate Youtube Shorts from a description and make some edits before exporting them to mp4.

The Saas Template consists of three main components:

- `/revideo`: Defines the video template using Revideo
- `/ui`: Frontend with video preview & editing functionality, built with the [NextJS App Router](https://nextjs.org/docs/app)
- `/websocket-server`: Backend logic for generating AI assets such as text-to-speech APIs and image generators, and storing them in an AWS bucket


## Get Started

#### in `/ui`:
```
npm install
npm run dev
```

#### in `/websocket-server`:
```
npm install
npm run dev
```

To preview and edit an example video, head to `localhost:3000/edit/191d7f6c-fefd-4045-96b5-718c73433a90`. If you want to generate your own videos, set up the following environment variables to use AI services for generating assets and an AWS bucket for storing assets in `/websocket-server/.env`:

```
OPENAI_API_KEY=<your-key>
ELEVEN_API_KEY=<your-key>
DEEPGRAM_API_KEY=<your-key>

AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-key>
```
