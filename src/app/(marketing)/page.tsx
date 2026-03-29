import { getPosts } from '@/lib/content'
import { LivingPortalClient } from './LivingPortalClient'

export default function Home() {
  const posts = getPosts().slice(0, 3)

  return <LivingPortalClient posts={posts} />
}
