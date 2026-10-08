import { makeScene2D, Rect, Txt, Layout, Circle } from "@revideo/2d";
import {
  createRef,
  all,
  waitFor,
  easeInOutCubic,
} from "@revideo/core";

export default makeScene2D("scene", function* (view) {
  view.fill("#1a1423");

  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const dot = createRef<Circle>();

  view.add(
    <Rect width={1280} height={720} fill={"#1a1423"}>
      <Layout direction={"column"} alignItems={"center"} gap={28}>
        <Txt
          ref={title}
          text={"Revideo"}
          fontSize={110}
          fontWeight={800}
          fill={"#ffd166"}
          opacity={0}
          y={40}
        />
        <Txt
          ref={subtitle}
          text={"Create Videos with Code"}
          fontSize={34}
          fill={"#f0f0f0"}
          opacity={0}
        />
        <Circle ref={dot} size={26} fill={"#ef476f"} opacity={0} />
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
    yield* dot().fill("#ef476f", 0.25).to("#06d6a0", 0.25);
  }
  yield* waitFor(0.4);
});
