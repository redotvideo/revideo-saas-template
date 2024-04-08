import {defineConfig} from 'vite';
import motionCanvas from '@revideo/vite-plugin';
import ffmpeg from '@revideo/ffmpeg';

export default defineConfig({
  plugins: [
    motionCanvas(),
    ffmpeg()
  ],
});
