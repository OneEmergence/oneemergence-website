/**
 * Liveness probe for container orchestration (Docker HEALTHCHECK, etc.).
 *
 * Intentionally shallow: no auth, no DB/Supabase touch. This answers
 * "is the Node process up and serving requests?", not "is the app fully
 * configured?" — a readiness probe (if one is added later) would check that.
 */
export async function GET() {
  return Response.json({ status: 'ok' })
}
