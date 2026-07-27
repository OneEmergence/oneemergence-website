"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Root error boundary.
 *
 * Copy is static German rather than translated: this boundary replaces the
 * tree below the root layout, so it renders *outside* the route groups that
 * own the `NextIntlClientProvider` — `useTranslations` would throw here, on
 * the one screen that must never throw.
 *
 * The link home matters as much as the retry: if the underlying error is
 * deterministic (bad MDX frontmatter, a missing content file), `reset()`
 * re-throws and a visitor with only that button is trapped.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[70svh] items-center justify-center bg-oe-deep-space px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-oe-aurora-violet-ink">
          Fehler
        </p>
        <h1 className="mt-5 font-serif text-3xl text-balance text-oe-pure-light">
          Hier ist etwas schiefgegangen.
        </h1>
        <p className="mt-4 leading-relaxed text-oe-pure-light/60">
          Die Seite konnte nicht geladen werden. Ein erneuter Versuch hilft oft
          — sonst geht es über die Startseite weiter.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-full bg-oe-aurora-violet-deep px-6 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold"
          >
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-oe-pure-light/15 px-6 text-sm text-oe-pure-light/70 transition-colors duration-200 hover:border-oe-pure-light/35 hover:text-oe-pure-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
