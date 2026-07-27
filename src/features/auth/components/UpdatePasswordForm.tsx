'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { updatePassword } from '../actions'
import { initialAuthState, type AuthActionState } from '../types'

const inputClasses = cn(
  'w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-2.5',
  'text-sm text-oe-pure-light placeholder:text-oe-pure-light/55',
  'transition-colors focus:border-oe-solar-gold/60 focus:outline-none focus:ring-1 focus:ring-oe-solar-gold/40'
)

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState<AuthActionState>(initialAuthState)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('password', password)
    fd.set('confirmPassword', confirmPassword)
    setState(initialAuthState)
    startTransition(async () => {
      // Success redirects to /inner server-side and never resolves here.
      setState(await updatePassword(fd))
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="block text-xs text-oe-pure-light/50">
          Neues Passwort <span className="text-oe-pure-light/55">(min. 8 Zeichen)</span>
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClasses}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="block text-xs text-oe-pure-light/50">
          Passwort bestätigen
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
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
        {isPending ? 'Speichert …' : 'Passwort setzen'}
      </button>

      {state.status === 'error' && (
        <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {state.error}
        </p>
      )}
    </form>
  )
}
