"use client";

import { cn } from "@/lib/utils";
import { BreathingOrb } from "@/components/motion/BreathingOrb";

/**
 * Decorative depth-layer backdrop. Renders behind page content as a single
 * negative-z layer (pair with `relative isolate` on the parent so in-flow
 * sections paint above it without per-section z-wrangling).
 *
 * Motion level: sacred — the static gradient wash always renders; the
 * breathing accent orbs are gated by BreathingOrb to balanced/immersive.
 *
 * Layer semantics (see brand spec — the three depths):
 * - solarpunk:    middle layer — living-green + solar-gold, dawn rising into cosmos
 * - transitional: outer cosmic base with the first hints of gold/sand warmth
 */
type AtmosphereVariant = "solarpunk" | "transitional";

interface OrbSpec {
  color: "violet" | "cyan" | "gold" | "green" | "sand";
  size: number;
  breathRate: number;
  glowIntensity: number;
  /** Positioning classes for the orb wrapper. */
  position: string;
}

interface VariantConfig {
  /** Composited static radial washes painted as the base tint. */
  wash: string;
  orbs: OrbSpec[];
}

const VARIANTS: Record<AtmosphereVariant, VariantConfig> = {
  // Middle depth: darkness stays the base, but dawn light rises — green from
  // the ground, gold overhead, a thread of cyan bridging back to the cosmos.
  solarpunk: {
    wash: [
      "radial-gradient(ellipse 120% 70% at 50% 118%, rgba(110,219,143,0.10) 0%, transparent 62%)",
      "radial-gradient(ellipse 90% 55% at 78% -8%, rgba(246,196,83,0.09) 0%, transparent 58%)",
      "radial-gradient(ellipse 130% 90% at 50% 100%, rgba(16,27,46,0.85) 0%, transparent 70%)",
    ].join(", "),
    orbs: [
      { color: "green", size: 620, breathRate: 15, glowIntensity: 90, position: "-bottom-40 left-1/2 -translate-x-1/2" },
      { color: "gold", size: 460, breathRate: 18, glowIntensity: 80, position: "-top-32 right-[6%]" },
      { color: "cyan", size: 360, breathRate: 21, glowIntensity: 70, position: "top-[38%] -left-24" },
    ],
  },
  // Outer cosmic base warming at the edges — a whisper of sand and gold
  // entering the void, the threshold toward the inner layers.
  transitional: {
    wash: [
      "radial-gradient(ellipse 100% 60% at 50% 116%, rgba(232,201,168,0.07) 0%, transparent 60%)",
      "radial-gradient(ellipse 80% 50% at 18% -6%, rgba(124,92,255,0.08) 0%, transparent 55%)",
    ].join(", "),
    orbs: [
      { color: "sand", size: 520, breathRate: 19, glowIntensity: 90, position: "-bottom-44 right-[12%]" },
      { color: "violet", size: 420, breathRate: 22, glowIntensity: 80, position: "-top-32 -left-16" },
    ],
  },
};

interface LayerAtmosphereProps {
  variant: AtmosphereVariant;
  className?: string;
}

export function LayerAtmosphere({ variant, className }: LayerAtmosphereProps) {
  const config = VARIANTS[variant];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Static tint wash — always present, no motion */}
      <div className="absolute inset-0" style={{ background: config.wash }} />

      {/* Breathing accent orbs — sacred motion, gated by BreathingOrb */}
      {config.orbs.map((orb, i) => (
        <div key={i} className={cn("absolute", orb.position)}>
          <BreathingOrb
            color={orb.color}
            size={orb.size}
            breathRate={orb.breathRate}
            glowIntensity={orb.glowIntensity}
          />
        </div>
      ))}
    </div>
  );
}
