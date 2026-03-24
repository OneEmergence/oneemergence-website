"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const x = useSpring(rawX, { stiffness: 500, damping: 40, mass: 0.3 });
  const y = useSpring(rawY, { stiffness: 500, damping: 40, mass: 0.3 });

  const trailX = useSpring(rawX, { stiffness: 120, damping: 28, mass: 0.5 });
  const trailY = useSpring(rawY, { stiffness: 120, damping: 28, mass: 0.5 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const over = (e: MouseEvent) => {
      const target = e.target as Element;
      const isInteractive = target.closest("a, button, [data-cursor-hover]");
      setHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [rawX, rawY, visible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Trail ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border border-oe-aurora-violet/50"
        style={{
          x: trailX,
          y: trailY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovered ? 44 : 28,
          height: hovered ? 44 : 28,
          opacity: visible ? 1 : 0,
          borderColor: hovered
            ? "rgba(246, 196, 83, 0.7)"
            : "rgba(124, 92, 255, 0.5)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-oe-solar-gold"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovered ? 6 : 5,
          height: hovered ? 6 : 5,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
