import { getPosts } from '@/lib/content'
import { LibraryClient } from './LibraryClient'

export const metadata = {
  title: 'Bibliothek',
  description:
    'Philosophische Texte, Reflexionen, Lehren und Einladungen zum Erwachen — geordnet nach heiligen Inhaltstypen.',
}

export default function LibraryPage() {
  const posts = getPosts()
  return <LibraryClient posts={posts} />
}
