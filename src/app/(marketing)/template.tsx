'use client'

import { motion } from 'framer-motion'
import { useMotionLevel } from '@/hooks/useMotionLevel'

/**
 * Route transition for the public tree.
 *
 * Motion level: Flow. Without the gate it played in Still mode and under
 * `prefers-reduced-motion` like every other ungated framer-motion animation.
 *
 * Rendering a plain fragment in Still mode also drops the non-identity
 * `transform`, which for the duration of the transition would otherwise make
 * this div a containing block for any `position: fixed` descendant.
 */
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  const allowFlow = useMotionLevel('flow')

  if (!allowFlow) return <>{children}</>

  return (
    <motion.div
      data-motion-level="flow"
      // Keep server-rendered content visible even before hydration.
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
