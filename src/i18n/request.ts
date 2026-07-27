import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, type Locale } from './config'

/**
 * Locale resolution has two paths, and which one runs decides whether the
 * route can be statically prerendered.
 *
 * 1. **Pinned** — a tree that calls `setRequestLocale()` (the marketing and
 *    legal layouts) resolves here through `requestLocale` without touching
 *    `cookies()`. No dynamic API ⇒ the route prerenders at build time. That is
 *    what lets an unfurl bot from WhatsApp/Slack/LinkedIn get cached HTML
 *    instead of a cold MDX compile inside its ~5s timeout.
 *
 * 2. **Cookie** — the portal does not pin a locale, so it falls through to
 *    `NEXT_LOCALE`. Those routes are authenticated and dynamic anyway.
 *
 * Marketing copy is German-only today, so the public tree is pinned to
 * `defaultLocale`. Real bilingual public pages need URL segments
 * (`/de/…`, `/en/…`) — that is the only shape giving both static rendering
 * and a distinct indexable URL per language for hreflang.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const pinned = await requestLocale
  const locale = isLocale(pinned) ? pinned : await localeFromCookie()

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})

function isLocale(value: string | undefined): value is Locale {
  return !!value && locales.includes(value as Locale)
}

async function localeFromCookie(): Promise<Locale> {
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale
}
