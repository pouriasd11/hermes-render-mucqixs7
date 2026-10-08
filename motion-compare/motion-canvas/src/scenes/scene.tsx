import { makeScene2D, Rect, Txt, Layout, Circle } from "@motion-canvas/2d";
import {
  createRef,
  all,
  waitFor,
  easeInOutCubic,
  tween,
  Vector2,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  view.fill("#0d1b2a");

  const bg = createRef<Rect>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const dot = createRef<Circle>();

  view.add(
    <Rect ref={bg} width={1280} height={720} fill={"#0d1b2a"}>
      <Layout direction={"column"} alignItems={"center"} gap={28}>
        <Txt
          ref={title}
          text={"Motion Canvas"}
          fontSize={110}
          fontWeight={800}
          fill={"#4cc9f0"}
          opacity={0}
          y={40}
        />
        <Txt
          ref={subtitle}
          text={"Visualize Your Ideas With Code"}
          fontSize={34}
          fill={"#e0e0e0"}
          opacity={0}
        />
        <Circle ref={dot} size={26} fill={"#f72585"} opacity={0} />
      </Layout>
    </Rect>,
  );

  yield* all(
    title().opacity(1, 0.6, easeInOutCubic),
    title().y(0, 0.6, easeInOutCubic),
  );
  yield* subtitle().opacity(1, 0.5);
  yield* dot().opacity(1, 0.3);
  yield* dot().scale(1.8, 0.3).to(1, 0.3);

  for (let i = 0; i < 2; i++) {
    yield* dot().fill("#f72585", 0.25).to("#4895ef", 0.25);
  }
  yield* waitFor(0.4);
});
