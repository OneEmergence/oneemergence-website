export type PracticeType = 'meditation' | 'breathwork' | 'soundscape'

export interface PracticeSession {
  id: string
  userId: string
  type: PracticeType
  duration: number // seconds
  completedAt: Date
  notes: string | null
}

export type BreathPattern = {
  name: string
  label: string // German
  description: string // German
  phases: { action: 'inhale' | 'hold' | 'exhale' | 'rest'; duration: number }[]
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    name: 'box',
    label: 'Box-Atmung',
    description:
      'Gleichmäßig und beruhigend — 4 Sekunden ein, halten, aus, halten.',
    phases: [
      { action: 'inhale', duration: 4 },
      { action: 'hold', duration: 4 },
      { action: 'exhale', duration: 4 },
      { action: 'rest', duration: 4 },
    ],
  },
  {
    name: '478',
    label: '4-7-8 Atmung',
    description: 'Tief beruhigend — 4 ein, 7 halten, 8 langsam ausatmen.',
    phases: [
      { action: 'inhale', duration: 4 },
      { action: 'hold', duration: 7 },
      { action: 'exhale', duration: 8 },
    ],
  },
  {
    name: 'coherent',
    label: 'Kohärente Atmung',
    description:
      'Einfach und harmonisierend — 5 Sekunden ein, 5 Sekunden aus.',
    phases: [
      { action: 'inhale', duration: 5 },
      { action: 'exhale', duration: 5 },
    ],
  },
]

export const MEDITATION_DURATIONS = [5, 10, 15, 20, 30] as const
