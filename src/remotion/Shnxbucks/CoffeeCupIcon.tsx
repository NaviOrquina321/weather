import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const CoffeeCupIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 120,
  color = "#4a5568",
}) => {
  const frame = useCurrentFrame();

  const steam1Y = interpolate(frame % 60, [0, 60], [0, -25]);
  const steam1Opacity = interpolate(frame % 60, [0, 30, 60], [0, 0.7, 0]);

  const steam2Y = interpolate((frame + 20) % 60, [0, 60], [0, -25]);
  const steam2Opacity = interpolate((frame + 20) % 60, [0, 30, 60], [0, 0.7, 0]);

  const steam3Y = interpolate((frame + 40) % 60, [0, 60], [0, -25]);
  const steam3Opacity = interpolate((frame + 40) % 60, [0, 30, 60], [0, 0.7, 0]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Animated Steam lines */}
      <div className="flex gap-3 mb-2 h-8 items-end">
        <div
          className="w-1.5 h-6 rounded-full bg-slate-400"
          style={{
            transform: `translateY(${steam1Y}px)`,
            opacity: steam1Opacity,
          }}
        />
        <div
          className="w-1.5 h-8 rounded-full bg-slate-300"
          style={{
            transform: `translateY(${steam2Y}px)`,
            opacity: steam2Opacity,
          }}
        />
        <div
          className="w-1.5 h-6 rounded-full bg-slate-400"
          style={{
            transform: `translateY(${steam3Y}px)`,
            opacity: steam3Opacity,
          }}
        />
      </div>

      {/* Coffee Cup SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    </div>
  );
};
