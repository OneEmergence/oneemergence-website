import { cn } from "@/lib/utils";

export type AtmosphereVariant =
  | "cosmic"
  | "solarpunk"
  | "transitional"
  | "warm";

interface LayerAtmosphereProps {
  variant: AtmosphereVariant;
  className?: string;
}

/**
 * Page-length depth field derived from the emblem's S-curve, double ring,
 * and orbit points. The generated artwork is static; the linework gains a
 * small compositor-only scroll drift when motion is allowed.
 *
 * Motion level: Flow. Still mode keeps the complete composition static.
 */
export function LayerAtmosphere({ variant, className }: LayerAtmosphereProps) {
  return (
    <div
      aria-hidden="true"
      data-atmosphere={variant}
      data-motion-level="flow"
      className={cn(
        "oe-atmosphere pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="oe-atmosphere__wash" />
      <div className="oe-atmosphere__artwork oe-atmosphere__artwork--top" />
      <div className="oe-atmosphere__artwork oe-atmosphere__artwork--echo" />

      <svg
        className="oe-atmosphere__linework"
        viewBox="0 0 1000 2400"
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
      >
        <path
          className="oe-atmosphere__spine oe-atmosphere__spine--halo"
          d="M540-120C835 170 820 430 560 625C300 820 300 1050 520 1220C750 1395 735 1650 470 1835C205 2020 230 2260 520 2520"
        />
        <path
          className="oe-atmosphere__spine"
          d="M540-120C835 170 820 430 560 625C300 820 300 1050 520 1220C750 1395 735 1650 470 1835C205 2020 230 2260 520 2520"
        />
        <path
          className="oe-atmosphere__orbit oe-atmosphere__orbit--a"
          d="M302 625C352 494 480 414 620 430C758 446 853 553 852 680"
        />
        <path
          className="oe-atmosphere__orbit oe-atmosphere__orbit--b"
          d="M171 1754C232 1605 379 1524 535 1558C673 1588 765 1707 753 1842"
        />
        <circle className="oe-atmosphere__node" cx="620" cy="430" r="6" />
        <circle className="oe-atmosphere__node" cx="302" cy="625" r="3.5" />
        <circle className="oe-atmosphere__node" cx="535" cy="1558" r="5" />
        <circle className="oe-atmosphere__node" cx="753" cy="1842" r="3" />
      </svg>

      <div className="oe-atmosphere__vignette" />
    </div>
  );
}
