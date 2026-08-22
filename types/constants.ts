import { z } from "zod";

export const COMP_NAME = "ShnxbucksPromo";

export const CompositionProps = z.object({
  title: z.string(),
  tagline: z.string(),
  discountCode: z.string(),
  discountPercent: z.string(),
  highlightRoast: z.string(),
  bgTheme: z.enum(["grey-slate", "peaceful-ash", "warm-stone"]),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "shnxbucks",
  tagline: "peace in every sip.",
  discountCode: "CHILL20",
  discountPercent: "20% OFF",
  highlightRoast: "Mellow Slate Espresso",
  bgTheme: "grey-slate",
};

export const DURATION_IN_FRAMES = 300; // 10 seconds @ 30fps
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;
