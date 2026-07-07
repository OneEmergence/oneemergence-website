"use client";

import { motion } from "framer-motion";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";

interface AmbientOrbProps {
  className?: string;
}

export function AmbientOrb({ className }: AmbientOrbProps) {
  const allowSacred = useMotionLevel('sacred');
  const { effectiveMode } = useIntensityMode();

  // Still mode: static orb with subtle gradient, no animation
  const isStill = !allowSacred;
  const isImmersive = effectiveMode === 'immersive';

  // Balanced: slow breathing; Immersive: full breathing with enhanced glow
  const breathScale = isImmersive ? 1.15 : 1.08;
  const breathDuration = isImmersive ? 8 : 12;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      data-motion-level="sacred"
    >
      {/* Primary orb — aurora violet */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          background:
            "radial-gradient(circle, rgba(124,92,255,0.35) 0%, rgba(124,92,255,0.08) 50%, transparent 70%)",
          filter: isImmersive ? "blur(60px)" : "blur(70px)",
          top: "10%",
          left: "50%",
          translateX: "-50%",
        }}
        animate={isStill ? { opacity: 0.6 } : {
          scale: [1, breathScale, 1],
          opacity: [0.7, 1, 0.7],
          y: isImmersive ? [0, -30, 0] : [0, -10, 0],
          x: isImmersive ? [0, 20, 0] : undefined,
        }}
        transition={isStill ? { duration: 0 } : {
          duration: breathDuration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />

      {/* Secondary orb — spirit cyan, offset bottom-left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "min(400px, 70vw)",
          height: "min(400px, 70vw)",
          background:
            "radial-gradient(circle, rgba(84,226,233,0.25) 0%, rgba(84,226,233,0.06) 55%, transparent 70%)",
          filter: isImmersive ? "blur(50px)" : "blur(60px)",
          bottom: "15%",
          left: "15%",
        }}
        animate={isStill ? { opacity: 0.45 } : {
          scale: [1, breathScale * 1.04, 1],
          opacity: [0.5, 0.85, 0.5],
          y: isImmersive ? [0, 25, 0] : [0, -8, 0],
          x: isImmersive ? [0, -15, 0] : undefined,
        }}
        transition={isStill ? { duration: 0 } : {
          duration: breathDuration * 1.35,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
          delay: 2,
        }}
      />

      {/* Accent orb — solar gold, top-right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "min(300px, 60vw)",
          height: "min(300px, 60vw)",
          background:
            "radial-gradient(circle, rgba(246,196,83,0.2) 0%, rgba(246,196,83,0.05) 55%, transparent 70%)",
          filter: isImmersive ? "blur(45px)" : "blur(55px)",
          top: "20%",
          right: "10%",
        }}
        animate={isStill ? { opacity: 0.35 } : {
          scale: [1, breathScale * 0.95, 1],
          opacity: [0.4, 0.75, 0.4],
          y: isImmersive ? [0, 20, 0] : [0, -6, 0],
          x: isImmersive ? [0, 10, 0] : undefined,
        }}
        transition={isStill ? { duration: 0 } : {
          duration: breathDuration * 1.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
          delay: 4,
        }}
      />
    </div>
  );
}
