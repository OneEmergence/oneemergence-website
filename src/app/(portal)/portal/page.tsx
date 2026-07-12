import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getWorkspaceAccess } from '@/features/workspaces'
import { PortalEntryClient } from './PortalEntryClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PortalEntryPage() {
  const user = await getCurrentUser()

  if (user) {
    const access = await getWorkspaceAccess()
    if (access.activeWorkspace) redirect('/inner')
    if (access.memberships.some((membership) => membership.status === 'pending')) {
      redirect('/portal/pending')
    }
    redirect('/portal/access')
  }

  return <PortalEntryClient />
}
