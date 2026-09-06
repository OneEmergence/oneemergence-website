import { expect, test } from '@playwright/test'
import {
  createJournalSaveCoordinator,
  type JournalDraft,
} from '../../src/features/journal/save-coordinator'

type Coordinator = ReturnType<typeof createJournalSaveCoordinator>
type PersistResult = Awaited<
  ReturnType<Parameters<typeof createJournalSaveCoordinator>[0]['persist']>
>

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

const existingDraft: JournalDraft = {
  title: 'A reflection',
  content: 'My original words',
  moodTags: ['calm'],
  themes: ['awareness'],
}
const coordinators: Coordinator[] = []

function setup(existing = false) {
  const writes: Array<{
    id: string | null
    draft: JournalDraft
    result: ReturnType<typeof deferred<PersistResult>>
  }> = []
  const coordinator = createJournalSaveCoordinator({
    initialDraft: existing ? existingDraft : { title: '', content: '', moodTags: [], themes: [] },
    initialId: existing ? 'existing-entry' : null,
    debounceMs: 10,
    persist: (id, draft) => {
      const result = deferred<PersistResult>()
      writes.push({ id, draft, result })
      return result.promise
    },
  })
  coordinators.push(coordinator)
  return { coordinator, writes }
}

test.afterEach(() => {
  coordinators.splice(0).forEach((coordinator) => coordinator.stop())
})

test('slow autosave and repeated manual submits share one create, then save the newest edit', async () => {
  const { coordinator, writes } = setup()
  coordinator.change({ title: 'First title', content: 'First draft' })
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(1)
  const firstManualSave = coordinator.flush()
  const secondManualSave = coordinator.flush()
  expect(secondManualSave).toBe(firstManualSave)
  coordinator.change({ title: 'Latest title', content: 'Latest draft' })
  expect(writes).toHaveLength(1)
  expect(writes[0].id).toBeNull()

  writes[0].result.resolve({ success: true, data: { id: 'created-entry' } })
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(2)
  expect(writes[1].id).toBe('created-entry')
  expect(writes[1].draft).toMatchObject({ title: 'Latest title', content: 'Latest draft' })
  expect(coordinator.getSnapshot()).toMatchObject({ status: 'saving', dirty: true })
  writes[1].result.resolve({ success: true, data: { id: 'created-entry' } })

  expect(await firstManualSave).toBe(true)
  expect(await secondManualSave).toBe(true)
  expect(coordinator.getSnapshot()).toMatchObject({ status: 'saved', dirty: false })
  expect(writes.filter((write) => write.id === null)).toHaveLength(1)
  expect(await coordinator.flush()).toBe(true)
  expect(writes).toHaveLength(2)
})

test('updates stay serial and coalesce edits made while the previous request is running', async () => {
  const { coordinator, writes } = setup(true)
  coordinator.change({ title: 'Revision 1' })
  const save = coordinator.flush()
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(1)
  coordinator.change({ title: 'Revision 2' })
  coordinator.change({ title: 'Revision 3', content: 'Newest content', moodTags: ['grateful'] })
  expect(coordinator.flush()).toBe(save)
  expect(writes).toHaveLength(1)
  writes[0].result.resolve({ success: true, data: { id: 'existing-entry' } })
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(2)
  expect(writes[1]).toMatchObject({
    id: 'existing-entry',
    draft: {
      title: 'Revision 3',
      content: 'Newest content',
      moodTags: ['grateful'],
      themes: ['awareness'],
    },
  })
  writes[1].result.resolve({ success: true, data: { id: 'existing-entry' } })
  expect(await save).toBe(true)
  expect(coordinator.getSnapshot().dirty).toBe(false)
})

test('a mood-only change autosaves and preserves the entry themes', async () => {
  const { coordinator, writes } = setup(true)
  coordinator.change({ moodTags: ['curious'] })
  expect(coordinator.getSnapshot()).toMatchObject({ status: 'dirty', dirty: true })
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(1)
  expect(writes[0].draft).toEqual({ ...existingDraft, moodTags: ['curious'] })
  writes[0].result.resolve({ success: true, data: { id: 'existing-entry' } })
  await expect.poll(() => coordinator.getSnapshot().status, { intervals: [5] }).toBe('saved')
})

test('reverting during an in-flight update restores the original data after that update completes', async () => {
  const { coordinator, writes } = setup(true)
  coordinator.change({ content: 'Temporary edit' })
  const save = coordinator.flush()
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(1)
  coordinator.change({ content: existingDraft.content })
  writes[0].result.resolve({ success: true, data: { id: 'existing-entry' } })
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(2)
  expect(writes[1].draft).toEqual(existingDraft)
  writes[1].result.resolve({ success: true, data: { id: 'existing-entry' } })
  expect(await save).toBe(true)
})

for (const failure of ['result', 'exception'] as const) {
  test(`${failure} failure retains dirty data and requires an explicit retry`, async () => {
    const { coordinator, writes } = setup(true)
    coordinator.change({ content: 'Unsaved private words' })
    const save = coordinator.flush()
    await expect.poll(() => writes.length, { intervals: [5] }).toBe(1)
    if (failure === 'result') writes[0].result.resolve({ success: false, error: 'Unavailable' })
    else writes[0].result.reject(new Error('Network failed'))
    expect(await save).toBe(false)
    expect(coordinator.getSnapshot()).toMatchObject({
      status: 'error',
      dirty: true,
      error: 'failed',
      draft: { content: 'Unsaved private words', themes: ['awareness'] },
    })
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(writes).toHaveLength(1)

    const retry = coordinator.flush()
    await expect.poll(() => writes.length, { intervals: [5] }).toBe(2)
    expect(writes[1].id).toBe('existing-entry')
    writes[1].result.resolve({ success: true, data: { id: 'existing-entry' } })
    expect(await retry).toBe(true)
    expect(coordinator.getSnapshot()).toMatchObject({ status: 'saved', error: null, dirty: false })
  })
}

test('incomplete input remains dirty without sending a request or claiming it was saved', async () => {
  const { coordinator, writes } = setup(true)
  coordinator.change({ content: '   ' })
  expect(await coordinator.flush()).toBe(false)
  expect(coordinator.getSnapshot()).toMatchObject({
    status: 'dirty',
    error: 'invalid',
    dirty: true,
  })
  expect(writes).toHaveLength(0)
})

test('retry rewrites a reverted draft when the previous server write has no confirmed response', async () => {
  const { coordinator, writes } = setup(true)
  coordinator.change({ content: 'Server committed these newer words' })
  const save = coordinator.flush()
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(1)
  // The server can commit B even though the editor already shows its old A.
  let serverContent = writes[0].draft.content
  coordinator.change({ content: existingDraft.content })
  writes[0].result.reject(new Error('Response lost after commit'))
  expect(await save).toBe(false)
  expect(serverContent).not.toBe(coordinator.getSnapshot().draft.content)
  expect(coordinator.getSnapshot()).toMatchObject({
    status: 'error',
    dirty: true,
    draft: { content: existingDraft.content },
  })

  const retry = coordinator.flush()
  await expect.poll(() => writes.length, { intervals: [5] }).toBe(2)
  expect(writes[1].id).toBe('existing-entry')
  expect(writes[1].draft.content).toBe(existingDraft.content)
  serverContent = writes[1].draft.content
  writes[1].result.resolve({ success: true, data: { id: 'existing-entry' } })
  expect(await retry).toBe(true)
  expect(serverContent).toBe(existingDraft.content)
  expect(coordinator.getSnapshot()).toMatchObject({ status: 'saved', dirty: false })
})

test('unmount clears the debounce and does not send follow-up writes after an active request', async () => {
  const pending = setup()
  pending.coordinator.change({ title: 'Draft', content: 'Pending debounce' })
  pending.coordinator.stop()
  await new Promise((resolve) => setTimeout(resolve, 30))
  expect(pending.writes).toHaveLength(0)

  const running = setup(true)
  running.coordinator.change({ content: 'First update' })
  const save = running.coordinator.flush()
  await expect.poll(() => running.writes.length, { intervals: [5] }).toBe(1)
  running.coordinator.change({ content: 'Newer unsaved update' })
  running.coordinator.stop()
  running.writes[0].result.resolve({ success: true, data: { id: 'existing-entry' } })
  expect(await save).toBe(false)
  await new Promise((resolve) => setTimeout(resolve, 30))
  expect(running.writes).toHaveLength(1)
  expect(running.coordinator.getSnapshot()).toMatchObject({ status: 'dirty', dirty: true })
})
