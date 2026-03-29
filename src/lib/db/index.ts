import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Database client for Neon Postgres.
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
  const sql = neon(url)
  return drizzle(sql, { schema })
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
