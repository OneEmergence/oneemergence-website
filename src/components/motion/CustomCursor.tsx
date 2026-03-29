"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Dot: follows exactly with tight spring
  const dotX = useSpring(rawX, { stiffness: 500, damping: 28 });
  const dotY = useSpring(rawY, { stiffness: 500, damping: 28 });

  // Ring: follows with lag for trailing effect
  const ringX = useSpring(rawX, { stiffness: 150, damping: 15 });
  const ringY = useSpring(rawY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    // Only render on desktop (fine pointer)
    const mq = window.matchMedia("(pointer: fine)");
    setIsDesktop(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const over = (e: MouseEvent) => {
      const target = e.target as Element;
      const isInteractive = target.closest(
        'a, button, [data-cursor="magnetic"], [data-cursor-hover]'
      );
      setHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [rawX, rawY, visible, isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Trail ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovered ? 48 : 32,
          height: hovered ? 48 : 32,
          opacity: visible ? 1 : 0,
          borderWidth: 2,
          borderColor: hovered
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(255, 255, 255, 0.4)",
          scale: hovered ? 1.5 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        initial={{
          borderStyle: "solid",
          borderWidth: 2,
          borderColor: "rgba(255, 255, 255, 0.4)",
          background: "transparent",
        }}
      />

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "#a855f7",
        }}
        animate={{
          width: hovered ? 6 : 8,
          height: hovered ? 6 : 8,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
