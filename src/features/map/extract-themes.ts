/**
 * Theme Extraction Module for the Consciousness Map
 *
 * Scans journal entry content for predefined consciousness/spirituality
 * theme keywords and returns matched themes with weights.
 *
 * v1: Simple keyword matching. AI-powered extraction planned for later.
 */

export const MAX_THEMES_PER_ENTRY = 5;

/**
 * Vocabulary of consciousness themes mapped to keyword variants (DE + EN).
 * Keys are canonical theme names; values are lowercase keyword arrays.
 */
export const THEME_VOCABULARY: Record<string, readonly string[]> = {
  Presence: ['presence', 'präsenz', 'present', 'gegenwärtig', 'gegenwart'],
  Consciousness: ['consciousness', 'bewusstsein', 'bewusst', 'conscious'],
  Shadow: ['shadow', 'schatten', 'shadow work', 'schattenarbeit'],
  Love: ['love', 'liebe', 'loving', 'liebevoll'],
  Fear: ['fear', 'angst', 'afraid', 'fürchten', 'furcht'],
  Unity: ['unity', 'einheit', 'oneness', 'eins sein', 'vereinigung'],
  Transformation: ['transformation', 'transformieren', 'transform', 'wandlung', 'verwandlung'],
  Silence: ['silence', 'stille', 'silent', 'still', 'schweigen'],
  Gratitude: ['gratitude', 'dankbarkeit', 'grateful', 'dankbar'],
  Emergence: ['emergence', 'emergenz', 'emergent', 'entstehen', 'hervorkommen'],
  Meditation: ['meditation', 'meditieren', 'meditate', 'meditativ'],
  Breath: ['breath', 'atem', 'breathing', 'atmen', 'atemarbeit', 'breathwork'],
  Dreams: ['dreams', 'träume', 'dream', 'traum', 'träumen', 'dreaming'],
  Awareness: ['awareness', 'gewahrsein', 'aware', 'gewahr', 'achtsamkeit', 'mindfulness'],
  Compassion: ['compassion', 'mitgefühl', 'compassionate', 'mitfühlend'],
  Surrender: ['surrender', 'hingabe', 'loslassen', 'letting go', 'hingeben'],
  Vision: ['vision', 'visionary', 'visionär', 'innere schau'],
  Practice: ['practice', 'praxis', 'practicing', 'praktizieren', 'übung'],
  Connection: ['connection', 'verbindung', 'connected', 'verbunden', 'verbundenheit'],
  'Inner Work': ['inner work', 'innere arbeit', 'inner journey', 'innere reise', 'selbstarbeit'],
} as const;

export interface ExtractedTheme {
  theme: string;
  weight: number;
  matches: number;
}

const MAX_WEIGHT = 5;

/**
 * Count non-overlapping occurrences of a keyword in the given text.
 */
function countOccurrences(text: string, keyword: string): number {
  let count = 0;
  let position = 0;

  while (position <= text.length - keyword.length) {
    const index = text.indexOf(keyword, position);
    if (index === -1) break;
    count++;
    position = index + keyword.length;
  }

  return count;
}

/**
 * Extract consciousness themes from journal entry content.
 *
 * Scans the content for keyword matches across all themes,
 * returns the top themes sorted by weight (descending).
 */
export function extractThemes(content: string): ExtractedTheme[] {
  const lowered = content.toLowerCase();
  const results: ExtractedTheme[] = [];

  for (const [theme, keywords] of Object.entries(THEME_VOCABULARY)) {
    let totalMatches = 0;

    for (const keyword of keywords) {
      totalMatches += countOccurrences(lowered, keyword);
    }

    if (totalMatches > 0) {
      results.push({
        theme,
        weight: Math.min(totalMatches, MAX_WEIGHT),
        matches: totalMatches,
      });
    }
  }

  results.sort((a, b) => b.weight - a.weight);

  return results.slice(0, MAX_THEMES_PER_ENTRY);
}
