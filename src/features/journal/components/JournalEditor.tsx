'use client'

import { useTransition, useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createEntry, updateEntry } from '../actions'
import { MoodTagSelector } from './MoodTagSelector'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JournalEditorProps {
  initialData?: {
    id: string
    title: string
    content: string
    moodTags: string[]
    themes: string[]
  }
}

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DELAY_MS = 2500

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JournalEditor({ initialData }: JournalEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [moodTags, setMoodTags] = useState<string[]>(initialData?.moodTags ?? [])
  const [error, setError] = useState<string | null>(null)

  // Controlled title/content for autosave
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')

  // Autosave state — use refs to avoid stale closures in the debounce callback
  const titleRef = useRef(initialData?.title ?? '')
  const contentRef = useRef(initialData?.content ?? '')
  const moodTagsRef = useRef<string[]>(initialData?.moodTags ?? [])
  // ID of the entry that has been persisted (either from initialData or after first autosave)
  const savedIdRef = useRef<string | null>(initialData?.id ?? null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')

  // Keep mood tags ref in sync
  useEffect(() => {
    moodTagsRef.current = moodTags
  }, [moodTags])

  // ---------------------------------------------------------------------------
  // Autosave
  // ---------------------------------------------------------------------------

  const performAutoSave = useCallback(async () => {
    const currentTitle = titleRef.current.trim()
    const currentContent = contentRef.current.trim()

    // Require both title and content before creating/updating
    if (!currentTitle || !currentContent) return

    setAutoSaveStatus('saving')

    const fd = new FormData()
    fd.set('title', currentTitle)
    fd.set('content', currentContent)
    fd.set('moodTags', JSON.stringify(moodTagsRef.current))
    fd.set('themes', JSON.stringify([]))

    const id = savedIdRef.current
    const result = id
      ? await updateEntry(id, fd)
      : await createEntry(fd)

    if (result.success) {
      if (!savedIdRef.current) {
        savedIdRef.current = result.data.id
      }
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } else {
      setAutoSaveStatus('error')
    }
  }, [])

  function scheduleAutoSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(performAutoSave, AUTOSAVE_DELAY_MS)
  }

  // Cancel pending autosave on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Manual submit
  // ---------------------------------------------------------------------------

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Cancel any pending autosave — manual save takes over
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('moodTags', JSON.stringify(moodTags))
    formData.set('themes', JSON.stringify([]))

    startTransition(async () => {
      // If autosave already created this entry, update it instead of creating again
      const existingId = savedIdRef.current
      const result = existingId && !initialData
        ? await updateEntry(existingId, formData)
        : initialData
          ? await updateEntry(initialData.id, formData)
          : await createEntry(formData)

      if (result.success) {
        router.push('/inner/journal')
      } else {
        setError(result.error)
      }
    })
  }

  // ---------------------------------------------------------------------------
  // Status label
  // ---------------------------------------------------------------------------

  function getStatusLabel(): string {
    if (isPending) return 'Wird gespeichert...'
    if (autoSaveStatus === 'saving') return 'Speichert...'
    if (autoSaveStatus === 'saved') return 'Automatisch gespeichert'
    if (autoSaveStatus === 'error') return 'Nicht gespeichert'
    return savedIdRef.current && !initialData ? 'Entwurf gespeichert' : 'Entwurf'
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const inputClasses = cn(
    'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3',
    'text-oe-pure-light placeholder:text-oe-pure-light/30',
    'focus:border-oe-aurora-violet focus:outline-none focus:ring-1 focus:ring-oe-aurora-violet',
    'transition-colors'
  )

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-oe-pure-light">
          {initialData ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
        </h1>
        <span
          className={cn(
            'text-xs transition-colors',
            autoSaveStatus === 'saved' && 'text-green-400/70',
            autoSaveStatus === 'error' && 'text-red-400/70',
            autoSaveStatus === 'saving' && 'text-oe-pure-light/50',
            autoSaveStatus === 'idle' && 'text-oe-pure-light/30'
          )}
        >
          {getStatusLabel()}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-oe-pure-light/70">
          Titel
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            titleRef.current = e.target.value
            scheduleAutoSave()
          }}
          placeholder="Was bewegt dich?"
          className={inputClasses}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-oe-pure-light/70">
          Inhalt
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            contentRef.current = e.target.value
            scheduleAutoSave()
          }}
          placeholder="Schreibe frei — dieser Raum gehört dir..."
          className={cn(inputClasses, 'resize-y')}
        />
      </div>

      <MoodTagSelector selectedTags={moodTags} onChange={setMoodTags} />

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'rounded-lg bg-oe-aurora-violet px-6 py-3 text-sm font-medium text-white',
            'transition-all hover:bg-oe-aurora-violet/80',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet focus-visible:ring-offset-2 focus-visible:ring-offset-oe-deep-space',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isPending ? 'Speichern...' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-oe-pure-light/50 transition-colors hover:text-oe-pure-light"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
