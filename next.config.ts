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
  /* config options here */
  output: "standalone",
};

const configWithIntl = withNextIntl(nextConfig);
const configWithAnalyzer = withAnalyzer(configWithIntl);

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithAnalyzer, { silent: true })
  : configWithAnalyzer;
