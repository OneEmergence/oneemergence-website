import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
});
