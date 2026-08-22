import React from "react";
import { fontFamily, loadFont } from "@remotion/google-fonts/Inter";
import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { CompositionProps } from "../../../types/constants";
import { IntroScene } from "./IntroScene";
import { OfferScene } from "./OfferScene";
import { RoastScene } from "./RoastScene";
import { SteamRings } from "./SteamRings";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["300", "400", "500", "600", "700"],
});

export const Main: React.FC<z.infer<typeof CompositionProps>> = ({
  title,
  tagline,
  discountCode,
  discountPercent,
  highlightRoast,
  bgTheme,
}) => {
  // Theme styling based on peaceful grey vibe
  const getBgStyle = () => {
    switch (bgTheme) {
      case "peaceful-ash":
        return "bg-gradient-to-br from-slate-100 via-stone-100 to-slate-200 text-slate-800";
      case "warm-stone":
        return "bg-gradient-to-br from-stone-200 via-neutral-100 to-slate-200 text-slate-800";
      case "grey-slate":
      default:
        return "bg-gradient-to-br from-slate-200 via-slate-100 to-zinc-200 text-slate-800";
    }
  };

  return (
    <AbsoluteFill className={getBgStyle()} style={{ fontFamily }}>
      {/* Background ambient steam elements */}
      <SteamRings color="#94a3b8" />

      {/* Scene 1: Intro Title & Brand Reveal (Frames 0 to 100) */}
      <Sequence from={0} durationInFrames={100}>
        <IntroScene title={title} tagline={tagline} />
      </Sequence>

      {/* Scene 2: Roast Showcase (Frames 90 to 200) */}
      <Sequence from={90} durationInFrames={110}>
        <RoastScene highlightRoast={highlightRoast} />
      </Sequence>

      {/* Scene 3: Exclusive Promo Offer (Frames 190 to 300) */}
      <Sequence from={190} durationInFrames={110}>
        <OfferScene
          title={title}
          discountCode={discountCode}
          discountPercent={discountPercent}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
