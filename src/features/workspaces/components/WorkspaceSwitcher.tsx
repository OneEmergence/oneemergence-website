'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { setActiveWorkspace } from '../actions'
import { initialWorkspaceActionState, type WorkspaceActionState } from '../types'
import { WorkspaceActionFeedback } from './WorkspaceActionFeedback'

interface WorkspaceOption {
  id: string
  name: string
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  id,
}: {
  workspaces: WorkspaceOption[]
  activeWorkspaceId?: string | null
  id: string
}) {
  const t = useTranslations('workspace')
  const router = useRouter()
  const [workspaceId, setWorkspaceId] = useState(activeWorkspaceId ?? workspaces[0]?.id ?? '')
  const [state, setState] = useState<WorkspaceActionState>(initialWorkspaceActionState)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData()
    formData.set('workspaceId', workspaceId)
    setState(initialWorkspaceActionState)
    startTransition(async () => {
      const result = await setActiveWorkspace(formData)
      setState(result)
      if (result.status === 'success') router.refresh()
    })
  }

  if (workspaces.length === 0) {
    return <p className="px-3 text-xs text-oe-pure-light/45">{t('noActive')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 px-3">
      <label htmlFor={id} className="block text-xs font-medium text-oe-pure-light/55">
        {t('selectorLabel')}
      </label>
      <div className="flex gap-2">
        <select
          id={id}
          name="workspaceId"
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          disabled={isPending}
          className="min-w-0 flex-1 rounded-lg border border-oe-warm-sand/20 bg-oe-depth-warm px-2 py-2 text-xs text-oe-pure-light focus:border-oe-solar-gold focus:outline-none focus:ring-2 focus:ring-oe-solar-gold/30 disabled:opacity-50"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
        {workspaces.length > 1 ? (
          <button
            type="submit"
            disabled={isPending || workspaceId === activeWorkspaceId}
            className="min-h-9 rounded-lg border border-oe-warm-sand/25 px-3 text-xs font-medium text-oe-warm-sand transition-colors hover:border-oe-solar-gold hover:text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold disabled:opacity-40"
          >
            {isPending ? t('switching') : t('switch')}
          </button>
        ) : null}
      </div>
      <WorkspaceActionFeedback state={state} className="text-xs" />
    </form>
  )
}
