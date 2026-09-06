import { expect, type Page, type Route } from '@playwright/test'
import { z } from 'zod'
import messages from '../../src/i18n/messages/de.json'
import { DELETE_CONFIRMATION } from '../../src/features/auth/schemas'
import { test, type TestIdentity } from '../helpers/disposable-supabase'

const exportedData = z.object({
  userId: z.uuid(),
  email: z.string(),
  profile: z.object({ id: z.uuid() }),
  role: z.object({ role: z.string(), userId: z.uuid() }),
  journalEntries: z.array(
    z.object({ id: z.uuid(), userId: z.uuid(), title: z.string(), content: z.string() })
  ),
  mapNodes: z.array(
    z.object({
      userId: z.uuid(),
      sourceId: z.string().nullable(),
      sourceType: z.string().nullable(),
    })
  ),
  mapEdges: z.array(z.object({ userId: z.uuid() })),
  workspaceMemberships: z.array(
    z.object({ workspaceId: z.uuid(), userId: z.uuid(), status: z.string() })
  ),
  workspaceMembershipEvents: z.array(z.object({ userId: z.uuid(), eventType: z.string() })),
  practices: z.array(z.unknown()),
  guideConversations: z.array(z.unknown()),
  guideMessages: z.array(z.unknown()),
  savedPromptCards: z.array(z.unknown()),
  workspaceProfiles: z.array(z.unknown()),
})

async function signIn(page: Page, identity: TestIdentity): Promise<void> {
  await page.goto('/portal', { waitUntil: 'domcontentloaded' })
  await page.locator('#login-email').fill(identity.email)
  await page.locator('#login-password').fill(identity.password)
  await page
    .locator('form')
    .getByRole('button', { name: messages.auth.actions.signIn, exact: true })
    .click()
}

async function downloadExport(page: Page) {
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: messages.profile.danger.export, exact: true }).click()
  const download = await downloadEvent
  expect(await download.failure()).toBeNull()
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Account export did not create a readable download')
  let json = ''
  for await (const chunk of stream) json += chunk.toString('utf8')
  return exportedData.parse(JSON.parse(json) as unknown)
}

test('signup, approval, private journal, export and deletion work across account access states', async ({
  disposable,
  page,
  browser,
}) => {
  test.setTimeout(180_000)
  await disposable.requireAccountCapabilities()
  const service = disposable.service
  const admin = await disposable.createConfirmedUser('admin')
  const role = await service
    .from('user_roles')
    .update({ role: 'admin' })
    .eq('user_id', admin.id)
    .select('user_id')
    .single()
  expect(role.error, 'Seed only the temporary test admin role').toBeNull()
  const membership = await service
    .from('workspace_memberships')
    .update({ status: 'active', approved_at: new Date().toISOString() })
    .eq('workspace_id', disposable.workspaceId)
    .eq('user_id', admin.id)
    .select('user_id')
    .single()
  expect(membership.error, 'Seed the temporary admin membership').toBeNull()
  const sentinel = await service
    .from('journal_entries')
    .insert({
      user_id: admin.id,
      title: 'Other owner',
      content: `Do not export ${disposable.runId}`,
    })
    .select('id')
    .single()
  expect(sentinel.error).toBeNull()

  const adminContext = await browser.newContext({
    baseURL: disposable.baseURL,
    reducedMotion: 'reduce',
  })
  try {
    await adminContext.addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: disposable.baseURL! }])
    await page
      .context()
      .addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: disposable.baseURL! }])
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const adminPage = await adminContext.newPage()
    // Prove that the running app authenticates against this disposable project
    // before calling its public signup action.
    await signIn(adminPage, admin)
    await expect(adminPage).toHaveURL(new URL('/inner', disposable.baseURL!).toString())
    await adminPage.goto('/inner/admin/members', { waitUntil: 'domcontentloaded' })
    await expect(adminPage.getByRole('row').filter({ hasText: admin.email })).toBeVisible()

    const member = disposable.reserveIdentity('member')
    await page.goto('/portal', { waitUntil: 'domcontentloaded' })
    await page
      .getByRole('group', { name: messages.auth.modeLabel })
      .getByRole('button', { name: messages.auth.modes.signup, exact: true })
      .click()
    await page.locator('#signup-name').fill(member.displayName)
    await page.locator('#signup-email').fill(member.email)
    await page.locator('#signup-password').fill(member.password)
    await page
      .locator('form')
      .getByRole('button', { name: messages.auth.actions.signUp, exact: true })
      .click()
    await expect(page).toHaveURL(new URL('/portal/pending', disposable.baseURL!).toString())
    const createdMember = await disposable.findIdentity(member)
    expect(createdMember).toBeDefined()
    const memberId = createdMember!.id
    const defaultRole = await service
      .from('user_roles')
      .select('role')
      .eq('user_id', memberId)
      .single()
    expect(defaultRole.error).toBeNull()
    expect(defaultRole.data?.role).toBe('user')

    await page.goto('/inner/journal/new', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new URL('/portal/pending', disposable.baseURL!).toString())
    await page.goto('/portal/account', { waitUntil: 'domcontentloaded' })
    const pendingExport = await downloadExport(page)
    expect(pendingExport.userId).toBe(memberId)
    expect(pendingExport.workspaceMemberships).toEqual([
      expect.objectContaining({
        workspaceId: disposable.workspaceId,
        userId: memberId,
        status: 'pending',
      }),
    ])
    expect(pendingExport.journalEntries).toHaveLength(0)

    await adminPage.reload({ waitUntil: 'domcontentloaded' })
    const memberRow = adminPage.getByRole('row').filter({ hasText: member.email })
    await expect(memberRow).toContainText(messages.membershipStatus.pending)
    await memberRow
      .getByRole('button', { name: messages.admin.members.approve, exact: true })
      .click()
    await expect(memberRow).toContainText(messages.membershipStatus.active)
    const approval = await service
      .from('workspace_memberships')
      .select('status, approved_by')
      .eq('workspace_id', disposable.workspaceId)
      .eq('user_id', memberId)
      .single()
    expect(approval.error).toBeNull()
    expect(approval.data).toMatchObject({ status: 'active', approved_by: admin.id })

    const title = `E2E Journal ${disposable.runId}`
    const content = `Meditation und Bewusstsein. Private account acceptance ${disposable.runId}.`
    await page.goto('/inner/journal/new', { waitUntil: 'domcontentloaded' })
    const journalUrl = new URL('/inner/journal/new', disposable.baseURL!).toString()
    let autosaveHeld = false
    let releaseAutosave = () => {}
    const autosaveGate = new Promise<void>((resolve) => {
      releaseAutosave = resolve
    })
    let firstSaveStatus: number | null = null
    let firstSaveError: Error | null = null
    let firstSaveFinished = false
    const holdFirstSave = async (route: Route) => {
      const request = route.request()
      if (!autosaveHeld && request.method() === 'POST' && request.headers()['next-action']) {
        autosaveHeld = true
        await autosaveGate
        try {
          // Commit the real action, then lose its response before the editor sees it.
          const response = await route.fetch({ timeout: 20_000, maxRetries: 0 })
          firstSaveStatus = response.status()
          await response.dispose()
        } catch (error) {
          firstSaveError = error instanceof Error ? error : new Error('First real save failed')
        } finally {
          try {
            await route.abort('failed')
          } catch (error) {
            if (!page.isClosed()) {
              firstSaveError =
                error instanceof Error ? error : new Error('Could not lose the first response')
            }
          }
          firstSaveFinished = true
        }
        return
      }
      // Every retry and queued update reaches the real server normally.
      await route.continue()
    }
    await page.route(journalUrl, holdFirstSave)
    try {
      await page.locator('#title').fill(title)
      await page.locator('#content').fill(`${content} Earlier draft.`)
      await expect
        .poll(() => autosaveHeld, {
          timeout: 10_000,
          message: 'The 2.5-second autosave must start before manual save',
        })
        .toBe(true)
      await page.locator('#content').fill(content)
      await page
        .getByRole('button', { name: messages.journalEditor.saveButton, exact: true })
        .click()
      await expect(
        page.getByRole('button', { name: messages.journalEditor.savingButton, exact: true })
      ).toBeDisabled()
      releaseAutosave()
      await expect.poll(() => firstSaveFinished, { timeout: 30_000 }).toBe(true)
      expect(firstSaveError).toBeNull()
      expect(firstSaveStatus).toBe(200)
      await expect(page.locator('form').getByRole('alert')).toHaveText(
        messages.journalEditor.saveError
      )
      await expect(page.locator('#content')).toHaveValue(content)
      const committedBeforeRetry = await service
        .from('journal_entries')
        .select('title, content')
        .eq('user_id', memberId)
      expect(committedBeforeRetry.error).toBeNull()
      expect(committedBeforeRetry.data).toEqual([{ title, content: `${content} Earlier draft.` }])
      const retrySave = page.getByRole('button', {
        name: messages.journalEditor.saveButton,
        exact: true,
      })
      await expect(retrySave).toBeEnabled()
      await retrySave.click()
      await expect(page).toHaveURL(new URL('/inner/journal', disposable.baseURL!).toString())
    } finally {
      releaseAutosave()
      // Do not leave a gated/fetching route behind when an assertion fails.
      await page.unrouteAll({ behavior: 'wait' })
    }
    await expect(page.getByText(title, { exact: true })).toBeVisible()
    const savedEntries = await service
      .from('journal_entries')
      .select('title, content')
      .eq('user_id', memberId)
    expect(savedEntries.error).toBeNull()
    expect(savedEntries.data).toEqual([{ title, content }])

    // An ordinary member cannot enter the admin UI after approval.
    await page.goto('/inner/admin/members', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new URL('/inner', disposable.baseURL!).toString())
    await page.goto('/portal/account', { waitUntil: 'domcontentloaded' })
    const activeExport = await downloadExport(page)
    expect(activeExport.userId).toBe(memberId)
    expect(activeExport.email).toBe(member.email)
    expect(activeExport.profile.id).toBe(memberId)
    expect(activeExport.role).toMatchObject({ userId: memberId, role: 'user' })
    expect(activeExport.journalEntries).toEqual([
      expect.objectContaining({ userId: memberId, title, content }),
    ])
    expect(activeExport.mapNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: memberId,
          sourceId: activeExport.journalEntries[0].id,
          sourceType: 'journal-entry',
        }),
      ])
    )
    expect(activeExport.mapNodes.every((node) => node.userId === memberId)).toBe(true)
    expect(activeExport.mapEdges.every((edge) => edge.userId === memberId)).toBe(true)
    expect(
      activeExport.workspaceMembershipEvents.some((event) => event.eventType === 'approved')
    ).toBe(true)
    expect(JSON.stringify(activeExport)).not.toContain(sentinel.data!.id)

    // Suspension removes app access while the account lifecycle remains available.
    await memberRow
      .getByRole('button', { name: messages.admin.members.suspend, exact: true })
      .click()
    await expect(memberRow).toContainText(messages.membershipStatus.suspended)
    await page.goto('/inner/journal', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new URL('/portal/access', disposable.baseURL!).toString())
    await page.goto('/portal/account', { waitUntil: 'domcontentloaded' })
    const suspendedExport = await downloadExport(page)
    expect(suspendedExport.journalEntries).toEqual(activeExport.journalEntries)
    expect(suspendedExport.workspaceMemberships[0].status).toBe('suspended')

    const deleteButton = page.getByRole('button', {
      name: messages.profile.danger.delete,
      exact: true,
    })
    await expect(deleteButton).toBeDisabled()
    await page.locator('#delete-confirmation').fill(DELETE_CONFIRMATION)
    await expect(deleteButton).toBeEnabled()
    await deleteButton.click()
    await expect(page).toHaveURL(new URL('/', disposable.baseURL!).toString())
    const removedUser = await service.auth.admin.getUserById(memberId)
    expect(removedUser.data.user).toBeNull()
    expect(removedUser.error?.status).toBe(404)
    for (const [table, ownerColumn] of [
      ['profiles', 'id'],
      ['user_roles', 'user_id'],
      ['user_preferences', 'user_id'],
      ['journal_entries', 'user_id'],
      ['map_nodes', 'user_id'],
      ['map_edges', 'user_id'],
      ['workspace_memberships', 'user_id'],
      ['workspace_profiles', 'user_id'],
      ['workspace_membership_events', 'user_id'],
    ]) {
      const remaining = await service
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(ownerColumn, memberId)
      expect(remaining.error, `Cascade check: ${table}`).toBeNull()
      expect(remaining.count, `Cascade check: ${table}`).toBe(0)
    }
    const preserved = await service
      .from('journal_entries')
      .select('id')
      .eq('id', sentinel.data!.id)
      .single()
    expect(preserved.error).toBeNull()
    expect(preserved.data?.id).toBe(sentinel.data!.id)
    await page.goto('/portal/account', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new URL('/portal', disposable.baseURL!).toString())
  } finally {
    await adminContext.close()
  }
})
