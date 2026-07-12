import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { listWorkspaces, requireAdmin } from '@/features/workspaces'
import { WorkspacesAdmin } from '@/features/workspaces/components'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.workspaces')
  return { title: t('metadataTitle') }
}

export default async function WorkspacesAdminPage() {
  await requireAdmin()
  const [workspaces, t] = await Promise.all([listWorkspaces(), getTranslations('admin.workspaces')])

  return (
    <div className="mx-auto max-w-6xl space-y-9 pb-16">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-oe-pure-light md:text-4xl">{t('title')}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-oe-pure-light/50">
          {t('description')}
        </p>
      </header>

      <WorkspacesAdmin workspaces={workspaces} />
    </div>
  )
}
