"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ParallaxImageProps {
  children: React.ReactNode;
  /** Pixel range of parallax displacement (default: 20) */
  offset?: number;
  className?: string;
}

/**
 * Wraps an image (or any content) with a scroll-driven parallax shift.
 * The inner container extends `offset` px above and below the clipping
 * boundary so the image never shows gaps at the extremes.
 *
 * Parallax is disabled when `prefers-reduced-motion` is active or when
 * the device uses a coarse pointer (touch), preserving mobile performance.
 */
export function ParallaxImage({ children, offset = 20, className = "" }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Check for coarse pointer (touch device) at mount time — safe on client
  const isCoarsePointer =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const effectiveOffset = prefersReduced || isCoarsePointer ? 0 : offset;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-effectiveOffset, effectiveOffset]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{
          y,
          position: "absolute",
          top: `-${effectiveOffset}px`,
          right: 0,
          bottom: `-${effectiveOffset}px`,
          left: 0,
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
