import { z } from 'zod'

// =============================================================================
// Auth & Identity — Zod Schemas (feature-owned)
// =============================================================================
// German messages surface directly in the portal UI (site language is DE).

const email = z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.')
const strongPassword = z
  .string()
  .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
  .max(72, 'Das Passwort darf höchstens 72 Zeichen lang sein.')

export const SignInSchema = z.object({
  email,
  password: z.string().min(1, 'Bitte gib dein Passwort ein.'),
})
export type SignInInput = z.infer<typeof SignInSchema>

export const SignUpSchema = z.object({
  email,
  password: strongPassword,
  displayName: z.string().trim().max(80, 'Der Name ist zu lang.').optional(),
})
export type SignUpInput = z.infer<typeof SignUpSchema>

export const MagicLinkSchema = z.object({ email })
export type MagicLinkInput = z.infer<typeof MagicLinkSchema>

export const ResetRequestSchema = z.object({ email })
export type ResetRequestInput = z.infer<typeof ResetRequestSchema>

export const UpdatePasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein.',
    path: ['confirmPassword'],
  })
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>

export const ProfileSchema = z.object({
  displayName: z.string().trim().max(80, 'Der Name ist zu lang.').optional(),
  bio: z.string().trim().max(500, 'Die Bio ist zu lang.').optional(),
})
export type ProfileInput = z.infer<typeof ProfileSchema>

/** Type-to-confirm account deletion. The literal must match exactly. */
export const DELETE_CONFIRMATION = 'LÖSCHEN' as const

export const DeleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine((v) => v === DELETE_CONFIRMATION, {
      message: `Bitte tippe „${DELETE_CONFIRMATION}“ zur Bestätigung.`,
    }),
})
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>
