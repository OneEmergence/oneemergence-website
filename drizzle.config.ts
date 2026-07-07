// =============================================================================
// drizzle-kit is for TYPE INTROSPECTION only — it is NOT the migration channel.
// The single migration channel is supabase/migrations (Supabase-native SQL).
// This config keeps a raw process.env read on purpose: drizzle-kit runs as a
// standalone CLI outside the Next.js runtime, so it cannot import src/lib/env.ts
// (which validates the full server env and would fail-fast outside a request).
// =============================================================================

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
