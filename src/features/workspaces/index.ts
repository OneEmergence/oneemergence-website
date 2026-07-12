import 'server-only'

export {
  APP_ROLES,
  MEMBERSHIP_STATUSES,
  CAPABILITIES,
  getCapabilities,
  hasCapability,
  canUsePrivilegedAi,
  initialWorkspaceActionState,
} from './types'
export type {
  AppRole,
  MembershipStatus,
  Capability,
  Workspace,
  WorkspaceMembershipSummary,
  WorkspaceAccessContext,
  ActiveWorkspaceAccessContext,
  WorkspaceMember,
  WorkspaceProfile,
  WorkspaceActionState,
} from './types'

export { getWorkspaceAccess, requireWorkspaceAccess, requireAdmin } from './access'
export { listWorkspaces, listWorkspaceMembers, getWorkspaceProfile } from './queries'
export {
  setActiveWorkspace,
  createWorkspace,
  addWorkspaceMembership,
  approveWorkspaceMembership,
  suspendWorkspaceMembership,
  setUserRole,
  updateWorkspaceProfile,
} from './actions'
