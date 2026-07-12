'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { requireDb } from '@/lib/db'
import {
  profiles,
  userRoles,
  workspaceMembershipEvents,
  workspaceMemberships,
  workspaceProfiles,
  workspaces,
} from '@/lib/db/schema'

import {
  ACTIVE_WORKSPACE_COOKIE,
  canAccessWorkspace,
  getWorkspaceAccess,
  hasActiveWorkspaceMembership,
  requireAdmin,
} from './access'
import {
  AddWorkspaceMembershipSchema,
  CreateWorkspaceSchema,
  SetUserRoleSchema,
  WorkspaceIdSchema,
  WorkspaceMemberSchema,
  WorkspaceProfileSchema,
} from './schemas'
import type { WorkspaceActionState } from './types'

const invalidInput: WorkspaceActionState = {
  status: 'error',
  error: 'invalid-input',
}

export async function setActiveWorkspace(formData: FormData): Promise<WorkspaceActionState> {
  const workspaceId = WorkspaceIdSchema.safeParse(formData.get('workspaceId'))
  if (!workspaceId.success) return invalidInput

  const context = await getWorkspaceAccess()
  if (!(await canAccessWorkspace(context.user.id, context.role, workspaceId.data))) {
    return { status: 'error', error: 'forbidden' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId.data, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath('/inner', 'layout')
  return { status: 'success', message: 'workspace-selected' }
}

export async function createWorkspace(formData: FormData): Promise<WorkspaceActionState> {
  const parsed = CreateWorkspaceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
  })
  if (!parsed.success) return invalidInput

  const admin = await requireAdmin()
  try {
    await requireDb().transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspaces)
        .values({ ...parsed.data, createdBy: admin.user.id })
        .returning({ id: workspaces.id })

      await tx.insert(workspaceMemberships).values({
        workspaceId: workspace.id,
        userId: admin.user.id,
        status: 'active',
        approvedBy: admin.user.id,
        approvedAt: new Date(),
      })
      await tx.insert(workspaceMembershipEvents).values({
        workspaceId: workspace.id,
        userId: admin.user.id,
        actorUserId: admin.user.id,
        eventType: 'approved',
      })
    })
  } catch {
    return { status: 'error', error: 'failed' }
  }

  revalidatePath('/inner/admin')
  return { status: 'success', message: 'workspace-created' }
}

export async function addWorkspaceMembership(formData: FormData): Promise<WorkspaceActionState> {
  const parsed = AddWorkspaceMembershipSchema.safeParse({
    workspaceId: formData.get('workspaceId'),
    email: formData.get('email'),
  })
  if (!parsed.success) return invalidInput

  const admin = await requireAdmin()
  try {
    const result = await requireDb().transaction(async (tx) => {
      const [target] = await tx
        .select({ userId: profiles.id })
        .from(profiles)
        .where(eq(profiles.email, parsed.data.email))
        .limit(1)
      if (!target) return 'missing'

      const inserted = await tx
        .insert(workspaceMemberships)
        .values({
          workspaceId: parsed.data.workspaceId,
          userId: target.userId,
          status: 'pending',
        })
        .onConflictDoNothing()
        .returning({ userId: workspaceMemberships.userId })
      if (inserted.length === 0) return 'exists'

      await tx.insert(workspaceMembershipEvents).values({
        workspaceId: parsed.data.workspaceId,
        userId: target.userId,
        actorUserId: admin.user.id,
        eventType: 'requested',
      })
      return 'created'
    })

    if (result === 'missing') {
      return { status: 'error', error: 'user-not-found' }
    }
    if (result === 'exists') {
      return { status: 'success', message: 'membership-exists' }
    }
  } catch {
    return { status: 'error', error: 'failed' }
  }

  revalidatePath('/inner/admin/members')
  return { status: 'success', message: 'membership-added' }
}

export async function approveWorkspaceMembership(
  formData: FormData
): Promise<WorkspaceActionState> {
  const parsed = WorkspaceMemberSchema.safeParse({
    workspaceId: formData.get('workspaceId'),
    userId: formData.get('userId'),
  })
  if (!parsed.success) return invalidInput

  const admin = await requireAdmin()
  try {
    const result = await requireDb().transaction(async (tx) => {
      const [current] = await tx
        .select({ status: workspaceMemberships.status })
        .from(workspaceMemberships)
        .where(
          and(
            eq(workspaceMemberships.workspaceId, parsed.data.workspaceId),
            eq(workspaceMemberships.userId, parsed.data.userId)
          )
        )
        .limit(1)

      if (!current) return 'missing'
      if (current.status === 'active') return 'unchanged'

      const updated = await tx
        .update(workspaceMemberships)
        .set({
          status: 'active',
          approvedBy: admin.user.id,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(workspaceMemberships.workspaceId, parsed.data.workspaceId),
            eq(workspaceMemberships.userId, parsed.data.userId),
            eq(workspaceMemberships.status, current.status)
          )
        )
        .returning({ userId: workspaceMemberships.userId })

      if (updated.length === 0) return 'conflict'
      await tx.insert(workspaceMembershipEvents).values({
        workspaceId: parsed.data.workspaceId,
        userId: parsed.data.userId,
        actorUserId: admin.user.id,
        eventType: current.status === 'suspended' ? 'reactivated' : 'approved',
      })
      return 'updated'
    })

    if (result === 'missing' || result === 'conflict') {
      return { status: 'error', error: 'failed' }
    }
  } catch {
    return { status: 'error', error: 'failed' }
  }

  revalidatePath('/inner/admin/members')
  revalidatePath('/portal/pending')
  return { status: 'success', message: 'membership-approved' }
}

export async function suspendWorkspaceMembership(
  formData: FormData
): Promise<WorkspaceActionState> {
  const parsed = WorkspaceMemberSchema.safeParse({
    workspaceId: formData.get('workspaceId'),
    userId: formData.get('userId'),
  })
  if (!parsed.success) return invalidInput

  const admin = await requireAdmin()
  try {
    const result = await requireDb().transaction(async (tx) => {
      const [current] = await tx
        .select({
          status: workspaceMemberships.status,
          role: userRoles.role,
        })
        .from(workspaceMemberships)
        .leftJoin(userRoles, eq(userRoles.userId, workspaceMemberships.userId))
        .where(
          and(
            eq(workspaceMemberships.workspaceId, parsed.data.workspaceId),
            eq(workspaceMemberships.userId, parsed.data.userId)
          )
        )
        .limit(1)

      if (!current) return 'missing'
      if (current.role === 'admin') return 'admin'
      if (current.status === 'suspended') return 'unchanged'

      const updated = await tx
        .update(workspaceMemberships)
        .set({ status: 'suspended', updatedAt: new Date() })
        .where(
          and(
            eq(workspaceMemberships.workspaceId, parsed.data.workspaceId),
            eq(workspaceMemberships.userId, parsed.data.userId),
            eq(workspaceMemberships.status, current.status)
          )
        )
        .returning({ userId: workspaceMemberships.userId })

      if (updated.length === 0) return 'conflict'
      await tx.insert(workspaceMembershipEvents).values({
        workspaceId: parsed.data.workspaceId,
        userId: parsed.data.userId,
        actorUserId: admin.user.id,
        eventType: 'suspended',
      })
      return 'updated'
    })

    if (result === 'admin') {
      return { status: 'error', error: 'demote-admin-first' }
    }
    if (result === 'missing' || result === 'conflict') {
      return { status: 'error', error: 'failed' }
    }
  } catch {
    return { status: 'error', error: 'failed' }
  }

  revalidatePath('/inner/admin/members')
  revalidatePath('/inner', 'layout')
  return { status: 'success', message: 'membership-suspended' }
}

export async function setUserRole(formData: FormData): Promise<WorkspaceActionState> {
  const parsed = SetUserRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })
  if (!parsed.success) return invalidInput

  const admin = await requireAdmin()
  if (parsed.data.userId === admin.user.id) {
    return { status: 'error', error: 'cannot-change-own-role' }
  }

  try {
    const updated = await requireDb()
      .update(userRoles)
      .set({
        role: parsed.data.role,
        assignedBy: admin.user.id,
        assignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userRoles.userId, parsed.data.userId))
      .returning({ userId: userRoles.userId })
    if (updated.length === 0) {
      return { status: 'error', error: 'failed' }
    }
  } catch {
    return { status: 'error', error: 'failed' }
  }

  revalidatePath('/inner/admin/members')
  return { status: 'success', message: 'role-updated' }
}

export async function updateWorkspaceProfile(formData: FormData): Promise<WorkspaceActionState> {
  const parsed = WorkspaceProfileSchema.safeParse({
    workspaceId: formData.get('workspaceId'),
    displayName: formData.get('displayName'),
    avatarUrl: formData.get('avatarUrl'),
    bio: formData.get('bio'),
    intensityMode: formData.get('intensityMode'),
    audioEnabled: formData.get('audioEnabled') ?? undefined,
    focusThemes: formData.get('focusThemes'),
  })
  if (!parsed.success) return invalidInput

  const context = await getWorkspaceAccess()
  if (!(await hasActiveWorkspaceMembership(context.user.id, parsed.data.workspaceId))) {
    return { status: 'error', error: 'forbidden' }
  }

  const values = {
    displayName: parsed.data.displayName ?? null,
    avatarUrl: parsed.data.avatarUrl ?? null,
    bio: parsed.data.bio ?? null,
    intensityMode: parsed.data.intensityMode ?? null,
    audioEnabled: parsed.data.audioEnabled,
    focusThemes: parsed.data.focusThemes,
    updatedAt: new Date(),
  }

  try {
    await requireDb()
      .insert(workspaceProfiles)
      .values({
        workspaceId: parsed.data.workspaceId,
        userId: context.user.id,
        ...values,
      })
      .onConflictDoUpdate({
        target: [workspaceProfiles.workspaceId, workspaceProfiles.userId],
        set: values,
      })
  } catch {
    return { status: 'error', error: 'failed' }
  }

  revalidatePath('/inner/settings')
  return { status: 'success', message: 'workspace-profile-updated' }
}
