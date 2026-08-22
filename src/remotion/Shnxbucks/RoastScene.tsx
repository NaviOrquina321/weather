import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface RoastSceneProps {
  highlightRoast: string;
}

export const RoastScene: React.FC<RoastSceneProps> = ({ highlightRoast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSlide = spring({
    frame,
    fps,
    config: { damping: 18 },
  });

  const cardOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="justify-center items-center p-12">
      <div
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-10 shadow-lg text-slate-800 space-y-6"
        style={{
          opacity: cardOpacity,
          transform: `scale(${cardSlide}) translateY(${(1 - cardSlide) * 40}px)`,
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <span className="text-sm uppercase tracking-widest font-semibold text-slate-500">
            Featured Brew
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
            100% Arabica • Slow Batch
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-light text-slate-800">{highlightRoast}</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Crafted for calm mornings and deep focus. Subtle notes of dark cocoa, dried plum, and velvet oak.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-100/70 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Roast</div>
            <div className="text-base font-medium text-slate-700 mt-1">Medium Smooth</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-100/70 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Acidity</div>
            <div className="text-base font-medium text-slate-700 mt-1">Balanced & Soft</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-100/70 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Vibe</div>
            <div className="text-base font-medium text-slate-700 mt-1">Peaceful Grey</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
