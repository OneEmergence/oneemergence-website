"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { useMotionLevel } from "@/hooks/useMotionLevel";

/**
 * Lenis smooth scroll, gated on the motion hierarchy.
 *
 * Scroll inertia is the largest-area motion on the site — a 1.2s eased ramp on
 * every wheel tick — and it used to be the one motion no gate reached. A user
 * with `prefers-reduced-motion: reduce`, or one who deliberately picked Still,
 * still got full scroll hijacking while everything else went quiet, which
 * reads as a bug rather than a style. It is also the classic vestibular
 * trigger that Still mode exists to remove.
 *
 * The CSS gates cannot help here: Lenis drives `window.scrollTo` from a rAF
 * loop and never consults `scroll-behavior`. Only this JS gate works.
 *
 * The import sits inside the effect so Still-mode users neither download nor
 * run the library.
 *
 * Motion level: Flow.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const allowFlow = useMotionLevel("flow");
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!allowFlow) return;

    let rafId: number | undefined;
    let cancelled = false;

    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Without this, clicking a link mid-inertia lets Lenis discard Next's
        // scroll-to-top and drag the freshly mounted route back down to the
        // previous page's offset.
        stopInertiaOnNavigate: true,
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    })();

    return () => {
      cancelled = true;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
    // Re-runs when the user toggles intensity, so switching to Still tears the
    // instance down immediately and restores native scrolling.
  }, [allowFlow]);

  return <>{children}</>;
}
