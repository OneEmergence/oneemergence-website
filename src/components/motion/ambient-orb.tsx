"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AmbientOrbProps {
  className?: string;
}

export function AmbientOrb({ className }: AmbientOrbProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Primary orb — aurora violet */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          background:
            "radial-gradient(circle, rgba(124,92,255,0.35) 0%, rgba(124,92,255,0.08) 50%, transparent 70%)",
          filter: "blur(60px)",
          top: "10%",
          left: "50%",
          translateX: "-50%",
        }}
        animate={prefersReduced ? { opacity: 0.85 } : {
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={prefersReduced ? { duration: 0 } : {
          duration: 8,
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
          filter: "blur(50px)",
          bottom: "15%",
          left: "15%",
        }}
        animate={prefersReduced ? { opacity: 0.65 } : {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.85, 0.5],
          y: [0, 25, 0],
          x: [0, -15, 0],
        }}
        transition={prefersReduced ? { duration: 0 } : {
          duration: 11,
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
          filter: "blur(45px)",
          top: "20%",
          right: "10%",
        }}
        animate={prefersReduced ? { opacity: 0.55 } : {
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.75, 0.4],
          y: [0, 20, 0],
          x: [0, 10, 0],
        }}
        transition={prefersReduced ? { duration: 0 } : {
          duration: 13,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
          delay: 4,
        }}
      />
    </div>
  );
}
