'use client'

import { motion } from 'framer-motion'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { PortalAuth } from '@/features/auth'

export function PortalEntryClient() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-oe-deep-space to-oe-depth-warm">
      <LayerAtmosphere variant="transitional" />

      {/* Portal content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-10 px-6 py-16 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Threshold glyph — outer ring cosmic, core carries the seed of warmth to come */}
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-oe-aurora-violet/30"
          animate={{
            boxShadow: [
              '0 0 20px rgba(124, 92, 255, 0.15)',
              '0 0 40px rgba(246, 196, 83, 0.25)',
              '0 0 20px rgba(124, 92, 255, 0.15)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-oe-aurora-violet to-oe-solar-gold" />
        </motion.div>

        {/* Invitation text */}
        <div className="max-w-md space-y-4">
          <motion.h1
            className="font-serif text-3xl leading-tight text-oe-pure-light md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Tritt über die Schwelle
          </motion.h1>
          <motion.p
            className="text-base leading-relaxed text-oe-pure-light/60 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Dein innerer Raum wartet. Ein Ort für Stille, Reflexion
            und bewusste Transformation.
          </motion.p>
        </div>

        {/* Auth panel — the threshold made passable */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex justify-center">
            <PortalAuth />
          </div>
        </motion.div>

        {/* Privacy note */}
        <motion.p
          className="max-w-xs text-center text-[11px] leading-relaxed text-oe-pure-light/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          Deine Daten gehören dir. Du kannst sie jederzeit exportieren oder dein
          Konto vollständig löschen.
        </motion.p>

        {/* Subtle return link */}
        <motion.a
          href="/"
          className="text-xs text-oe-pure-light/30 transition-colors hover:text-oe-pure-light/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Zurück zur öffentlichen Seite
        </motion.a>
      </motion.div>
    </div>
  )
}
