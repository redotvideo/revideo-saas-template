import {defineConfig} from 'vite';
import motionCanvas from '@revideo/vite-plugin';
import ffmpeg from '@revideo/ffmpeg';
import { rendererPlugin } from '@revideo/renderer';

export default defineConfig({
  plugins: [
    motionCanvas(),
    ffmpeg(),
    rendererPlugin(),
  ],
});
