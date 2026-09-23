'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import type { LibraryItem } from '@/lib/content'
import { libraryItemHref, libraryTypeMeta, type LibraryType } from '@/lib/content/library-types'

type FilterId = 'all' | LibraryType

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export function LibraryClient({ items }: { items: LibraryItem[] }) {
  const t = useTranslations('library')
  const tc = useTranslations('common')
  const format = useFormatter()
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')

  // Only offer filters for types that actually have entries, so the four
  // currently-empty content directories do not produce dead pills.
  const contentTypes: Array<{ id: FilterId; label: string }> = [
    { id: 'all', label: t('all') },
    ...[...new Set(items.map((item) => item.libraryType))].map((type) => ({
      id: type as FilterId,
      label: libraryTypeMeta(type).label,
    })),
  ]

  const filtered =
    activeFilter === 'all' ? items : items.filter((item) => item.libraryType === activeFilter)

  return (
    <>
      <div role="group" aria-label={t('filterLabel')} className="mb-10 flex flex-wrap gap-2">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveFilter(type.id)}
            aria-pressed={activeFilter === type.id}
            className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
              activeFilter === type.id
                ? 'border-oe-aurora-violet/70 bg-oe-aurora-violet/15 text-oe-pure-light'
                : 'border-oe-pure-light/10 text-oe-pure-light/55 hover:border-oe-pure-light/30 hover:text-oe-pure-light/70'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center text-oe-pure-light/55"
          >
            {t('empty')}
          </motion.p>
        ) : (
          <motion.div key={activeFilter} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  href={libraryItemHref(item)}
                  data-cursor-hover
                  className="group relative block overflow-hidden rounded-2xl border border-oe-pure-light/8 bg-oe-depth-cosmic/40 p-6 transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
                >
                  {/* Content type indicator */}
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${libraryTypeMeta(item.libraryType).dotColor}`}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-oe-pure-light/55">
                      {libraryTypeMeta(item.libraryType).label}
                    </span>
                  </div>

                  <time
                    dateTime={item.date}
                    className="font-mono text-xs tracking-wider text-oe-pure-light/55"
                  >
                    {format.dateTime(new Date(item.date), {
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
                          className="rounded-full bg-oe-aurora-violet/10 px-2.5 py-0.5 text-[11px] text-oe-aurora-violet-ink"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-xs text-oe-aurora-violet-ink">
                    <span>{tc('readingTime', { minutes: item.readingTime })}</span>
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
    </>
  )
}
