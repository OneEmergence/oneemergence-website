import Link from 'next/link'

/**
 * 404 for URLs that match no route group at all (e.g. /gibt-es-nicht).
 *
 * Distinct from `(marketing)/not-found.tsx`, which catches `notFound()` calls
 * *inside* the public tree and therefore gets PublicChrome and translations.
 * This one renders directly under the root layout — outside every
 * `NextIntlClientProvider` — so the copy is static German, same as
 * `error.tsx`. Without it, an unknown path fell through to Next's unstyled
 * white default page.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-oe-deep-space px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-oe-aurora-violet-ink">
          404
        </p>
        <h1 className="mt-5 font-serif text-4xl text-balance text-oe-pure-light">
          Diese Seite existiert nicht.
        </h1>
        <p className="mt-4 leading-relaxed text-oe-pure-light/60">
          Vielleicht wurde sie verschoben, vielleicht war der Link
          unvollständig. Beides lässt sich beheben.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-11 items-center rounded-full bg-oe-aurora-violet-deep px-6 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
