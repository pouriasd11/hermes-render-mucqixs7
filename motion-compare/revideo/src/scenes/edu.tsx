import { makeScene2D, Rect, Line, Txt } from "@revideo/2d";
import { createRef, all, waitFor, easeInOutCubic, Vector2 } from "@revideo/core";

// Identical educational scenario - Motion Canvas.
const BG = "#0B1020";
const COL_A = "#4CC9F0";
const COL_B = "#F72585";
const COL_C = "#06D6A0";
const TRI = "#FFD166";
const TXT = "#E6EDF3";
const MUTED = "#9FB3C8";

const v = (x: number, y: number) => new Vector2(x - 640, y - 360);

const P_C = v(560, 470);
const P_A = v(560, 350);
const P_B = v(720, 470);

export default makeScene2D("edu", function* (view) {
  view.fill(BG);

  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();

  const sqA = createRef<Rect>();
  const sqB = createRef<Rect>();
  const sqC = createRef<Rect>();

  const edgeA = createRef<Line>();
  const edgeB = createRef<Line>();
  const edgeC = createRef<Line>();
  const rightAngle = createRef<Line>();

  const labA = createRef<Txt>();
  const labB = createRef<Txt>();
  const labC = createRef<Txt>();

  const areaA = createRef<Txt>();
  const areaB = createRef<Txt>();
  const areaC = createRef<Txt>();

  const eqA = createRef<Txt>();
  const eqPlus = createRef<Txt>();
  const eqB = createRef<Txt>();
  const eqEq = createRef<Txt>();
  const eqC = createRef<Txt>();

  view.add(
    <>
      {/* squares */}
      <Rect
        ref={sqA}
        width={120}
        height={120}
        position={v(500, 410)}
        fill={"rgba(76, 201, 240, 0.22)"}
        stroke={COL_A}
        lineWidth={3}
        scale={0.7}
        opacity={0}
      />
      <Rect
        ref={sqB}
        width={160}
        height={160}
        position={v(640, 550)}
        fill={"rgba(247, 37, 133, 0.22)"}
        stroke={COL_B}
        lineWidth={3}
        scale={0.7}
        opacity={0}
      />
      <Rect
        ref={sqC}
        width={200}
        height={200}
        position={v(700, 330)}
        rotation={36.87}
        fill={"rgba(6, 214, 160, 0.22)"}
        stroke={COL_C}
        lineWidth={3}
        scale={0.7}
        opacity={0}
      />

      {/* triangle */}
      <Line ref={edgeA} points={[P_C, P_A]} stroke={TRI} lineWidth={5} end={0} />
      <Line ref={edgeB} points={[P_C, P_B]} stroke={TRI} lineWidth={5} end={0} />
      <Line ref={edgeC} points={[P_A, P_B]} stroke={TRI} lineWidth={5} end={0} />
      <Line
        ref={rightAngle}
        points={[v(560, 470), v(560, 446), v(584, 446), v(584, 470)]}
        stroke={TRI}
        lineWidth={3}
        end={0}
      />

      {/* side labels (inside the triangle) */}
      <Txt ref={labA} text={"a"} fontSize={30} fontWeight={700} fill={COL_A} position={v(578, 412)} opacity={0} />
      <Txt ref={labB} text={"b"} fontSize={30} fontWeight={700} fill={COL_B} position={v(646, 450)} opacity={0} />
      <Txt ref={labC} text={"c"} fontSize={30} fontWeight={700} fill={COL_C} position={v(618, 406)} opacity={0} />

      {/* area labels */}
      <Txt ref={areaA} text={"a\u00b2"} fontSize={34} fontWeight={700} fill={COL_A} position={v(500, 412)} opacity={0} />
      <Txt ref={areaB} text={"b\u00b2"} fontSize={34} fontWeight={700} fill={COL_B} position={v(640, 552)} opacity={0} />
      <Txt ref={areaC} text={"c\u00b2"} fontSize={34} fontWeight={700} fill={COL_C} position={v(640, 332)} opacity={0} />

      {/* equation */}
      <Txt ref={eqA} text={"a\u00b2"} fontSize={52} fontWeight={800} fill={COL_A} position={v(566, 692)} opacity={0} />
      <Txt ref={eqPlus} text={"+"} fontSize={52} fontWeight={800} fill={TXT} position={v(612, 692)} opacity={0} />
      <Txt ref={eqB} text={"b\u00b2"} fontSize={52} fontWeight={800} fill={COL_B} position={v(664, 692)} opacity={0} />
      <Txt ref={eqEq} text={"="} fontSize={52} fontWeight={800} fill={TXT} position={v(712, 692)} opacity={0} />
      <Txt ref={eqC} text={"c\u00b2"} fontSize={52} fontWeight={800} fill={COL_C} position={v(762, 692)} opacity={0} />

      {/* title */}
      <Txt ref={title} text={"Pythagorean Theorem"} fontSize={58} fontWeight={800} fill={TXT} position={v(640, 40)} opacity={0} />
      <Txt ref={subtitle} text={"A right triangle with legs a, b and hypotenuse c"} fontSize={24} fill={MUTED} position={v(640, 116)} opacity={0} />
    </>,
  );

  // 0.0 -> title
  yield* all(
    title().opacity(1, 1.2),
    title().y(v(640, 66).y, 1.2, easeInOutCubic),
    waitFor(1.2),
  );
  // 1.2 -> subtitle
  yield* all(subtitle().opacity(1, 0.6), waitFor(0.6));
  // 1.8 -> triangle edges (staggered draw-on)
  yield* all(
    (function* () { yield* edgeA().end(1, 0.9); })(),
    (function* () { yield* waitFor(0.35); yield* edgeB().end(1, 0.9); })(),
    (function* () { yield* waitFor(0.7); yield* edgeC().end(1, 0.9); })(),
    waitFor(1.6),
  );
  // 3.4 -> right-angle marker
  yield* all(rightAngle().end(1, 0.4), waitFor(0.4));
  // 3.8 -> side labels
  yield* all(
    labA().opacity(1, 0.5),
    labB().opacity(1, 0.5),
    labC().opacity(1, 0.5),
    waitFor(0.5),
  );
  // 4.3 -> squares grow (staggered)
  yield* all(
    (function* () { yield* all(sqA().opacity(1, 1.0), sqA().scale(1, 1.0)); })(),
    (function* () { yield* waitFor(0.2); yield* all(sqB().opacity(1, 1.0), sqB().scale(1, 1.0)); })(),
    (function* () { yield* waitFor(0.4); yield* all(sqC().opacity(1, 1.1), sqC().scale(1, 1.1)); })(),
    waitFor(1.5),
  );
  // 5.8 -> area labels
  yield* all(
    areaA().opacity(1, 0.7),
    areaB().opacity(1, 0.7),
    areaC().opacity(1, 0.7),
    waitFor(0.7),
  );
  // 6.5 -> equation
  yield* all(
    eqA().opacity(1, 1.0),
    eqPlus().opacity(1, 1.0),
    eqB().opacity(1, 1.0),
    eqEq().opacity(1, 1.0),
    eqC().opacity(1, 1.0),
    waitFor(1.0),
  );
  // 7.5 -> pulse c²
  yield* all(sqC().scale(1.06, 0.4), waitFor(0.4));
  yield* all(sqC().scale(1, 0.4), waitFor(0.4));
  // 8.3 -> hold to 10 s
  yield* waitFor(1.7);
});
