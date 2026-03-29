'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createEntry, updateEntry } from '../actions'
import { MoodTagSelector } from './MoodTagSelector'

interface JournalEditorProps {
  initialData?: {
    id: string
    title: string
    content: string
    moodTags: string[]
    themes: string[]
  }
}

export function JournalEditor({ initialData }: JournalEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [moodTags, setMoodTags] = useState<string[]>(initialData?.moodTags ?? [])
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('moodTags', JSON.stringify(moodTags))
    formData.set('themes', JSON.stringify([]))

    startTransition(async () => {
      const result = initialData
        ? await updateEntry(initialData.id, formData)
        : await createEntry(formData)

      if (result.success) {
        router.push('/inner/journal')
      } else {
        setError(result.error)
      }
    })
  }

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
        <span className="text-xs text-oe-pure-light/40">
          {isPending ? 'Wird gespeichert...' : 'Entwurf'}
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
          defaultValue={initialData?.title}
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
          defaultValue={initialData?.content}
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
