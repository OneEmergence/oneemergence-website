"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-oe-deep-space text-oe-pure-light px-6 py-24 md:py-32"
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-oe-solar-gold mb-10">
          Datenschutzerklärung
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            1. Datenschutz auf einen Blick
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was
            mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website
            besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
            persönlich identifiziert werden können.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            2. Datenerfassung auf dieser Website
          </h2>
          <h3 className="text-base font-semibold text-oe-aurora-violet mb-2">
            Wer ist verantwortlich für die Datenerfassung?
          </h3>
          <p className="text-oe-pure-light/80 leading-relaxed mb-4">
            Die Datenverarbeitung auf dieser Website erfolgt durch den
            Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum
            dieser Website entnehmen.
          </p>
          <h3 className="text-base font-semibold text-oe-aurora-violet mb-2">
            Wie erfassen wir Ihre Daten?
          </h3>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
            mitteilen (z. B. Kontaktformular). Andere Daten werden automatisch
            oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
            IT-Systeme erfasst. Das sind vor allem technische Daten (z. B.
            Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            3. Hosting
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Diese Website wird bei einem externen Dienstleister gehostet
            (Hoster). Die personenbezogenen Daten, die auf dieser Website
            erfasst werden, werden auf den Servern des Hosters gespeichert.
            Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta-
            und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen,
            Websitezugriffe und sonstige Daten, die über eine Website generiert
            werden, handeln.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            4. Ihre Rechte
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft,
            Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu
            erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
            Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur
            Datenverarbeitung erteilt haben, können Sie diese Einwilligung
            jederzeit für die Zukunft widerrufen. Bitte wenden Sie sich dazu an:
            hello@oneemergence.org
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-oe-spirit-cyan mb-3">
            5. Analyse-Tools und Tools von Drittanbietern
          </h2>
          <p className="text-oe-pure-light/80 leading-relaxed">
            Diese Website verwendet derzeit keine Analyse-Tools oder
            Drittanbieter-Dienste, die personenbezogene Daten erheben. Sollte
            sich dies ändern, werden Sie hier entsprechend informiert.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
