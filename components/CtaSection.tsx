"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { ctaSection } from "@/data/landingContent";

// ── Theme tokens (matches AboutSection — same light palette so the two
// sections read as one continuous system) ───────────────────────────────
// base:    #FAFAF8  — warm cream ground
// glow:    #CFE8B9 / #E7E9C9  — pale sage/yellow-green diffusion
// surface: white/70 + black/10 border — frosted pills, same as About's checklist
// accent:  #2F6B4F (text/icons) · #B7D96B (fills/dots)

const trustPoints = [
  "No credit card required",
  "Deploy in under 5 minutes",
  "SOC 2 Type II compliant",
];

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

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// Same hand-drawn arrow doodle used in AboutSection, mirrored to point
// down-toward the CTA button instead of sideways toward a checklist.
function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
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

export default function CtaSection() {
  return (
    <section
      id="pricing"
      className="relative bg-[#FAFAF8] pt-24 pb-28 md:pt-32 md:pb-36 overflow-hidden"
    >
      {/* Same top blend technique as About, so the seam from the previous section disappears */}
      <div
        aria-hidden
        className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#EAF1DC]/60 to-transparent pointer-events-none"
      />

      {/* Same diffuse green glows as About/Hero */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-[10%] top-[-10%] w-[55%] h-[55%] rounded-full bg-[#CFE8B9] blur-[150px] opacity-45" />
        <div className="absolute right-[-10%] top-[20%] w-[50%] h-[60%] rounded-full bg-[#E7E9C9] blur-[160px] opacity-35" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Eyebrow — same italic sage style as About */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="italic text-sm text-[#2F6B4F] mb-4"
        >
          Get started today
        </motion.p>

        {/* Big title — same scale/weight as About's h2 */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="text-[clamp(34px,5.5vw,58px)] font-black text-[#1B1A17]/90 leading-[1.08] tracking-tight"
        >
          {ctaSection.title.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h2>

        {/* Subtitle — word-by-word reveal, same technique as About's paragraph */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={wordContainer}
          className="mt-6 text-base md:text-lg text-[#1B1A17]/60 leading-relaxed max-w-xl mx-auto"
        >
          {ctaSection.subtitle.split(" ").map((word, i) => (
            <motion.span key={i} variants={wordVariant} className="inline-block mr-[0.28em]">
              {word}
            </motion.span>
          ))}
        </motion.p>

        {/* CTA button, with the arrow doodle pointing toward it — same doodle as About */}
        <div className="relative inline-block mt-10">
          <ArrowDoodle className="hidden md:block absolute -top-16 -left-24 w-20 h-16" />
          <motion.a
            href={ctaSection.ctaHref}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2F6B4F] text-white font-semibold text-sm shadow-[0_10px_30px_rgba(47,107,79,0.25)] hover:shadow-[0_14px_40px_rgba(47,107,79,0.4)] transition-shadow duration-300"
          >
            {ctaSection.ctaLabel}
            <ArrowRight size={15} />
          </motion.a>
        </div>

        {/* Trust pills — same frosted-card language as About's checklist, laid out horizontally */}
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {trustPoints.map((item, i) => (
            <motion.li
              key={i}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm hover:border-[#2F6B4F]/40 transition-colors duration-300 shadow-sm"
            >
              <CheckCircle size={15} className="shrink-0 text-[#2F6B4F]" />
              <span className="text-xs text-[#1B1A17]/70 leading-relaxed whitespace-nowrap">
                {item}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}