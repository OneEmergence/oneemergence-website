import { z } from 'zod'

import { APP_ROLES } from './types'

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().trim().max(max).optional()
  )

export const WorkspaceIdSchema = z.string().uuid()

export const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: optionalText(500),
})

export const WorkspaceMemberSchema = z.object({
  workspaceId: WorkspaceIdSchema,
  userId: z.string().uuid(),
})

export const AddWorkspaceMembershipSchema = z.object({
  workspaceId: WorkspaceIdSchema,
  email: z.string().trim().email().max(320).toLowerCase(),
})

export const SetUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(APP_ROLES),
})

export const WorkspaceProfileSchema = z.object({
  workspaceId: WorkspaceIdSchema,
  displayName: optionalText(80),
  avatarUrl: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().url().max(2048).optional()
  ),
  bio: optionalText(500),
  intensityMode: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.enum(['still', 'balanced', 'immersive']).optional()
  ),
  audioEnabled: z
    .enum(['true', 'false', 'on'])
    .optional()
    .transform((value) => value === 'true' || value === 'on'),
  focusThemes: optionalText(500).transform((value) =>
    value
      ? [
          ...new Set(
            value
              .split(',')
              .map((theme) => theme.trim())
              .filter(Boolean)
          ),
        ]
      : []
  ),
})
