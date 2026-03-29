import type { Metadata } from 'next'
import { MeditationTimer } from '@/features/rituals'

export const metadata: Metadata = {
  title: 'Meditation',
  description: 'Ein einfacher Timer für deine Meditationspraxis.',
}

export default function MeditationPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-center font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-oe-pure-light md:text-4xl">
        Meditation
      </h1>
      <p className="mt-3 text-center text-sm text-oe-pure-light/50">
        Wähle eine Dauer. Lass dich vom Schweigen halten.
      </p>

      <div className="mt-10">
        <MeditationTimer />
      </div>
    </div>
  )
}
