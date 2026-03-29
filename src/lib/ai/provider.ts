import { createAnthropic } from '@ai-sdk/anthropic'

/**
 * Anthropic provider for the AI Guide.
 *
 * Returns null if ANTHROPIC_API_KEY is not configured, allowing the app
 * to build and run without an API key. Guide features will show a
 * configuration message instead of failing.
 */
function createProvider() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return null
  }
  return createAnthropic({ apiKey })
}

export const anthropic = createProvider()

/**
 * Get the Anthropic provider, throwing if not configured.
 * Use in API routes where the provider is required.
 */
export function requireAnthropic() {
  if (!anthropic) {
    throw new Error(
      'Anthropic API key not configured. Set ANTHROPIC_API_KEY in your environment.'
    )
  }
  return anthropic
}
