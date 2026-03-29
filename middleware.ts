export { auth as middleware } from '@/lib/auth'

export const config = {
  // Protect all /inner routes — redirect to /portal if unauthenticated
  // The authorization logic is in authConfig.callbacks.authorized
  matcher: ['/inner/:path*'],
}
