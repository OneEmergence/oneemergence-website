"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const story = [
  {
    label: "Der Ursprung",
    year: "2019",
    heading: "Ein Gefühl, das keine Worte hatte",
    body: "Es begann mit einer einfachen Frage: Warum fühlen sich so viele Menschen trotz aller Vernetzung tief allein? Aus kleinen Gesprächskreisen, die nach tieferer Berührung suchten, entstand eine Idee — ein Raum, in dem Verbindung nicht organisiert, sondern ermöglicht wird.",
    align: "left",
  },
  {
    label: "Die Vision",
    year: "2021",
    heading: "Ein Feld, kein Produkt",
    body: "OneEmergence ist kein Kurs, kein Coaching-Format und keine Bewegung. Es ist ein Feld — ein lebendiger Raum, der entsteht, wenn Menschen bereit sind, sich wirklich zu zeigen. Wir bauen Infrastruktur für echte Begegnung.",
    align: "right",
  },
  {
    label: "Heute",
    year: "2024",
    heading: "Wachstum durch Resonanz",
    body: "Heute sind wir ein kleines Team aus Facilitatoren, Entwicklern und Visionären, die glauben, dass Technologie dem Menschen dienen kann — nicht umgekehrt. Wir wachsen langsam, tief und absichtsvoll.",
    align: "left",
  },
];

const team = [
  {
    name: "Mia Steiner",
    role: "Gründerin & Facilitatorin",
    bio: "Mia verbringt ihr Leben damit, Räume zu schaffen, in denen Transformation möglich wird. Ausgebildet in systemischer Therapie und Somatic Work.",
  },
  {
    name: "Jonas Weber",
    role: "Technischer Leiter",
    bio: "Jonas verbindet seine Leidenschaft für Open-Source-Technologie mit dem Wunsch, digitale Umgebungen zu schaffen, die sich menschlich anfühlen.",
  },
  {
    name: "Lena Frei",
    role: "Creative & Brand",
    bio: "Lena gestaltet die visuelle Sprache von OneEmergence — eine Ästhetik, die Tiefe, Stille und Lebendigkeit zugleich vermittelt.",
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] md:min-h-screen px-6 pt-20 pb-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet"
        >
          Über uns
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-3xl sm:text-5xl leading-tight text-oe-solar-gold md:text-6xl lg:text-7xl"
        >
          Woher wir kommen.
          <br />
          Wohin wir gehen.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70 md:text-xl"
        >
          OneEmergence entstand aus dem tiefen Wunsch, echte Verbindung in einer
          zunehmend fragmentierten Welt zu ermöglichen. Dies ist unsere Geschichte.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 h-px w-16 bg-oe-solar-gold/40 mx-auto"
        />
      </section>

      {/* Story Blocks */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl space-y-16 md:space-y-32">
          {story.map((block, i) => (
            <motion.div
              key={block.year}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`flex flex-col gap-5 md:gap-8 md:flex-row md:items-center ${
                block.align === "right" ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Year pillar */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3 md:w-24">
                <span className="text-xs font-semibold uppercase tracking-widest text-oe-spirit-cyan">
                  {block.label}
                </span>
                <span className="font-serif text-4xl text-oe-solar-gold/30">
                  {block.year}
                </span>
                <div className="h-24 w-px bg-oe-aurora-violet/20" />
              </div>

              {/* Content card */}
              <div className="flex-1 rounded-2xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 p-6 sm:p-8 hover:border-oe-aurora-violet/40 transition-colors duration-300">
                <h2 className="font-serif text-3xl text-oe-solar-gold mb-4">
                  {block.heading}
                </h2>
                <p className="text-base leading-relaxed text-oe-pure-light/65">
                  {block.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-24 bg-oe-aurora-violet/5">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
              Menschen
            </p>
            <h2 className="font-serif text-4xl text-oe-solar-gold md:text-5xl">
              Das Team
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:gap-8 md:grid-cols-3">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl border border-oe-aurora-violet/20 bg-oe-deep-space p-6 sm:p-8 hover:border-oe-spirit-cyan/30 transition-colors duration-300"
              >
                {/* Avatar placeholder */}
                <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-oe-aurora-violet/40 to-oe-spirit-cyan/20 flex items-center justify-center">
                  <span className="font-serif text-xl text-oe-solar-gold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-oe-pure-light mb-1">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-oe-spirit-cyan mb-4">
                  {member.role}
                </p>
                <p className="text-sm leading-relaxed text-oe-pure-light/60">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl"
        >
          <h2 className="font-serif text-4xl text-oe-pure-light md:text-5xl">
            Werde Teil des Feldes
          </h2>
          <p className="mt-6 text-lg text-oe-pure-light/60">
            Unsere Geschichte ist noch nicht zu Ende geschrieben. Sie wartet auf
            dich.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/community")}
            >
              Community beitreten
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/contact")}
            >
              Uns schreiben
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
