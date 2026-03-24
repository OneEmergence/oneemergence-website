"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/about", label: "Über uns" },
  { href: "/content", label: "Inhalte" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/contact", label: "Kontakt" },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.92]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: `rgba(10, 15, 31, ${bgOpacity.get()})`,
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
        <Link href="/" className="group flex items-center gap-2">
          <motion.span
            className="font-serif text-xl text-oe-solar-gold"
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
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href="/community"
          className="hidden rounded-full bg-oe-aurora-violet px-5 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85 md:block"
        >
          Mitmachen
        </Link>

        {/* Mobile menu button (placeholder) */}
        <button
          aria-label="Menü öffnen"
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className="block h-px w-6 bg-oe-pure-light" />
          <span className="block h-px w-6 bg-oe-pure-light" />
          <span className="block h-px w-4 bg-oe-pure-light" />
        </button>
      </nav>
    </motion.header>
  );
}
