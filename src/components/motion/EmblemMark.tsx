import Image from "next/image";
import { cn } from "@/lib/utils";

interface EmblemMarkProps {
  /** Rendered emblem width/height in px (the emblem is ~square). */
  size?: number;
  /** Preload for above-the-fold use (e.g. the home hero). */
  priority?: boolean;
  className?: string;
}

/**
 * The fixed point of the OneEmergence identity. Motion and light belong to
 * the surrounding field; the emblem itself stays unfiltered and still.
 */
export function EmblemMark({
  size = 120,
  priority = false,
  className,
}: EmblemMarkProps) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/logo-cosmic-yinyang-trimmed.png"
        alt="OneEmergence"
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
