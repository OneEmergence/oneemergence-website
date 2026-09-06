import { expect, test } from '@playwright/test'

test('contact prepares a complete draft without claiming delivery or clearing the form', async ({
  page,
}) => {
  await page.goto('/contact', { waitUntil: 'domcontentloaded' })
  const prepare = page.getByRole('button', { name: 'E-Mail-Entwurf vorbereiten' })
  const draft = page.getByRole('link', { name: 'Entwurf im Mailprogramm öffnen' })

  await prepare.click()
  await expect(page.locator('#name:invalid')).toHaveCount(1)
  await expect(draft).toHaveCount(0)

  const name = 'Mira & René'
  const email = 'mira+test@example.com'
  const message = 'Hallo Team!\nEine Idee mit & Fragezeichen? #Zusammen'
  await page.getByLabel('Name', { exact: false }).fill(name)
  await page.locator('#email').fill(email)
  await page.getByLabel('Betreff', { exact: true }).selectOption('Community & Onboarding')
  await page.getByLabel('Nachricht', { exact: false }).fill(message)
  await prepare.click()

  await expect(page.getByRole('status')).toContainText('Noch wurde nichts gesendet.')
  await expect(draft).toBeVisible()
  const href = await draft.getAttribute('href')
  expect(href).not.toBeNull()
  const emailDraft = new URL(href!)
  expect(emailDraft.protocol).toBe('mailto:')
  expect(emailDraft.pathname).toBe('hello@oneemergence.com')
  expect(emailDraft.searchParams.get('subject')).toBe('Community & Onboarding')
  expect(emailDraft.searchParams.get('body')).toBe(`${message}\n\nName: ${name}\nE-Mail: ${email}`)
  await expect(page.locator('#name')).toHaveValue(name)
  await expect(page.locator('#email')).toHaveValue(email)
  await expect(page.locator('#message')).toHaveValue(message)
  await expect(
    page.getByText('Deine Nachricht ist bei uns angekommen.', { exact: false })
  ).toHaveCount(0)
  // Inspecting the complete draft stops before the user's external email app.
})

for (const path of ['/', '/manifesto', '/experiences']) {
  test(`${path} offers email contact without claiming newsletter signup`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const newsletter = page.locator('[aria-label="In Verbindung bleiben"]')
    await expect(newsletter).toContainText('Die Newsletter-Anmeldung ist noch nicht verfügbar.')
    await expect(newsletter).toContainText('damit meldest du dich nicht für einen Newsletter an.')
    await expect(newsletter.locator('input[type="email"]')).toHaveCount(0)
    const href = await newsletter
      .getByRole('link', { name: 'Per E-Mail Kontakt aufnehmen' })
      .getAttribute('href')
    expect(href).not.toBeNull()
    const contact = new URL(href!)
    expect(contact.protocol).toBe('mailto:')
    expect(contact.pathname).toBe('hello@oneemergence.com')
    expect(contact.searchParams.get('subject')).toBe('Interesse an OneEmergence')
    await expect(page.getByText('Du erhältst bald unsere erste Nachricht.')).toHaveCount(0)
  })
}
