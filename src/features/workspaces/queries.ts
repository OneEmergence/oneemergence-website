import 'server-only'

import { and, asc, eq } from 'drizzle-orm'

import { requireDb } from '@/lib/db'
import {
  profiles,
  userRoles,
  workspaceMemberships,
  workspaceProfiles,
  workspaces,
} from '@/lib/db/schema'

import { getWorkspaceAccess, hasActiveWorkspaceMembership, requireAdmin } from './access'
import { WorkspaceIdSchema } from './schemas'
import type { Workspace, WorkspaceMember, WorkspaceProfile } from './types'

export async function listWorkspaces(): Promise<Workspace[]> {
  await requireAdmin()
  return requireDb().select().from(workspaces).orderBy(asc(workspaces.name))
}

export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  await requireAdmin()
  const parsedId = WorkspaceIdSchema.safeParse(workspaceId)
  if (!parsedId.success) return []

  const rows = await requireDb()
    .select({
      userId: workspaceMemberships.userId,
      email: profiles.email,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      role: userRoles.role,
      status: workspaceMemberships.status,
      joinedAt: workspaceMemberships.createdAt,
      approvedAt: workspaceMemberships.approvedAt,
    })
    .from(workspaceMemberships)
    .leftJoin(profiles, eq(profiles.id, workspaceMemberships.userId))
    .leftJoin(userRoles, eq(userRoles.userId, workspaceMemberships.userId))
    .where(eq(workspaceMemberships.workspaceId, parsedId.data))
    .orderBy(asc(profiles.displayName), asc(workspaceMemberships.createdAt))

  return rows.map((row) => ({ ...row, role: row.role ?? 'user' }))
}

export async function getWorkspaceProfile(workspaceId: string): Promise<WorkspaceProfile | null> {
  const parsedId = WorkspaceIdSchema.safeParse(workspaceId)
  if (!parsedId.success) return null

  const context = await getWorkspaceAccess()
  if (!(await hasActiveWorkspaceMembership(context.user.id, parsedId.data))) {
    return null
  }

  const rows = await requireDb()
    .select({
      workspaceId: workspaceProfiles.workspaceId,
      userId: workspaceProfiles.userId,
      displayName: workspaceProfiles.displayName,
      avatarUrl: workspaceProfiles.avatarUrl,
      bio: workspaceProfiles.bio,
      intensityMode: workspaceProfiles.intensityMode,
      audioEnabled: workspaceProfiles.audioEnabled,
      focusThemes: workspaceProfiles.focusThemes,
      updatedAt: workspaceProfiles.updatedAt,
    })
    .from(workspaceProfiles)
    .where(
      and(
        eq(workspaceProfiles.workspaceId, parsedId.data),
        eq(workspaceProfiles.userId, context.user.id)
      )
    )
    .limit(1)

  return rows[0] ?? null
}
