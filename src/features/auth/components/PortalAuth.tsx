'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { signInWithGoogle, signInWithMagicLink, signInWithPassword, signUp } from '../actions'
import { initialAuthState, type AuthActionState } from '../types'

type Mode = 'login' | 'signup'
type Pending = 'password' | 'magic' | 'google' | 'signup' | null

const inputClasses = cn(
  'w-full rounded-lg border border-oe-warm-sand/25 bg-oe-warm-sand/[0.05] px-4 py-3',
  'text-sm text-oe-pure-light placeholder:text-oe-pure-light/55',
  'transition-colors focus:border-oe-solar-gold focus:outline-none focus:ring-2 focus:ring-oe-solar-gold/35',
  'aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-red-300/30'
)

const primaryButton = cn(
  'flex min-h-11 w-full items-center justify-center rounded-full bg-oe-solar-gold px-6 py-3',
  'text-sm font-semibold text-oe-depth-warm transition-colors hover:bg-oe-warm-sand active:translate-y-px',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

export function PortalAuth() {
  const t = useTranslations('auth')
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [state, setState] = useState<AuthActionState>(initialAuthState)
  const [pending, setPending] = useState<Pending>(null)
  const [isPending, startTransition] = useTransition()

  function run(kind: Exclude<Pending, null>, action: () => Promise<AuthActionState>) {
    setPending(kind)
    setState(initialAuthState)
    startTransition(async () => {
      try {
        setState(await action())
      } catch {
        setState({ status: 'error', error: t('errors.generic') })
      } finally {
        setPending(null)
      }
    })
  }

  function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    run('password', () => signInWithPassword(new FormData(event.currentTarget)))
  }

  function submitSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    run('signup', () => signUp(new FormData(event.currentTarget)))
  }

  function submitMagicLink() {
    const formData = new FormData()
    formData.set('email', email)
    run('magic', () => signInWithMagicLink(formData))
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setState(initialAuthState)
    setPassword('')
  }

  const hasError = state.status === 'error'

  return (
    <div className="w-full max-w-md">
      <div
        className="mb-7 grid grid-cols-2 rounded-full border border-oe-warm-sand/20 p-1"
        role="group"
        aria-label={t('modeLabel')}
      >
        {(['login', 'signup'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => switchMode(option)}
            className={cn(
              'min-h-10 rounded-full px-3 text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold',
              mode === option
                ? 'bg-oe-warm-sand text-oe-depth-warm'
                : 'text-oe-pure-light/65 hover:text-oe-pure-light'
            )}
          >
            {t(`modes.${option}`)}
          </button>
        ))}
      </div>

      {mode === 'login' ? (
        <form onSubmit={submitPassword} className="space-y-4" aria-busy={isPending}>
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-oe-pure-light/70"
            >
              {t('fields.email')}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('fields.emailPlaceholder')}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? 'auth-feedback' : undefined}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-oe-pure-light/70"
            >
              {t('fields.password')}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('fields.passwordPlaceholder')}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? 'auth-feedback' : undefined}
              className={inputClasses}
            />
          </div>

          <button type="submit" disabled={isPending} className={primaryButton}>
            {pending === 'password' ? t('actions.signingIn') : t('actions.signIn')}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <button
              type="button"
              onClick={submitMagicLink}
              disabled={isPending || email.length === 0}
              className="min-h-8 text-left text-oe-warm-sand/80 transition-colors hover:text-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold disabled:opacity-50"
            >
              {pending === 'magic' ? t('actions.sendingLink') : t('actions.magicLink')}
            </button>
            <Link
              href="/auth/reset-password"
              className="min-h-8 py-2 text-oe-pure-light/55 transition-colors hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
            >
              {t('actions.forgotPassword')}
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={submitSignUp} className="space-y-4" aria-busy={isPending}>
          <div className="space-y-1.5">
            <label
              htmlFor="signup-name"
              className="block text-xs font-medium text-oe-pure-light/70"
            >
              {t('fields.displayName')}{' '}
              <span className="text-oe-pure-light/55">{t('fields.optional')}</span>
            </label>
            <input
              id="signup-name"
              name="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={t('fields.displayNamePlaceholder')}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="block text-xs font-medium text-oe-pure-light/70"
            >
              {t('fields.email')}
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('fields.emailPlaceholder')}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? 'auth-feedback' : undefined}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="block text-xs font-medium text-oe-pure-light/70"
            >
              {t('fields.password')}
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('fields.passwordPlaceholder')}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? 'auth-feedback' : 'password-help'}
              className={inputClasses}
            />
            <p id="password-help" className="text-xs text-oe-pure-light/55">
              {t('fields.passwordHelp')}
            </p>
          </div>

          <button type="submit" disabled={isPending} className={primaryButton}>
            {pending === 'signup' ? t('actions.creatingAccount') : t('actions.signUp')}
          </button>
        </form>
      )}

      <div id="auth-feedback" className="mt-4 min-h-5" aria-live="polite" aria-atomic="true">
        {state.status === 'error' ? (
          <p
            role="alert"
            className="rounded-lg border border-red-300/35 bg-red-950/30 px-3 py-2 text-sm text-red-100"
          >
            {state.error}
          </p>
        ) : null}
        {state.status === 'success' && state.message ? (
          <p
            role="status"
            className="rounded-lg border border-oe-living-green/35 bg-oe-living-green/10 px-3 py-2 text-sm text-oe-living-green"
          >
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-oe-warm-sand/15" />
        <span className="text-xs text-oe-pure-light/55">{t('or')}</span>
        <span className="h-px flex-1 bg-oe-warm-sand/15" />
      </div>

      <button
        type="button"
        onClick={() => run('google', signInWithGoogle)}
        disabled={isPending}
        className={cn(
          'flex min-h-11 w-full items-center justify-center rounded-full border border-oe-warm-sand/25 px-6 py-3',
          'text-sm font-medium text-oe-pure-light/80 transition-colors hover:border-oe-solar-gold hover:text-oe-pure-light active:translate-y-px',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {pending === 'google' ? t('actions.redirecting') : t('actions.google')}
      </button>
    </div>
  )
}
