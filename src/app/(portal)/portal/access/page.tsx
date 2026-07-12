import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getWorkspaceAccess } from '@/features/workspaces'
import { WorkspaceAccessState } from '@/features/workspaces/components'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.access')
  return { title: t('metadataTitle') }
}

export default async function PausedAccessPage() {
  const access = await getWorkspaceAccess()
  if (access.activeWorkspace) redirect('/inner')
  if (access.memberships.some((membership) => membership.status === 'pending')) {
    redirect('/portal/pending')
  }

  return <WorkspaceAccessState kind="access" />
}
