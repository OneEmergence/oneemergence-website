import type { WorldLandmarkId } from '../landmarks'

type WorldPlaceId = Exclude<WorldLandmarkId, 'tree'>

export const GATE_ONE_PAIR_ID = 'root-earth' as const

export const RESONANCE_PAIRS = [
  {
    id: GATE_ONE_PAIR_ID,
    personalId: 'root-home',
    globalId: 'earth',
    supportsPairId: 'creation-temple-creation',
  },
  {
    id: 'creation-temple-creation',
    personalId: 'creation-temple',
    globalId: 'creation',
    supportsPairId: 'solar-ark-energy',
  },
  {
    id: 'solar-ark-energy',
    personalId: 'solar-ark',
    globalId: 'energy',
    supportsPairId: 'heart-caravan-exchange',
  },
  {
    id: 'heart-caravan-exchange',
    personalId: 'heart-caravan',
    globalId: 'exchange',
    supportsPairId: 'voice-beacon-council',
  },
  {
    id: 'voice-beacon-council',
    personalId: 'voice-beacon',
    globalId: 'council',
    supportsPairId: 'observatory-noosphere',
  },
  {
    id: 'observatory-noosphere',
    personalId: 'observatory',
    globalId: 'noosphere',
    supportsPairId: 'cosmic-control-ashram',
  },
  {
    id: 'cosmic-control-ashram',
    personalId: 'cosmic-control',
    globalId: 'ashram',
    supportsPairId: GATE_ONE_PAIR_ID,
  },
] as const satisfies readonly {
  id: string
  personalId: WorldPlaceId
  globalId: WorldPlaceId
  supportsPairId: string
}[]

export type ResonancePair = (typeof RESONANCE_PAIRS)[number]
export type ResonancePairId = ResonancePair['id']
export type ResonancePlaceId = ResonancePair['personalId' | 'globalId']
export type AttentionNodeId = WorldLandmarkId

export const PULSE_INTERVAL_MS = 2_500
export const TOTAL_ATTENTION = 5
export const PLACE_ATTENTION_CAPACITY = 2
export const ATTUNED_RESONANCE = 32
export const RESONANCE_SESSION_STORAGE_KEY = 'one-emergence:world-map:resonance-session:v2'

const MAX_RESONANCE = 100
const SESSION_KEYS = ['game', 'events', 'revision'] as const
const GAME_KEYS = [
  'version',
  'pulse',
  'attention',
  'resonance',
  'pairs',
  'emergenceAtPulse',
] as const
const PAIR_PROGRESS_KEYS = [
  'globalUnlocked',
  'stabilizing',
  'coherence',
  'dissonance',
  'support',
  'completedAtPulse',
] as const
const REJECTED_CODES = [
  'GLOBAL_LOCKED',
  'NO_ATTENTION',
  'PAIR_COMPLETE',
  'PAIR_NOT_READY',
  'TARGET_FULL',
] as const

export interface ResonancePairProgress {
  globalUnlocked: boolean
  stabilizing: boolean
  coherence: number
  dissonance: number
  support: number
  completedAtPulse: number | null
}

export interface ResonanceGameState {
  version: 2
  pulse: number
  attention: Record<AttentionNodeId, number>
  resonance: Record<ResonancePlaceId, number>
  pairs: Record<ResonancePairId, ResonancePairProgress>
  emergenceAtPulse: number | null
}

export type ResonanceGameCommand =
  | {
      type: 'MOVE_ATTENTION'
      from: AttentionNodeId
      to: AttentionNodeId
    }
  | {
      type: 'STABILIZE_PAIR'
      pairId: ResonancePairId
    }
  | {
      type: 'PULSE'
    }

export type ResonanceGameEvent =
  | {
      type: 'COMMAND_REJECTED'
      code: 'GLOBAL_LOCKED' | 'NO_ATTENTION' | 'PAIR_COMPLETE' | 'PAIR_NOT_READY' | 'TARGET_FULL'
    }
  | {
      type: 'PLACE_ATTUNED'
      placeId: ResonancePlaceId
    }
  | {
      type: 'GLOBAL_UNLOCKED'
      pairId: ResonancePairId
    }
  | {
      type: 'PAIR_READY'
      pairId: ResonancePairId
    }
  | {
      type: 'STABILIZATION_STARTED'
      pairId: ResonancePairId
    }
  | {
      type: 'PAIR_HARMONIZED'
      pairId: ResonancePairId
    }
  | {
      type: 'PAIR_INFLUENCE_CHANGED'
      sourcePairId: ResonancePairId
      targetPairId: ResonancePairId
      support: number
    }
  | {
      type: 'PAIR_DISSONANT' | 'PAIR_REALIGNED'
      pairId: ResonancePairId
    }
  | {
      type: 'EMERGENCE_REACHED'
      pulse: number
    }

export interface ResonanceGameResult {
  state: ResonanceGameState
  events: ResonanceGameEvent[]
}

export interface ResonanceSession {
  game: ResonanceGameState
  events: ResonanceGameEvent[]
  revision: number
}

export type ResonanceSessionCommand = ResonanceGameCommand | { type: 'RESET' }

const EMPTY_RESONANCE = {
  'root-home': 0,
  earth: 0,
  'creation-temple': 0,
  creation: 0,
  'solar-ark': 0,
  energy: 0,
  'heart-caravan': 0,
  exchange: 0,
  'voice-beacon': 0,
  council: 0,
  observatory: 0,
  noosphere: 0,
  'cosmic-control': 0,
  ashram: 0,
} satisfies Record<ResonancePlaceId, number>

function createPairProgress(): ResonancePairProgress {
  return {
    globalUnlocked: false,
    stabilizing: false,
    coherence: 0,
    dissonance: 0,
    support: 0,
    completedAtPulse: null,
  }
}

export function createResonanceSession(): ResonanceSession {
  return { game: createInitialGameState(), events: [], revision: 0 }
}

export function parseResonanceSession(value: string): ResonanceSession | null {
  try {
    const session: unknown = JSON.parse(value)
    return isResonanceSession(session) ? session : null
  } catch {
    return null
  }
}

export function reduceResonanceSession(
  session: ResonanceSession,
  command: ResonanceSessionCommand
): ResonanceSession {
  if (command.type === 'RESET') return createResonanceSession()

  const result = reduceGame(session.game, command)
  return {
    game: result.state,
    events: result.events,
    revision: session.revision + 1,
  }
}

export function createInitialGameState(): ResonanceGameState {
  return {
    version: 2,
    pulse: 0,
    attention: {
      tree: TOTAL_ATTENTION,
      ...EMPTY_RESONANCE,
    },
    resonance: { ...EMPTY_RESONANCE },
    pairs: {
      'root-earth': createPairProgress(),
      'creation-temple-creation': createPairProgress(),
      'solar-ark-energy': createPairProgress(),
      'heart-caravan-exchange': createPairProgress(),
      'voice-beacon-council': createPairProgress(),
      'observatory-noosphere': createPairProgress(),
      'cosmic-control-ashram': createPairProgress(),
    },
    emergenceAtPulse: null,
  }
}

export function reduceGame(
  state: ResonanceGameState,
  command: ResonanceGameCommand
): ResonanceGameResult {
  switch (command.type) {
    case 'MOVE_ATTENTION':
      return moveAttention(state, command.from, command.to)
    case 'STABILIZE_PAIR':
      return stabilizePair(state, command.pairId)
    case 'PULSE':
      return pulse(state)
  }
}

export function getPairForPlace(placeId: WorldLandmarkId): ResonancePair | undefined {
  return RESONANCE_PAIRS.find(
    ({ personalId, globalId }) => personalId === placeId || globalId === placeId
  )
}

export function getCompletedPairCount(state: ResonanceGameState): number {
  return RESONANCE_PAIRS.filter(({ id }) => state.pairs[id].completedAtPulse !== null).length
}

export function hasReachedEmergence(state: ResonanceGameState): boolean {
  return state.emergenceAtPulse !== null
}

function moveAttention(
  state: ResonanceGameState,
  from: AttentionNodeId,
  to: AttentionNodeId
): ResonanceGameResult {
  if (from === to) {
    return { state, events: [] }
  }

  if (state.attention[from] === 0) {
    return rejected(state, 'NO_ATTENTION')
  }

  const destinationPair = getPairForPlace(to)

  if (destinationPair) {
    const progress = state.pairs[destinationPair.id]

    if (progress.completedAtPulse !== null) {
      return rejected(state, 'PAIR_COMPLETE')
    }

    if (to === destinationPair.globalId && !progress.globalUnlocked) {
      return rejected(state, 'GLOBAL_LOCKED')
    }
  }

  const capacity = to === 'tree' ? TOTAL_ATTENTION : PLACE_ATTENTION_CAPACITY
  if (state.attention[to] >= capacity) {
    return rejected(state, 'TARGET_FULL')
  }

  const attention = {
    ...state.attention,
    [from]: state.attention[from] - 1,
    [to]: state.attention[to] + 1,
  }
  const influenced = refreshSupport(state.pairs, attention)

  return {
    state: {
      ...state,
      attention,
      pairs: influenced.pairs,
    },
    events: influenced.events,
  }
}

function stabilizePair(state: ResonanceGameState, pairId: ResonancePairId): ResonanceGameResult {
  const progress = state.pairs[pairId]

  if (progress.completedAtPulse !== null) {
    return rejected(state, 'PAIR_COMPLETE')
  }

  if (progress.stabilizing) {
    return { state, events: [] }
  }

  if (!isPairReady(state, pairId)) {
    return rejected(state, 'PAIR_NOT_READY')
  }

  return {
    state: {
      ...state,
      pairs: {
        ...state.pairs,
        [pairId]: {
          ...progress,
          stabilizing: true,
        },
      },
    },
    events: [{ type: 'STABILIZATION_STARTED', pairId }],
  }
}

function getPair(pairId: ResonancePairId): ResonancePair {
  const pair = RESONANCE_PAIRS.find(({ id }) => id === pairId)

  if (!pair) {
    throw new Error(`Unknown resonance pair: ${pairId}`)
  }

  return pair
}

function pulse(state: ResonanceGameState): ResonanceGameResult {
  const nextPulse = state.pulse + 1
  const nextAttention = { ...state.attention }
  const nextResonance = { ...state.resonance }
  const nextPairs = { ...state.pairs }
  const events: ResonanceGameEvent[] = []

  for (const pair of RESONANCE_PAIRS) {
    const progress = state.pairs[pair.id]
    if (progress.completedAtPulse !== null) {
      continue
    }

    nextResonance[pair.personalId] = applyAttention(
      state.resonance[pair.personalId],
      state.attention[pair.personalId]
    )

    if (progress.globalUnlocked) {
      nextResonance[pair.globalId] = applyAttention(
        state.resonance[pair.globalId],
        state.attention[pair.globalId]
      )
    }

    if (
      state.resonance[pair.personalId] < ATTUNED_RESONANCE &&
      nextResonance[pair.personalId] >= ATTUNED_RESONANCE
    ) {
      events.push({ type: 'PLACE_ATTUNED', placeId: pair.personalId })
    }

    if (
      state.resonance[pair.globalId] < ATTUNED_RESONANCE &&
      nextResonance[pair.globalId] >= ATTUNED_RESONANCE
    ) {
      events.push({ type: 'PLACE_ATTUNED', placeId: pair.globalId })
    }

    const globalUnlocked =
      progress.globalUnlocked || nextResonance[pair.personalId] >= ATTUNED_RESONANCE

    if (!progress.globalUnlocked && globalUnlocked) {
      events.push({ type: 'GLOBAL_UNLOCKED', pairId: pair.id })
    }

    const wasReady = hasReadyConditions(
      state.resonance,
      state.attention,
      pair,
      progress.globalUnlocked
    )
    const ready = hasReadyConditions(nextResonance, state.attention, pair, globalUnlocked)

    if (!wasReady && ready) {
      events.push({ type: 'PAIR_READY', pairId: pair.id })
    }

    const balanced =
      globalUnlocked && state.attention[pair.personalId] > 0 && state.attention[pair.globalId] > 0
    const dissonance = globalUnlocked
      ? clamp(progress.dissonance + (balanced ? -(1 + progress.support) : 1))
      : progress.dissonance

    if (progress.dissonance === 0 && dissonance > 0) {
      events.push({ type: 'PAIR_DISSONANT', pairId: pair.id })
    } else if (progress.dissonance > 0 && dissonance === 0) {
      events.push({ type: 'PAIR_REALIGNED', pairId: pair.id })
    }

    const coherence = progress.stabilizing
      ? clamp(progress.coherence + (ready ? 2 + progress.support : -2))
      : progress.coherence

    if (coherence === MAX_RESONANCE) {
      nextResonance[pair.personalId] = MAX_RESONANCE
      nextResonance[pair.globalId] = MAX_RESONANCE
      nextAttention.tree += nextAttention[pair.personalId] + nextAttention[pair.globalId]
      nextAttention[pair.personalId] = 0
      nextAttention[pair.globalId] = 0
      nextPairs[pair.id] = {
        ...progress,
        globalUnlocked,
        coherence,
        dissonance: 0,
        completedAtPulse: nextPulse,
      }
      events.push({ type: 'PAIR_HARMONIZED', pairId: pair.id })
      continue
    }

    nextPairs[pair.id] = {
      ...progress,
      globalUnlocked,
      coherence,
      dissonance,
    }
  }

  const influenced = refreshSupport(nextPairs, nextAttention)
  events.push(...influenced.events)
  const emerged =
    state.emergenceAtPulse === null &&
    RESONANCE_PAIRS.every(({ id }) => influenced.pairs[id].completedAtPulse !== null)
  const emergenceAtPulse = emerged ? nextPulse : state.emergenceAtPulse

  if (emerged) {
    events.push({ type: 'EMERGENCE_REACHED', pulse: nextPulse })
  }

  return {
    state: {
      ...state,
      pulse: nextPulse,
      attention: nextAttention,
      resonance: nextResonance,
      pairs: influenced.pairs,
      emergenceAtPulse,
    },
    events,
  }
}

function refreshSupport(
  pairs: ResonanceGameState['pairs'],
  attention: ResonanceGameState['attention']
): { pairs: ResonanceGameState['pairs']; events: ResonanceGameEvent[] } {
  const nextPairs = { ...pairs }
  const events: ResonanceGameEvent[] = []

  for (const source of RESONANCE_PAIRS) {
    const sourceActive =
      pairs[source.id].completedAtPulse !== null ||
      attention[source.personalId] + attention[source.globalId] > 0
    const support = sourceActive ? 1 : 0
    const target = getPair(source.supportsPairId)

    if (pairs[target.id].support === support) continue

    nextPairs[target.id] = {
      ...nextPairs[target.id],
      support,
    }
    events.push({
      type: 'PAIR_INFLUENCE_CHANGED',
      sourcePairId: source.id,
      targetPairId: target.id,
      support,
    })
  }

  return { pairs: nextPairs, events }
}

function applyAttention(resonance: number, attention: number): number {
  if (attention >= PLACE_ATTENTION_CAPACITY) {
    return clamp(resonance + PLACE_ATTENTION_CAPACITY)
  }

  if (attention === 0) {
    return clamp(resonance - 1)
  }

  return resonance
}

export function isPairReady(state: ResonanceGameState, pairId: ResonancePairId): boolean {
  const pair = getPair(pairId)
  const progress = state.pairs[pairId]

  return hasReadyConditions(state.resonance, state.attention, pair, progress.globalUnlocked)
}

function hasReadyConditions(
  resonance: ResonanceGameState['resonance'],
  attention: ResonanceGameState['attention'],
  pair: ResonancePair,
  globalUnlocked: boolean
): boolean {
  return (
    globalUnlocked &&
    resonance[pair.personalId] >= ATTUNED_RESONANCE &&
    resonance[pair.globalId] >= ATTUNED_RESONANCE &&
    attention[pair.personalId] >= 1 &&
    attention[pair.globalId] >= 1
  )
}

function clamp(value: number): number {
  return Math.min(MAX_RESONANCE, Math.max(0, value))
}

function rejected(
  state: ResonanceGameState,
  code: Extract<ResonanceGameEvent, { type: 'COMMAND_REJECTED' }>['code']
): ResonanceGameResult {
  return {
    state,
    events: [{ type: 'COMMAND_REJECTED', code }],
  }
}

function isResonanceSession(value: unknown): value is ResonanceSession {
  if (!isRecordWithKeys(value, SESSION_KEYS) || !isSafeInteger(value.revision, 1)) return false
  if (!Array.isArray(value.events) || !value.events.every(isGameEvent)) return false

  return isGameState(value.game) && value.revision >= value.game.pulse
}

function isGameState(value: unknown): value is ResonanceGameState {
  if (!isRecordWithKeys(value, GAME_KEYS) || value.version !== 2) return false
  if (!isSafeInteger(value.pulse, 0)) return false
  const pulse = value.pulse
  if (value.emergenceAtPulse !== null && !isSafeInteger(value.emergenceAtPulse, 0, pulse)) {
    return false
  }

  const placeIds = RESONANCE_PAIRS.flatMap(({ personalId, globalId }) => [personalId, globalId])
  const attentionIds: AttentionNodeId[] = ['tree', ...placeIds]
  const attention = value.attention
  if (!isRecordWithKeys(attention, attentionIds)) return false
  if (
    !attentionIds.every((id) =>
      isSafeInteger(attention[id], 0, id === 'tree' ? TOTAL_ATTENTION : 2)
    ) ||
    attentionIds.reduce((sum, id) => sum + Number(attention[id]), 0) !== TOTAL_ATTENTION
  ) {
    return false
  }

  const resonance = value.resonance
  if (
    !isRecordWithKeys(resonance, placeIds) ||
    !placeIds.every((id) => isSafeInteger(resonance[id], 0, MAX_RESONANCE))
  ) {
    return false
  }

  const pairIds = RESONANCE_PAIRS.map(({ id }) => id)
  const pairs = value.pairs
  if (
    !isRecordWithKeys(pairs, pairIds) ||
    !pairIds.every((id) => isPairProgress(pairs[id], pulse))
  ) {
    return false
  }
  const validatedPairs = pairs as ResonanceGameState['pairs']

  const completedStateIsConsistent = RESONANCE_PAIRS.every((pair) => {
    const progress = validatedPairs[pair.id]
    return (
      progress.completedAtPulse === null ||
      (progress.globalUnlocked &&
        progress.coherence === MAX_RESONANCE &&
        progress.dissonance === 0 &&
        resonance[pair.personalId] === MAX_RESONANCE &&
        resonance[pair.globalId] === MAX_RESONANCE &&
        attention[pair.personalId] === 0 &&
        attention[pair.globalId] === 0)
    )
  })

  if (!completedStateIsConsistent) return false

  const completedPulses = RESONANCE_PAIRS.flatMap(({ id }) => {
    const completedAtPulse = validatedPairs[id].completedAtPulse
    return completedAtPulse === null ? [] : [completedAtPulse]
  })

  const emergenceAtPulse =
    completedPulses.length === RESONANCE_PAIRS.length ? Math.max(...completedPulses) : null

  return value.emergenceAtPulse === emergenceAtPulse
}

function isPairProgress(value: unknown, pulse: number): value is ResonancePairProgress {
  return (
    isRecordWithKeys(value, PAIR_PROGRESS_KEYS) &&
    typeof value.globalUnlocked === 'boolean' &&
    typeof value.stabilizing === 'boolean' &&
    isSafeInteger(value.coherence, 0, MAX_RESONANCE) &&
    isSafeInteger(value.dissonance, 0, MAX_RESONANCE) &&
    isSafeInteger(value.support, 0, 1) &&
    (value.completedAtPulse === null || isSafeInteger(value.completedAtPulse, 0, pulse))
  )
}

function isGameEvent(value: unknown): value is ResonanceGameEvent {
  if (!isRecord(value) || typeof value.type !== 'string') return false

  const pairIds = RESONANCE_PAIRS.map(({ id }) => id)
  const placeIds = RESONANCE_PAIRS.flatMap(({ personalId, globalId }) => [personalId, globalId])

  switch (value.type) {
    case 'COMMAND_REJECTED':
      return (
        hasOnlyKeys(value, ['type', 'code']) && REJECTED_CODES.some((code) => code === value.code)
      )
    case 'PLACE_ATTUNED':
      return (
        hasOnlyKeys(value, ['type', 'placeId']) &&
        placeIds.some((placeId) => placeId === value.placeId)
      )
    case 'GLOBAL_UNLOCKED':
    case 'PAIR_READY':
    case 'STABILIZATION_STARTED':
    case 'PAIR_HARMONIZED':
    case 'PAIR_DISSONANT':
    case 'PAIR_REALIGNED':
      return (
        hasOnlyKeys(value, ['type', 'pairId']) && pairIds.some((pairId) => pairId === value.pairId)
      )
    case 'PAIR_INFLUENCE_CHANGED':
      return (
        hasOnlyKeys(value, ['type', 'sourcePairId', 'targetPairId', 'support']) &&
        pairIds.some((pairId) => pairId === value.sourcePairId) &&
        pairIds.some((pairId) => pairId === value.targetPairId) &&
        isSafeInteger(value.support, 0, 1)
      )
    case 'EMERGENCE_REACHED':
      return hasOnlyKeys(value, ['type', 'pulse']) && isSafeInteger(value.pulse, 0)
    default:
      return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRecordWithKeys<const Key extends string>(
  value: unknown,
  keys: readonly Key[]
): value is Record<Key, unknown> {
  return isRecord(value) && hasOnlyKeys(value, keys)
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actualKeys = Object.keys(value)
  return actualKeys.length === keys.length && keys.every((key) => Object.hasOwn(value, key))
}

function isSafeInteger(
  value: unknown,
  min: number,
  max = Number.MAX_SAFE_INTEGER
): value is number {
  return Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max
}
