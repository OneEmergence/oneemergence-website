"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  /** Magnetic pull strength — 0.3 = 30% of cursor distance from center (default: 0.3) */
  strength?: number;
  /** Additional CSS class names */
  className?: string;
  /** HTML tag to render as (default: div) */
  as?: "div" | "span" | "li";
}

export function MagneticButton({
  children,
  strength = 0.3,
  className,
  as = "div",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness: 150, damping: 15 });
  const y = useSpring(rawY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    // Clamp displacement to max ~20px
    const pullX = Math.max(-20, Math.min(20, distX * strength));
    const pullY = Math.max(-20, Math.min(20, distY * strength));

    rawX.set(pullX);
    rawY.set(pullY);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref}
      data-cursor="magnetic"
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Component>
  );
}
