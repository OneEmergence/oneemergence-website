"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";

interface ParallaxLayerProps {
  children: React.ReactNode;
  /** Parallax depth factor: 0 = no movement, 1 = full scroll-driven shift (default: 0.5) */
  depth?: number;
  /** Direction of parallax shift relative to scroll */
  direction?: "up" | "down";
  /** Maximum pixel displacement (default: 80) */
  range?: number;
  className?: string;
}

/**
 * Generic parallax wrapper for scroll-driven depth effects.
 * Wraps any content and shifts it along the Y axis as the user scrolls.
 *
 * Motion level: flow — disabled in still mode, scaled by intensity.
 */
export function ParallaxLayer({
  children,
  depth = 0.5,
  direction = "up",
  range = 80,
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const allowFlow = useMotionLevel("flow");
  const { effectiveMode } = useIntensityMode();

  // Still: no parallax; Balanced: 50% depth; Immersive: full depth
  const intensityScale = effectiveMode === "immersive" ? 1 : 0.5;
  const effectiveRange = !allowFlow ? 0 : range * depth * intensityScale;
  const sign = direction === "up" ? -1 : 1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [sign * effectiveRange, sign * -effectiveRange]
  );

  return (
    <div ref={ref} className={className} data-motion-level="flow">
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
