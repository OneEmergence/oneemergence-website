"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIntensityMode } from "@/hooks/useIntensityMode";
import { useFinePointer } from "@/hooks/usePointerType";

export function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const isDesktop = useFinePointer();
  const { effectiveMode } = useIntensityMode();
  const isStill = effectiveMode === "still";
  const isImmersive = effectiveMode === "immersive";

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Dot: follows exactly with tight spring
  const dotX = useSpring(rawX, { stiffness: 500, damping: 28 });
  const dotY = useSpring(rawY, { stiffness: 500, damping: 28 });

  // Ring: follows with lag for trailing effect
  const ringX = useSpring(rawX, { stiffness: 150, damping: 15 });
  const ringY = useSpring(rawY, { stiffness: 150, damping: 15 });

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

  // Owns the flag that hides the native cursor. The CSS used to key off
  // `data-intensity` alone, so from the moment intensity resolved until the
  // first mousemove there was no pointer on screen at all — unbounded for
  // anyone arriving via keyboard, wheel, or a background tab. Now the two are
  // one source of truth: the native cursor is only hidden once its
  // replacement is actually drawn.
  const cursorActive = isDesktop && !isStill && visible;
  useEffect(() => {
    const root = document.documentElement;
    if (cursorActive) root.dataset.customCursor = "on";
    else delete root.dataset.customCursor;
    return () => {
      delete root.dataset.customCursor;
    };
  }, [cursorActive]);

  if (!isDesktop) return null;

  // Still mode: no custom cursor at all — restore native cursor via CSS
  if (isStill) return null;

  // Geometry is fixed in `style`; only compositable properties are animated.
  // Previously `width`/`height`/`boxShadow` were animated on a layer that is
  // already moving every frame, so each hover forced paint + re-raster of a
  // moving compositor layer. Animating `scale` AND `width` together also
  // stacked into a 2.25x jump rather than the intended 1.5x.
  return (
    <>
      {/* Trail ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border-2 border-solid"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: 32,
          height: 32,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          borderColor: hovered
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(255, 255, 255, 0.4)",
          scale: hovered ? 1.5 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />

      {/* Immersive glow — its own layer so the ring's raster stays cheap. */}
      {isImmersive && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-[9997] rounded-full bg-oe-aurora-violet/30 blur-lg"
          style={{
            x: ringX,
            y: ringY,
            translateX: "-50%",
            translateY: "-50%",
            width: 48,
            height: 48,
          }}
          animate={{ opacity: visible && hovered ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}

      {/* Inner dot */}
      <motion.div
        // Decorative, carries no text — the brand violet is correct here.
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-oe-aurora-violet"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          width: 8,
          height: 8,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovered ? 0.75 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
