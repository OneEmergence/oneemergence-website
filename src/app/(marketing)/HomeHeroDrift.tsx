'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useMotionLevel } from '@/hooks/useMotionLevel'

/**
 * The hero recedes as the page descends into the first depth.
 *
 * Motion level: Flow. Still mode renders a plain element: no inline opacity
 * and no transform, so the hero never fades or becomes a containing block.
 */
export function HomeHeroDrift({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const allowFlow = useMotionLevel('flow')
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.18], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.18], [1, 0.96])

  if (!allowFlow) {
    return (
      <div data-motion-level="flow" className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div data-motion-level="flow" style={{ opacity, scale }} className={className}>
      {children}
    </motion.div>
  )
}
