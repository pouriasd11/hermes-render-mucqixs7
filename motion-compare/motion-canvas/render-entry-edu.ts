import { Renderer, Vector2 } from "@motion-canvas/core";
import project from "./src/project-edu.ts?project";

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
    name: "motion-canvas-edu",
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
