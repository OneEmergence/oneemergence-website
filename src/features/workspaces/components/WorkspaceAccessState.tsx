'use client'

import Link from 'next/link'
import { Clock3, ShieldAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { signOut } from '@/features/auth'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'

interface WorkspaceAccessStateProps {
  kind: 'pending' | 'access'
  workspaceName?: string | null
}

export function WorkspaceAccessState({ kind, workspaceName }: WorkspaceAccessStateProps) {
  const t = useTranslations(`auth.${kind}`)
  const Icon = kind === 'pending' ? Clock3 : ShieldAlert

  return (
    <main
      id="main-content"
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-oe-depth-warm px-5 py-12 text-oe-pure-light"
    >
      <LayerAtmosphere variant="warm" />
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-14 inline-block font-serif text-xl text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
        >
          OneEmergence
        </Link>

        <section aria-labelledby="access-state-title" className="max-w-xl">
          <Icon className="mb-7 h-9 w-9 text-oe-warm-sand" strokeWidth={1.5} aria-hidden="true" />
          <h1 id="access-state-title" className="font-serif text-4xl leading-tight md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-oe-pure-light/65">
            {t('description')}
          </p>
          {kind === 'pending' && workspaceName ? (
            <p className="mt-5 text-sm font-medium text-oe-warm-sand">
              {t('workspace', { name: workspaceName })}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={kind === 'pending' ? '/portal' : '/contact'}
              className="inline-flex min-h-11 items-center rounded-full bg-oe-solar-gold px-6 py-3 text-sm font-semibold text-oe-depth-warm transition-colors hover:bg-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm"
            >
              {t(kind === 'pending' ? 'check' : 'contact')}
            </Link>
            <Link
              href="/portal/account"
              className="inline-flex min-h-11 items-center rounded-full border border-oe-warm-sand/30 px-6 py-3 text-sm font-medium text-oe-pure-light/75 transition-colors hover:border-oe-warm-sand hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
            >
              {t('account')}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 rounded-full border border-oe-warm-sand/30 px-6 py-3 text-sm font-medium text-oe-pure-light/75 transition-colors hover:border-oe-warm-sand hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
              >
                {t('signOut')}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
