'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useMotionLevel } from '@/hooks/useMotionLevel'

/**
 * The "scroll down" hint under the hero.
 *
 * Motion level: Flow. It used to declare no level at all, so neither gate
 * could reach it — the one permanently looping element on the landing page
 * was also the one that survived Still mode and `prefers-reduced-motion`.
 */
export function ScrollIndicator() {
  const allowFlow = useMotionLevel('flow')
  const t = useTranslations('common')

  const label = (
    <span className="text-[10px] uppercase tracking-[0.3em] text-oe-pure-light/50">
      {t('discover')}
    </span>
  )
  const rule = 'h-8 w-px bg-gradient-to-b from-oe-aurora-violet/40 to-transparent'

  if (!allowFlow) {
    return (
      <div className="flex flex-col items-center gap-2">
        {label}
        <div className={rule} />
      </div>
    )
  }

  return (
    <motion.div
      data-motion-level="flow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="flex flex-col items-center gap-2"
    >
      {label}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={rule}
      />
    </motion.div>
  )
}
