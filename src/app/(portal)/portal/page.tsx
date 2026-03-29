import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { PortalEntryClient } from './PortalEntryClient'

export const metadata: Metadata = {
  title: 'Portal — Tritt ein',
  description: 'Der Übergang in deinen inneren Raum. Kein Login — eine Schwelle.',
}

export default async function PortalEntryPage() {
  const session = await auth()

  // Already authenticated — proceed to inner space
  if (session?.user) {
    redirect('/inner')
  }

  return <PortalEntryClient />
}
