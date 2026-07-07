'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { resetPassword } from '../actions'
import { initialAuthState, type AuthActionState } from '../types'

const inputClasses = cn(
  'w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-2.5',
  'text-sm text-oe-pure-light placeholder:text-oe-pure-light/30',
  'transition-colors focus:border-oe-solar-gold/60 focus:outline-none focus:ring-1 focus:ring-oe-solar-gold/40'
)

export function ResetPasswordRequestForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<AuthActionState>(initialAuthState)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('email', email)
    setState(initialAuthState)
    startTransition(async () => {
      setState(await resetPassword(fd))
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <label htmlFor="reset-email" className="block text-xs text-oe-pure-light/50">
          E-Mail
        </label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="du@beispiel.de"
          className={inputClasses}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'w-full rounded-full bg-oe-solar-gold px-6 py-2.5 text-sm font-medium text-oe-depth-warm',
          'transition-all duration-300 hover:bg-oe-solar-gold/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {isPending ? 'Sende Link …' : 'Link zum Zurücksetzen senden'}
      </button>

      {state.status === 'error' && (
        <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {state.error}
        </p>
      )}
      {state.status === 'success' && state.message && (
        <p className="rounded-lg border border-oe-living-green/25 bg-oe-living-green/10 px-3 py-2 text-xs text-oe-living-green">
          {state.message}
        </p>
      )}
    </form>
  )
}
