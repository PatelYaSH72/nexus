"use client";

import { motion, type Variants } from "framer-motion";
import { about } from "@/data/landingContent";
import { CheckCircle } from "lucide-react";

// ── Theme tokens (matches HeroSection / Navbar, light) ──────────────────
// base:    #FAFAF8  — warm cream ground (same as hero, so the seam disappears)
// glow:    #CFE8B9 / #E7E9C9  — pale sage/yellow-green diffusion
// surface: white/70 + black/10 border — frosted cards, same language as hero's rating pill
// accent:  #2F6B4F (text/icons) · #B7D96B (fills/dots)

const callouts = [
  "No hallucinations — every answer is grounded in your docs",
  "Department-scoped RBAC enforced at the retrieval layer",
  "Full audit trail for compliance and governance",
  "Deploys in minutes, not months",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Word-by-word reveal for the paragraph — gives it its own "full" animation
// instead of fading up as one block.
const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: 0.1 } },
};

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// Small hand-drawn arrow doodle — draws itself in on scroll, pointing from
// the title area toward the checklist, echoing the hero's sparkle accents.
function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M4 6 C 40 2, 70 20, 78 46 C 84 64, 70 74, 54 70"
        stroke="#2F6B4F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity={0.45}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M42 62 L54 70 L46 82"
        stroke="#2F6B4F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.45}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 1.0 }}
      />
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative bg-[#FAFAF8] pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden"
    >
      {/* Blend into the hero's bottom fade — same base color, so no seam/border shows between sections */}
      <div
        aria-hidden
        className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#EAF1DC]/60 to-transparent pointer-events-none"
      />

      {/* Same diffuse green glows as the hero, quieter here so About reads as a continuation, not a new block */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-[10%] top-[-10%] w-[55%] h-[55%] rounded-full bg-[#CFE8B9] blur-[150px] opacity-45" />
        <div className="absolute right-[-10%] top-[20%] w-[50%] h-[60%] rounded-full bg-[#E7E9C9] blur-[160px] opacity-35" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* WHY NEXUS — centered eyebrow, styled like the hero's */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="italic text-sm text-[#2F6B4F] mb-4"
        >
          {about.eyebrow ?? "WHY NEXUS"}
        </motion.p>

        {/* Big title — same scale/weight language as the hero headline */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="text-[clamp(34px,5.5vw,58px)] font-black text-[#1B1A17]/90 leading-[1.08] tracking-tight"
        >
          {about.title.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h2>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left: paragraph, revealed word by word */}
          <div className="relative">
            <ArrowDoodle className="hidden md:block absolute -top-14 left-4 w-20 h-16 -scale-x-100" />
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={wordContainer}
              className="text-base md:text-lg text-[#1B1A17]/60 leading-relaxed text-left"
            >
              {about.description.split(" ").map((word, i) => (
                <motion.span key={i} variants={wordVariant} className="inline-block mr-[0.28em]">
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>

          {/* Right: callout checklist */}
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="flex flex-col gap-4"
          >
            {callouts.map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-4 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm hover:border-[#2F6B4F]/40 transition-colors duration-300 shadow-sm"
              >
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-[#2F6B4F]" />
                <span className="text-sm text-[#1B1A17]/70 leading-relaxed text-left">
                  {item}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}