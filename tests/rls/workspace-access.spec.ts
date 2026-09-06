import { expect } from '@playwright/test'
import { test } from '../helpers/disposable-supabase'

test('defaults to user/pending, blocks escalation, and revokes on suspension', async ({
  disposable,
}) => {
  const service = disposable.service
  const workspaceId = disposable.workspaceId
  const userA = await disposable.createConfirmedUser('workspace-a')
  const userB = await disposable.createConfirmedUser('workspace-b')
  const userAId = userA.id
  const userBId = userB.id
  const clientA = await disposable.signIn(userA)
  const clientB = await disposable.signIn(userB)

  const [role, membership, requestedEvents] = await Promise.all([
    service.from('user_roles').select('role').eq('user_id', userAId).single(),
    service
      .from('workspace_memberships')
      .select('status')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userAId)
      .single(),
    service
      .from('workspace_membership_events')
      .select('event_type')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userAId),
  ])
  expect(role.data?.role).toBe('user')
  expect(membership.data?.status).toBe('pending')
  expect(requestedEvents.data?.map((event) => event.event_type)).toContain('requested')

  await clientA.from('user_roles').update({ role: 'admin' }).eq('user_id', userAId)
  const unchangedRole = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', userAId)
    .single()
  expect(unchangedRole.data?.role).toBe('user')

  const pendingWrite = await clientA.from('journal_entries').insert({
    user_id: userAId,
    title: 'Blocked while pending',
    content: 'This must not be stored.',
  })
  expect(pendingWrite.error).not.toBeNull()

  await service
    .from('workspace_memberships')
    .update({ status: 'active', approved_at: new Date().toISOString() })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userAId)
  const emailHijack = await clientA
    .from('profiles')
    .update({ email: userB.email })
    .eq('id', userAId)
  expect(emailHijack.error).not.toBeNull()
  const unchangedEmail = await service.from('profiles').select('email').eq('id', userAId).single()
  expect(unchangedEmail.data?.email).toBe(userA.email)

  const activeWrite = await clientA
    .from('journal_entries')
    .insert({
      user_id: userAId,
      title: 'Allowed after approval',
      content: 'Private to A.',
    })
    .select('id')
    .single()
  expect(activeWrite.error, activeWrite.error?.message).toBeNull()

  await service
    .from('workspace_memberships')
    .update({ status: 'active', approved_at: new Date().toISOString() })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userBId)
  const bReadsA = await clientB.from('journal_entries').select('id').eq('id', activeWrite.data!.id)
  expect(bReadsA.error).toBeNull()
  expect(bReadsA.data ?? []).toHaveLength(0)

  const [nodeA, nodeB, conversationB] = await Promise.all([
    clientA
      .from('map_nodes')
      .insert({ user_id: userAId, type: 'theme', label: 'A' })
      .select('id')
      .single(),
    clientB
      .from('map_nodes')
      .insert({ user_id: userBId, type: 'theme', label: 'B' })
      .select('id')
      .single(),
    clientB
      .from('guide_conversations')
      .insert({ user_id: userBId, role: 'mirror' })
      .select('id')
      .single(),
  ])
  expect(nodeA.error, nodeA.error?.message).toBeNull()
  expect(nodeB.error, nodeB.error?.message).toBeNull()
  expect(conversationB.error, conversationB.error?.message).toBeNull()

  const crossOwnerEdge = await clientA.from('map_edges').insert({
    user_id: userAId,
    source_node_id: nodeA.data!.id,
    target_node_id: nodeB.data!.id,
  })
  expect(crossOwnerEdge.error).not.toBeNull()

  const crossOwnerCard = await clientA.from('saved_prompt_cards').insert({
    user_id: userAId,
    question: 'Cross-owner link',
    type: 'inquiry',
    source_conversation_id: conversationB.data!.id,
  })
  expect(crossOwnerCard.error).not.toBeNull()

  await service
    .from('workspace_memberships')
    .update({ status: 'suspended' })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userAId)
  const suspendedReadsOwn = await clientA
    .from('journal_entries')
    .select('id')
    .eq('id', activeWrite.data!.id)
  expect(suspendedReadsOwn.error).toBeNull()
  expect(suspendedReadsOwn.data ?? []).toHaveLength(0)
})
