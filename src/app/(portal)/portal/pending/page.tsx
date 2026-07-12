import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getWorkspaceAccess } from '@/features/workspaces'
import { WorkspaceAccessState } from '@/features/workspaces/components'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.pending')
  return { title: t('metadataTitle') }
}

export default async function PendingAccessPage() {
  const access = await getWorkspaceAccess()
  if (access.activeWorkspace) redirect('/inner')

  const pendingMembership = access.memberships.find((membership) => membership.status === 'pending')
  if (!pendingMembership) redirect('/portal/access')

  return <WorkspaceAccessState kind="pending" workspaceName={pendingMembership.name} />
}
