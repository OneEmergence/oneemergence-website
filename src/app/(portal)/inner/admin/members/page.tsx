import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { listWorkspaceMembers, requireAdmin } from '@/features/workspaces'
import { WorkspaceMembersAdmin } from '@/features/workspaces/components'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.members')
  return { title: t('metadataTitle') }
}

export default async function MembersAdminPage() {
  const access = await requireAdmin()
  const activeWorkspace = access.activeWorkspace
  if (!activeWorkspace) redirect('/inner/admin/workspaces')

  const [members, t] = await Promise.all([
    listWorkspaceMembers(activeWorkspace.workspaceId),
    getTranslations('admin.members'),
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-9 pb-16">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-oe-pure-light md:text-4xl">{t('title')}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-oe-pure-light/50">
          {t('description')}
        </p>
        <p className="text-sm font-medium text-oe-warm-sand">{activeWorkspace.name}</p>
      </header>

      <WorkspaceMembersAdmin workspaceId={activeWorkspace.workspaceId} members={members} />
    </div>
  )
}
