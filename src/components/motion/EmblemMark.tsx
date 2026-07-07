"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";

type GlowColor = "violet" | "gold" | "green" | "none";

const GLOW: Record<Exclude<GlowColor, "none">, string> = {
  violet: "rgba(124,92,255,0.30)",
  gold: "rgba(246,196,83,0.28)",
  green: "rgba(110,219,143,0.26)",
};

interface EmblemMarkProps {
  /** Rendered emblem width/height in px (the emblem is ~square). */
  size?: number;
  /** Aura color behind the emblem. */
  glow?: GlowColor;
  /** Preload for above-the-fold use (e.g. the home hero). */
  priority?: boolean;
  className?: string;
}

/**
 * The cosmic yin-yang emblem — blue cosmos and orange warmth, each half
 * carrying the seed of the other. Rendered with a soft aura and a slow
 * breath (sacred motion, static in Still mode).
 */
export function EmblemMark({
  size = 120,
  glow = "gold",
  priority = false,
  className,
}: EmblemMarkProps) {
  const allowSacred = useMotionLevel("sacred");
  const { effectiveMode } = useIntensityMode();
  const isImmersive = effectiveMode === "immersive";

  const auraColor = glow === "none" ? null : GLOW[glow];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {auraColor && (
        <motion.span
          aria-hidden="true"
          data-motion-level="sacred"
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: "-30%",
            background: `radial-gradient(circle, ${auraColor} 0%, transparent 68%)`,
            filter: `blur(${size * 0.16}px)`,
          }}
          animate={
            allowSacred
              ? {
                  opacity: [0.55, 0.95, 0.55],
                  scale: [1, isImmersive ? 1.12 : 1.06, 1],
                }
              : { opacity: 0.6 }
          }
          transition={
            allowSacred
              ? {
                  duration: isImmersive ? 7 : 10,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }
              : { duration: 0 }
          }
        />
      )}

      <motion.div
        data-motion-level="sacred"
        className="relative"
        style={{ width: size, height: size }}
        animate={
          allowSacred
            ? { scale: [1, isImmersive ? 1.035 : 1.02, 1] }
            : { scale: 1 }
        }
        transition={
          allowSacred
            ? {
                duration: isImmersive ? 9 : 13,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
              }
            : { duration: 0 }
        }
      >
        <Image
          src="/images/logo-cosmic-yinyang-trimmed.png"
          alt="OneEmergence"
          width={size}
          height={size}
          priority={priority}
          sizes={`${size}px`}
          className="h-full w-full object-contain"
        />
      </motion.div>
    </div>
  );
}
