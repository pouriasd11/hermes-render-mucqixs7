import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Identical educational scenario - Remotion (SVG).
const BG = "#0B1020";
const COL_A = "#4CC9F0";
const COL_B = "#F72585";
const COL_C = "#06D6A0";
const TRI = "#FFD166";
const TXT = "#E6EDF3";
const MUTED = "#9FB3C8";

const A = { x: 560, y: 350 }; // top of leg a
const B = { x: 720, y: 470 }; // end of leg b
const C = { x: 560, y: 470 }; // right angle
const SQ_C = [
  { x: 560, y: 350 },
  { x: 720, y: 470 },
  { x: 840, y: 310 },
  { x: 680, y: 190 },
];

const pts = (p: { x: number; y: number }[]) => p.map((q) => `${q.x},${q.y}`).join(" ");

const range = (
  frame: number,
  from: number,
  to: number,
  a = 0,
  b = 1,
): number => interpolate(frame, [from, to], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Square: React.FC<{
  corners: { x: number; y: number }[];
  color: string;
  show: number;
  pulse?: number;
}> = ({ corners, color, show, pulse = 1 }) => {
  const opacity = range(show, 0, 45);
  const scale = range(show, 0, 45, 0.7, 1) * pulse;
  const cx = corners.reduce((s, p) => s + p.x, 0) / corners.length;
  const cy = corners.reduce((s, p) => s + p.y, 0) / corners.length;
  return (
    <polygon
      points={pts(corners)}
      fill={color}
      fillOpacity={0.22 * opacity}
      stroke={color}
      strokeWidth={3}
      strokeOpacity={opacity}
      transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}
    />
  );
};

const DrawLine: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
}> = ({ from, to, progress }) => {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={TRI}
      strokeWidth={5}
      strokeLinecap="round"
      strokeDasharray={len}
      strokeDashoffset={len * (1 - progress)}
    />
  );
};

export const Edu: React.FC = () => {
  const frame = useCurrentFrame();

  const titleY = range(frame, 0, 36, 40, 66);
  const titleO = range(frame, 0, 36);
  const subO = range(frame, 36, 54);

  const drawA = range(frame, 54, 84);
  const drawB = range(frame, 63, 93);
  const drawC = range(frame, 72, 102);

  const raO = range(frame, 102, 114);
  const labABC = range(frame, 114, 129);

  const sqA = range(frame, 129, 159, 0, 159);
  const sqB = range(frame, 135, 165, 0, 165);
  const sqC = range(frame, 141, 174, 0, 174);
  const areaO = range(frame, 174, 195);

  const eqFrom = range(frame, 195, 225, 0, 225);
  const eqO = range(frame, 195, 225);

  const pulse = 1 + 0.03 * Math.sin(range(frame, 225, 249, 0, Math.PI));

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "sans-serif" }}>
      <svg viewBox="0 0 1280 720" width={1280} height={720}>
        <Square
          corners={[ { x: 440, y: 350 }, { x: 560, y: 350 }, { x: 560, y: 470 }, { x: 440, y: 470 } ]}
          color={COL_A}
          show={sqA}
        />
        <Square
          corners={[ { x: 560, y: 470 }, { x: 720, y: 470 }, { x: 720, y: 630 }, { x: 560, y: 630 } ]}
          color={COL_B}
          show={sqB}
        />
        <Square corners={SQ_C} color={COL_C} show={sqC} pulse={pulse} />

        <DrawLine from={C} to={A} progress={drawA} />
        <DrawLine from={C} to={B} progress={drawB} />
        <DrawLine from={A} to={B} progress={drawC} />

        <polygon
          points="560,470 560,446 584,446 584,470"
          fill="none"
          stroke={TRI}
          strokeWidth={3}
          opacity={raO}
        />

        <g opacity={labABC} fontSize={30} fontWeight={700}>
          <text x={578} y={412} fill={COL_A} textAnchor="middle">a</text>
          <text x={646} y={450} fill={COL_B} textAnchor="middle">b</text>
          <text x={618} y={406} fill={COL_C} textAnchor="middle">c</text>
        </g>

        <g opacity={areaO} fontSize={34} fontWeight={700}>
          <text x={500} y={422} fill={COL_A} textAnchor="middle">a²</text>
          <text x={640} y={562} fill={COL_B} textAnchor="middle">b²</text>
          <text x={640} y={342} fill={COL_C} textAnchor="middle">c²</text>
        </g>

        <g
          opacity={eqO}
          fontSize={52}
          fontWeight={800}
          textAnchor="middle"
          transform={`translate(640 ${700 - eqFrom * 0.15})`}
        >
          <text x={-150} y={0} fill={COL_A}>a²</text>
          <text x={-70} y={0} fill={TXT}>+</text>
          <text x={0} y={0} fill={COL_B}>b²</text>
          <text x={80} y={0} fill={TXT}>=</text>
          <text x={150} y={0} fill={COL_C}>c²</text>
        </g>
      </svg>

      <div style={{ position: "absolute", inset: 0, textAlign: "center", color: TXT }}>
        <div
          style={{
            position: "absolute",
            top: titleY,
            left: 0,
            right: 0,
            fontSize: 58,
            fontWeight: 800,
            opacity: titleO,
          }}
        >
          Pythagorean Theorem
        </div>
        <div
          style={{
            position: "absolute",
            top: 116,
            left: 0,
            right: 0,
            fontSize: 24,
            color: MUTED,
            opacity: subO,
          }}
        >
          A right triangle with legs a, b and hypotenuse c
        </div>
      </div>
    </AbsoluteFill>
  );
};
