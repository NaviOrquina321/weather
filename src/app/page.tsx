"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  CompositionProps,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { Main } from "../remotion/Shnxbucks/Main";

const Home: NextPage = () => {
  // Dynamic Remotion video parameters state
  const [title, setTitle] = useState<string>(defaultMyCompProps.title);
  const [tagline, setTagline] = useState<string>(defaultMyCompProps.tagline);
  const [discountCode, setDiscountCode] = useState<string>(
    defaultMyCompProps.discountCode
  );
  const [discountPercent, setDiscountPercent] = useState<string>(
    defaultMyCompProps.discountPercent
  );
  const [highlightRoast, setHighlightRoast] = useState<string>(
    defaultMyCompProps.highlightRoast
  );
  const [bgTheme, setBgTheme] = useState<
    "grey-slate" | "peaceful-ash" | "warm-stone"
  >(defaultMyCompProps.bgTheme);

  // Cart / Order interaction state
  const [cartCount, setCartCount] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [claimedOffer, setClaimedOffer] = useState<string>("");

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title,
      tagline,
      discountCode,
      discountPercent,
      highlightRoast,
      bgTheme,
    };
  }, [title, tagline, discountCode, discountPercent, highlightRoast, bgTheme]);

  const copyPromoCode = () => {
    navigator.clipboard?.writeText(discountCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaimOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimedOffer.trim()) {
      alert(`Success! Offer applied for ${claimedOffer}. Use code ${discountCode} at checkout.`);
      setClaimedOffer("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-100/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="text-xl font-light tracking-tight text-slate-900 font-serif">
                shnxbucks
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-sans">
                Peaceful Roasts
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
            <a href="#promo-video" className="hover:text-slate-900 transition-colors">
              Promo Video
            </a>
            <a href="#menu" className="hover:text-slate-900 transition-colors">
              Signature Blends
            </a>
            <a href="#why-shnxbucks" className="hover:text-slate-900 transition-colors">
              Our Vibe
            </a>
            <a href="#reviews" className="hover:text-slate-900 transition-colors">
              Reviews
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => alert(`Shopping Bag: ${cartCount} item(s)`)}
              className="relative px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold tracking-wide transition-all flex items-center gap-2"
            >
              <span>Bag</span>
              <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-100 text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </button>
            <a
              href="#promo-video"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-100 text-xs font-medium tracking-wide shadow-sm transition-all"
            >
              Custom Promo
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/80 text-slate-600 text-xs font-medium tracking-wider uppercase mb-6 border border-slate-300/60">
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
          Chill Vibe • Muted Grey Aesthetic • Remotion Powered
        </div>

        <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          shnxbucks — <span className="font-normal text-slate-600">peace in every sip.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Unwind with small-batch slow roasts designed for quiet focus and serene mornings.
          Watch and customize our dynamic promo video powered by Remotion below.
        </p>

        {/* Video Player & Live Controls Container */}
        <div id="promo-video" className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 text-left">
          <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-2xl font-light text-slate-800">
                Interactive Remotion Video Studio
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Real-time video rendering powered by @remotion/player
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                Live 30 FPS
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
                1280x720 • 10s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Remotion Player Display */}
            <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-slate-900">
              <Player
                component={Main}
                inputProps={inputProps}
                durationInFrames={DURATION_IN_FRAMES}
                fps={VIDEO_FPS}
                compositionHeight={VIDEO_HEIGHT}
                compositionWidth={VIDEO_WIDTH}
                style={{ width: "100%" }}
                controls
                autoPlay
                loop
                initiallyMuted
                acknowledgeRemotionLicense
              />
            </div>

            {/* Live Interactive Control Panel */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200">
                Live Video Customizer
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Brand Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Featured Roast Name
                  </label>
                  <input
                    type="text"
                    value={highlightRoast}
                    onChange={(e) => setHighlightRoast(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Discount Code
                    </label>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Discount Off
                    </label>
                    <input
                      type="text"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Background Color Vibe
                  </label>
                  <select
                    value={bgTheme}
                    onChange={(e) =>
                      setBgTheme(
                        e.target.value as "grey-slate" | "peaceful-ash" | "warm-stone"
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="grey-slate">Grey Slate (Default Chill)</option>
                    <option value="peaceful-ash">Peaceful Ash (Muted Light)</option>
                    <option value="warm-stone">Warm Stone (Soft Earthy)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={copyPromoCode}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-100 font-medium text-xs tracking-wider uppercase transition-colors"
                >
                  {copiedCode ? "Code Copied!" : `Copy Code: ${discountCode}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Coffee Blends Section */}
      <section id="menu" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Handcrafted Menu
          </span>
          <h2 className="text-4xl font-light text-slate-900">
            Signature Muted Roasts
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto text-sm">
            Carefully curated single-origin and balanced blends roasted to perfection for a calm experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: 1,
              title: "Mellow Slate Espresso",
              tag: "Best Seller",
              roast: "Medium Smooth",
              notes: "Dark cocoa, velvet oak, dried plum",
              price: "$18.00",
            },
            {
              id: 2,
              title: "Peaceful Cold Brew",
              tag: "Nitro Infused",
              roast: "Light Smooth",
              notes: "Soothing hazelnut, sweet vanilla bean",
              price: "$16.50",
            },
            {
              id: 3,
              title: "Serene Oat Latte Blend",
              tag: "Creamy Harmony",
              roast: "Balanced",
              notes: "Toasted oats, warm caramel, nutmeg",
              price: "$19.00",
            },
            {
              id: 4,
              title: "Quiet Ash Reserve",
              tag: "Single Origin",
              roast: "Micro Batch",
              notes: "Soft citrus, elderflower, honeydew",
              price: "$21.00",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                    {item.tag}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.price}
                  </span>
                </div>
                <h3 className="text-xl font-normal text-slate-800 mb-1">
                  {item.title}
                </h3>
                <div className="text-xs text-slate-500 font-medium mb-3">
                  Roast: {item.roast}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.notes}
                </p>
              </div>

              <button
                onClick={() => setCartCount((prev) => prev + 1)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200"
              >
                Add to Bag
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Why shnxbucks / Our Vibe */}
      <section id="why-shnxbucks" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="bg-slate-800 text-slate-100 rounded-3xl p-10 md:p-14 shadow-xl border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xl">
              🧘
            </div>
            <h3 className="text-xl font-light">Peaceful Roasting</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our unique temperature gradient roasting eliminates sharp bitterness, leaving only smooth, balanced harmony.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xl">
              🌿
            </div>
            <h3 className="text-xl font-light">Shade-Grown Arabica</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              100% sustainably farmed under rainforest canopies in high-altitude volcanic soil.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xl">
              ☕
            </div>
            <h3 className="text-xl font-light">Chill Spaces</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Designed for quiet contemplation, deep work, and peaceful conversation in slate-tinted sanctuary environments.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="py-12 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Testimonials
          </span>
          <h2 className="text-3xl font-light text-slate-900 mt-1">
            Loved by Calm Seekers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "shnxbucks gives me that exact calm morning energy I need before writing code or reading.",
              author: "Elena Rostova",
              role: "Software Architect",
            },
            {
              quote:
                "The Mellow Slate Espresso is smoothly balanced without any harsh acidity. Total peace.",
              author: "Marcus Chen",
              role: "Design Lead",
            },
            {
              quote:
                "The chill grey aesthetic isn't just marketing — their coffee genuinely grounds your day.",
              author: "Sophia Vance",
              role: "Author & Creative",
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex gap-1 text-amber-400 text-sm">★★★★★</div>
              <p className="text-sm text-slate-700 italic">"{rev.quote}"</p>
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  {rev.author}
                </div>
                <div className="text-[11px] text-slate-500">{rev.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Offer Subscription Banner */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-4">
          <h3 className="text-2xl font-light text-slate-900">
            Claim Your {discountPercent} Welcome Offer
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Subscribe to receive our freshly roasted coffee directly to your door with code{" "}
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
              {discountCode}
            </span>.
          </p>
          <form onSubmit={handleClaimOffer} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={claimedOffer}
              onChange={(e) => setClaimedOffer(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-100 text-sm font-medium transition-colors"
            >
              Claim Offer
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 pt-8 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} <span className="font-medium text-slate-700">shnxbucks</span> coffee. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
