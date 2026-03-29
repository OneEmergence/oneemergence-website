'use client'

import { cn } from '@/lib/utils'
import { GUIDE_ROLES } from '../types'
import type { GuideRole } from '../types'

interface RoleSelectorProps {
  activeRole: GuideRole
  onSelect: (role: GuideRole) => void
  disabled?: boolean
}

const roleColorMap: Record<GuideRole, string> = {
  seer: 'border-oe-aurora-violet/40 bg-oe-aurora-violet/10 text-oe-aurora-violet',
  scientist: 'border-oe-spirit-cyan/40 bg-oe-spirit-cyan/10 text-oe-spirit-cyan',
  architect: 'border-oe-solar-gold/40 bg-oe-solar-gold/10 text-oe-solar-gold',
  mirror: 'border-oe-pure-light/40 bg-oe-pure-light/10 text-oe-pure-light',
}

const roleColorInactive: Record<GuideRole, string> = {
  seer: 'hover:border-oe-aurora-violet/20 hover:text-oe-aurora-violet/60',
  scientist: 'hover:border-oe-spirit-cyan/20 hover:text-oe-spirit-cyan/60',
  architect: 'hover:border-oe-solar-gold/20 hover:text-oe-solar-gold/60',
  mirror: 'hover:border-oe-pure-light/20 hover:text-oe-pure-light/60',
}

export function RoleSelector({ activeRole, onSelect, disabled }: RoleSelectorProps) {
  return (
    <div className="flex gap-2">
      {GUIDE_ROLES.map((role) => {
        const isActive = activeRole === role.id
        return (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all',
              'disabled:pointer-events-none disabled:opacity-40',
              isActive
                ? roleColorMap[role.id]
                : cn(
                    'border-oe-pure-light/10 text-oe-pure-light/40',
                    roleColorInactive[role.id]
                  )
            )}
            title={role.description}
          >
            <span className="text-sm">{role.icon}</span>
            <span className="hidden sm:inline">{role.label}</span>
          </button>
        )
      })}
    </div>
  )
}
