"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type EventType = "online" | "live" | "retreat";

interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  type: EventType;
  spots: number | null;
  description: string;
  featured?: boolean;
}

const events: Event[] = [
  {
    id: "1",
    title: "Feld-Gespräch: Stille & Sprache",
    subtitle: "Ein geführter Kreis über das, was zwischen den Worten lebt",
    date: "12. April 2025",
    time: "19:00 – 21:00 Uhr",
    location: "Online via Circle",
    type: "online",
    spots: 18,
    description:
      "In diesem Gespräch erkunden wir gemeinsam, was Stille uns lehren kann — und wie echte Sprache aus ihr entsteht. Ein Raum für Tiefe, keine Performance.",
    featured: true,
  },
  {
    id: "2",
    title: "Embodiment Morning",
    subtitle: "Körperarbeit, Atemübungen & stilles Essen",
    date: "3. Mai 2025",
    time: "09:00 – 13:00 Uhr",
    location: "München, Schwabing",
    type: "live",
    spots: 12,
    description:
      "Ein halber Tag voller sanfter Körperanker: Somatic Movement, Atemarbeit und gemeinsames schweigendes Frühstück. Begrenzte Plätze.",
  },
  {
    id: "3",
    title: "Lesezirkel: Kapitel der Verbindung",
    subtitle: "Gemeinsames Lesen & Reflektieren",
    date: "28. April 2025",
    time: "18:30 – 20:00 Uhr",
    location: "Online via Circle",
    type: "online",
    spots: null,
    description:
      "Wir lesen gemeinsam ausgewählte Passagen zu Themen wie Bindung, Autonomie und Vertrauen — und teilen, was sie in uns bewegt.",
  },
  {
    id: "4",
    title: "Retreat: In die Stille gehen",
    subtitle: "3 Tage Wald, Schweigen und Begegnung",
    date: "20. – 22. Juni 2025",
    time: "Anreise Fr. 16:00 Uhr",
    location: "Bayerischer Wald",
    type: "retreat",
    spots: 16,
    description:
      "Unser jährliches Sommer-Retreat: Drei Tage tief im Wald, abseits von Bildschirmen und Lärm. Tagesstruktur mit Stille, Kreisen und freier Zeit in der Natur.",
    featured: true,
  },
  {
    id: "5",
    title: "Q&A mit Mia: Psychedelik & Integration",
    subtitle: "Offene Fragen, ehrliche Antworten",
    date: "15. Mai 2025",
    time: "20:00 – 21:30 Uhr",
    location: "Online via Circle",
    type: "online",
    spots: null,
    description:
      "Mia beantwortet Fragen zu bewusster Exploration, Integration und dem Umgang mit schwierigen Erfahrungen. Kein Dogma, nur Offenheit.",
  },
  {
    id: "6",
    title: "Workshop: Grenzen & Kontakt",
    subtitle: "Theorie & Praxis in kleiner Gruppe",
    date: "7. Juni 2025",
    time: "10:00 – 16:00 Uhr",
    location: "Berlin, Mitte",
    type: "live",
    spots: 10,
    description:
      "Wie entstehen gesunde Grenzen, ohne den Kontakt zu verlieren? Ein Ganztages-Workshop mit Theorie, Übungen und intensivem Austausch.",
  },
];

const typeConfig: Record<EventType, { label: string; color: string }> = {
  online: { label: "Online", color: "text-oe-spirit-cyan border-oe-spirit-cyan/40 bg-oe-spirit-cyan/10" },
  live: { label: "Live", color: "text-oe-solar-gold border-oe-solar-gold/40 bg-oe-solar-gold/10" },
  retreat: { label: "Retreat", color: "text-oe-aurora-violet border-oe-aurora-violet/40 bg-oe-aurora-violet/10" },
};

function EventCard({ event, index }: { event: Event; index: number }) {
  const cfg = typeConfig[event.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className={`relative rounded-2xl border p-8 transition-all duration-300 group hover:-translate-y-1 ${
        event.featured
          ? "border-oe-solar-gold/30 bg-gradient-to-br from-oe-solar-gold/5 to-oe-aurora-violet/5"
          : "border-oe-aurora-violet/20 bg-oe-aurora-violet/5 hover:border-oe-aurora-violet/40"
      }`}
    >
      {event.featured && (
        <span className="absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-semibold bg-oe-solar-gold text-oe-deep-space tracking-wide">
          Empfohlen
        </span>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <span
            className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <h3 className="font-serif text-2xl text-oe-solar-gold leading-tight">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-oe-spirit-cyan">{event.subtitle}</p>
        </div>
        {event.spots !== null && (
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-serif text-oe-pure-light">{event.spots}</p>
            <p className="text-xs text-oe-pure-light/40 uppercase tracking-widest">Plätze</p>
          </div>
        )}
      </div>

      <p className="text-sm leading-relaxed text-oe-pure-light/60 mb-6">
        {event.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-oe-pure-light/80">{event.date}</p>
          <p className="text-xs text-oe-pure-light/40">{event.time}</p>
          <p className="text-xs text-oe-pure-light/40">{event.location}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-oe-aurora-violet/30 text-xs text-oe-pure-light/70 hover:border-oe-aurora-violet/60 hover:text-oe-pure-light transition-colors duration-200">
            Kalender
          </button>
          <button className="px-4 py-2 rounded-lg bg-oe-aurora-violet/20 border border-oe-aurora-violet/40 text-xs text-oe-pure-light hover:bg-oe-aurora-violet/35 transition-colors duration-200">
            Anmelden
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-6 pt-24 pb-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet"
        >
          Gatherings & Events
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl leading-tight text-oe-solar-gold md:text-7xl"
        >
          Räume der
          <br />
          Begegnung
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-oe-pure-light/70"
        >
          Online und live — Orte, an denen echter Kontakt entstehen kann. Kommende
          Gatherings, Retreats und Lesekreise.
        </motion.p>
      </section>

      {/* Events Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl"
        >
          <h2 className="font-serif text-3xl text-oe-pure-light md:text-4xl">
            Keine Veranstaltung verpassen
          </h2>
          <p className="mt-4 text-base text-oe-pure-light/60">
            Werde Teil der Community und erhalte persönliche Einladungen zu neuen Events.
          </p>
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/community")}
            >
              Community beitreten
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
