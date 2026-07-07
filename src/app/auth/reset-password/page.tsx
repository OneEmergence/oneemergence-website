import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth/session'
import { ResetPasswordRequestForm, UpdatePasswordForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Passwort zurücksetzen',
  description: 'Setze dein Passwort zurück oder wähle ein neues.',
}

/**
 * Password reset page — two states in one route:
 *  - No session  → request form (enter email, receive reset link).
 *  - Recovery session (arrived via the emailed link → /auth/callback exchanged
 *    the code, so the user is now authenticated) → set-new-password form.
 */
export default async function ResetPasswordPage() {
  const user = await getCurrentUser()
  const inRecovery = Boolean(user)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-oe-deep-space to-oe-depth-warm px-6 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oe-aurora-violet/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oe-warm-sand/10 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="font-serif text-3xl leading-tight text-oe-pure-light">
            {inRecovery ? 'Ein neues Passwort' : 'Passwort zurücksetzen'}
          </h1>
          <p className="text-sm leading-relaxed text-oe-pure-light/50">
            {inRecovery
              ? 'Wähle ein neues Passwort, um deinen Zugang zu erneuern.'
              : 'Gib deine E-Mail-Adresse ein — wir senden dir einen Link, um dein Passwort neu zu setzen.'}
          </p>
        </div>

        {inRecovery ? <UpdatePasswordForm /> : <ResetPasswordRequestForm />}

        <a
          href="/portal"
          className="inline-block text-xs text-oe-pure-light/30 transition-colors hover:text-oe-pure-light/50"
        >
          Zurück zum Portal
        </a>
      </div>
    </div>
  )
}
