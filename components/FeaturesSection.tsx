"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { features, featuresSectionHeading } from "@/data/landingContent";

// ── Theme tokens (matches Hero / Navbar / About, dark) ──────────────────
// base:    #090C08  — near-black ground
// glow:    #2E4A22 / #3C5B2C  — same mesh blobs as the hero
// accent:  #B7D96B  — lime-green

function Sparkle({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute text-white/40 select-none pointer-events-none ${className ?? ""}`}
      style={{ fontSize: 18, lineHeight: 1 }}
    >
      +
    </span>
  );
}

// Fixed size/shape for every feature visual — same box, same alignment,
// only the image inside changes. Kept intentionally small (not a hero-sized
// image) so it reads as a supporting visual, not the star of the row.
const IMAGE_BOX = "relative w-full max-w-[260px] aspect-[4/3] mx-auto";

// One alternating row: text + image. Even rows are text-left/image-right,
// odd rows flip to image-left/text-right. Each row is exactly 50vh so 4
// features stack to a predictable, non-bloated section height. Entrance is
// a real GSAP ScrollTrigger reveal (same tool the Hero mockup uses) rather
// than a scroll-scrubbed fade in/out, which also removes the extra scroll
// distance that fade-out was eating up.
function FeatureRow({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const imageFirst = index % 2 === 1;
  const rowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    const initGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!rowRef.current || !contentRef.current) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }, rowRef);
    };

    initGSAP();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={rowRef} className="py-10 md:py-14 flex items-center">
      <div
        ref={contentRef}
        className={`w-full grid grid-cols-1 gap-8 md:gap-14 items-center ${
          imageFirst ? "md:grid-cols-[3fr_7fr]" : "md:grid-cols-[7fr_3fr]"
        }`}
      >
        {/* Text — always first in the DOM (consistent, sensible mobile order) */}
        <div className={imageFirst ? "md:order-2" : "md:order-1"}>
          <span className="text-xs font-bold text-white/20 font-mono block mb-3">
            {feature.index}
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
            <span className="text-[#B7D96B]">{feature.titleHighlight}</span>
            {feature.title.slice(feature.titleHighlight.length)}
          </h3>
          <p className="text-base text-white/50 leading-relaxed max-w-md">
            {feature.description}
          </p>
        </div>

        {/* Visual — fixed box, same size/alignment for every row */}
        <div className={imageFirst ? "md:order-1" : "md:order-2"}>
          <div className={IMAGE_BOX}>
            <div className="absolute -inset-3 rounded-2xl bg-[#B7D96B]/10 blur-2xl" />
            <div className="relative w-full h-full rounded-2xl border border-[#B7D96B]/20 bg-[#171C13] overflow-hidden shadow-[0_0_40px_rgba(183,217,107,0.12)]">
              <Image
                src={feature.image}
                alt={feature.visualLabel}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 260px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const sectionFade: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      id="features"
      className="relative bg-[#090C08] pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden"
    >
      {/* Mesh gradient ground — same technique as Hero/About */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-[10%] top-[10%] w-[55%] h-[55%] rounded-full bg-[#2E4A22] blur-[150px] opacity-50" />
        <div className="absolute right-[-10%] bottom-[0%] w-[50%] h-[60%] rounded-full bg-[#3C5B2C] blur-[160px] opacity-35" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Intro heading — unchanged: eyebrow + title ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative max-w-4xl mx-auto px-6 text-center mb-10 md:mb-14"
      >
        <Sparkle className="left-1/2 -ml-24 top-0 hidden md:block" />
        <motion.p variants={sectionFade} className="italic text-sm text-[#B7D96B] mb-4">
          {featuresSectionHeading.eyebrow}
        </motion.p>
        <motion.h2
          variants={sectionFade}
          className="text-[clamp(30px,4.5vw,48px)] font-black text-white/90 leading-[1.08] tracking-tight"
        >
          {featuresSectionHeading.title.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h2>
      </motion.div>

      {/* ── Alternating rows, each a fixed 50vh, revealed via GSAP ScrollTrigger ── */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col">
        {features.map((feature, i) => (
          <FeatureRow key={feature.index} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}