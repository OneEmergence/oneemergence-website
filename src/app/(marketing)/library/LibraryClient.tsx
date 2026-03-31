'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import type { LibraryItem } from '@/lib/content'

const contentTypes = [
  { id: 'all', label: 'Alle' },
  { id: 'teaching', label: 'Lehren', color: 'oe-solar-gold' },
  { id: 'reflection', label: 'Reflexionen', color: 'oe-spirit-cyan' },
  { id: 'journal', label: 'Journal', color: 'oe-aurora-violet' },
] as const

type FilterId = (typeof contentTypes)[number]['id']

function filterIdForItem(item: LibraryItem): FilterId {
  if (item.libraryType === 'teaching') return 'teaching'
  if (item.libraryType === 'reflection') return 'reflection'
  return 'journal'
}

function typeLabel(item: LibraryItem): string {
  if (item.libraryType === 'teaching') return 'Lehre'
  if (item.libraryType === 'reflection') return 'Reflexion'
  return 'Journal'
}

function dotColor(item: LibraryItem): string {
  if (item.libraryType === 'teaching') return 'bg-oe-solar-gold'
  if (item.libraryType === 'reflection') return 'bg-oe-spirit-cyan'
  return 'bg-oe-aurora-violet'
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export function LibraryClient({ items }: { items: LibraryItem[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')

  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((item) => filterIdForItem(item) === activeFilter)

  return (
    <div className="min-h-screen bg-oe-deep-space pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-oe-aurora-violet/70"
          >
            Bibliothek
          </motion.p>
          <ScrollReveal
            text="Heilige Inhalte"
            as="h1"
            className="font-serif text-4xl text-oe-pure-light sm:text-5xl md:text-6xl justify-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-5 max-w-xl text-oe-pure-light/55 leading-relaxed"
          >
            Lehren, Reflexionen und Einladungen — als Begleitung auf dem Weg
            zur inneren Einheit.
          </motion.p>
        </div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveFilter(type.id)}
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                activeFilter === type.id
                  ? 'border-oe-aurora-violet bg-oe-aurora-violet/20 text-oe-pure-light'
                  : 'border-oe-pure-light/10 text-oe-pure-light/40 hover:border-oe-pure-light/30 hover:text-oe-pure-light/70'
              }`}
            >
              {type.label}
            </button>
          ))}
        </motion.div>

        {/* Content grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-oe-pure-light/40"
            >
              Noch keine Inhalte in dieser Kategorie.
            </motion.p>
          ) : (
            <motion.div
              key={activeFilter}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={`${item.libraryType}-${item.slug}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: i * 0.06 }}
                  layout
                >
                  <Link
                    href={`/library/${item.libraryType}/${item.slug}`}
                    data-cursor-hover
                    className="group relative block overflow-hidden rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
                  >
                    {/* Content type indicator */}
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor(item)}`}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-oe-pure-light/30">
                        {typeLabel(item)}
                      </span>
                    </div>

                    <time className="font-mono text-xs tracking-wider text-oe-pure-light/30">
                      {new Date(item.date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                    <h2 className="mt-3 font-serif text-xl leading-snug text-oe-pure-light transition-colors group-hover:text-oe-solar-gold">
                      {item.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-oe-pure-light/50">
                      {item.excerpt}
                    </p>

                    {item.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
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
                      <span>{item.readingTime} Min. Lesezeit</span>
                      <ArrowRight
                        size={12}
                        className="ml-auto transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
