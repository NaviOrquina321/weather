import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface OfferSceneProps {
  discountCode: string;
  discountPercent: string;
  title: string;
}

export const OfferScene: React.FC<OfferSceneProps> = ({
  discountCode,
  discountPercent,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 14 },
  });

  const codePulse = interpolate(frame % 30, [0, 15, 30], [1, 1.03, 1]);

  return (
    <AbsoluteFill className="justify-center items-center p-12 text-center">
      <div
        className="w-full max-w-xl bg-slate-800 text-slate-100 rounded-3xl p-10 shadow-2xl border border-slate-700 flex flex-col items-center space-y-6"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="px-4 py-1.5 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold tracking-widest uppercase">
          Exclusive Peaceful Offer
        </div>

        <div className="space-y-2">
          <div className="text-5xl font-light text-slate-100">{discountPercent}</div>
          <p className="text-slate-400 text-base">
            Experience the calm of {title}. Use promo code at checkout:
          </p>
        </div>

        <div
          className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-600 text-slate-100 font-mono text-3xl tracking-wider shadow-inner"
          style={{ transform: `scale(${codePulse})` }}
        >
          {discountCode}
        </div>

        <div className="text-xs text-slate-400 tracking-wide pt-2">
          Visit <span className="text-slate-200 font-medium">shnxbucks.com</span> • Free Shipping
          Worldwide
        </div>
      </div>
    </AbsoluteFill>
  );
};
