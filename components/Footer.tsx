"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { footer } from "@/data/landingContent";

// ── Theme tokens (matches AboutSection / CtaSection — same light palette) ─
// base:    #FAFAF8  — warm cream ground
// accent:  #2F6B4F (logo mark, hover states)
// text:    #1B1A17 at varying opacity — dark ink on cream, inverse of the old dark footer

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#FAFAF8] border-t border-black/10 pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Top row: logo + columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#2F6B4F] flex items-center justify-center">
                <Zap size={14} className="text-[#FAFAF8]" />
              </div>
              <span className="font-bold text-base text-[#1B1A17]/90">
                {footer.logo}
              </span>
            </a>
            <p className="text-sm text-[#1B1A17]/45 leading-relaxed max-w-[200px]">
              {footer.tagline}
            </p>
          </div>

          {/* Link columns */}
          {footer.columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1B1A17]/35 mb-4">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#1B1A17]/55 hover:text-[#2F6B4F] transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row: copyright + social micro-links */}
        <div className="border-t border-black/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#1B1A17]/30">{footer.copyright}</p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <a
                key={social}
                href={`#${social.toLowerCase()}`}
                className="text-xs text-[#1B1A17]/30 hover:text-[#2F6B4F] transition-colors duration-200"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}