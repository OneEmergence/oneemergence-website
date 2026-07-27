"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionLevel } from "@/hooks/useMotionLevel";

interface MagneticButtonProps {
  children: ReactNode;
  /** Magnetic pull strength — 0.3 = 30% of cursor distance from center (default: 0.3) */
  strength?: number;
  /** Additional CSS class names */
  className?: string;
  /** HTML tag to render as (default: div) */
  as?: "div" | "span" | "li";
}

/**
 * A control that leans toward the cursor.
 *
 * Motion level: Flow — and it needs this explicit gate. The displacement is a
 * direct MotionValue write, so neither the CSS gates nor `MotionConfig` stop
 * it: in Still mode every primary nav target used to keep drifting up to 20px
 * toward the pointer. For someone with a tremor or limited fine motor control
 * that is a moving target in the main navigation, made worse by `cursor: none`
 * leaving only a small dot that moves with it.
 */
export function MagneticButton({
  children,
  strength = 0.3,
  className,
  as = "div",
}: MagneticButtonProps) {
  const allowFlow = useMotionLevel("flow");
  const ref = useRef<HTMLDivElement>(null);
  // Measured once on enter. Reading it per mousemove forced a layout flush on
  // the frames Lenis and the canvas already contend for — and because the
  // element is itself spring-translated, the live rect fed the pull back into
  // its own measured centre.
  const restRect = useRef<DOMRect | null>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness: 150, damping: 15 });
  const y = useSpring(rawY, { stiffness: 150, damping: 15 });

  const Component = motion[as] as typeof motion.div;

  if (!allowFlow) {
    return (
      <Component data-cursor="magnetic" className={className}>
        {children}
      </Component>
    );
  }

  const handleMouseEnter = () => {
    restRect.current = ref.current?.getBoundingClientRect() ?? null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = restRect.current;
    if (!rect) return;

    const distX = e.clientX - (rect.left + rect.width / 2);
    const distY = e.clientY - (rect.top + rect.height / 2);

    // Clamp displacement to max ~20px
    rawX.set(Math.max(-20, Math.min(20, distX * strength)));
    rawY.set(Math.max(-20, Math.min(20, distY * strength)));
  };

  const handleMouseLeave = () => {
    restRect.current = null;
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <Component
      ref={ref}
      data-cursor="magnetic"
      data-motion-level="flow"
      className={className}
      style={{ x, y }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Component>
  );
}
