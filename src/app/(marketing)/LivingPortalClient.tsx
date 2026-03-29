'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { StarField } from '@/components/scene/StarField'
import { AmbientOrb } from '@/components/motion/ambient-orb'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { ScrollIndicator } from '@/components/motion/ScrollIndicator'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Button } from '@/components/ui/button'
import { NewsletterSignup } from '@/components/sections/NewsletterSignup'
import type { Post } from '@/lib/content'

type PostPreview = Omit<Post, 'content'>

const sectionFade: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.12 } },
}

export function LivingPortalClient({ posts }: { posts: PostPreview[] }) {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* ── Hero: Living Portal ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        <StarField />
        <AmbientOrb />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 flex flex-col items-center px-4 text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-oe-aurora-violet/80"
          >
            Ein lebendiges Portal
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl leading-tight text-oe-solar-gold sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            OneEmergence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-oe-pure-light/60 sm:text-lg md:text-xl"
          >
            Eine digitale Heimat, die dich einlädt in eine Erfahrung
            von Einheit, Freiheit und Liebe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <MagneticButton strength={0.3}>
              <Link href="/manifesto">
                <Button variant="primary" size="lg">
                  Manifesto entdecken
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.3}>
              <Link href="/experiences">
                <Button variant="outline" size="lg">
                  Erfahrungen erkunden
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 z-10">
          <ScrollIndicator />
        </div>
      </section>

      {/* ── Vision Statement ── */}
      <section className="relative px-4 py-24 sm:px-6 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-oe-spirit-cyan/70"
          >
            Vision
          </motion.p>
          <ScrollReveal
            text="Nicht Information, sondern Erfahrung. Nicht Konsum, sondern Tiefe. Ein Ort, an dem innere Transformation auf echte Technologie trifft."
            as="p"
            className="font-serif text-2xl leading-relaxed text-oe-pure-light/80 sm:text-3xl md:text-4xl"
            stagger={0.04}
          />
        </div>
        {/* Subtle divider glow */}
        <div
          aria-hidden="true"
          className="mx-auto mt-20 h-px w-48 bg-gradient-to-r from-transparent via-oe-aurora-violet/30 to-transparent"
        />
      </section>

      {/* ── Featured Content ── */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-oe-aurora-violet/70"
            >
              Aus der Bibliothek
            </motion.p>
            <ScrollReveal
              text="Texte, die bewegen"
              as="h2"
              className="font-serif text-3xl text-oe-solar-gold md:text-4xl lg:text-5xl justify-center"
              delay={0.1}
            />
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-3"
          >
            {posts.map((post) => (
              <motion.div key={post.slug} variants={sectionFade}>
                <Link
                  href={`/journal/${post.slug}`}
                  data-cursor-hover
                  className="group block rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
                >
                  <time className="font-mono text-xs text-oe-pure-light/30 tracking-wider">
                    {new Date(post.date).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                  <h3 className="mt-3 font-serif text-xl leading-snug text-oe-pure-light transition-colors group-hover:text-oe-solar-gold">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-oe-pure-light/50 line-clamp-3">
                    {post.excerpt}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-oe-aurora-violet/10 px-2.5 py-0.5 text-[11px] text-oe-aurora-violet/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center gap-2 text-xs text-oe-aurora-violet/70">
                    <span>{post.readingTime} Min. Lesezeit</span>
                    <ArrowRight
                      size={12}
                      className="ml-auto transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 text-center">
            <Link href="/library">
              <Button variant="ghost" size="md">
                Alle Inhalte entdecken <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Experiences Preview ── */}
      <section className="relative px-4 py-16 sm:px-6 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(84,226,233,0.04) 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-oe-spirit-cyan/70"
          >
            Erfahrungen
          </motion.p>
          <ScrollReveal
            text="Nicht lesen. Eintauchen."
            as="h2"
            className="font-serif text-3xl text-oe-pure-light md:text-4xl lg:text-5xl justify-center"
            delay={0.1}
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-oe-pure-light/50"
          >
            Visuelle Essays, geführte Interaktionen und kontemplative Reisen —
            Erfahrungen, die über Text hinausgehen und dich einladen, zu fühlen.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                title: 'Was wäre, wenn die Erde träumt?',
                type: 'Visueller Essay',
                duration: '8 Min.',
                accent: 'oe-spirit-cyan',
              },
              {
                title: 'Die Stille zwischen den Gedanken',
                type: 'Kontemplation',
                duration: '5 Min.',
                accent: 'oe-aurora-violet',
              },
              {
                title: 'Emergenz: Wenn Neues entsteht',
                type: 'Geführte Reise',
                duration: '12 Min.',
                accent: 'oe-solar-gold',
              },
            ].map((exp) => (
              <motion.div key={exp.title} variants={sectionFade}>
                <Link
                  href="/experiences"
                  data-cursor-hover
                  className="group block rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.02] p-6 text-left transition-all duration-300 hover:border-oe-spirit-cyan/30 hover:bg-oe-spirit-cyan/5"
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-${exp.accent}/70`}>
                    {exp.type}
                  </span>
                  <h3 className="mt-2 font-serif text-lg text-oe-pure-light transition-colors group-hover:text-oe-solar-gold">
                    {exp.title}
                  </h3>
                  <p className="mt-3 text-xs text-oe-pure-light/40">{exp.duration}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10">
            <Link href="/experiences">
              <Button variant="outline" size="md">
                Alle Erfahrungen <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Community Pulse ── */}
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-oe-solar-gold/70"
          >
            Gemeinschaft
          </motion.p>
          <ScrollReveal
            text="Du bist nicht allein auf diesem Weg"
            as="h2"
            className="font-serif text-3xl text-oe-pure-light md:text-4xl justify-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-oe-pure-light/50"
          >
            OneEmergence ist ein lebendiges Feld von Menschen, die spüren, dass eine
            tiefere Art des Zusammenlebens möglich ist. Sessions, Retreats und
            gemeinsame Zeremonien — digital und vor Ort.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/events">
              <Button variant="primary" size="md">Events entdecken</Button>
            </Link>
            <Link href="/community">
              <Button variant="ghost" size="md">Mehr erfahren</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="relative px-4 py-16 sm:px-6 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(124,92,255,0.06) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <ScrollReveal
            text="Bereit, tiefer einzutauchen?"
            as="h2"
            className="font-serif text-3xl text-oe-pure-light md:text-4xl lg:text-5xl justify-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-6 max-w-lg text-base text-oe-pure-light/50"
          >
            Erhalte Impulse, neue Inhalte und Einladungen — direkt in dein Postfach.
            Kein Spam. Nur das, was zählt.
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
