"use client";

import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

const principles = [
  {
    name: "Einheit",
    summary: "Alles ist verbunden.",
    description:
      "Wir erkennen die fundamentale Verbundenheit aller Wesen und Systeme — jenseits von Trennung und Dualität. Einheit ist kein Konzept, sondern eine gelebte Erfahrung.",
  },
  {
    name: "Freiheit",
    summary: "Authentizität als Grundlage.",
    description:
      "Freiheit entsteht, wenn wir aufhören, uns selbst und anderen etwas vorzuspielen. Wir schaffen Räume, in denen jeder Mensch sein kann, wer er wirklich ist — ohne Anpassungsdruck.",
  },
  {
    name: "Liebe",
    summary: "Die tiefste Kraft.",
    description:
      "Liebe ist nicht Sentimentalität, sondern die radikale Bereitschaft, das Leben und die Menschen so anzunehmen, wie sie sind. Sie ist der Antrieb hinter allem, was wir tun.",
  },
  {
    name: "Klarheit",
    summary: "Ehrlichkeit über Dogma.",
    description:
      "Wir sprechen klar und direkt. Keine übertriebenen Heilsversprechen, keine Worthülsen. Klarheit ist ein Akt der Wertschätzung gegenüber jedem, der uns begegnet.",
  },
  {
    name: "Integrität",
    summary: "Handeln aus dem Inneren heraus.",
    description:
      "Wir richten unser Handeln an unseren tiefsten Werten aus — auch dann, wenn es unbequem ist. Integrität bedeutet, dass Innen und Außen übereinstimmen.",
  },
  {
    name: "Emergenz",
    summary: "Das Neue entsteht aus Verbindung.",
    description:
      "Echte Innovation und Transformation entstehen nicht durch Kontrolle, sondern wenn diverse Menschen und Ideen in einem offenen Raum zusammenkommen. Wir vertrauen dem Prozess.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function ManifestoPage() {
  const router = useRouter();

  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet"
        >
          Unser Manifest
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl leading-tight text-oe-solar-gold md:text-7xl"
        >
          Eine Einladung
          <br />
          zur Ganzheit
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70 md:text-xl"
        >
          OneEmergence ist kein Programm, keine Bewegung und kein System. Es ist
          eine offene Einladung — an alle, die spüren, dass etwas Tieferes möglich
          ist: mehr Verbindung, mehr Wahrhaftigkeit, mehr Leben.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10"
        >
          <Button variant="primary" size="lg" onClick={() => router.push("/community")}>
            Teil der Gemeinschaft werden
          </Button>
        </motion.div>
      </section>

      {/* Principles Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
              Prinzipien
            </p>
            <h2 className="font-serif text-4xl text-oe-solar-gold md:text-5xl">
              Wofür wir stehen
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle, i) => (
              <motion.div
                key={principle.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group rounded-2xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 p-8 transition-colors duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/10"
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-oe-spirit-cyan">
                  {principle.summary}
                </p>
                <h3 className="mb-4 font-serif text-2xl text-oe-solar-gold">
                  {principle.name}
                </h3>
                <p className="text-sm leading-relaxed text-oe-pure-light/60">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl"
        >
          <h2 className="font-serif text-4xl text-oe-pure-light md:text-5xl">
            Bereit, tiefer einzutauchen?
          </h2>
          <p className="mt-6 text-lg text-oe-pure-light/60">
            Werde Teil der Community und gestalte gemeinsam mit uns den Raum für
            Einheit, Freiheit und Liebe.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" onClick={() => router.push("/community")}>
              Community beitreten
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
              Kontakt aufnehmen
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
