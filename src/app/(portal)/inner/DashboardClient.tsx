'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Flame, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardClientProps {
  userName?: string | null
  impulseText: string
  impulseSource: string
}

const quickActions = [
  {
    href: '/inner/journal/new',
    label: 'Journal schreiben',
    description: 'Halte deine Gedanken und Reflexionen fest',
    icon: BookOpen,
    color: 'oe-spirit-cyan',
    disabled: false,
  },
  {
    href: '/inner/practice',
    label: 'Praxis beginnen',
    description: 'Meditation, Atemarbeit oder Klangräume',
    icon: Flame,
    color: 'oe-solar-gold',
    disabled: false,
  },
  {
    href: '/inner/guide',
    label: 'Guide fragen',
    description: 'Dein KI-Begleiter für innere Arbeit',
    icon: Sparkles,
    color: 'oe-aurora-violet',
    disabled: false,
  },
] as const

export function DashboardClient({
  userName,
  impulseText,
  impulseSource,
}: DashboardClientProps) {
  const greeting = getGreeting()

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-serif text-2xl text-oe-pure-light md:text-3xl">
          {greeting}, {userName ?? 'Reisender'}
        </h1>
        <p className="mt-1 text-sm text-oe-pure-light/40">
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </motion.div>

      {/* Daily Impulse */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-oe-pure-light/5 bg-oe-pure-light/[0.02] p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-oe-aurora-violet/5 blur-[60px]" />
        <p className="text-xs uppercase tracking-widest text-oe-aurora-violet/60">
          Tagesimpuls
        </p>
        <blockquote className="mt-4 font-serif text-lg leading-relaxed text-oe-pure-light/80 md:text-xl">
          &ldquo;{impulseText}&rdquo;
        </blockquote>
        <p className="mt-3 text-xs text-oe-pure-light/30">— {impulseSource}</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.disabled ? '#' : action.href}
            className={cn(
              'group flex flex-col gap-3 rounded-xl border border-oe-pure-light/5 p-5 transition-all duration-300',
              'hover:border-oe-pure-light/10 hover:bg-oe-pure-light/[0.02]',
              action.disabled && 'pointer-events-none opacity-40'
            )}
          >
            <action.icon className={cn('h-5 w-5', `text-${action.color}`)} />
            <div>
              <p className="text-sm font-medium text-oe-pure-light/80">
                {action.label}
              </p>
              <p className="mt-1 text-xs text-oe-pure-light/40">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Placeholder sections for future data */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-xl border border-oe-pure-light/5 p-5">
          <p className="text-xs uppercase tracking-widest text-oe-pure-light/30">
            Journal
          </p>
          <p className="mt-3 text-sm text-oe-pure-light/50">
            Beginne dein erstes Journal — jede Reflexion ist ein Samen.
          </p>
        </div>
        <div className="rounded-xl border border-oe-pure-light/5 p-5">
          <p className="text-xs uppercase tracking-widest text-oe-pure-light/30">
            Praxis
          </p>
          <p className="mt-3 text-sm text-oe-pure-light/50">
            Noch keine Praxis-Sitzungen. Starte deine erste Meditation.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Stille Nacht'
  if (hour < 12) return 'Guten Morgen'
  if (hour < 17) return 'Guten Tag'
  if (hour < 21) return 'Guten Abend'
  return 'Stille Nacht'
}
