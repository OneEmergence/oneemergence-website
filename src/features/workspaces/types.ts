import type { AppUser } from '@/lib/auth/session'

export const APP_ROLES = ['user', 'agent', 'superuser', 'admin'] as const
export type AppRole = (typeof APP_ROLES)[number]

export const MEMBERSHIP_STATUSES = ['pending', 'active', 'suspended'] as const
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number]

export const CAPABILITIES = [
  'future-ai',
  'manage-platform',
  'manage-workspaces',
  'manage-users',
  'assign-roles',
] as const
export type Capability = (typeof CAPABILITIES)[number]

const ROLE_CAPABILITIES: Record<AppRole, readonly Capability[]> = {
  user: [],
  agent: [],
  superuser: ['future-ai'],
  admin: CAPABILITIES,
}

export function getCapabilities(role: AppRole): Capability[] {
  return [...ROLE_CAPABILITIES[role]]
}

export function hasCapability(role: AppRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability)
}

export function canUsePrivilegedAi(role: AppRole): boolean {
  return hasCapability(role, 'future-ai')
}

export interface Workspace {
  id: string
  slug: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceMembershipSummary {
  workspaceId: string
  slug: string
  name: string
  description: string | null
  status: MembershipStatus
  joinedAt: Date | null
  approvedAt: Date | null
  accessKind: 'membership' | 'admin'
}

export interface WorkspaceAccessContext {
  user: AppUser
  role: AppRole
  capabilities: Capability[]
  memberships: WorkspaceMembershipSummary[]
  activeWorkspace: WorkspaceMembershipSummary | null
}

export type ActiveWorkspaceAccessContext = Omit<WorkspaceAccessContext, 'activeWorkspace'> & {
  activeWorkspace: WorkspaceMembershipSummary
}

export interface WorkspaceMember {
  userId: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  role: AppRole
  status: MembershipStatus
  joinedAt: Date
  approvedAt: Date | null
}

export interface WorkspaceProfile {
  workspaceId: string
  userId: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  intensityMode: 'still' | 'balanced' | 'immersive' | null
  audioEnabled: boolean | null
  focusThemes: string[] | null
  updatedAt: Date
}

export type WorkspaceActionState =
  { status: 'idle' } | { status: 'success'; message?: string } | { status: 'error'; error: string }

export const initialWorkspaceActionState: WorkspaceActionState = {
  status: 'idle',
}
