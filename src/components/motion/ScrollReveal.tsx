"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const prefersReduced = useReducedMotion();

  const words = text.split(" ");

  if (prefersReduced) {
    return (
      <Tag className={cn(className)}>
        {text}
      </Tag>
    );
  }

  return (
    <div ref={containerRef}>
      <Tag className={cn(className)} aria-label={text}>
        {words.map((word, i) => (
          <span
            key={i}
            className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] mb-[-0.1em] last:mr-0"
          >
            <motion.span
              className="inline-block"
              initial={{ y: "110%", opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: delay + i * stagger,
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
