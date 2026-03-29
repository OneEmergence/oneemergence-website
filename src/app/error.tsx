"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

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
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-md">
        <h2 className="font-serif text-2xl text-oe-pure-light mb-4">
          Something went wrong
        </h2>
        <p className="text-oe-pure-light/60 mb-8">
          This page encountered an error. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-oe-aurora-violet/20 border border-oe-aurora-violet/40 rounded-lg text-oe-pure-light hover:bg-oe-aurora-violet/30 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
