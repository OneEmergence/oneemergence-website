'use client'

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { createEntry, updateEntry } from '../actions'
import { createJournalSaveCoordinator, type JournalDraft } from '../save-coordinator'
import { MoodTagSelector } from './MoodTagSelector'

interface JournalEditorProps {
  initialData?: JournalDraft & { id: string }
}

function persistDraft(id: string | null, draft: JournalDraft, createId: string) {
  const formData = new FormData()
  formData.set('title', draft.title)
  formData.set('content', draft.content)
  formData.set('moodTags', JSON.stringify(draft.moodTags))
  formData.set('themes', JSON.stringify(draft.themes))
  if (!id) formData.set('entryId', createId)
  return id ? updateEntry(id, formData) : createEntry(formData)
}

export function JournalEditor({ initialData }: JournalEditorProps) {
  const router = useRouter()
  const t = useTranslations('journalEditor')
  const [isPending, startTransition] = useTransition()
  const submittingRef = useRef(false)
  const mountedRef = useRef(false)
  const [coordinator] = useState(() => {
    // This survives failed create responses for the lifetime of the draft.
    const createId = initialData?.id ?? crypto.randomUUID()
    return createJournalSaveCoordinator({
      initialDraft: initialData ?? { title: '', content: '', moodTags: [], themes: [] },
      initialId: initialData?.id,
      persist: (id, draft) => persistDraft(id, draft, createId),
    })
  })
  const { draft, status, error } = useSyncExternalStore(
    coordinator.subscribe,
    coordinator.getSnapshot,
    coordinator.getSnapshot
  )

  useEffect(() => {
    mountedRef.current = true
    coordinator.start()
    return () => {
      mountedRef.current = false
      coordinator.stop()
    }
  }, [coordinator])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // A synchronous guard also covers repeated submits before React renders
    // the disabled button. The queue is shared with any active autosave.
    if (submittingRef.current) return
    submittingRef.current = true
    startTransition(async () => {
      try {
        let saved = await coordinator.flush()
        while (saved && mountedRef.current && coordinator.getSnapshot().dirty) {
          saved = await coordinator.flush()
        }
        if (saved && mountedRef.current) router.push('/inner/journal')
      } finally {
        submittingRef.current = false
      }
    })
  }

  const inputClasses = cn(
    'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3',
    'text-oe-pure-light placeholder:text-oe-pure-light/55',
    'focus:border-oe-aurora-violet focus:outline-none focus:ring-1 focus:ring-oe-aurora-violet',
    'transition-colors'
  )

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-oe-pure-light">
          {initialData ? t('editTitle') : t('newTitle')}
        </h1>
        <span
          role="status"
          className={cn(
            'text-xs',
            status === 'saved' && 'text-oe-spirit-cyan',
            status === 'error' && 'text-red-300',
            status !== 'saved' && status !== 'error' && 'text-oe-pure-light/70'
          )}
        >
          {t(`status.${status}`)}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error === 'invalid' ? t('requiredError') : t('saveError')}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-oe-pure-light/70">
          {t('titleLabel')}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={draft.title}
          onChange={(event) => coordinator.change({ title: event.target.value })}
          placeholder={t('titlePlaceholder')}
          className={inputClasses}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-oe-pure-light/70">
          {t('contentLabel')}
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          value={draft.content}
          onChange={(event) => coordinator.change({ content: event.target.value })}
          placeholder={t('contentPlaceholder')}
          className={cn(inputClasses, 'resize-y')}
        />
      </div>

      <MoodTagSelector
        selectedTags={draft.moodTags}
        onChange={(moodTags) => coordinator.change({ moodTags })}
      />

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'rounded-lg bg-oe-aurora-violet-deep px-6 py-3 text-sm font-medium text-white',
            'transition-all hover:bg-oe-aurora-violet/80',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet focus-visible:ring-offset-2 focus-visible:ring-offset-oe-deep-space',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isPending ? t('savingButton') : t('saveButton')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="text-sm text-oe-pure-light/70 transition-colors hover:text-oe-pure-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('backButton')}
        </button>
      </div>
    </form>
  )
}
