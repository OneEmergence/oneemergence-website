import type { Metadata } from 'next'
import { getSavedCards } from '@/lib/actions/guide'
import { SavedCardsView } from './SavedCardsView'

export const metadata: Metadata = {
  title: 'Gespeicherte Karten — OneEmergence',
  description: 'Deine gesammelten Reflexions- und Impulskarten.',
}

export default async function SavedCardsPage() {
  const result = await getSavedCards()
  const cards = result.success ? result.data : []

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-2 font-serif text-2xl text-oe-pure-light">
        Gespeicherte Karten
      </h1>
      <p className="mb-8 text-sm text-oe-pure-light/50">
        Reflexionsfragen und Impulse aus deinen Guide-Gesprächen.
      </p>

      <SavedCardsView cards={cards} />
    </div>
  )
}
