// =============================================================================
// Compatibility shim — the Guide schemas now live in the guide feature module
// (src/features/guide/schemas.ts) per the "feature owns its contract" rule.
// This re-export keeps external importers (e.g. the streaming API route in
// src/app/api/guide/route.ts) working without a churn edit. Prefer importing
// from '@/features/guide' (public index) or './schemas' inside the feature.
// =============================================================================

export * from '@/features/guide/schemas'
