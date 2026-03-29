'use client'

import { motion } from 'framer-motion'
import { GUIDE_ROLES } from '../types'
import type { GuideRole } from '../types'

interface GuideWelcomeProps {
  onRoleSelect: (role: GuideRole) => void
}

export function GuideWelcome({ onRoleSelect }: GuideWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg text-center"
      >
        <div className="mb-6 text-4xl">✦</div>
        <h2 className="mb-3 font-serif text-2xl text-oe-pure-light">
          Der Guide erwartet dich
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-oe-pure-light/50">
          Wähle eine Perspektive. Jede Rolle bietet einen anderen Zugang zu
          deiner inneren Landschaft — poetisch, rational, praktisch oder
          reflektierend.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {GUIDE_ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              onClick={() => onRoleSelect(role.id)}
              className="group rounded-xl border border-oe-pure-light/10 bg-oe-pure-light/[0.03] p-4 text-left transition-all hover:border-oe-pure-light/20 hover:bg-oe-pure-light/[0.06]"
            >
              <div className="mb-2 text-2xl">{role.icon}</div>
              <h3 className="mb-1 text-sm font-medium text-oe-pure-light/80">
                {role.label}
              </h3>
              <p className="text-xs text-oe-pure-light/40">
                {role.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
