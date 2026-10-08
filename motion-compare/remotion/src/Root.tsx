import { Composition } from "remotion";
import { Scene } from "./Scene";
import { Edu } from "./Edu";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Root"
        component={Scene}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Edu"
        component={Edu}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
