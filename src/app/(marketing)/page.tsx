import { getPosts } from '@/lib/content'
import { LivingPortalClient } from './LivingPortalClient'

// The root layout no longer sets a canonical (it would be inherited by every
// route that does not declare one). The home page declares its own.
export const metadata = {
  alternates: { canonical: '/' },
}

export default function Home() {
  const posts = getPosts().slice(0, 3)

  return <LivingPortalClient posts={posts} />
}
