"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  num: string;
  label: string;
}

/**
 * Sticky in-page chapter rail with scroll-spy. Plain anchor links keep it
 * working without JS; the IntersectionObserver only drives the active state.
 */
export function JumpNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Brand guide chapters"
      className="sticky top-14 z-30 border-b border-oe-aurora-violet/15 bg-oe-deep-space/85 backdrop-blur-md sm:top-16"
    >
      <ul className="flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="flex-shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  isActive
                    ? "bg-oe-aurora-violet/15 text-oe-solar-gold"
                    : "text-oe-pure-light/55 hover:text-oe-pure-light"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[0.65rem]",
                    isActive ? "text-oe-aurora-violet-ink" : "text-oe-pure-light/55"
                  )}
                >
                  {s.num}
                </span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
