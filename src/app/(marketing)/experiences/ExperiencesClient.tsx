'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Clock, Eye, Compass } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StarField } from '@/components/scene/StarField'
import { NewsletterSignup } from '@/components/sections/NewsletterSignup'
import { Button } from '@/components/ui/button'

interface Experience {
  slug: string
  title: string
  type: 'visual-essay' | 'contemplation' | 'guided-journey'
  typeLabel: string
  description: string
  duration: string
  accentColor: string
  icon: typeof Eye
  available: boolean
}

const experiences: Experience[] = [
  {
    slug: 'what-if-earth-is-dreaming',
    title: 'Was wäre, wenn die Erde träumt?',
    type: 'visual-essay',
    typeLabel: 'Visueller Essay',
    description:
      'Eine scroll-getriebene visuelle Erzählung, die dich einlädt, die Erde als bewusstes, träumendes Wesen zu sehen. Text und Bild verschmelzen zu einer meditativen Erfahrung.',
    duration: '8 Min.',
    accentColor: 'oe-spirit-cyan',
    icon: Eye,
    available: false,
  },
  {
    slug: 'silence-between-thoughts',
    title: 'Die Stille zwischen den Gedanken',
    type: 'contemplation',
    typeLabel: 'Kontemplation',
    description:
      'Eine geführte Erfahrung in die Lücke zwischen den Gedanken. Atemübungen, Stille-Intervalle und minimalistische Visuals begleiten dich in eine Erfahrung von Gegenwärtigkeit.',
    duration: '5 Min.',
    accentColor: 'oe-aurora-violet',
    icon: Compass,
    available: false,
  },
  {
    slug: 'emergence-when-new-arises',
    title: 'Emergenz: Wenn Neues entsteht',
    type: 'guided-journey',
    typeLabel: 'Geführte Reise',
    description:
      'Erforsche das Prinzip der Emergenz — wie aus einfachen Verbindungen komplexe Schönheit entsteht. Von Ameisen bis zu Galaxien, von Neuronen bis zu Gemeinschaften.',
    duration: '12 Min.',
    accentColor: 'oe-solar-gold',
    icon: Eye,
    available: false,
  },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function ExperiencesClient() {
  return (
    <div className="min-h-screen bg-oe-deep-space text-oe-pure-light">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 pt-20 text-center">
        <StarField />
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-oe-spirit-cyan/70"
          >
            Erfahrungen
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl leading-tight text-oe-pure-light sm:text-5xl md:text-6xl"
          >
            Nicht lesen.
            <br />
            <span className="text-oe-solar-gold">Eintauchen.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-oe-pure-light/55 md:text-lg"
          >
            Visuelle Essays, geführte Interaktionen und kontemplative Reisen —
            Erfahrungen, die über Text hinausgehen und dich einladen, zu fühlen.
          </motion.p>
        </div>
      </section>

      {/* Experience cards */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <ScrollReveal
              text="Verfügbare Erfahrungen"
              as="h2"
              className="font-serif text-3xl text-oe-solar-gold md:text-4xl justify-center"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:gap-8">
            {experiences.map((exp, i) => {
              const Icon = exp.icon
              return (
                <motion.div
                  key={exp.slug}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div
                    className={`group relative overflow-hidden rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.02] p-8 transition-all duration-300 ${
                      exp.available
                        ? 'hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5'
                        : ''
                    } md:flex md:items-center md:gap-8`}
                  >
                    {/* Icon area */}
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-${exp.accentColor}/20 bg-${exp.accentColor}/5`}
                    >
                      <Icon size={24} className={`text-${exp.accentColor}/70`} />
                    </div>

                    {/* Content */}
                    <div className="mt-5 flex-1 md:mt-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-${exp.accentColor}/70`}
                        >
                          {exp.typeLabel}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-oe-pure-light/30">
                          <Clock size={10} />
                          {exp.duration}
                        </span>
                      </div>
                      <h3 className="mt-2 font-serif text-xl text-oe-pure-light md:text-2xl">
                        {exp.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-oe-pure-light/50">
                        {exp.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="mt-5 shrink-0 md:mt-0">
                      {exp.available ? (
                        <Link href={`/experiences/${exp.slug}`}>
                          <Button variant="outline" size="md">
                            Starten
                          </Button>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-oe-pure-light/10 px-4 py-2 text-xs text-oe-pure-light/30">
                          Bald verfügbar
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Coming soon section */}
      <section className="relative px-4 py-16 sm:px-6 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(124,92,255,0.05) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <ScrollReveal
            text="Mehr Erfahrungen sind in Entstehung"
            as="h2"
            className="font-serif text-2xl text-oe-pure-light/80 md:text-3xl justify-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-6 max-w-lg text-base text-oe-pure-light/50"
          >
            Klangstudio-Reisen, interaktive Meditationen und kollektive
            Zeremonien. Trage dich ein, um als Erste*r davon zu erfahren.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <NewsletterSignup />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
