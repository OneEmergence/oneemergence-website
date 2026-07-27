'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createWorkspace } from '../actions'
import { initialWorkspaceActionState, type Workspace, type WorkspaceActionState } from '../types'
import { WorkspaceActionFeedback } from './WorkspaceActionFeedback'

const inputClasses =
  'w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-3 text-sm text-oe-pure-light placeholder:text-oe-pure-light/55 focus:border-oe-solar-gold focus:outline-none focus:ring-2 focus:ring-oe-solar-gold/30'

export function WorkspacesAdmin({ workspaces }: { workspaces: Workspace[] }) {
  const t = useTranslations('admin.workspaces')
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<WorkspaceActionState>(initialWorkspaceActionState)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setState(initialWorkspaceActionState)
    startTransition(async () => {
      try {
        const result = await createWorkspace(formData)
        setState(result)
        if (result.status === 'success') {
          formRef.current?.reset()
          router.refresh()
        }
      } catch {
        setState({ status: 'error', error: 'failed' })
      }
    })
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <section aria-labelledby="workspace-list-title">
        <h2 id="workspace-list-title" className="sr-only">
          {t('title')}
        </h2>
        {workspaces.length === 0 ? (
          <p className="border-t border-oe-warm-sand/15 py-10 text-sm text-oe-pure-light/50">
            {t('empty')}
          </p>
        ) : (
          <ul className="border-t border-oe-warm-sand/15">
            {workspaces.map((workspace) => (
              <li key={workspace.id} className="border-b border-oe-warm-sand/10 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-xl text-oe-pure-light">{workspace.name}</h3>
                  <code className="text-xs text-oe-warm-sand/65">{workspace.slug}</code>
                </div>
                {workspace.description ? (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-oe-pure-light/50">
                    {workspace.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="create-workspace-title"
        className="lg:border-l lg:border-oe-warm-sand/15 lg:pl-8"
      >
        <h2 id="create-workspace-title" className="font-serif text-xl text-oe-pure-light">
          {t('createTitle')}
        </h2>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          aria-busy={isPending}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="workspace-name"
              className="block text-xs font-medium text-oe-pure-light/60"
            >
              {t('name')}
            </label>
            <input
              id="workspace-name"
              name="name"
              required
              maxLength={100}
              placeholder={t('namePlaceholder')}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="workspace-slug"
              className="block text-xs font-medium text-oe-pure-light/60"
            >
              {t('slug')}
            </label>
            <input
              id="workspace-slug"
              name="slug"
              required
              minLength={2}
              maxLength={63}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder={t('slugPlaceholder')}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="workspace-description"
              className="block text-xs font-medium text-oe-pure-light/60"
            >
              {t('descriptionLabel')}
            </label>
            <textarea
              id="workspace-description"
              name="description"
              rows={4}
              maxLength={500}
              placeholder={t('descriptionPlaceholder')}
              className={`${inputClasses} resize-y`}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 rounded-full bg-oe-solar-gold px-6 py-3 text-sm font-semibold text-oe-depth-warm transition-colors hover:bg-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm disabled:opacity-50"
          >
            {isPending ? t('creating') : t('create')}
          </button>
          <WorkspaceActionFeedback state={state} />
        </form>
      </section>
    </div>
  )
}
