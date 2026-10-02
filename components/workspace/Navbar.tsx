"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Zap, Search, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard, FileText } from "lucide-react";
import { workspaceNav } from "@/data/landingContent";
import { getUserMe, logoutUser, type UserProfile } from "@/lib/api";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user details for profile dropdown
    getUserMe()
      .then(setUser)
      .catch(() => {
        // Silently handle if unauthenticated (middleware will handle redirect)
      });
  }, []);

  // Cmd+K / Ctrl+K search hotkey + Click outside close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "N";

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
          className="flex items-center gap-2 shrink-0 group"
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-105">
            <Zap size={14} style={{ color: "var(--accent-ink)" }} />
          </div>
          <span className="font-bold text-base tracking-tight text-[var(--text-light)]">
            {workspaceNav.logo}
          </span>
        </MotionLink>

        {/* Nav links */}
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

        {/* Spacer */}
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
          className="relative p-2 rounded-lg text-[var(--text-light)]/50 hover:text-[var(--text-light)] hover:bg-[var(--accent-pale)] transition-colors duration-200 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        </motion.button>

        {/* Profile Dropdown Trigger */}
        <div className="relative" ref={menuRef}>
          <motion.button
            variants={itemVariants}
            onClick={() => setMenuOpen((prev) => !prev)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full border border-[var(--accent)]/20 hover:border-[var(--accent)]/40 bg-white/5 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B7D96B] to-[#8CAE42] flex items-center justify-center text-[12px] font-bold text-[#0D110B] shadow-sm">
              {userInitial}
            </div>
            <ChevronDown size={13} className={`text-[var(--text-light)]/50 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
          </motion.button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#12160F] border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-2xl"
              >
                {/* User Info Header */}
                <div className="px-3 py-3 border-b border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B7D96B] to-[#8CAE42] flex items-center justify-center text-sm font-bold text-[#0D110B]">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user?.name || "Nexus User"}
                    </p>
                    <p className="text-[11px] text-white/50 truncate">
                      {user?.email || "authenticated"}
                    </p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="py-1.5 space-y-0.5">
                  <Link
                    href="/workspace"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard size={14} className="text-[#B7D96B]" />
                    <span>Workspace Overview</span>
                  </Link>

                  <Link
                    href="/workspace/documents"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FileText size={14} className="text-[#B7D96B]" />
                    <span>Documents</span>
                  </Link>

                  <Link
                    href="/workspace/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings size={14} className="text-[#B7D96B]" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout Action */}
                <div className="pt-1.5 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </motion.header>
  );
}