import type { Metadata } from 'next'
import { ExperiencesClient } from './ExperiencesClient'

export const metadata: Metadata = {
  title: 'Erfahrungen',
  description:
    'Visuelle Essays, geführte Interaktionen und kontemplative Reisen — Erfahrungen, die über Text hinausgehen.',
}

export default function ExperiencesPage() {
  return <ExperiencesClient />
}
