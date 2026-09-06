'use client'

import { useTranslations } from 'next-intl'

export function NewsletterSignup() {
  const t = useTranslations('newsletter')
  const href = `mailto:hello@oneemergence.com?subject=${encodeURIComponent(t('subject'))}`

  return (
    <div role="group" aria-label={t('label')} className="flex flex-col items-center gap-4">
      <p className="max-w-lg text-sm leading-relaxed text-oe-pure-light/70">{t('description')}</p>
      <a
        href={href}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-oe-aurora-violet-deep px-6 py-3 text-base font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-oe-deep-space"
      >
        {t('contact')}
      </a>
      <p className="max-w-lg text-xs leading-relaxed text-oe-pure-light/60">{t('mailHelp')}</p>
    </div>
  )
}
