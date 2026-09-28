"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X, Zap, User } from "lucide-react";
import { nav } from "@/data/landingContent";
import { getTokenCookie } from "@/lib/api";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!getTokenCookie());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    const initGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!headerRef.current || !scrimRef.current) return;

      ctx = gsap.context(() => {
        // Page-load entrance: the whole bar drops/fades in once on mount
        gsap.fromTo(
          headerRef.current,
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.15 }
        );

        // Scroll-scrubbed background: a transparent scrim fades in smoothly
        // over the first ~120px of scroll instead of snapping on/off — the
        // bar itself never gets a solid fill, so it stays see-through.
        gsap.fromTo(
          scrimRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "+=120",
              scrub: 0.4,
            },
          }
        );
      });
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, []);

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      >
        {/* Scroll-scrubbed scrim — transparent at the top, gently darkens/blurs on scroll, never opaque */}
        <div
          ref={scrimRef}
          aria-hidden
          className="absolute inset-0 bg-[#090C08]/55 backdrop-blur-xl border-b border-white/5 opacity-0 pointer-events-none"
        />

        <nav className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <motion.a
            href="/"
            variants={itemVariants}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-[#B7D96B] flex items-center justify-center">
              <Zap size={14} style={{ color: "#0D110B" }} />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              {nav.logo}
            </span>
          </motion.a>

          {/* Center links — desktop */}
          <motion.ul
            variants={itemVariants}
            className="hidden md:flex items-center gap-1"
          >
            {nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </motion.ul>

          {/* Right side area — desktop */}
          {isLoggedIn ? (
            <motion.div
              variants={itemVariants}
              className="hidden md:flex items-center gap-3"
            >
              <a
                href="/profile"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-[#B7D96B]/50 transition-all duration-200"
                aria-label="Profile"
              >
                <User size={18} />
              </a>
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="hidden md:flex items-center gap-3"
            >
              <a
                href="/login"
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                {nav.loginLabel}
              </a>
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 text-sm font-semibold rounded-full bg-[#B7D96B] text-[#0D110B] hover:bg-[#9BC24F] transition-colors duration-200"
              >
                {nav.signupLabel}
              </motion.a>
            </motion.div>
          )}

          {/* Mobile hamburger */}
          <motion.button
            variants={itemVariants}
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#090C08]/80 backdrop-blur-xl border-b border-white/5 px-6 pb-6"
          >
            <ul className="pt-4 flex flex-col gap-1">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={`${link.label == "Workspace"? "_blank": ""}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {isLoggedIn ? (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center">
                <a
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-[#B7D96B]/50 transition-all"
                  aria-label="Profile"
                >
                  <User size={20} />
                </a>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 text-sm text-center text-white/70 hover:text-white transition-colors"
                >
                  {nav.loginLabel}
                </a>
                <a
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-center rounded-full bg-[#B7D96B] text-[#0D110B]"
                >
                  {nav.signupLabel}
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}