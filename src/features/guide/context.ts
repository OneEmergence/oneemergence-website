import { eq, desc } from 'drizzle-orm'
import { requireDb } from '@/lib/db'
import { journalEntries, practices, userPreferences } from '@/lib/db/schema'
import type { UserContext } from './prompts'

/**
 * Load the user's context for Guide system prompt injection.
 * Summarizes recent journal entries, practice history, and preferences.
 */
export async function getUserContext(
  userId: string,
  userName: string | null
): Promise<UserContext> {
  const db = requireDb()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch journal entries, practices, and preferences in parallel
  const [recentJournals, recentPractices, prefs] = await Promise.all([
    db
      .select({
        title: journalEntries.title,
        content: journalEntries.content,
        moodTags: journalEntries.moodTags,
        themes: journalEntries.themes,
        createdAt: journalEntries.createdAt,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(10),

    db
      .select()
      .from(practices)
      .where(eq(practices.userId, userId))
      .orderBy(desc(practices.completedAt)),

    db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
  ])

  // Summarize journal entries (excerpt only, not full content)
  const journalSummaries = recentJournals.map((entry) => ({
    title: entry.title,
    excerpt: entry.content.slice(0, 200) + (entry.content.length > 200 ? '...' : ''),
    moodTags: (entry.moodTags as string[]) ?? [],
    themes: (entry.themes as string[]) ?? [],
    createdAt: entry.createdAt,
  }))

  // Aggregate practice history by type (last 30 days)
  const recentOnly = recentPractices.filter(
    (p) => p.completedAt >= thirtyDaysAgo
  )
  const practiceMap = new Map<
    string,
    { totalSessions: number; totalMinutes: number; lastPractice: Date | null }
  >()

  for (const p of recentOnly) {
    const existing = practiceMap.get(p.type) ?? {
      totalSessions: 0,
      totalMinutes: 0,
      lastPractice: null,
    }
    existing.totalSessions += 1
    existing.totalMinutes += Math.round(p.duration / 60)
    if (!existing.lastPractice || p.completedAt > existing.lastPractice) {
      existing.lastPractice = p.completedAt
    }
    practiceMap.set(p.type, existing)
  }

  const practiceHistory = Array.from(practiceMap.entries()).map(
    ([type, stats]) => ({ type, ...stats })
  )

  const userPrefs = prefs[0]

  return {
    userName,
    journalEntries: journalSummaries,
    practiceHistory,
    focusThemes: (userPrefs?.focusThemes as string[]) ?? [],
    intensityMode: userPrefs?.intensityMode ?? 'balanced',
  }
}
