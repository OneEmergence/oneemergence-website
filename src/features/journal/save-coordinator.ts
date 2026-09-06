import type { JournalEntryInput } from './schemas'

export type JournalDraft = JournalEntryInput
type SaveResult = { success: true; data: { id: string } } | { success: false; error: string }

export interface JournalSaveSnapshot {
  draft: JournalDraft
  entryId: string | null
  status: 'draft' | 'dirty' | 'saving' | 'saved' | 'error'
  error: 'invalid' | 'failed' | null
  dirty: boolean
}

function copyDraft(draft: JournalDraft): JournalDraft {
  return { ...draft, moodTags: [...draft.moodTags], themes: [...draft.themes] }
}

function sameDraft(a: JournalDraft, b: JournalDraft) {
  return (
    a.title === b.title &&
    a.content === b.content &&
    a.moodTags.length === b.moodTags.length &&
    a.moodTags.every((value, index) => value === b.moodTags[index]) &&
    a.themes.length === b.themes.length &&
    a.themes.every((value, index) => value === b.themes[index])
  )
}

/** One editor owns one queue. Autosave and manual save share its current request. */
export function createJournalSaveCoordinator({
  initialDraft,
  initialId = null,
  persist,
  debounceMs = 2500,
}: {
  initialDraft: JournalDraft
  initialId?: string | null
  persist: (id: string | null, draft: JournalDraft) => Promise<SaveResult>
  debounceMs?: number
}) {
  let savedDraft = copyDraft(initialDraft)
  let savedDraftConfirmed = true
  let state: JournalSaveSnapshot = {
    draft: copyDraft(initialDraft),
    entryId: initialId,
    status: initialId ? 'saved' : 'draft',
    error: null,
    dirty: false,
  }
  let active = true
  let inFlight: Promise<boolean> | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  const listeners = new Set<() => void>()

  function dirty() {
    return !savedDraftConfirmed || !sameDraft(state.draft, savedDraft)
  }

  function valid() {
    return Boolean(state.draft.title.trim() && state.draft.content.trim())
  }

  function publish(
    status: JournalSaveSnapshot['status'],
    error: JournalSaveSnapshot['error'] = null
  ) {
    state = { ...state, status, error, dirty: dirty() }
    listeners.forEach((listener) => listener())
  }

  function clearTimer() {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  async function drain(): Promise<boolean> {
    while (active && (dirty() || !state.entryId)) {
      if (!valid()) {
        publish('dirty', 'invalid')
        return false
      }

      const writing = copyDraft(state.draft)
      publish('saving')
      let result: SaveResult
      try {
        result = await persist(state.entryId, writing)
      } catch {
        // A missing response does not prove the server rolled the write back.
        // Even a draft reverted to the old snapshot must be written on retry.
        savedDraftConfirmed = false
        publish('error', 'failed')
        return false
      }
      if (!result.success) {
        savedDraftConfirmed = false
        publish('error', 'failed')
        return false
      }

      // Set the created ID before considering newer edits. A manual save that
      // joins a slow create can only update this entry, never create another.
      state = { ...state, entryId: result.data.id }
      savedDraft = writing
      savedDraftConfirmed = true
    }

    publish(dirty() ? 'dirty' : state.entryId ? 'saved' : 'draft')
    return active && !dirty()
  }

  function flush(): Promise<boolean> {
    clearTimer()
    if (!active) return Promise.resolve(false)
    if (inFlight) return inFlight
    // Defer the drain one microtask so the shared promise is installed before
    // persistence or subscribers can synchronously request another save.
    inFlight = Promise.resolve()
      .then(drain)
      .finally(() => {
        inFlight = null
      })
    return inFlight
  }

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    change(patch: Partial<JournalDraft>) {
      const draft = copyDraft({ ...state.draft, ...patch })
      if (sameDraft(draft, state.draft)) return
      state = { ...state, draft }
      clearTimer()
      publish(inFlight ? 'saving' : dirty() ? 'dirty' : state.entryId ? 'saved' : 'draft')
      if (active && dirty() && valid() && !inFlight) {
        timer = setTimeout(() => {
          timer = null
          void flush()
        }, debounceMs)
      }
    },
    flush,
    start() {
      active = true
    },
    stop() {
      active = false
      clearTimer()
      // Server actions cannot be aborted here. Let the current request finish,
      // but do not launch queued writes after the editor has unmounted.
    },
  }
}
