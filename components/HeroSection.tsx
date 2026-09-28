"use client";

import { useRef, useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Layers,
  Database,
  Shield,
  Star,
  RotateCw,
  Maximize2,
  X,
  Smile,
  AtSign,
  MessageSquare,
} from "lucide-react";
import { hero } from "@/data/landingContent";

// ── Typing-demo content for the mail-compose mockup ─────────────────────
const MAIL_BODY = "The assignment will be complete by our group this week.";
const MAIL_ERROR_WORDS = ["complete", "week"];

// Typewriter with randomized per-character delay, then a grammar-fix reveal,
// looping so the mockup always feels "alive" once it's on screen.
function TypingMailBody() {
  const [typed, setTyped] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const typeStep = (i: number) => {
      if (cancelled) return;
      if (i <= MAIL_BODY.length) {
        setTyped(i);
        const jitter = 22 + Math.random() * 55; // random cadence = the "typing" feels human, not linear
        timeout = setTimeout(() => typeStep(i + 1), jitter);
      } else {
        timeout = setTimeout(() => {
          if (cancelled) return;
          setShowErrors(true);
          timeout = setTimeout(() => {
            if (cancelled) return;
            setShowErrors(false);
            setTyped(0);
            timeout = setTimeout(() => typeStep(0), 550);
          }, 3400);
        }, 500);
      }
    };

    timeout = setTimeout(() => typeStep(0), 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const parts = showErrors
    ? MAIL_BODY.split(new RegExp(`(${MAIL_ERROR_WORDS.join("|")})`, "g"))
    : null;

  return (
    <div className="relative">
      <p className="text-[13px] text-[#1B1A17]/80 leading-relaxed min-h-[38px] text-left">
        {showErrors && parts
          ? parts.map((part, idx) =>
            MAIL_ERROR_WORDS.includes(part) ? (
              <span
                key={idx}
                className="underline decoration-[#DD7A45] decoration-2 underline-offset-2"
              >
                {part}
              </span>
            ) : (
              <span key={idx}>{part}</span>
            )
          )
          : (
            <>
              {MAIL_BODY.slice(0, typed)}
              <motion.span
                className="inline-block w-[2px] h-[13px] bg-[#1B1A17]/60 ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              />
            </>
          )}
      </p>
      {showErrors && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-9 right-0 px-3 py-1.5 rounded-full bg-[#1B1A17] text-white text-[11px] font-medium whitespace-nowrap shadow-lg"
        >
          Fix {MAIL_ERROR_WORDS.length} grammar errors.
        </motion.span>
      )}
    </div>
  );
}

// ── Theme tokens (dark, mesh-gradient) ──────────────────────────────────
// base:    #090C08  — near-black ground
// glow 1:  #2E4A22  — deep olive (corner diffusion)
// glow 2:  #A9C24C  — lime glow (light source)
// surface: #12160F  — card / mockup surface
// border:  rgba(255,255,255,0.08)
// text:    #F5F6F1  — warm off-white
// muted:   rgba(245,246,241,0.55)
// accent:  #B7D96B  — lime-green accent (eyebrow, links)
// cta bg:  #3C5B2C  — deep leaf green

// Map icon string keys to Lucide components
const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  layers: Layers,
  database: Database,
  shield: Shield,
};

function InlineIconBadge({ iconKey }: { iconKey: string }) {
  const Icon = iconMap[iconKey] ?? Zap;
  return (
    <span className="inline-flex items-center gap-1.5 align-middle mx-2">
      <span className="inline-flex">
        <span className="w-7 h-7 rounded-full bg-[#B7D96B]/15 border border-[#B7D96B]/25 flex items-center justify-center -mr-2 shadow-lg">
          <Icon size={12} className="text-[#B7D96B]" />
        </span>
        <span className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center -mr-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B7D96B]/50" />
        </span>
        <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white/40" />
        </span>
      </span>
    </span>
  );
}

// Small decorative sparkle used near the eyebrow / CTA, matching the reference
function Sparkle({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute text-white/50 select-none pointer-events-none ${className ?? ""}`}
      style={{ fontSize: 18, lineHeight: 1 }}
    >
      +
    </span>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  // GSAP scroll-scrub: the widget starts low + small (mostly hidden by the fold)
  // and rises smoothly into full view, scaling up, as the hero scrolls out.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    const initGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current || !mockupRef.current) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          mockupRef.current,
          { y: 140, scale: 0.9 },
          {
            y: 0,
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6, // slight smoothing lag so it never feels jumpy
            },
          }
        );
      }, sectionRef);
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, []);

  /* ── Framer Motion variants ─────────────────────────────────────────── */
  const eyebrowVariant: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  const badgeVariant: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.85 },
    },
  };

  const lineVariant = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
    },
  });

  const ctaVariant: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.65 },
    },
  };

  const mockupVariant: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.95 },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen md:min-h-[120vh]  flex flex-col overflow-hidden bg-[#090C08]"
    >
      {/* Mesh gradient ground — diffuse green blobs over near-black, matching reference */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-[10%] top-[-15%] w-[70%] h-[70%] rounded-full bg-[#2E4A22] blur-[140px] opacity-70" />
        <div className="absolute right-[-5%] top-[5%] w-[65%] h-[75%] rounded-full bg-[#A9C24C] blur-[160px] opacity-30" />
        <div className="absolute left-[20%] bottom-[-20%] w-[60%] h-[55%] rounded-full bg-[#3C5B2C] blur-[130px] opacity-40" />
      </div>
      {/* Subtle grain/vignette to keep corners grounded */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-28 text-center max-w-6xl mx-auto w-full">
        {/* Eyebrow */}
        <motion.div initial="hidden" animate="visible" variants={eyebrowVariant} className="relative mb-5">
          <Sparkle className="-left-7 top-0" />
          <span className="italic text-sm text-[#B7D96B]">{hero.eyebrow}</span>
        </motion.div>

        {/* Headline — CTA rides inline beside the final line, like the reference */}
        <h1 className=" leading-[1.08] mt-[50px]">
          {hero.headlineLines.map((line, i) => {
            const isLast = i === hero.headlineLines.length - 1;
            return (
              <motion.span
                key={i}
                initial="hidden"
                animate="visible"
                variants={lineVariant(0.1 + i * 0.15)}
                className="block text-[clamp(38px,6.5vw,92px)] font-black tracking-tight text-white/90"
              >
                {line.text}
                {"icon" in line && line.icon && (
                  <InlineIconBadge iconKey={line.icon as string} />
                )}
                {isLast && (
                  <motion.a
                    href={hero.ctaHref}
                    target="_blank"
                    initial="hidden"
                    animate="visible"
                    variants={ctaVariant}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative inline-flex items-center gap-2.5 align-middle ml-3 px-6 py-3 rounded-full bg-[#B7D96B] text-[#152106] font-bold text-base whitespace-nowrap shadow-[0_10px_30px_rgba(183,217,107,0.35)] hover:shadow-[0_14px_40px_rgba(183,217,107,0.5)] transition-shadow duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#152106]" />
                    {hero.ctaLabel}
                    <Sparkle className="-right-6 -top-2 text-[16px]" />
                  </motion.a>
                )}
              </motion.span>
            );
          })}
        </h1>

        {/* Rating / installs pill */}
        <motion.div initial="hidden" animate="visible" variants={badgeVariant} className="mt-8">
          <div className="inline-flex items-center divide-x divide-white/15 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5 px-4 py-2">
              <Star size={12} className="text-[#B7D96B] fill-[#B7D96B]" />
              {hero.ratingLabel ?? "4.8/5 Rating"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2">
              <RotateCw size={12} className="text-[#B7D96B]" />
              {hero.installsLabel ?? "10k+ Companies"}
            </span>
          </div>
        </motion.div>

        {/* ── Floating mockup — starts hidden below the fold, rises up smoothly on scroll ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={mockupVariant}
          className="relative w-full max-w-2xl mx-auto pb-24"
        >


          {/* The ref is on the inner div so GSAP y/scale stays centered */}
          <div ref={mockupRef} className="relative z-10 origin-bottom will-change-transform">
            <div className="z-[20] relative rounded-2xl overflow-hidden border border-black/5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] bg-white">
              {/* Dark header bar */}
              <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#151515]">
                <span className="text-xs text-white/80 font-medium">New message</span>
                <div className="flex items-center gap-3 text-white/40">
                  <Maximize2 size={12} />
                  <X size={13} />
                </div>
              </div>

              {/* White compose body */}
              <div className="p-5 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#EA4335] via-[#FBBC05] to-[#34A853] flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                    M
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-xs text-[#1B1A17]/70">
                    hello@anniegolden.com
                    <X size={10} className="text-[#1B1A17]/40" />
                  </span>
                </div>

                <TypingMailBody />

                {/* Toolbar */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-full bg-[#151515] text-white text-xs font-semibold">
                      Send
                    </button>
                    <span className="text-xs text-[#1B1A17]/40 font-medium">Aa</span>
                    <Smile size={14} className="text-[#1B1A17]/40" />
                    <AtSign size={14} className="text-[#1B1A17]/40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#DD7A45] text-white text-[11px] font-bold flex items-center justify-center">
                      {MAIL_ERROR_WORDS.length}
                    </span>
                    <span className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center">
                      <MessageSquare size={13} className="text-[#1B1A17]/50" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Caption below the widget */}

        </motion.div>
      </div>

      {/* Bottom fade into about section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
    </section>
  );
}