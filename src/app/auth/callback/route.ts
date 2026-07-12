import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env, siteUrl } from '@/lib/env'

function safeRedirectPath(value: string | null): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/inner'

  const target = new URL(value, siteUrl)
  if (target.origin !== new URL(siteUrl).origin) return '/inner'

  return `${target.pathname}${target.search}${target.hash}`
}

/**
 * Supabase Auth callback handler.
 * After OAuth sign-in, Supabase redirects here with a `code` query param.
 * We exchange it for a session and redirect the user to /inner.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'))

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, siteUrl))
    }
  }

  // Auth code exchange failed — redirect to portal with error indication
  return NextResponse.redirect(new URL('/portal?error=callback', siteUrl))
}
