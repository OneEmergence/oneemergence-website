"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";
import { useFinePointer } from "@/hooks/usePointerType";

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
  const allowFlow = useMotionLevel('flow');
  const { effectiveMode } = useIntensityMode();

  // SSR-stable and reactive. A bare `matchMedia` read during render made the
  // server (false → offset 20) and the first client render on touch (0)
  // disagree, i.e. a hydration mismatch on every cover in the journal grid.
  const isFinePointer = useFinePointer();

  // Still: no parallax; Balanced: subtle; Immersive: full depth
  const depthScale = effectiveMode === 'immersive' ? 1 : 0.5;
  const effectiveOffset = !allowFlow || !isFinePointer ? 0 : offset * depthScale;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-effectiveOffset, effectiveOffset]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} data-motion-level="flow">
      <motion.div
        style={{
          y,
          position: "absolute",
          top: `-${effectiveOffset}px`,
          right: 0,
          bottom: `-${effectiveOffset}px`,
          left: 0,
        }}
        // Only promote a layer that actually moves; a standing
        // `will-change: transform` costs GPU memory on exactly the devices
        // (touch, Still mode) where the offset is zeroed anyway.
        className={effectiveOffset !== 0 ? "will-change-transform" : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
}
