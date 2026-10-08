import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 20, 130, 150], [0, 1, 1, 0]);
  const x = interpolate(frame, [0, 150], [-300, 300]);
  const hue = interpolate(frame, [0, 150], [200, 340]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, hsl(${hue},70%,12%), hsl(${hue + 40},80%,25%))`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
        color: "white",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) translateX(${x}px)`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            background: `linear-gradient(90deg, hsl(${hue},90%,65%), hsl(${hue + 60},90%,70%))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Remotion
        </div>
      </div>
      <div style={{ fontSize: 32, opacity: interpolate(frame, [15, 45], [0, 1]) }}>
        Videos in React. Rendered with code.
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          fontSize: 22,
          opacity: 0.7,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span>frame {frame} / 150</span>
        <span>·</span>
        <span>{fps} fps</span>
        <span>·</span>
        <span>1280×720</span>
      </div>
    </AbsoluteFill>
  );
};
