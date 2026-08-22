import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SteamRings: React.FC<{ color?: string }> = ({ color = "#cbd5e0" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale1 = spring({ frame, fps, config: { damping: 100 } });
  const scale2 = spring({ frame: frame - 15, fps, config: { damping: 100 } });
  const opacity = interpolate(frame, [0, 40, 260, 300], [0, 0.4, 0.4, 0]);

  return (
    <AbsoluteFill className="justify-center items-center pointer-events-none">
      <div
        className="absolute rounded-full border border-dashed transition-all duration-300"
        style={{
          width: 380 * scale1,
          height: 380 * scale1,
          borderColor: color,
          opacity,
          transform: `rotate(${frame * 0.2}deg)`,
        }}
      />
      <div
        className="absolute rounded-full border transition-all duration-300"
        style={{
          width: 520 * scale2,
          height: 520 * scale2,
          borderColor: color,
          opacity: opacity * 0.5,
          transform: `rotate(-${frame * 0.1}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
