import { defineConfig } from "vite";
import motionCanvasModule from "@motion-canvas/vite-plugin";
import ffmpegModule from "@motion-canvas/ffmpeg";

// CJS interop: these packages are CommonJS with a `default` export.
const motionCanvas: any = (motionCanvasModule as any).default ?? motionCanvasModule;
const ffmpeg: any = (ffmpegModule as any).default ?? ffmpegModule;

export default defineConfig({
  plugins: [motionCanvas(), ffmpeg()],
});
