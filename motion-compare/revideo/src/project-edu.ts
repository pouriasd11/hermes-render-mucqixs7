import { makeProject } from "@revideo/core";
import scene from "./scenes/edu?scene";

export default makeProject({
  scenes: [scene],
  settings: {
    shared: { size: { x: 1280, y: 720 } },
  },
});
