export type { GuideRole, GuideResponse, GuideMessage, GuideConversation, SavedCard, PromptCard, Exercise } from '@/lib/schemas/guide'

/** Role metadata for the UI */
export interface RoleMeta {
  id: 'seer' | 'scientist' | 'architect' | 'mirror'
  label: string
  description: string
  color: string
  icon: string
}

export const GUIDE_ROLES: RoleMeta[] = [
  {
    id: 'seer',
    label: 'Seher',
    description: 'Poetisch, intuitiv, metaphorisch',
    color: 'oe-aurora-violet',
    icon: '🔮',
  },
  {
    id: 'scientist',
    label: 'Forscher',
    description: 'Rational, klar, evidenzbasiert',
    color: 'oe-spirit-cyan',
    icon: '🔬',
  },
  {
    id: 'architect',
    label: 'Architekt',
    description: 'Strategisch, praktisch, integrativ',
    color: 'oe-solar-gold',
    icon: '📐',
  },
  {
    id: 'mirror',
    label: 'Spiegel',
    description: 'Reflektierend, fragend, weitsichtig',
    color: 'oe-pure-light',
    icon: '🪞',
  },
]
