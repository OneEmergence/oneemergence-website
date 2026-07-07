// =============================================================================
// Auth & Identity — public feature API
// =============================================================================
// Nothing outside this feature should import its internals directly; import
// from '@/features/auth'.

// Types
export type {
  AuthActionState,
  ProfileRow,
  UserDataExport,
} from './types'
export { initialAuthState } from './types'
export type { PreferencesRow } from './preferences'

// Schemas
export {
  SignInSchema,
  SignUpSchema,
  MagicLinkSchema,
  ResetRequestSchema,
  UpdatePasswordSchema,
  ProfileSchema,
  DeleteAccountSchema,
  DELETE_CONFIRMATION,
} from './schemas'

// Auth flow actions
export {
  signInWithPassword,
  signUp,
  signInWithMagicLink,
  signInWithGoogle,
  signOut,
  resetPassword,
  updatePassword,
  getProfile,
  updateProfile,
  updateAvatarUrl,
  exportUserData,
  deleteAccount,
} from './actions'

// Preferences & onboarding actions
export {
  updatePreferences,
  getPreferences,
  completeOnboarding,
} from './preferences'

// Components
export { PortalAuth } from './components/PortalAuth'
export { ResetPasswordRequestForm } from './components/ResetPasswordRequestForm'
export { UpdatePasswordForm } from './components/UpdatePasswordForm'
export { ProfileSettingsForm } from './components/ProfileSettingsForm'
export { PreferencesSettingsForm } from './components/PreferencesSettingsForm'
export { DangerZone } from './components/DangerZone'
export { AvatarUpload } from './components/AvatarUpload'
