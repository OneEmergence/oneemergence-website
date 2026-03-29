'use client'

import { motion } from 'framer-motion'

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-[10px] uppercase tracking-[0.3em] text-oe-pure-light/30">
        Entdecken
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="h-8 w-px bg-gradient-to-b from-oe-aurora-violet/40 to-transparent"
      />
    </motion.div>
  )
}
