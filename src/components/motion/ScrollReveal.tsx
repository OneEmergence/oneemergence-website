"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMotionLevel } from "@/hooks/useMotionLevel";
import { useIntensityMode } from "@/hooks/useIntensityMode";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

interface ScrollRevealProps {
  text: string;
  /** HTML element to render (default: "p") */
  as?: HeadingTag;
  className?: string;
  /** Extra delay before the first word animates in (seconds) */
  delay?: number;
  /** Stagger between each word (seconds, default: 0.06) */
  stagger?: number;
}

/**
 * Splits `text` into words and reveals them one-by-one with a slide-up
 * + fade effect when the element scrolls into view.
 *
 * Usage:
 *   <ScrollReveal text="Wofür wir stehen" as="h2" className="font-serif text-4xl" />
 */
export function ScrollReveal({
  text,
  as: Tag = "p",
  className,
  delay = 0,
  stagger = 0.06,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  const allowFlow = useMotionLevel('flow');
  const { effectiveMode } = useIntensityMode();

  const words = text.split(" ");

  // Still mode: render immediately, no animation
  if (!allowFlow) {
    return (
      <Tag className={cn(className)}>
        {text}
      </Tag>
    );
  }

  // Balanced: subtle fade-in; Immersive: full slide-up reveal
  const isImmersive = effectiveMode === 'immersive';

  return (
    <div ref={containerRef} data-motion-level="flow">
      <Tag className={cn(className)} aria-label={text}>
        {words.map((word, i) => (
          <span
            key={i}
            className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] mb-[-0.1em] last:mr-0"
          >
            <motion.span
              className="inline-block"
              initial={{ y: isImmersive ? "110%" : "40%", opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: isImmersive ? "110%" : "40%", opacity: 0 }}
              transition={{
                duration: isImmersive ? 0.6 : 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: delay + i * (isImmersive ? stagger : stagger * 0.5),
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  );
}
