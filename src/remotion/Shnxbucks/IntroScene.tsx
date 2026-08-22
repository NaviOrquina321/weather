import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CoffeeCupIcon } from "./CoffeeCupIcon";

interface IntroSceneProps {
  title: string;
  tagline: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ title, tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15 },
  });

  const taglineOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, 40], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="justify-center items-center p-12 text-center">
      <div
        className="flex flex-col items-center gap-6"
        style={{ transform: `translateY(${translateY}px)` }}
      >
        <div style={{ transform: `scale(${titleSpring})` }}>
          <CoffeeCupIcon size={110} color="#718096" />
        </div>

        <div className="space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-200/60 text-slate-600 text-sm font-medium tracking-widest uppercase mb-2">
            Peaceful Coffee Experience
          </div>
          <h1 className="text-7xl font-light tracking-tight text-slate-800 dark:text-slate-100">
            {title}
          </h1>
          <p
            className="text-2xl font-normal text-slate-500 tracking-wide"
            style={{ opacity: taglineOpacity }}
          >
            {tagline}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
