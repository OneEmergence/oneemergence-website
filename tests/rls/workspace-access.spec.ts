import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_TEST_URL
const serviceRoleKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_TEST_ANON_KEY
const configured = Boolean(url && serviceRoleKey && anonKey)

test.describe('RLS: workspace approval gates private data', () => {
  test.skip(!configured, 'Set the disposable Supabase test project variables to run this suite')

  let service: SupabaseClient
  let clientA: SupabaseClient
  let clientB: SupabaseClient
  let workspaceId = ''
  let userAId = ''
  let userBId = ''
  const password = 'Test-Passw0rd!'
  const suffix = Math.random().toString(36).slice(2, 10)

  test.beforeAll(async () => {
    service = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const [userA, userB, workspace] = await Promise.all([
      service.auth.admin.createUser({
        email: `workspace-a-${suffix}@example.com`,
        password,
        email_confirm: true,
      }),
      service.auth.admin.createUser({
        email: `workspace-b-${suffix}@example.com`,
        password,
        email_confirm: true,
      }),
      service.from('workspaces').select('id').eq('slug', 'one-emergence').single(),
    ])

    expect(userA.error, userA.error?.message).toBeNull()
    expect(userB.error, userB.error?.message).toBeNull()
    expect(workspace.error, workspace.error?.message).toBeNull()
    userAId = userA.data.user!.id
    userBId = userB.data.user!.id
    workspaceId = workspace.data!.id as string

    clientA = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    clientB = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const [signInA, signInB] = await Promise.all([
      clientA.auth.signInWithPassword({
        email: `workspace-a-${suffix}@example.com`,
        password,
      }),
      clientB.auth.signInWithPassword({
        email: `workspace-b-${suffix}@example.com`,
        password,
      }),
    ])
    expect(signInA.error, signInA.error?.message).toBeNull()
    expect(signInB.error, signInB.error?.message).toBeNull()
  })

  test.afterAll(async () => {
    if (userAId) await service.auth.admin.deleteUser(userAId)
    if (userBId) await service.auth.admin.deleteUser(userBId)
  })

  test('defaults to user/pending, blocks escalation, and revokes on suspension', async () => {
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
      .update({ email: `workspace-b-${suffix}@example.com` })
      .eq('id', userAId)
    expect(emailHijack.error).not.toBeNull()
    const unchangedEmail = await service.from('profiles').select('email').eq('id', userAId).single()
    expect(unchangedEmail.data?.email).toBe(`workspace-a-${suffix}@example.com`)

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
    const bReadsA = await clientB
      .from('journal_entries')
      .select('id')
      .eq('id', activeWrite.data!.id)
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
    expect(suspendedReadsOwn.data ?? []).toHaveLength(0)
  })
})
