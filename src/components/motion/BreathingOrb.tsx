"use client";

import { motion } from "framer-motion";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";

type OrbColor = "violet" | "cyan" | "gold";

const ORB_COLORS: Record<OrbColor, { center: string; edge: string }> = {
  violet: {
    center: "rgba(124, 92, 255, 0.4)",
    edge: "rgba(124, 92, 255, 0.08)",
  },
  cyan: {
    center: "rgba(84, 226, 233, 0.35)",
    edge: "rgba(84, 226, 233, 0.06)",
  },
  gold: {
    center: "rgba(246, 196, 83, 0.3)",
    edge: "rgba(246, 196, 83, 0.06)",
  },
};

interface BreathingOrbProps {
  /** Brand color of the orb */
  color?: OrbColor;
  /** Diameter in pixels (default: 200) */
  size?: number;
  /** Breathing cycle duration in seconds (default: 8) */
  breathRate?: number;
  /** Glow blur radius in pixels (default: 50) */
  glowIntensity?: number;
  className?: string;
}

/**
 * A single breathing orb — configurable color, size, and rhythm.
 *
 * Motion level: sacred — static in still mode, slow breathing in balanced,
 * full breathing with movement in immersive.
 */
export function BreathingOrb({
  color = "violet",
  size = 200,
  breathRate = 8,
  glowIntensity = 50,
  className,
}: BreathingOrbProps) {
  const allowSacred = useMotionLevel("sacred");
  const { effectiveMode } = useIntensityMode();

  const isStill = !allowSacred;
  const isImmersive = effectiveMode === "immersive";
  const palette = ORB_COLORS[color];

  const breathScale = isImmersive ? 1.15 : 1.08;
  const blur = isImmersive ? glowIntensity * 0.85 : glowIntensity;

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      data-motion-level="sacred"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${palette.center} 0%, ${palette.edge} 55%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
      animate={
        isStill
          ? { opacity: 0.5 }
          : {
              scale: [1, breathScale, 1],
              opacity: [0.6, 1, 0.6],
              y: isImmersive ? [0, -15, 0] : undefined,
            }
      }
      transition={
        isStill
          ? { duration: 0 }
          : {
              duration: breathRate,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }
      }
    />
  );
}
