import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
};

const configWithIntl = withNextIntl(nextConfig);
const configWithAnalyzer = withAnalyzer(configWithIntl);

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithAnalyzer, { silent: true })
  : configWithAnalyzer;
