import 'server-only'

import { and, asc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/auth/session'
import { requireDb } from '@/lib/db'
import { userRoles, workspaceMemberships, workspaces } from '@/lib/db/schema'

import { WorkspaceIdSchema } from './schemas'
import {
  getCapabilities,
  hasCapability,
  type ActiveWorkspaceAccessContext,
  type AppRole,
  type WorkspaceAccessContext,
  type WorkspaceMembershipSummary,
} from './types'

const ACTIVE_WORKSPACE_COOKIE = 'oe-workspace'

function membershipSummary(row: {
  workspaceId: string
  slug: string
  name: string
  description: string | null
  status: 'pending' | 'active' | 'suspended'
  joinedAt: Date
  approvedAt: Date | null
}): WorkspaceMembershipSummary {
  return { ...row, accessKind: 'membership' }
}

function adminWorkspaceSummary(row: {
  id: string
  slug: string
  name: string
  description: string | null
}): WorkspaceMembershipSummary {
  return {
    workspaceId: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: 'active',
    joinedAt: null,
    approvedAt: null,
    accessKind: 'admin',
  }
}

export async function canAccessWorkspace(
  userId: string,
  role: AppRole,
  workspaceId: string
): Promise<boolean> {
  const parsedId = WorkspaceIdSchema.safeParse(workspaceId)
  if (!parsedId.success) return false

  const db = requireDb()
  if (role === 'admin') {
    const rows = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.id, parsedId.data))
      .limit(1)
    return rows.length === 1
  }

  return hasActiveWorkspaceMembership(userId, parsedId.data)
}

export async function hasActiveWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const parsedId = WorkspaceIdSchema.safeParse(workspaceId)
  if (!parsedId.success) return false

  const rows = await requireDb()
    .select({ workspaceId: workspaceMemberships.workspaceId })
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.workspaceId, parsedId.data),
        eq(workspaceMemberships.userId, userId),
        eq(workspaceMemberships.status, 'active')
      )
    )
    .limit(1)

  return rows.length === 1
}

/** Authenticated access context. Pending/suspended users are returned intact. */
async function loadWorkspaceAccess(): Promise<WorkspaceAccessContext> {
  const user = await requireAuth()
  const db = requireDb()

  const [roleRows, membershipRows] = await Promise.all([
    db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
      .limit(1),
    db
      .select({
        workspaceId: workspaces.id,
        slug: workspaces.slug,
        name: workspaces.name,
        description: workspaces.description,
        status: workspaceMemberships.status,
        joinedAt: workspaceMemberships.createdAt,
        approvedAt: workspaceMemberships.approvedAt,
      })
      .from(workspaceMemberships)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMemberships.workspaceId))
      .where(eq(workspaceMemberships.userId, user.id))
      .orderBy(asc(workspaces.name)),
  ])

  const role = roleRows[0]?.role ?? 'user'
  const memberships = membershipRows.map(membershipSummary)
  const cookieStore = await cookies()
  const cookieId = WorkspaceIdSchema.safeParse(cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value)
  let activeWorkspace = cookieId.success
    ? (memberships.find(
        (membership) => membership.workspaceId === cookieId.data && membership.status === 'active'
      ) ?? null)
    : null

  if (!activeWorkspace && !cookieId.success) {
    activeWorkspace = memberships.find((membership) => membership.status === 'active') ?? null
  }

  if (!activeWorkspace && role === 'admin') {
    const preferredId = cookieId.success ? cookieId.data : memberships[0]?.workspaceId
    const adminWorkspaceRows = await db
      .select({
        id: workspaces.id,
        slug: workspaces.slug,
        name: workspaces.name,
        description: workspaces.description,
      })
      .from(workspaces)
      .where(preferredId ? eq(workspaces.id, preferredId) : undefined)
      .orderBy(asc(workspaces.name))
      .limit(1)
    activeWorkspace = adminWorkspaceRows[0] ? adminWorkspaceSummary(adminWorkspaceRows[0]) : null
  }

  activeWorkspace ??= memberships.find((membership) => membership.status === 'active') ?? null

  return {
    user,
    role,
    capabilities: getCapabilities(role),
    memberships,
    activeWorkspace,
  }
}

/** Request-scoped dedupe for layouts and feature DAL calls sharing this read. */
export const getWorkspaceAccess = cache(loadWorkspaceAccess)

export async function requireWorkspaceAccess(): Promise<ActiveWorkspaceAccessContext> {
  const context = await getWorkspaceAccess()
  if (context.activeWorkspace) {
    return { ...context, activeWorkspace: context.activeWorkspace }
  }

  if (context.memberships.some((membership) => membership.status === 'pending')) {
    redirect('/portal/pending')
  }

  redirect('/portal/access')
}

export async function requireAdmin(): Promise<WorkspaceAccessContext> {
  const context = await getWorkspaceAccess()
  if (!hasCapability(context.role, 'manage-platform')) {
    redirect('/inner')
  }
  return context
}

export { ACTIVE_WORKSPACE_COOKIE }
