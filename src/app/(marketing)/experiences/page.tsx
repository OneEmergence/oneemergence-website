import type { Metadata } from 'next'
import { ExperiencesClient } from './ExperiencesClient'

export const metadata: Metadata = {
  title: 'Erfahrungen',
  description:
    'Visuelle Essays, geführte Interaktionen und kontemplative Reisen — Erfahrungen, die über Text hinausgehen.',
  alternates: { canonical: '/experiences' },
  openGraph: { url: '/experiences' },
}

export default function ExperiencesPage() {
  return <ExperiencesClient />
}
