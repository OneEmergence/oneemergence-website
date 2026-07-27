import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

// NOTE: next.config.ts is transpiled by Next's lightweight config loader
// (next/dist/build/next-config-ts/transpile-config), which does not resolve
// tsconfig path aliases (`@/*`) or run the file through the app's module
// graph. Importing `@/lib/env` here is unreliable across Next.js versions,
// so this file intentionally keeps raw `process.env` reads.

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Standalone output is opt-in, set by the Dockerfile's builder stage.
  // Unconditionally on, it breaks the normal local production loop twice:
  // `next start` refuses to serve a standalone build, and
  // `.next/standalone/server.js` does not load `.env*` files (it expects the
  // container runtime to supply env). Gating it keeps `pnpm start` honest
  // while Docker still gets the slim self-contained server.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
};

const configWithIntl = withNextIntl(nextConfig);
const configWithAnalyzer = withAnalyzer(configWithIntl);

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithAnalyzer, { silent: true })
  : configWithAnalyzer;
