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
    label: 'Seer',
    description: 'Poetic, intuitive, metaphorical',
    color: 'oe-aurora-violet',
    icon: '🔮',
  },
  {
    id: 'scientist',
    label: 'Scientist',
    description: 'Rational, clear, evidence-based',
    color: 'oe-spirit-cyan',
    icon: '🔬',
  },
  {
    id: 'architect',
    label: 'Architect',
    description: 'Strategic, practical, integrative',
    color: 'oe-solar-gold',
    icon: '📐',
  },
  {
    id: 'mirror',
    label: 'Mirror',
    description: 'Reflective, questioning, spacious',
    color: 'oe-pure-light',
    icon: '🪞',
  },
]
