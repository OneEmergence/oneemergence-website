"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Ankommen",
    subtitle: "Tritt dem Space bei",
    description:
      "Der erste Schritt ist der einfachste: Tritt unserem offenen Circle-Space bei. Kein Bewerbungsprozess, keine Hürden. Nur du und ein Raum, der wartet.",
    cta: "Circle beitreten",
    href: "#",
    accent: "oe-spirit-cyan",
  },
  {
    number: "02",
    title: "Verbinden",
    subtitle: "Finde deine Menschen",
    description:
      "In unserem Telegram-Channel und den wöchentlichen Check-In-Runden lernst du Menschen kennen, die ähnliche Fragen tragen wie du — ohne Smalltalk-Zwang.",
    cta: "Telegram öffnen",
    href: "#",
    accent: "oe-aurora-violet",
  },
  {
    number: "03",
    title: "Gestalten",
    subtitle: "Bringe dich ein",
    description:
      "Community bedeutet Mitgestaltung. Du kannst Themen vorschlagen, eigene Circles moderieren oder einfach regelmäßig präsent sein — jede Form zählt.",
    cta: "Mitmachen",
    href: "#",
    accent: "oe-solar-gold",
  },
];

const values = [
  {
    icon: "◎",
    title: "Kein Performance-Druck",
    description:
      "Du musst nichts zeigen, beweisen oder darstellen. Ankommen reicht.",
  },
  {
    icon: "≋",
    title: "Echte Verbindung",
    description:
      "Wir schaffen Räume für Tiefe, nicht für Reichweite. Qualität vor Quantität.",
  },
  {
    icon: "⟳",
    title: "Gegenseitigkeit",
    description:
      "Hier gibt es kein Oben oder Unten — wir lernen voneinander, nicht übereinander.",
  },
  {
    icon: "△",
    title: "Wachstum durch Begegnung",
    description:
      "Transformation entsteht im Kontakt. Jedes Gespräch kann ein Wendepunkt sein.",
  },
];

const accentMap: Record<string, string> = {
  "oe-spirit-cyan": "border-oe-spirit-cyan/30 bg-oe-spirit-cyan/5 group-hover:border-oe-spirit-cyan/60",
  "oe-aurora-violet": "border-oe-aurora-violet/30 bg-oe-aurora-violet/5 group-hover:border-oe-aurora-violet/60",
  "oe-solar-gold": "border-oe-solar-gold/30 bg-oe-solar-gold/5 group-hover:border-oe-solar-gold/60",
};

const numberColorMap: Record<string, string> = {
  "oe-spirit-cyan": "text-oe-spirit-cyan",
  "oe-aurora-violet": "text-oe-aurora-violet",
  "oe-solar-gold": "text-oe-solar-gold",
};

export default function CommunityPage() {
  const router = useRouter();

  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[65vh] px-6 pt-24 pb-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet"
        >
          Community
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl leading-tight text-oe-solar-gold md:text-7xl"
        >
          Du gehörst
          <br />
          dazu.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-oe-pure-light/70"
        >
          OneEmergence lebt durch die Menschen, die sich einbringen. Hier findest
          du den Weg, wie du Teil dieses Feldes werden kannst.
        </motion.p>
      </section>

      {/* 3-Step Onboarding */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
              Onboarding
            </p>
            <h2 className="font-serif text-4xl text-oe-solar-gold md:text-5xl">
              In drei Schritten ankommen
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative"
              >
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-8 h-px bg-oe-aurora-violet/20 z-10" />
                )}

                <div
                  className={`rounded-2xl border p-8 h-full transition-all duration-300 hover:-translate-y-1 ${accentMap[step.accent]}`}
                >
                  <span
                    className={`font-serif text-5xl font-light ${numberColorMap[step.accent]} opacity-40 block mb-4`}
                  >
                    {step.number}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-oe-pure-light/40 mb-2">
                    {step.subtitle}
                  </p>
                  <h3 className="font-serif text-2xl text-oe-pure-light mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-oe-pure-light/60 mb-8">
                    {step.description}
                  </p>
                  <a
                    href={step.href}
                    className="inline-block px-5 py-2.5 rounded-xl border border-oe-aurora-violet/30 text-sm text-oe-pure-light/80 hover:border-oe-aurora-violet/60 hover:text-oe-pure-light transition-colors duration-200"
                  >
                    {step.cta}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="px-6 py-24 bg-oe-aurora-violet/5">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
              Worum es geht
            </p>
            <h2 className="font-serif text-3xl text-oe-solar-gold md:text-4xl">
              Was diese Community prägt
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 rounded-xl border border-oe-aurora-violet/15 bg-oe-deep-space p-6 hover:border-oe-aurora-violet/30 transition-colors duration-300"
              >
                <span className="text-2xl text-oe-solar-gold/60 flex-shrink-0 mt-0.5">
                  {val.icon}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-oe-pure-light mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-oe-pure-light/55">
                    {val.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl"
        >
          <h2 className="font-serif text-4xl text-oe-pure-light md:text-5xl">
            Bereit?
          </h2>
          <p className="mt-6 text-lg text-oe-pure-light/60">
            Es braucht keine Voraussetzungen außer der Bereitschaft, du selbst zu
            sein.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" onClick={() => router.push("/events")}>
              Nächstes Event
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
              Fragen stellen
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
