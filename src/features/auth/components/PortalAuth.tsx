'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  signInWithPassword,
  signUp,
  signInWithMagicLink,
  signInWithGoogle,
} from '../actions'
import { initialAuthState, type AuthActionState } from '../types'

type Mode = 'login' | 'signup'
type Pending = 'password' | 'magic' | 'google' | 'signup' | null

const inputClasses = cn(
  'w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-2.5',
  'text-sm text-oe-pure-light placeholder:text-oe-pure-light/30',
  'transition-colors focus:border-oe-solar-gold/60 focus:outline-none focus:ring-1 focus:ring-oe-solar-gold/40'
)

const primaryButton = cn(
  'flex w-full items-center justify-center gap-2 rounded-full bg-oe-solar-gold px-6 py-2.5',
  'text-sm font-medium text-oe-depth-warm transition-all duration-300',
  'hover:bg-oe-solar-gold/90 hover:shadow-[0_0_24px_rgba(246,196,83,0.25)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

export function PortalAuth() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [state, setState] = useState<AuthActionState>(initialAuthState)
  const [pending, setPending] = useState<Pending>(null)
  const [isPending, startTransition] = useTransition()

  function run(kind: Pending, fn: () => Promise<AuthActionState>) {
    setPending(kind)
    setState(initialAuthState)
    startTransition(async () => {
      const result = await fn()
      // Successful sign-in / OAuth redirect server-side and never resolve here.
      setState(result)
      setPending(null)
    })
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('email', email)
    fd.set('password', password)
    run('password', () => signInWithPassword(fd))
  }

  function submitSignUp(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('email', email)
    fd.set('password', password)
    if (displayName) fd.set('displayName', displayName)
    run('signup', () => signUp(fd))
  }

  function submitMagicLink() {
    const fd = new FormData()
    fd.set('email', email)
    run('magic', () => signInWithMagicLink(fd))
  }

  function submitGoogle() {
    run('google', () => signInWithGoogle())
  }

  function switchMode(next: Mode) {
    setMode(next)
    setState(initialAuthState)
    setPassword('')
  }

  return (
    <div className="w-full max-w-sm">
      {/* Tabs — gentle toggle between entering and crossing the threshold */}
      <div
        className="mb-6 flex rounded-full border border-oe-warm-sand/15 p-1"
        role="tablist"
        aria-label="Zugang"
      >
        {(
          [
            { id: 'login', label: 'Eintreten' },
            { id: 'signup', label: 'Schwelle überschreiten' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => switchMode(tab.id)}
            className={cn(
              'relative flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold/40',
              mode === tab.id
                ? 'text-oe-depth-warm'
                : 'text-oe-pure-light/50 hover:text-oe-pure-light/80'
            )}
          >
            {mode === tab.id && (
              <motion.span
                layoutId="portal-auth-tab"
                className="absolute inset-0 -z-0 rounded-full bg-oe-warm-sand"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {mode === 'login' ? (
            <form onSubmit={submitPassword} className="space-y-3 text-left">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs text-oe-pure-light/50">
                  E-Mail
                </label>
                <input
                  id="login-email"
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
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-xs text-oe-pure-light/50">
                  Passwort
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
              </div>

              <button type="submit" disabled={isPending} className={primaryButton}>
                {pending === 'password' ? 'Ein Moment …' : 'Eintreten'}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={submitMagicLink}
                  disabled={isPending}
                  className="text-oe-warm-sand/70 transition-colors hover:text-oe-warm-sand disabled:opacity-50"
                >
                  {pending === 'magic' ? 'Sende Link …' : 'Magischen Link senden'}
                </button>
                <a
                  href="/auth/reset-password"
                  className="text-oe-pure-light/40 transition-colors hover:text-oe-pure-light/70"
                >
                  Passwort vergessen?
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={submitSignUp} className="space-y-3 text-left">
              <div className="space-y-1.5">
                <label htmlFor="signup-name" className="block text-xs text-oe-pure-light/50">
                  Name <span className="text-oe-pure-light/25">(optional)</span>
                </label>
                <input
                  id="signup-name"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Wie sollen wir dich nennen?"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="block text-xs text-oe-pure-light/50">
                  E-Mail
                </label>
                <input
                  id="signup-email"
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
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="block text-xs text-oe-pure-light/50">
                  Passwort <span className="text-oe-pure-light/25">(min. 8 Zeichen)</span>
                </label>
                <input
                  id="signup-password"
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

              <button type="submit" disabled={isPending} className={primaryButton}>
                {pending === 'signup' ? 'Ein Moment …' : 'Schwelle überschreiten'}
              </button>
            </form>
          )}

          {/* Feedback */}
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

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-oe-warm-sand/10" />
            <span className="text-[10px] uppercase tracking-widest text-oe-pure-light/25">
              oder
            </span>
            <span className="h-px flex-1 bg-oe-warm-sand/10" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={submitGoogle}
            disabled={isPending}
            className={cn(
              'group flex w-full items-center justify-center gap-3 rounded-full',
              'border border-oe-warm-sand/15 px-6 py-2.5',
              'text-sm text-oe-pure-light/70 transition-all duration-300',
              'hover:border-oe-solar-gold/50 hover:text-oe-pure-light',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <GoogleIcon className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
            {pending === 'google' ? 'Weiterleitung …' : 'Mit Google eintreten'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
