"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="de">
      <body className="bg-oe-deep-space text-oe-pure-light font-sans flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-6">
          <h1 className="font-serif text-3xl mb-4">
            Something went wrong
          </h1>
          <p className="text-oe-pure-light/60 mb-8">
            An unexpected error occurred. We&apos;ve been notified and are looking into it.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-oe-aurora-violet/20 border border-oe-aurora-violet/40 rounded-lg text-oe-pure-light hover:bg-oe-aurora-violet/30 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
