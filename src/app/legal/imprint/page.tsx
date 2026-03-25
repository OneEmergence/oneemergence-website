"use client";

import { motion } from "framer-motion";

export default function ImprintPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-oe-deep-space text-oe-pure-light px-6 py-24 md:py-32"
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-oe-solar-gold mb-10">
          Impressum
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            Angaben gemäß § 5 TMG
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            OneEmergence e.V. (in Gründung)
            <br />
            Musterstraße 1
            <br />
            12345 Musterstadt
            <br />
            Deutschland
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            Kontakt
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            E-Mail: hello@oneemergence.org
            <br />
            Web: https://oneemergence.org
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Vorname Nachname
            <br />
            Musterstraße 1
            <br />
            12345 Musterstadt
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            Haftungsausschluss
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt
            erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
            Inhalte übernehmen wir keine Gewähr. Als Diensteanbieter sind wir
            gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            Urheberrecht
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
