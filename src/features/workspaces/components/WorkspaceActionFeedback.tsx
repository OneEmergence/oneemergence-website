'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { WorkspaceActionState } from '../types'

function messageKey(code?: string) {
  switch (code) {
    case 'workspace-created':
    case 'membership-approved':
    case 'membership-suspended':
    case 'membership-added':
    case 'membership-exists':
    case 'role-updated':
    case 'workspace-profile-updated':
    case 'invalid-input':
    case 'forbidden':
    case 'failed':
    case 'cannot-change-own-role':
    case 'demote-admin-first':
    case 'user-not-found':
      return code
    case 'workspace-selected':
      return 'active-workspace-updated'
    default:
      return 'saved'
  }
}

export function WorkspaceActionFeedback({
  state,
  className,
}: {
  state: WorkspaceActionState
  className?: string
}) {
  const t = useTranslations('admin.feedback')

  return (
    <div className={cn('min-h-5 text-sm', className)} aria-live="polite" aria-atomic="true">
      {state.status === 'error' ? (
        <p role="alert" className="text-red-200">
          {t(messageKey(state.error))}
        </p>
      ) : null}
      {state.status === 'success' ? (
        <p role="status" className="text-oe-living-green">
          {t(messageKey(state.message))}
        </p>
      ) : null}
    </div>
  )
}
