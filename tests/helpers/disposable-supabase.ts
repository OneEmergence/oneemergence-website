import { randomUUID } from 'node:crypto'
import { test as base } from '@playwright/test'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

type DisposableConfig = {
  url: string
  anonKey: string
  serviceRoleKey: string
}

export type TestIdentity = {
  email: string
  password: string
  displayName: string
  id?: string
}

const requiredKeys = [
  'SUPABASE_TEST_URL',
  'SUPABASE_TEST_ANON_KEY',
  'SUPABASE_TEST_SERVICE_ROLE_KEY',
] as const

function normalizedOrigin(value: string): string {
  const url = new URL(value)
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  )
    throw new Error('Supabase test URLs must be HTTP(S) origins without credentials or paths')
  return url.origin
}

/** No fallback to the app's credentials. Partial configuration fails instead of skipping. */
export function readDisposableConfig(
  env: Readonly<Record<string, string | undefined>> = process.env
): DisposableConfig | null {
  const requested =
    requiredKeys.some((key) => Boolean(env[key])) || Boolean(env.SUPABASE_TEST_DISPOSABLE)
  if (!requested) return null
  const missing = requiredKeys.filter((key) => !env[key])
  if (missing.length)
    throw new Error(`Incomplete disposable test configuration: ${missing.join(', ')}`)
  if (env.SUPABASE_TEST_DISPOSABLE !== '1') {
    throw new Error(
      'Refusing mutations: set SUPABASE_TEST_DISPOSABLE=1 only for an explicitly disposable project'
    )
  }
  return {
    url: normalizedOrigin(env.SUPABASE_TEST_URL!),
    anonKey: env.SUPABASE_TEST_ANON_KEY!,
    serviceRoleKey: env.SUPABASE_TEST_SERVICE_ROLE_KEY!,
  }
}

function requireSuccess(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(`${operation}: ${error.message}`)
}

/** Owns only the exact random identities reserved by this test, including partial setup. */
export class DisposableSupabase {
  readonly service: SupabaseClient
  readonly runId = randomUUID().replaceAll('-', '')
  workspaceId = ''
  private readonly identities: TestIdentity[] = []

  constructor(
    readonly config: DisposableConfig,
    readonly baseURL: string | undefined
  ) {
    this.service = createClient(config.url, config.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  async prepare(): Promise<void> {
    const permissions = await this.service.auth.admin.listUsers({ page: 1, perPage: 1 })
    requireSuccess(permissions.error, 'Disposable project admin capability')
    const workspace = await this.service
      .from('workspaces')
      .select('id')
      .eq('slug', 'one-emergence')
      .single()
    requireSuccess(workspace.error, 'Migrated default workspace')
    if (!workspace.data) throw new Error('The disposable project has no default workspace')
    this.workspaceId = workspace.data.id as string
  }

  async requireAccountCapabilities(): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!appUrl || normalizedOrigin(appUrl) !== this.config.url) {
      throw new Error(
        'Account E2E requires the app and SUPABASE_TEST_URL to use exactly the same disposable Supabase origin'
      )
    }
    if (!this.baseURL) throw new Error('Account E2E requires a configured Playwright baseURL')
    const response = await fetch(`${this.config.url}/auth/v1/settings`, {
      headers: { apikey: this.config.anonKey },
    })
    if (!response.ok) throw new Error(`Auth settings preflight failed (${response.status})`)
    const settings: unknown = await response.json()
    if (
      !settings ||
      typeof settings !== 'object' ||
      !('mailer_autoconfirm' in settings) ||
      settings.mailer_autoconfirm !== true ||
      !('disable_signup' in settings) ||
      settings.disable_signup !== false
    ) {
      throw new Error(
        'Account E2E requires enabled email signup with mailer_autoconfirm=true; no confirmation emails may be sent'
      )
    }
    const bootstrapAdmins = await this.service
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
    requireSuccess(bootstrapAdmins.error, 'Bootstrap admin capability')
    if (!bootstrapAdmins.data?.length) {
      throw new Error(
        'A disposable project bootstrap admin is required: protect_last_admin must allow cleanup of the temporary test admin'
      )
    }
    const buckets = await this.service.storage.listBuckets()
    requireSuccess(buckets.error, 'Storage capability')
    if (!buckets.data?.some((bucket) => bucket.id === 'avatars')) {
      throw new Error('The migrated avatars bucket is required to test account deletion')
    }
  }

  reserveIdentity(kind: string): TestIdentity {
    const identity: TestIdentity = {
      email: `oe-e2e-${this.runId}-${kind}@example.test`,
      password: `E2e!${randomUUID()}aA7`,
      displayName: `E2E ${this.runId.slice(0, 8)} ${kind}`,
    }
    if (this.identities.some((existing) => existing.email === identity.email)) {
      throw new Error('Test identity names must be unique within a test')
    }
    this.identities.push(identity)
    return identity
  }

  async createConfirmedUser(kind: string): Promise<TestIdentity & { id: string }> {
    const identity = this.reserveIdentity(kind)
    const result = await this.service.auth.admin.createUser({
      email: identity.email,
      password: identity.password,
      email_confirm: true,
      user_metadata: { full_name: identity.displayName, e2e_run_id: this.runId },
    })
    // Register immediately, even if a later assertion/setup step fails.
    if (result.data.user) identity.id = result.data.user.id
    requireSuccess(result.error, `Create ${kind} test identity`)
    if (!identity.id) throw new Error(`Create ${kind} returned no user`)
    return identity as TestIdentity & { id: string }
  }

  client(): SupabaseClient {
    return createClient(this.config.url, this.config.anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  async signIn(identity: TestIdentity): Promise<SupabaseClient> {
    const client = this.client()
    const result = await client.auth.signInWithPassword({
      email: identity.email,
      password: identity.password,
    })
    requireSuccess(result.error, 'Test identity password sign-in')
    return client
  }

  async findIdentity(identity: TestIdentity): Promise<User | undefined> {
    if (!this.identities.includes(identity))
      throw new Error('Identity was not reserved by this test')
    if (identity.id) {
      const result = await this.service.auth.admin.getUserById(identity.id)
      if (result.error?.status === 404) return undefined
      requireSuccess(result.error, 'Read test identity')
      if (result.data.user?.email !== identity.email)
        throw new Error('Refusing cleanup: test identity ownership mismatch')
      return result.data.user
    }
    // Also recovers a UI signup or an admin request that succeeded before its response failed.
    for (let page = 1; page <= 100; page++) {
      const result = await this.service.auth.admin.listUsers({ page, perPage: 200 })
      requireSuccess(result.error, 'Locate reserved test identity')
      const found = result.data.users.find((user) => user.email === identity.email)
      if (found) {
        identity.id = found.id
        return found
      }
      if (result.data.users.length < 200) return undefined
    }
    throw new Error('Disposable project user listing exceeded the cleanup limit')
  }

  async cleanup(): Promise<void> {
    const failures: Error[] = []
    for (const identity of [...this.identities].reverse()) {
      try {
        const user = await this.findIdentity(identity)
        if (!user) continue
        const result = await this.service.auth.admin.deleteUser(user.id)
        requireSuccess(result.error, 'Delete owned test identity')
      } catch (error) {
        failures.push(error instanceof Error ? error : new Error('Test identity cleanup failed'))
      }
    }
    if (failures.length)
      throw new AggregateError(failures, 'Disposable identity cleanup incomplete')
  }
}

export const test = base.extend<{ disposable: DisposableSupabase }>({
  disposable: async ({ baseURL }, run) => {
    const config = readDisposableConfig()
    base.skip(
      !config,
      'Set explicit SUPABASE_TEST_* credentials and SUPABASE_TEST_DISPOSABLE=1 for a disposable project'
    )
    if (!config) return
    const project = new DisposableSupabase(config, baseURL)
    try {
      await project.prepare()
      await run(project)
    } finally {
      await project.cleanup()
    }
  },
})
