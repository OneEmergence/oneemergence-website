'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StarField } from '@/components/scene/StarField'
import { NewsletterSignup } from '@/components/sections/NewsletterSignup'

type PrincipleAccent = 'oe-spirit-cyan' | 'oe-aurora-violet' | 'oe-solar-gold'

const PRINCIPLE_ACCENT_CLASSES: Record<PrincipleAccent, { number: string; label: string }> = {
  'oe-spirit-cyan': { number: 'text-oe-spirit-cyan/15', label: 'text-oe-spirit-cyan/70' },
  'oe-aurora-violet': { number: 'text-oe-aurora-violet/15', label: 'text-oe-aurora-violet/70' },
  'oe-solar-gold': { number: 'text-oe-solar-gold/15', label: 'text-oe-solar-gold/70' },
}

const principles = [
  {
    name: 'Einheit',
    summary: 'Alles ist verbunden.',
    description:
      'Wir erkennen die fundamentale Verbundenheit aller Wesen und Systeme — jenseits von Trennung und Dualität. Einheit ist kein Konzept, sondern eine gelebte Erfahrung.',
    accent: 'oe-spirit-cyan',
  },
  {
    name: 'Freiheit',
    summary: 'Authentizität als Grundlage.',
    description:
      'Freiheit entsteht, wenn wir aufhören, uns selbst und anderen etwas vorzuspielen. Wir schaffen Räume, in denen jeder Mensch sein kann, wer er wirklich ist — ohne Anpassungsdruck.',
    accent: 'oe-aurora-violet',
  },
  {
    name: 'Liebe',
    summary: 'Die tiefste Kraft.',
    description:
      'Liebe ist nicht Sentimentalität, sondern die radikale Bereitschaft, das Leben und die Menschen so anzunehmen, wie sie sind. Sie ist der Antrieb hinter allem, was wir tun.',
    accent: 'oe-solar-gold',
  },
  {
    name: 'Klarheit',
    summary: 'Ehrlichkeit über Dogma.',
    description:
      'Wir sprechen klar und direkt. Keine übertriebenen Heilsversprechen, keine Worthülsen. Klarheit ist ein Akt der Wertschätzung gegenüber jedem, der uns begegnet.',
    accent: 'oe-spirit-cyan',
  },
  {
    name: 'Integrität',
    summary: 'Handeln aus dem Inneren heraus.',
    description:
      'Wir richten unser Handeln an unseren tiefsten Werten aus — auch dann, wenn es unbequem ist. Integrität bedeutet, dass Innen und Außen übereinstimmen.',
    accent: 'oe-aurora-violet',
  },
  {
    name: 'Emergenz',
    summary: 'Das Neue entsteht aus Verbindung.',
    description:
      'Echte Innovation und Transformation entstehen nicht durch Kontrolle, sondern wenn diverse Menschen und Ideen in einem offenen Raum zusammenkommen. Wir vertrauen dem Prozess.',
    accent: 'oe-solar-gold',
  },
]

function PrincipleSection({
  principle,
  index,
}: {
  principle: (typeof principles)[number]
  index: number
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.3])

  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative py-16 md:py-24"
    >
      <div
        className={`mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 sm:px-6 md:flex-row ${
          isEven ? '' : 'md:flex-row-reverse'
        }`}
      >
        {/* Number / visual accent */}
        <motion.div
          style={{ y }}
          className="flex shrink-0 flex-col items-center"
        >
          <span
            className={`font-serif text-7xl font-bold md:text-9xl ${PRINCIPLE_ACCENT_CLASSES[principle.accent as PrincipleAccent]?.number}`}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </motion.div>

        {/* Content */}
        <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`mb-2 text-xs font-semibold uppercase tracking-[0.3em] ${PRINCIPLE_ACCENT_CLASSES[principle.accent as PrincipleAccent]?.label}`}
          >
            {principle.summary}
          </motion.p>
          <ScrollReveal
            text={principle.name}
            as="h2"
            className={`font-serif text-4xl text-oe-solar-gold md:text-5xl lg:text-6xl ${
              isEven ? 'md:justify-start' : 'md:justify-end'
            } justify-center`}
            delay={0.1}
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-base leading-relaxed text-oe-pure-light/60 md:text-lg"
          >
            {principle.description}
          </motion.p>
        </div>
      </div>

      {/* Divider */}
      {index < principles.length - 1 && (
        <div
          aria-hidden="true"
          className="mx-auto mt-16 h-px w-32 bg-gradient-to-r from-transparent via-oe-aurora-violet/20 to-transparent md:mt-24"
        />
      )}
    </motion.div>
  )
}

export default function ManifestoPage() {
  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 pt-16 text-center sm:px-6 md:min-h-screen">
        <StarField />
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-oe-aurora-violet/80"
          >
            Unser Manifest
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl leading-tight text-oe-solar-gold sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Eine Einladung
            <br />
            zur Ganzheit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-oe-pure-light/60 md:text-xl"
          >
            OneEmergence ist kein Programm, keine Bewegung und kein System. Es ist
            eine offene Einladung — an alle, die spüren, dass etwas Tieferes möglich
            ist: mehr Verbindung, mehr Wahrhaftigkeit, mehr Leben.
          </motion.p>
        </div>
      </section>

      {/* Opening vision */}
      <section className="relative px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal
            text="Wir glauben, dass eine andere Art zu leben, zu denken und zusammen zu sein nicht nur möglich, sondern bereits am Entstehen ist."
            as="p"
            className="font-serif text-xl leading-relaxed text-oe-pure-light/70 sm:text-2xl md:text-3xl"
            stagger={0.03}
          />
        </div>
      </section>

      {/* Principles Section — Immersive Depth Layers */}
      <section>
        <div className="mb-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-oe-aurora-violet/70"
          >
            Sechs Prinzipien
          </motion.p>
        </div>

        {principles.map((principle, i) => (
          <PrincipleSection key={principle.name} principle={principle} index={i} />
        ))}
      </section>

      {/* Closing vision */}
      <section className="relative px-4 py-16 sm:px-6 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(84,226,233,0.04) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal
            text="Die Zukunft, die wir spüren, ist nicht weit entfernt. Sie entsteht jetzt — in jedem Moment, in dem wir uns entscheiden, wach, verbunden und wahrhaftig zu sein."
            as="p"
            className="font-serif text-xl leading-relaxed text-oe-pure-light/70 sm:text-2xl md:text-3xl"
            stagger={0.03}
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal
            text="Bereit, Teil davon zu sein?"
            as="h2"
            className="font-serif text-3xl text-oe-pure-light md:text-4xl lg:text-5xl justify-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-6 text-base text-oe-pure-light/50 md:text-lg"
          >
            Werde Teil der Gemeinschaft und gestalte gemeinsam mit uns den Raum für
            Einheit, Freiheit und Liebe.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link href="/community">
              <Button variant="primary" size="lg">
                Community beitreten
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Kontakt aufnehmen
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-16"
          >
            <p className="mb-4 text-sm text-oe-pure-light/40">
              Oder erhalte unsere Impulse direkt:
            </p>
            <NewsletterSignup />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
