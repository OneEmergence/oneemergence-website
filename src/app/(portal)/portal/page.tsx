import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { PortalEntryClient } from './PortalEntryClient'

export const metadata: Metadata = {
  title: 'Portal — Tritt ein',
  description: 'Der Übergang in deinen inneren Raum. Kein Login — eine Schwelle.',
}

export default async function PortalEntryPage() {
  const user = await getCurrentUser()

  // Already authenticated — proceed to inner space
  if (user) {
    redirect('/inner')
  }

  return <PortalEntryClient />
}
