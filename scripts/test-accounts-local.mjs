// Real Auth/PostgREST/SQL/browser acceptance in a fresh, loopback-only stack.
// Does not load .env files, link a cloud project, or reuse an existing app server.
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const project = `oe-accounts-${randomUUID().slice(0, 8)}`
const workdir = path.join(root, 'tmp', project)
const cli = path.join(root, 'node_modules/supabase/dist/supabase.js')
const appURL = 'http://127.0.0.1:3100'
const baseEnv = { ...process.env, SUPABASE_ACCESS_TOKEN: '' }
let networkCreated = false
let stackAttempted = false
let activeChild
let interrupted = false
let cleaning = false

function interrupt(signal) {
  interrupted = true
  if (!cleaning) activeChild?.kill(signal)
}
const onInterrupt = () => interrupt('SIGINT')
const onTerminate = () => interrupt('SIGTERM')
process.on('SIGINT', onInterrupt)
process.on('SIGTERM', onTerminate)

async function run(command, args, { env = baseEnv, log, inherit = false } = {}) {
  if (interrupted && !cleaning) throw new Error('Account acceptance interrupted; cleaning up.')
  const result = await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      windowsHide: true,
      stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    })
    activeChild = child
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (data) => {
      stdout += data
    })
    child.stderr?.on('data', (data) => {
      stderr += data
    })
    child.once('error', reject)
    child.once('close', (code) => {
      activeChild = undefined
      resolve({ code, stdout, stderr })
    })
  })
  if (log) await writeFile(path.join(workdir, log), result.stdout + result.stderr, { mode: 0o600 })
  if (result.code !== 0) {
    throw new Error(
      `${path.basename(command)} ${args[0]} exited ${result.code}.${log ? ` See ${path.join(workdir, log)}` : ''}`
    )
  }
  return result.stdout
}

async function assertPortFree(port) {
  await new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', () =>
      reject(
        new Error(`Port ${port} is occupied; stop its owner before running account acceptance.`)
      )
    )
    server.listen(port, '127.0.0.1', () => server.close(resolve))
  })
}

try {
  await run('docker', ['version', '--format', '{{.Server.Version}}'])
  for (const port of [3100, 55320, 55321, 55322, 55323, 55324]) await assertPortFree(port)
  await mkdir(path.join(workdir, 'supabase'), { recursive: true })
  const config = (await readFile(path.join(root, 'supabase/config.toml'), 'utf8'))
    .replace(/^project_id = .+$/m, `project_id = "${project}"`)
    .replace(/5432([0-9])/g, '5532$1')
    .replace('http://127.0.0.1:3000', appURL)
    .replace('https://127.0.0.1:3000', 'http://localhost:3100')
    .replace('sign_in_sign_ups = 30', 'sign_in_sign_ups = 150')
  await writeFile(path.join(workdir, 'supabase/config.toml'), config)
  for (const directory of ['schemas', 'migrations']) {
    await cp(path.join(root, 'supabase', directory), path.join(workdir, 'supabase', directory), {
      recursive: true,
    })
  }
  await run('docker', [
    'network',
    'create',
    '-o',
    'com.docker.network.bridge.host_binding_ipv4=127.0.0.1',
    project,
  ])
  networkCreated = true
  stackAttempted = true
  console.log(
    `Starting fresh local Supabase project ${project}; first run downloads container images.`
  )
  await run(
    process.execPath,
    [
      cli,
      'start',
      '--workdir',
      workdir,
      '--network-id',
      project,
      '--exclude',
      'studio,imgproxy,realtime,edge-runtime,logflare,vector,postgres-meta,supavisor',
      '--yes',
    ],
    { log: 'supabase-start.log' }
  )
  const status = JSON.parse(
    await run(process.execPath, [cli, 'status', '--workdir', workdir, '-o', 'json'])
  )
  for (const key of ['API_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY', 'DB_URL']) {
    if (typeof status[key] !== 'string' || !status[key])
      throw new Error(`Local Supabase status is missing ${key}.`)
  }
  for (const key of ['API_URL', 'DB_URL']) {
    if (new URL(status[key]).hostname !== '127.0.0.1')
      throw new Error(`${key} must use literal loopback.`)
  }
  // The last-admin DB guard intentionally prevents deleting a sole admin.
  // This bootstrap account exists only for this stack's lifetime; fixtures use a second admin.
  const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await admin.auth.admin.createUser({
    email: `bootstrap-${project}@example.invalid`,
    password: `Local!${randomUUID()}`,
    email_confirm: true,
  })
  if (error || !data.user) throw new Error('Could not create the local bootstrap admin.')
  const { error: roleError } = await admin
    .from('user_roles')
    .update({ role: 'admin' })
    .eq('user_id', data.user.id)
  if (roleError) throw new Error('Could not assign the local bootstrap admin role.')
  const env = {
    ...baseEnv,
    NEXT_PUBLIC_SITE_URL: appURL,
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    DATABASE_URL: status.DB_URL,
    SUPABASE_TEST_URL: status.API_URL,
    SUPABASE_TEST_ANON_KEY: status.ANON_KEY,
    SUPABASE_TEST_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    SUPABASE_TEST_DISPOSABLE: '1',
    PLAYWRIGHT_BASE_URL: appURL,
    PLAYWRIGHT_REUSE_SERVER: '0',
    ANTHROPIC_API_KEY: '',
    NEXT_PUBLIC_SENTRY_DSN: '',
    NEXT_OUTPUT: '',
  }
  console.log('Building the app for local Supabase, then checking account lifecycle and RLS.')
  await run(
    process.execPath,
    [
      path.join(root, 'node_modules/@playwright/test/cli.js'),
      'test',
      'tests/accounts',
      'tests/rls',
      '--project=chromium',
      ...process.argv.slice(2),
    ],
    { env, inherit: true }
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Local account acceptance failed.')
  process.exitCode = 1
} finally {
  cleaning = true
  // Both identifiers were generated here. Never stop --all or a linked project.
  if (stackAttempted) {
    try {
      await run(
        process.execPath,
        [cli, 'stop', '--workdir', workdir, '--project-id', project, '--no-backup', '--yes'],
        { log: 'supabase-stop.log' }
      )
      console.log(`Removed test stack and data: ${project}`)
    } catch (error) {
      console.error(error.message)
      process.exitCode = 1
    }
  }
  if (networkCreated) {
    try {
      await run('docker', ['network', 'rm', project])
    } catch (error) {
      console.error(error.message)
      process.exitCode = 1
    }
  }
  process.off('SIGINT', onInterrupt)
  process.off('SIGTERM', onTerminate)
  if (interrupted) process.exitCode = 1
}
