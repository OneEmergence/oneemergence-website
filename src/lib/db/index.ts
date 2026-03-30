import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Database client for Supabase Postgres (via postgres-js).
 *
 * Returns null if DATABASE_URL is not configured, allowing the app to build
 * and run in development without a database connection. All code that uses
 * the database should check for null and handle gracefully.
 */
function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return null
  }
  const client = postgres(url, { prepare: false }) // prepare: false for Supabase transaction pooler
  return drizzle(client, { schema })
}

export const db = createDb()
export type Database = NonNullable<ReturnType<typeof createDb>>

/**
 * Get the database client, throwing if not configured.
 * Use this in server actions where a database is required.
 */
export function requireDb(): Database {
  if (!db) {
    throw new Error(
      'Database not configured. Set DATABASE_URL in your environment.'
    )
  }
  return db
}
