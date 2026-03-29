'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('submitting')
    // Placeholder: in production this would call a server action
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 600)
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="font-serif text-xl text-oe-solar-gold">
          Willkommen im Feld.
        </p>
        <p className="mt-2 text-sm text-oe-pure-light/60">
          Du erhältst bald unsere erste Nachricht.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
      <label htmlFor="newsletter-email" className="sr-only">
        E-Mail-Adresse
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="deine@email.de"
        disabled={status === 'submitting'}
        className="w-full max-w-sm rounded-full border border-oe-aurora-violet/30 bg-oe-pure-light/5 px-5 py-3 text-sm text-oe-pure-light placeholder:text-oe-pure-light/30 focus:border-oe-aurora-violet/60 focus:outline-none focus:ring-1 focus:ring-oe-aurora-violet/40 transition-colors disabled:opacity-50"
      />
      <Button
        variant="primary"
        size="md"
        type="submit"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Wird gesendet...' : 'Eintauchen'}
      </Button>
    </form>
  )
}
