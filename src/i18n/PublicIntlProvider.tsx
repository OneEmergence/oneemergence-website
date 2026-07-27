import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { defaultLocale } from './config'

/**
 * Intl provider for the public tree (marketing + legal).
 *
 * `setRequestLocale` pins the locale so `src/i18n/request.ts` resolves it
 * without reading cookies — that is the single thing keeping these routes
 * statically prerenderable. Any dynamic API called above this point puts them
 * back on the per-request path, so keep the root layout intl-free.
 *
 * Pinned to `defaultLocale` because public copy is German-only. Bilingual
 * public pages need `/de` + `/en` URL segments, not a cookie.
 */
export async function PublicIntlProvider({ children }: { children: React.ReactNode }) {
  setRequestLocale(defaultLocale)
  const messages = await getMessages()

  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
}
