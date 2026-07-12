import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DangerZone, signOut } from '@/features/auth'
import { getCurrentUser } from '@/lib/auth/session'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile.account')
  return { title: t('metadataTitle') }
}

export default async function PortalAccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/portal')
  const t = await getTranslations('profile.account')

  return (
    <main
      id="main-content"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-oe-depth-warm px-5 py-10 text-oe-pure-light sm:px-8 md:py-16"
    >
      <LayerAtmosphere variant="warm" />
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/portal"
            className="text-sm text-oe-warm-sand/75 underline-offset-4 hover:text-oe-warm-sand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
          >
            {t('back')}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-10 rounded-full border border-oe-warm-sand/25 px-5 py-2 text-sm text-oe-pure-light/70 hover:border-oe-warm-sand hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
            >
              {t('signOut')}
            </button>
          </form>
        </div>

        <header className="mb-12 mt-12 space-y-3">
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">{t('title')}</h1>
          <p className="max-w-xl text-sm leading-relaxed text-oe-pure-light/55">
            {t('description')}
          </p>
          {user.email ? (
            <p className="text-sm font-medium text-oe-warm-sand">{user.email}</p>
          ) : null}
        </header>

        <DangerZone />
      </div>
    </main>
  )
}
