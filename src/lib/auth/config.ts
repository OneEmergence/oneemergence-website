import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'

/**
 * Build the list of OAuth providers from available env vars.
 * Providers without credentials are silently skipped, so the app
 * can run in dev without all OAuth secrets configured.
 */
function getProviders(): NextAuthConfig['providers'] {
  const providers: NextAuthConfig['providers'] = []

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(Google)
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(GitHub)
  }

  return providers
}

export const authConfig: NextAuthConfig = {
  providers: getProviders(),

  // Use Drizzle adapter when database is available
  ...(db
    ? {
        adapter: DrizzleAdapter(db, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: sessions,
          verificationTokensTable: verificationTokens,
        }),
      }
    : {}),

  pages: {
    signIn: '/portal',
    error: '/portal',
    newUser: '/inner',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPortalRoute = nextUrl.pathname.startsWith('/inner')

      if (isPortalRoute && !isLoggedIn) {
        return Response.redirect(new URL('/portal', nextUrl))
      }

      return true
    },

    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },

  // Use database sessions (not JWT) when DB is available
  session: {
    strategy: db ? 'database' : 'jwt',
  },
}
