"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Zap, Search, Bell, ChevronDown } from "lucide-react";
import { workspaceNav } from "@/data/landingContent";

// ── Theme tokens (same brand system as the marketing Navbar/Hero/About) ──
// base:    #090C08 / #0D110B  — near-black, always-solid here (dashboards
//          don't need the scroll-scrim trick the marketing navbar uses —
//          the app is the only thing behind it, so it can just be solid)
// accent:  #B7D96B  — lime-green, unchanged from the marketing brand
// border:  rgba(255,255,255,0.08)
// text:    white at varying opacity

const MotionLink = motion(Link);

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function WorkspaceNavbar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K focuses the search input, matching the hint badge shown
  // inside it. Escape blurs it back out.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-[var(--base)] shadow-[0_1px_0_rgba(0,0,0,0.35)]"
    >
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto px-6 h-16 flex items-center gap-8"
      >
        {/* Logo */}
        <MotionLink
          href="/workspace"
          variants={itemVariants}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Zap size={14} style={{ color: "var(--accent-ink)" }} />
          </div>
          <span className="font-bold text-base tracking-tight text-[var(--text-light)]">
            {workspaceNav.logo}
          </span>
        </MotionLink>

        {/* Nav links — sliding lime indicator under the active tab, shared
            layoutId gives the smooth "morph" animation between tabs */}
        <motion.ul variants={itemVariants} className="hidden md:flex items-center gap-1">
          {workspaceNav.links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`relative z-10 block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    isActive ? "text-[var(--text-light)]" : "text-[var(--text-light)]/50 hover:text-[var(--text-light)]"
                  }`}
                >
                  {link.label}
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="workspace-nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-[var(--accent-pale)]"
                  />
                )}
              </li>
            );
          })}
        </motion.ul>

        {/* Spacer pushes the utility icons to the right */}
        <div className="flex-1" />

        {/* Search */}
        <motion.div variants={itemVariants} className="hidden sm:flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-pale)] border transition-colors duration-200 ${
              searchFocused ? "border-[var(--accent)]/40" : "border-[var(--accent)]/15"
            }`}
          >
            <Search size={14} className="text-[var(--text-light)]/40 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search…"
              className="bg-transparent outline-none text-xs text-[var(--text-light)] placeholder:text-[var(--text-light)]/40 w-32 focus:w-48 transition-all duration-200"
            />
            {!searchFocused && !searchQuery && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--accent)]/15 text-[var(--text-light)]/30 shrink-0">
                ⌘K
              </span>
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.button
          variants={itemVariants}
          onClick={() => setNotifOpen((o) => !o)}
          whileTap={{ scale: 0.94 }}
          className="relative p-2 rounded-lg text-[var(--text-light)]/50 hover:text-[var(--text-light)] hover:bg-[var(--accent-pale)] transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        </motion.button>

        {/* Profile */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-[var(--accent)]/15 hover:border-[var(--accent)]/35 transition-colors duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center text-[11px] font-bold text-[var(--accent-ink)]">
            N
          </div>
          <ChevronDown size={13} className="text-[var(--text-light)]/40" />
        </motion.button>
      </motion.nav>
    </motion.header>
  );
}