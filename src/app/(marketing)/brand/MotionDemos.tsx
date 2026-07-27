"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";
import { BreathingOrb } from "@/components/motion/BreathingOrb";

type Level = "Micro" | "Flow" | "Sacred" | "Event";

const LEVEL_ACCENT: Record<Level, string> = {
  Micro: "text-oe-spirit-cyan",
  Flow: "text-oe-aurora-violet-ink",
  Sacred: "text-oe-solar-gold",
  Event: "text-oe-living-green",
};

interface DemoCardProps {
  level: Level;
  purpose: string;
  token: string;
  timing: string;
  behavior: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function DemoCard({
  level,
  purpose,
  token,
  timing,
  behavior,
  children,
  action,
}: DemoCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02]">
      <div className="flex items-baseline justify-between gap-4 border-b border-oe-aurora-violet/10 px-5 py-4">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-widest",
              LEVEL_ACCENT[level]
            )}
          >
            {level}
          </p>
          <p className="mt-1 text-sm text-oe-pure-light/60">{purpose}</p>
        </div>
        {action}
      </div>

      <div className="relative flex min-h-[180px] flex-1 items-center justify-center bg-oe-deep-space p-6">
        {children}
      </div>

      <div className="space-y-1 border-t border-oe-aurora-violet/10 px-5 py-4">
        <p className="font-mono text-[0.7rem] text-oe-spirit-cyan/80">{token}</p>
        <p className="font-mono text-[0.7rem] text-oe-pure-light/55">{timing}</p>
        <p className="mt-2 text-xs leading-relaxed text-oe-pure-light/55">
          {behavior}
        </p>
      </div>
    </div>
  );
}

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-oe-aurora-violet/30 px-3 py-1.5 text-xs text-oe-pure-light/70 transition-colors duration-150 hover:border-oe-aurora-violet/60 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet"
    >
      <RotateCcw className="h-3 w-3" aria-hidden="true" />
      Replay
    </button>
  );
}

export function MotionDemos() {
  const { effectiveMode } = useIntensityMode();
  const allowFlow = useMotionLevel("flow");
  const allowEvent = useMotionLevel("event");

  const [flowKey, setFlowKey] = useState(0);
  const [eventKey, setEventKey] = useState(0);

  return (
    <div>
      <p className="mb-6 text-sm text-oe-pure-light/60">
        Intensity mode:{" "}
        <span className="font-semibold text-oe-solar-gold capitalize">
          {effectiveMode}
        </span>{" "}
        — change it with the toggle in the top navigation. Sacred and Event
        levels are gated in Still mode; all levels respect{" "}
        <span className="font-mono text-xs">prefers-reduced-motion</span>.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Micro — always active */}
        <DemoCard
          level="Micro"
          purpose="Feedback & affordance"
          token="--oe-transition-fast"
          timing="150ms · ease"
          behavior="Instant confirmation of intent. Always active — present even in Still mode, because it communicates state rather than atmosphere."
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="rounded-full border border-oe-spirit-cyan/40 px-6 py-3 text-sm text-oe-spirit-cyan transition-colors duration-150 hover:bg-oe-spirit-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            Hover or focus me
          </motion.button>
        </DemoCard>

        {/* Flow — balanced + immersive */}
        <DemoCard
          level="Flow"
          purpose="Navigation & continuity"
          token="--oe-transition-base / --oe-transition-slow"
          timing="300–600ms · ease / ease-out-expo"
          behavior="Content that arrives with intent — panels, reveals, transitions between states. Balanced & Immersive only; Still mode renders it in place instantly."
          action={allowFlow ? <ReplayButton onClick={() => setFlowKey((k) => k + 1)} /> : undefined}
        >
          {allowFlow ? (
            <motion.div
              key={flowKey}
              data-motion-level="flow"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xs rounded-xl border border-oe-aurora-violet/25 bg-oe-aurora-violet/10 p-5 text-sm text-oe-pure-light/80"
            >
              A panel slides into view — the eye follows a clear line of
              continuity.
            </motion.div>
          ) : (
            <div className="w-full max-w-xs rounded-xl border border-oe-aurora-violet/25 bg-oe-aurora-violet/10 p-5 text-sm text-oe-pure-light/80">
              In Still mode the panel simply appears — no travel, no delay.
            </div>
          )}
        </DemoCard>

        {/* Sacred — breathing orb */}
        <DemoCard
          level="Sacred"
          purpose="Contemplation & presence"
          token="--oe-transition-sacred"
          timing="1200ms · cubic-bezier(0.22, 1, 0.36, 1)"
          behavior="Slow, continuous, ambient — a breath rather than a gesture. Balanced breathes gently; Immersive adds drift; Still holds a static glow."
        >
          <BreathingOrb color="gold" size={150} breathRate={8} />
        </DemoCard>

        {/* Event — threshold / portal */}
        <DemoCard
          level="Event"
          purpose="Ceremony & threshold"
          token="--oe-transition-sacred"
          timing="1200ms · cubic-bezier(0.22, 1, 0.36, 1)"
          behavior="A rare, deliberate crossing — the portal opening, a moment marked. Immersive only; every other mode shows the destination without the passage."
          action={allowEvent ? <ReplayButton onClick={() => setEventKey((k) => k + 1)} /> : undefined}
        >
          {allowEvent ? (
            <motion.div
              key={eventKey}
              data-motion-level="event"
              initial={{ clipPath: "circle(0% at 50% 50%)", opacity: 0.3 }}
              animate={{ clipPath: "circle(75% at 50% 50%)", opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full w-full items-center justify-center rounded-xl bg-[radial-gradient(circle_at_center,rgba(110,219,143,0.25),rgba(124,92,255,0.12)_55%,transparent_75%)] p-6 text-center text-sm text-oe-pure-light/85"
            >
              You have crossed a threshold.
            </motion.div>
          ) : (
            <p className="text-center text-sm text-oe-pure-light/55">
              Plays only in Immersive mode.
            </p>
          )}
        </DemoCard>
      </div>
    </div>
  );
}
