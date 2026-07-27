import { getLibraryItems } from '@/lib/content'
import { LibraryClient } from './LibraryClient'

export const metadata = {
  title: 'Bibliothek',
  description:
    'Philosophische Texte, Reflexionen, Lehren und Einladungen zum Erwachen — geordnet nach heiligen Inhaltstypen.',
  alternates: { canonical: '/library' },
  openGraph: { url: '/library' },
}

export default function LibraryPage() {
  const items = getLibraryItems()
  return <LibraryClient items={items} />
}
