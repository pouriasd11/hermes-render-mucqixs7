import { Composition } from "remotion";
import { Scene } from "./Scene";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Root"
      component={Scene}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
