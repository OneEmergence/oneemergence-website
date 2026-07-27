import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

/**
 * Inherited by every route in the group, so the 18 portal pages do not each
 * need their own. Pairs with the disallow list in `src/app/robots.ts`: the
 * authenticated funnel should never accumulate thin results in the index.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Intl provider for the authenticated tree.
 *
 * Unlike the public tree this does NOT pin a locale, so `src/i18n/request.ts`
 * falls through to the `NEXT_LOCALE` cookie and the DE/EN switch keeps
 * working here. That makes these routes dynamic — which they already are,
 * since every one of them reads the Supabase session.
 *
 * `lang` is re-declared because the root `<html>` carries the public default.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()])

  return (
    <div lang={locale}>
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </div>
  )
}
