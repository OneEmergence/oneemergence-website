import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = {
  title: 'Innerer Raum — Dashboard',
}

/**
 * Daily impulses — a curated set of teachings and reflections.
 * Seeded by day-of-year so each day is consistent but unique.
 */
const dailyImpulses = [
  {
    text: 'Stille ist nicht die Abwesenheit von Geräusch. Sie ist die Anwesenheit von Aufmerksamkeit.',
    source: 'Innere Lehre',
  },
  {
    text: 'Was du in dir beobachtest, verliert seine Macht über dich.',
    source: 'Reflexion',
  },
  {
    text: 'Jeder Atemzug ist eine Schwelle — ein Ankommen in diesem Moment.',
    source: 'Praxis',
  },
  {
    text: 'Das Universum faltet sich nicht auseinander. Es entfaltet sich — durch dich.',
    source: 'Transmission',
  },
  {
    text: 'Bewusstsein ist kein Ziel. Es ist der Boden, auf dem du bereits stehst.',
    source: 'Innere Lehre',
  },
  {
    text: 'Die Dunkelheit ist nicht leer. Sie ist der Raum, in dem Licht geboren wird.',
    source: 'Reflexion',
  },
  {
    text: 'Transformation beginnt nicht mit Veränderung. Sie beginnt mit Annahme.',
    source: 'Praxis',
  },
]

function getDailyImpulse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  return dailyImpulses[dayOfYear % dailyImpulses.length]
}

export default async function InnerDashboardPage() {
  const user = await requireAuth()
  const impulse = getDailyImpulse()

  return (
    <DashboardClient
      userName={user.name}
      impulseText={impulse.text}
      impulseSource={impulse.source}
    />
  )
}
