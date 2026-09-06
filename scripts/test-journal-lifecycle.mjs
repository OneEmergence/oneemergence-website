/**
 * Regression check for the real Journal server actions against local PostgreSQL.
 * Requires JOURNAL_TEST_ADMIN_URL (explicit loopback URL, CREATEDB privilege).
 * Creates a unique database and removes only that database in finally.
 * Auth and Next cache are stubbed; Zod, Drizzle, map generation, and SQL are real.
 * Never reads DATABASE_URL, Supabase settings, or .env files.
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, and } from 'drizzle-orm'

const requirePackage = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const adminUrlValue = process.env.JOURNAL_TEST_ADMIN_URL
if (!adminUrlValue) {
  console.error(
    'Set JOURNAL_TEST_ADMIN_URL to an explicit local PostgreSQL URL with CREATEDB privilege.'
  )
  process.exit(1)
}
let adminUrl
try {
  adminUrl = new URL(adminUrlValue)
} catch {
  console.error('JOURNAL_TEST_ADMIN_URL must be a valid PostgreSQL URL.')
  process.exit(1)
}
if (
  !['postgres:', 'postgresql:'].includes(adminUrl.protocol) ||
  !['127.0.0.1', '[::1]'].includes(adminUrl.hostname) ||
  adminUrl.search ||
  adminUrl.hash
) {
  console.error(
    'Refusing test: use an explicit 127.0.0.1 or [::1] PostgreSQL URL without query parameters.'
  )
  process.exit(1)
}
const databaseName = `oe_journal_test_${randomUUID().replaceAll('-', '')}`
const databaseUrl = new URL(adminUrl)
databaseUrl.pathname = `/${databaseName}`
const adminSql = postgres(adminUrl.toString(), { prepare: false, max: 1 })
const sql = postgres(databaseUrl.toString(), { prepare: false })
let createdDatabase = false
const uid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const otherUid = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const invalidated = []
const modules = new Map()
let db

function load(relative) {
  const file = path.resolve(root, relative)
  if (modules.has(file)) return modules.get(file).exports
  const loadedModule = { exports: {} }
  modules.set(file, loadedModule)
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText
  const scopedRequire = (name) => {
    if (name === 'server-only') return {}
    if (name === 'next/cache') return { revalidatePath: (route) => invalidated.push(route) }
    if (name === '@/lib/db') return { requireDb: () => db }
    if (name === '@/features/workspaces')
      return { requireWorkspaceAccess: async () => ({ user: { id: uid } }) }
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`)
    if (name.startsWith('.'))
      return load(path.relative(root, path.resolve(path.dirname(file), `${name}.ts`)))
    return requirePackage(name)
  }
  new Function('require', 'module', 'exports', source)(
    scopedRequire,
    loadedModule,
    loadedModule.exports
  )
  return loadedModule.exports
}

function form(title, content, entryId) {
  const result = new FormData()
  result.set('title', title)
  result.set('content', content)
  if (entryId !== undefined) result.set('entryId', entryId)
  return result
}

async function main() {
  await adminSql.unsafe(`create database "${databaseName}"`)
  createdDatabase = true
  await sql`create schema auth`
  await sql`create table auth.users (id uuid primary key)`
  await sql`insert into auth.users (id) values (${uid}), (${otherUid})`
  const desired = fs.readFileSync(path.join(root, 'supabase/schemas/10_tables.sql'), 'utf8')
  const tables = desired.match(
    /create table public\.(?:journal_entries|map_nodes|map_edges) \([\s\S]*?\r?\n\);/g
  )
  assert.equal(tables.length, 3)
  for (const table of tables) await sql.unsafe(table)

  const schema = load('src/lib/db/schema.ts')
  db = drizzle(sql, { schema })
  const { journalEntries, mapNodes, mapEdges } = schema
  const { createEntry, updateEntry, deleteEntry } = load('src/features/journal/actions.ts')

  const created = await createEntry(
    form('Alter Titel', 'Meditation und Bewusstsein. Private alte Worte.')
  )
  assert.equal(created.success, true)
  const entryId = created.data.id
  const [entryNode] = await db
    .select()
    .from(mapNodes)
    .where(and(eq(mapNodes.sourceId, entryId), eq(mapNodes.userId, uid)))
  assert.ok(entryNode)
  const oldEdges = await db.select().from(mapEdges).where(eq(mapEdges.sourceNodeId, entryNode.id))
  assert.ok(oldEdges.length > 0, 'real theme generation created a cascade target')
  await db.update(mapNodes).set({ x: 120, y: 45 }).where(eq(mapNodes.id, entryNode.id))
  const [foreignNode] = await db
    .insert(mapNodes)
    .values({
      userId: otherUid,
      type: 'journal-entry',
      label: 'Andere Person',
      description: 'Fremd',
      sourceId: entryId,
      sourceType: 'journal-entry',
    })
    .returning()
  const [unrelated] = await db
    .insert(mapNodes)
    .values({
      userId: uid,
      type: 'practice',
      label: 'Andere Quelle',
      sourceId: entryId,
      sourceType: 'practice',
    })
    .returning()

  const title = 'Neuer Titel '.repeat(8)
  const content = 'Neue private Worte. '.repeat(20)
  assert.equal((await updateEntry(entryId, form(title, content))).success, true)
  const [updatedNode] = await db.select().from(mapNodes).where(eq(mapNodes.id, entryNode.id))
  assert.equal(updatedNode.label, title.slice(0, 37) + '…')
  assert.equal(updatedNode.description, content.slice(0, 200))
  assert.equal(updatedNode.x, 120)
  assert.equal(updatedNode.y, 45)
  assert.deepEqual(
    await db.select().from(mapEdges).where(eq(mapEdges.sourceNodeId, entryNode.id)),
    oldEdges
  )
  assert.equal(
    (await db.select().from(mapNodes).where(eq(mapNodes.id, foreignNode.id)))[0].description,
    'Fremd'
  )
  assert.equal(
    (await db.select().from(mapNodes).where(eq(mapNodes.id, unrelated.id)))[0].label,
    'Andere Quelle'
  )
  console.log(
    'PASS: update refreshes owned excerpts, preserves positions/connections, isolates owner/source type'
  )

  await sql.unsafe(
    "create function reject_map_change() returns trigger language plpgsql as $$ begin raise exception 'forced map failure'; end $$"
  )
  await sql.unsafe(
    'create trigger reject_map_change before update or delete on public.map_nodes for each row execute function reject_map_change()'
  )
  assert.equal(
    (await updateEntry(entryId, form('Must roll back', 'Must roll back'))).success,
    false
  )
  assert.equal(
    (await db.select().from(journalEntries).where(eq(journalEntries.id, entryId)))[0].title,
    title
  )
  assert.equal((await deleteEntry(entryId)).success, false)
  assert.equal(
    (await db.select().from(journalEntries).where(eq(journalEntries.id, entryId))).length,
    1
  )
  assert.equal((await db.select().from(mapNodes).where(eq(mapNodes.id, entryNode.id))).length, 1)
  await sql.unsafe('drop trigger reject_map_change on public.map_nodes')
  console.log('PASS: map write/delete failures roll back the journal mutation')

  const [foreignEntry] = await db
    .insert(journalEntries)
    .values({ userId: otherUid, title: 'Fremder Eintrag', content: 'Privat' })
    .returning()
  const [foreignEntryNode] = await db
    .insert(mapNodes)
    .values({
      userId: otherUid,
      type: 'journal-entry',
      label: 'Fremde Kopie',
      sourceId: foreignEntry.id,
      sourceType: 'journal-entry',
    })
    .returning()
  assert.equal((await updateEntry(foreignEntry.id, form('Forbidden', 'Forbidden'))).success, false)
  assert.equal((await deleteEntry(foreignEntry.id)).success, false)
  assert.equal(
    (await db.select().from(mapNodes).where(eq(mapNodes.id, foreignEntryNode.id)))[0].label,
    'Fremde Kopie'
  )
  console.log('PASS: foreign journal ID cannot update or delete journal/map rows')

  assert.equal((await deleteEntry(entryId)).success, true)
  assert.equal(
    (await db.select().from(journalEntries).where(eq(journalEntries.id, entryId))).length,
    0
  )
  assert.equal((await db.select().from(mapNodes).where(eq(mapNodes.id, entryNode.id))).length, 0)
  assert.equal(
    (await db.select().from(mapEdges).where(eq(mapEdges.sourceNodeId, entryNode.id))).length,
    0
  )
  assert.equal((await db.select().from(mapNodes).where(eq(mapNodes.id, foreignNode.id))).length, 1)
  assert.equal((await db.select().from(mapNodes).where(eq(mapNodes.id, unrelated.id))).length, 1)
  assert.ok((await db.select().from(mapNodes).where(eq(mapNodes.type, 'theme'))).length > 0)
  assert.ok(invalidated.includes('/inner/journal'))
  assert.ok(invalidated.includes('/inner/map'))
  console.log(
    'PASS: delete clears copied private text and attached edges, preserves independent themes/foreign nodes'
  )

  const graphBeforeFailure = await db.select().from(mapNodes).orderBy(mapNodes.id)
  await sql.unsafe(
    'create trigger reject_edge_insert before insert on public.map_edges for each row execute function reject_map_change()'
  )
  const fallback = await createEntry(form('Journal survives', 'Meditation und Bewusstsein.'))
  assert.equal(fallback.success, true)
  assert.equal(
    (await db.select().from(journalEntries).where(eq(journalEntries.id, fallback.data.id))).length,
    1
  )
  assert.deepEqual(await db.select().from(mapNodes).orderBy(mapNodes.id), graphBeforeFailure)
  await sql.unsafe('drop trigger reject_edge_insert on public.map_edges')
  console.log(
    'PASS: optional map generation failure saves the journal and rolls back its partial graph'
  )

  const stableId = randomUUID()
  const initialCreate = await createEntry(
    form('First create', 'Meditation und Bewusstsein.', stableId)
  )
  assert.equal(initialCreate.success, true)
  assert.equal(initialCreate.data.id, stableId)
  const graphAfterCreate = await db.select().from(mapNodes).orderBy(mapNodes.id)
  const latestRetry = form(
    'Latest retry',
    'Latest private words after the lost response.',
    stableId
  )
  latestRetry.set('moodTags', JSON.stringify(['grateful']))
  latestRetry.set('themes', JSON.stringify(['awareness']))
  const retriedCreate = await createEntry(latestRetry)
  assert.equal(retriedCreate.success, true)
  assert.equal(retriedCreate.data.id, stableId)
  assert.equal(retriedCreate.data.content, 'Latest private words after the lost response.')
  assert.deepEqual(retriedCreate.data.moodTags, ['grateful'])
  assert.deepEqual(retriedCreate.data.themes, ['awareness'])
  const sameEntries = await db.select().from(journalEntries).where(eq(journalEntries.id, stableId))
  const sameSources = await db.select().from(mapNodes).where(eq(mapNodes.sourceId, stableId))
  assert.equal(sameEntries.length, 1)
  assert.equal(sameSources.length, 1)
  assert.equal(sameSources[0].label, 'Latest retry')
  assert.equal(sameSources[0].description, retriedCreate.data.content)
  assert.deepEqual(
    (await db.select().from(mapNodes).orderBy(mapNodes.id)).filter(
      (node) => node.sourceId !== stableId
    ),
    graphAfterCreate.filter((node) => node.sourceId !== stableId)
  )
  console.log(
    'PASS: repeated create ID updates latest content and its single source map without regenerating themes'
  )

  const concurrentId = randomUUID()
  const concurrentCreates = await Promise.all([
    createEntry(form('Concurrent draft', 'Meditation und Bewusstsein.', concurrentId)),
    createEntry(form('Concurrent draft', 'Meditation und Bewusstsein.', concurrentId)),
  ])
  assert.ok(concurrentCreates.every((result) => result.success && result.data.id === concurrentId))
  assert.equal(
    (await db.select().from(journalEntries).where(eq(journalEntries.id, concurrentId))).length,
    1
  )
  assert.equal(
    (await db.select().from(mapNodes).where(eq(mapNodes.sourceId, concurrentId))).length,
    1
  )
  console.log(
    'PASS: concurrent creates with one draft ID produce one entry and one source map node'
  )

  assert.equal(
    (await createEntry(form('Forbidden create', 'Forbidden content', foreignEntry.id))).success,
    false
  )
  assert.equal(
    (await db.select().from(journalEntries).where(eq(journalEntries.id, foreignEntry.id)))[0]
      .content,
    'Privat'
  )
  assert.equal(
    (await db.select().from(mapNodes).where(eq(mapNodes.id, foreignEntryNode.id)))[0].label,
    'Fremde Kopie'
  )
  assert.equal((await createEntry(form('Invalid', 'Invalid', 'not-a-uuid'))).success, false)
  console.log(
    'PASS: foreign create-ID collisions and malformed IDs cannot mutate another entry or its map'
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    try {
      await sql.end({ timeout: 5 })
      if (createdDatabase) await adminSql.unsafe(`drop database "${databaseName}"`)
    } finally {
      await adminSql.end({ timeout: 5 })
    }
  })
