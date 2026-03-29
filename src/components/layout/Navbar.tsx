"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/components/layout/AudioProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";

const navLinks = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/experiences", label: "Erfahrungen" },
  { href: "/library", label: "Bibliothek" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "Über uns" },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { isPlaying, toggle } = useAudio();
  const [menuOpen, setMenuOpen] = useState(false);

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.92]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const bgColor = useMotionTemplate`rgba(10, 15, 31, ${bgOpacity})`;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: bgColor,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-oe-aurora-violet/30"
        style={{ opacity: borderOpacity }}
      />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="group flex items-center gap-2">
          <motion.span
            className="font-serif text-lg sm:text-xl text-oe-solar-gold"
            whileHover={{ opacity: 0.85 }}
            transition={{ duration: 0.2 }}
          >
            OneEmergence
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <MagneticButton as="span" strength={0.3}>
                  <Link
                    href={href}
                    className={cn(
                      "relative text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-oe-solar-gold"
                        : "text-oe-pure-light/70 hover:text-oe-pure-light"
                    )}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-oe-solar-gold"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </MagneticButton>
              </li>
            );
          })}
        </ul>

        {/* Audio toggle + CTA (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <motion.button
            onClick={toggle}
            aria-label={isPlaying ? "Ambient-Ton ausschalten" : "Ambient-Ton einschalten"}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-500",
              isPlaying
                ? "border-oe-spirit-cyan/60 text-oe-spirit-cyan"
                : "border-oe-pure-light/20 text-oe-pure-light/40 hover:border-oe-pure-light/40 hover:text-oe-pure-light/70"
            )}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying && (
              <motion.span
                className="absolute inset-0 rounded-full bg-oe-spirit-cyan/10"
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isPlaying ? <Volume2 size={14} strokeWidth={1.5} /> : <VolumeX size={14} strokeWidth={1.5} />}
          </motion.button>

          <MagneticButton as="span" strength={0.3}>
            <Link
              href="/community"
              className="rounded-full bg-oe-aurora-violet px-5 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85"
            >
              Mitmachen
            </Link>
          </MagneticButton>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={menuOpen}
          className="flex flex-col gap-1.5 p-2.5 -m-1 min-h-[44px] min-w-[44px] items-center justify-center md:hidden"
        >
          <span
            className={cn(
              "block h-px w-6 bg-oe-pure-light origin-center transition-all duration-300",
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            )}
          />
          <span
            className={cn(
              "block h-px w-6 bg-oe-pure-light transition-all duration-300",
              menuOpen ? "opacity-0 scale-x-0" : ""
            )}
          />
          <span
            className={cn(
              "block h-px bg-oe-pure-light origin-center transition-all duration-300",
              menuOpen ? "w-6 -translate-y-[7px] -rotate-45" : "w-4"
            )}
          />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden border-t border-oe-aurora-violet/20 md:hidden"
            style={{ backgroundColor: "rgba(10, 15, 31, 0.97)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex flex-col px-6 py-5 gap-1 max-h-[calc(100dvh-64px)] overflow-y-auto">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className={cn(
                      "py-3 text-base font-medium border-b border-oe-aurora-violet/10 last:border-0 transition-colors duration-200",
                      isActive
                        ? "text-oe-solar-gold"
                        : "text-oe-pure-light/70 hover:text-oe-pure-light"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/community"
                onClick={closeMenu}
                className="mt-4 rounded-full bg-oe-aurora-violet px-5 py-3 text-sm font-medium text-white text-center transition-opacity duration-200 hover:opacity-85"
              >
                Mitmachen
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
