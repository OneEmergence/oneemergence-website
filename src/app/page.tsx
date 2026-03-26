"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AmbientOrb } from "@/components/ui/ambient-orb";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-oe-deep-space text-oe-pure-light px-6 text-center pt-20">
      <AmbientOrb />
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-oe-solar-gold mb-6">
          OneEmergence
        </h1>
        <p className="text-base sm:text-xl md:text-2xl max-w-2xl text-oe-spirit-cyan mb-10 sm:mb-12">
          Eine digitale Heimat, die dich einlädt in eine Erfahrung von Einheit, Freiheit und Liebe.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <MagneticButton strength={0.3}>
            <Button variant="primary" size="md" onClick={() => router.push("/manifesto")}>
              Manifesto lesen
            </Button>
          </MagneticButton>
          <MagneticButton strength={0.3}>
            <Button variant="outline" size="md" onClick={() => router.push("/community")}>
              Community beitreten
            </Button>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
