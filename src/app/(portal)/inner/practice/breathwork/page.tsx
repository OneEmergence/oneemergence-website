import type { Metadata } from 'next'
import { BreathworkGuide } from '@/features/rituals'

export const metadata: Metadata = {
  title: 'Atemarbeit',
  description: 'Geführte Atemmuster für Ruhe, Klarheit und Kohärenz.',
}

export default function BreathworkPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-center font-serif text-3xl font-semibold text-oe-pure-light md:text-4xl">
        Atemarbeit
      </h1>
      <p className="mt-3 text-center text-sm text-oe-pure-light/50">
        Wähle ein Atemmuster. Folge dem Rhythmus.
      </p>

      <div className="mt-10">
        <BreathworkGuide />
      </div>
    </div>
  )
}
