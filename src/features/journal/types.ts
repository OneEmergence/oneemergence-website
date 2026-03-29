export type MoodTag =
  | 'calm'
  | 'restless'
  | 'grateful'
  | 'anxious'
  | 'inspired'
  | 'heavy'
  | 'light'
  | 'curious'
  | 'peaceful'
  | 'uncertain'

export const MOOD_TAGS: { value: MoodTag; label: string }[] = [
  { value: 'calm', label: 'Ruhig' },
  { value: 'restless', label: 'Rastlos' },
  { value: 'grateful', label: 'Dankbar' },
  { value: 'anxious', label: 'Ängstlich' },
  { value: 'inspired', label: 'Inspiriert' },
  { value: 'heavy', label: 'Schwer' },
  { value: 'light', label: 'Leicht' },
  { value: 'curious', label: 'Neugierig' },
  { value: 'peaceful', label: 'Friedvoll' },
  { value: 'uncertain', label: 'Unsicher' },
]

export interface JournalEntry {
  id: string
  userId: string
  title: string
  content: string
  moodTags: string[]
  themes: string[]
  createdAt: Date
  updatedAt: Date
}
