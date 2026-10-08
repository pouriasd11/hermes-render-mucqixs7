import { makeScene2D, Rect, Txt } from "@revideo/2d";
import { createRef, waitFor } from "@revideo/core";

export default makeScene2D("minimal", function* (view) {
  view.fill("#101820");
  const box = createRef<Rect>();
  view.add(
    <Rect ref={box} width={400} height={200} fill={"#ffd166"} />,
  );
  yield* box().scale(1.5, 1).to(1, 1);
  yield* waitFor(0.5);
});
