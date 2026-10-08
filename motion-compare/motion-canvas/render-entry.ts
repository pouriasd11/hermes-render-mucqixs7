// Headless render entry for Motion Canvas.
//
// Motion Canvas has no official CLI renderer (the editor is the supported
// path). This entry imports the bootstrapped project via the vite plugin's
// `?project` virtual module and drives the public `Renderer` API with a
// custom Exporter that hands every frame to the Playwright harness through
// window.__capture.
import { Renderer, Vector2 } from "@motion-canvas/core";
import project from "./src/project.ts?project";

declare global {
  interface Window {
    __ready: boolean;
    __done: boolean;
    __error: string | null;
    __capture: (frame: number, dataUrl: string) => void;
  }
}

async function main() {
  window.__ready = false;
  window.__done = false;
  window.__error = null;

  const meta = (project as any).meta;
  meta.rendering.exporter.exporters.push({
    id: "capture/png",
    create: async () => ({
      start: async () => {},
      handleFrame: async (
        canvas: HTMLCanvasElement,
        frame: number,
      ): Promise<void> => {
        window.__capture(frame, canvas.toDataURL("image/png"));
      },
      stop: async () => {},
    }),
  });

  const renderer = new Renderer(project as any);
  await renderer.render({
    name: "motion-canvas-sample",
    range: [0, Infinity],
    fps: 30,
    size: new Vector2(1280, 720),
    resolutionScale: 1,
    exporter: { name: "capture/png", options: {} },
  });

  window.__done = true;
}

main().catch((err) => {
  window.__error = err?.stack ?? String(err);
  window.__done = true;
});
