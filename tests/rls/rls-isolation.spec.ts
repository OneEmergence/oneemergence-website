import { expect } from '@playwright/test'
import { test } from '../helpers/disposable-supabase'

/** Real per-user JWTs exercise RLS; only setup/cleanup uses the service role. */
test('RLS isolates journal reads between two approved owners', async ({ disposable }) => {
  const userA = await disposable.createConfirmedUser('isolation-a')
  const userB = await disposable.createConfirmedUser('isolation-b')
  const approval = await disposable.service
    .from('workspace_memberships')
    .update({ status: 'active', approved_at: new Date().toISOString() })
    .eq('workspace_id', disposable.workspaceId)
    .in('user_id', [userA.id, userB.id])
    .select('user_id, status')
  expect(approval.error).toBeNull()
  expect(approval.data).toHaveLength(2)
  expect(approval.data?.every((membership) => membership.status === 'active')).toBe(true)
  const clientA = await disposable.signIn(userA)
  const clientB = await disposable.signIn(userB)

  const insert = await clientA
    .from('journal_entries')
    .insert({
      user_id: userA.id,
      title: 'Private to A',
      content: 'Only A may read this.',
    })
    .select('id')
    .single()
  expect(insert.error).toBeNull()
  const entryId = insert.data!.id

  const bReadsA = await clientB.from('journal_entries').select('*').eq('id', entryId)
  expect(bReadsA.error).toBeNull()
  expect(bReadsA.data).toHaveLength(0)
  const bReadsAll = await clientB.from('journal_entries').select('id')
  expect(bReadsAll.error).toBeNull()
  expect(bReadsAll.data?.map((entry) => entry.id)).not.toContain(entryId)
  const aReadsOwn = await clientA.from('journal_entries').select('id').eq('id', entryId)
  expect(aReadsOwn.error).toBeNull()
  expect(aReadsOwn.data).toHaveLength(1)
})
