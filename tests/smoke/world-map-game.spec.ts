import { expect, test } from '@playwright/test'

import {
  createInitialGameState,
  createResonanceSession,
  getCompletedPairCount,
  getPairForPlace,
  hasReachedEmergence,
  parseResonanceSession,
  PLACE_ATTENTION_CAPACITY,
  PULSE_INTERVAL_MS,
  reduceGame,
  reduceResonanceSession,
  RESONANCE_PAIRS,
  RESONANCE_SESSION_STORAGE_KEY,
  TOTAL_ATTENTION,
  type AttentionNodeId,
  type ResonanceGameEvent,
  type ResonanceGameState,
  type ResonancePair,
} from '../../src/features/world-map/immersive/game'
import { WORLD_LANDMARK_IDS } from '../../src/features/world-map/immersive/placements'

function move(
  state: ResonanceGameState,
  from: AttentionNodeId,
  to: AttentionNodeId
): ResonanceGameState {
  return reduceGame(state, { type: 'MOVE_ATTENTION', from, to }).state
}

function runPulses(
  state: ResonanceGameState,
  count: number
): { state: ResonanceGameState; events: ResonanceGameEvent[] } {
  let current = state
  const events: ResonanceGameEvent[] = []

  for (let pulse = 0; pulse < count; pulse += 1) {
    const result = reduceGame(current, { type: 'PULSE' })
    current = result.state
    events.push(...result.events)
  }

  return { state: current, events }
}

function pulseUntil(
  state: ResonanceGameState,
  predicate: (candidate: ResonanceGameState) => boolean
): { state: ResonanceGameState; events: ResonanceGameEvent[] } {
  let current = state
  const events: ResonanceGameEvent[] = []

  while (!predicate(current)) {
    const result = reduceGame(current, { type: 'PULSE' })
    current = result.state
    events.push(...result.events)
    expect(current.pulse).toBeLessThan(1_000)
  }

  return { state: current, events }
}

function harmonizePair(
  state: ResonanceGameState,
  pair: ResonancePair
): { state: ResonanceGameState; events: ResonanceGameEvent[] } {
  let current = move(state, 'tree', pair.personalId)
  current = move(current, 'tree', pair.personalId)
  const personal = pulseUntil(current, (candidate) => candidate.pairs[pair.id].globalUnlocked)
  current = move(personal.state, pair.personalId, pair.globalId)
  current = move(current, 'tree', pair.globalId)
  const ready = pulseUntil(current, (candidate) => candidate.resonance[pair.globalId] >= 32)
  const stabilization = reduceGame(ready.state, { type: 'STABILIZE_PAIR', pairId: pair.id })
  const complete = pulseUntil(
    stabilization.state,
    (candidate) => candidate.pairs[pair.id].completedAtPulse !== null
  )

  return {
    state: complete.state,
    events: [...personal.events, ...ready.events, ...stabilization.events, ...complete.events],
  }
}

function runStrategy(pairs: readonly ResonancePair[]) {
  let state = createInitialGameState()
  const events: ResonanceGameEvent[] = []

  for (const pair of pairs) {
    const result = harmonizePair(state, pair)
    state = result.state
    events.push(...result.events)
  }

  return { state, events }
}

test('the seven roadmap pairs cover all 15 typed landmarks exactly once', () => {
  expect(RESONANCE_PAIRS.map(({ personalId, globalId }) => [personalId, globalId])).toEqual([
    ['root-home', 'earth'],
    ['creation-temple', 'creation'],
    ['solar-ark', 'energy'],
    ['heart-caravan', 'exchange'],
    ['voice-beacon', 'council'],
    ['observatory', 'noosphere'],
    ['cosmic-control', 'ashram'],
  ])

  const pairedPlaces = RESONANCE_PAIRS.flatMap(({ personalId, globalId }) => [personalId, globalId])
  expect(new Set(['tree', ...pairedPlaces])).toEqual(new Set(WORLD_LANDMARK_IDS))
  expect(new Set(pairedPlaces).size).toBe(14)
  expect(getPairForPlace('tree')).toBeUndefined()
  expect(getPairForPlace('voice-beacon')?.globalId).toBe('council')
})

test('campaign persistence accepts only complete version 2 sessions', () => {
  const initialSession = createResonanceSession()
  const session = reduceResonanceSession(initialSession, {
    type: 'MOVE_ATTENTION',
    from: 'tree',
    to: 'root-home',
  })
  expect(RESONANCE_SESSION_STORAGE_KEY).toBe('one-emergence:world-map:resonance-session:v2')
  expect(parseResonanceSession(JSON.stringify(session))).toEqual(session)

  expect(parseResonanceSession(JSON.stringify(initialSession))).toBeNull()
  expect(parseResonanceSession('{')).toBeNull()
  expect(
    parseResonanceSession(JSON.stringify({ ...session, game: { ...session.game, version: 1 } }))
  ).toBeNull()
  expect(
    parseResonanceSession(
      JSON.stringify({
        ...session,
        game: {
          ...session.game,
          attention: { ...session.game.attention, tree: undefined },
        },
      })
    )
  ).toBeNull()
  expect(
    parseResonanceSession(
      JSON.stringify({
        ...session,
        game: {
          ...session.game,
          pairs: {
            ...session.game.pairs,
            'root-earth': {
              ...session.game.pairs['root-earth'],
              completedAtPulse: 0,
            },
          },
        },
      })
    )
  ).toBeNull()
  expect(
    parseResonanceSession(
      JSON.stringify({
        ...session,
        game: { ...session.game, emergenceAtPulse: 0 },
      })
    )
  ).toBeNull()
})

test('shared attention is bounded, conserved and changes the next pair immediately', () => {
  const initial = createInitialGameState()
  const locked = reduceGame(initial, {
    type: 'MOVE_ATTENTION',
    from: 'tree',
    to: 'earth',
  })

  expect(locked.state).toBe(initial)
  expect(locked.events).toEqual([{ type: 'COMMAND_REJECTED', code: 'GLOBAL_LOCKED' }])

  const influenced = reduceGame(initial, {
    type: 'MOVE_ATTENTION',
    from: 'tree',
    to: 'root-home',
  })
  expect(influenced.state.pairs['creation-temple-creation'].support).toBe(1)
  expect(influenced.events).toContainEqual({
    type: 'PAIR_INFLUENCE_CHANGED',
    sourcePairId: 'root-earth',
    targetPairId: 'creation-temple-creation',
    support: 1,
  })

  const state = move(influenced.state, 'tree', 'root-home')
  const full = reduceGame(state, {
    type: 'MOVE_ATTENTION',
    from: 'tree',
    to: 'root-home',
  })
  expect(full.state).toBe(state)
  expect(full.events).toEqual([{ type: 'COMMAND_REJECTED', code: 'TARGET_FULL' }])
  expect(Math.max(...Object.values(state.attention))).toBeLessThanOrEqual(TOTAL_ATTENTION)
  expect(state.attention['root-home']).toBe(PLACE_ATTENTION_CAPACITY)
  expect(Object.values(state.attention).reduce((sum, value) => sum + value, 0)).toBe(
    TOTAL_ATTENTION
  )
})

test('dissonance is reversible and never creates a loss state', () => {
  const pair = RESONANCE_PAIRS[0]
  let state = move(createInitialGameState(), 'tree', pair.personalId)
  state = move(state, 'tree', pair.personalId)
  state = pulseUntil(state, (candidate) => candidate.pairs[pair.id].globalUnlocked).state
  state = move(state, pair.personalId, pair.globalId)
  state = move(state, 'tree', pair.globalId)
  state = pulseUntil(state, (candidate) => candidate.resonance[pair.globalId] >= 32).state
  state = reduceGame(state, { type: 'STABILIZE_PAIR', pairId: pair.id }).state
  state = runPulses(state, 5).state
  expect(state.pairs[pair.id].coherence).toBe(10)

  state = move(state, pair.personalId, 'tree')
  const drift = runPulses(state, 3)
  expect(drift.state.pairs[pair.id].dissonance).toBe(3)
  expect(drift.state.pairs[pair.id].coherence).toBe(4)
  expect(drift.events).toContainEqual({ type: 'PAIR_DISSONANT', pairId: pair.id })

  state = move(drift.state, pair.globalId, pair.personalId)
  state = move(state, 'tree', pair.personalId)
  const restored = runPulses(state, 3)
  expect(restored.state.pairs[pair.id].dissonance).toBe(0)
  expect(restored.state.pairs[pair.id].coherence).toBe(6)
  expect(restored.state.pairs[pair.id].stabilizing).toBe(true)
  expect(restored.events).toContainEqual({ type: 'PAIR_REALIGNED', pairId: pair.id })
})

test('two deterministic strategies reach Emergence in about 20–30 minutes', () => {
  const ascending = runStrategy(RESONANCE_PAIRS)
  const descending = runStrategy([...RESONANCE_PAIRS].reverse())
  const repeatedAscending = runStrategy(RESONANCE_PAIRS)

  expect(ascending).toEqual(repeatedAscending)
  expect(ascending.state.pulse).toBe(478)
  expect(descending.state.pulse).toBe(558)

  for (const result of [ascending, descending]) {
    expect(getCompletedPairCount(result.state)).toBe(RESONANCE_PAIRS.length)
    expect(hasReachedEmergence(result.state)).toBe(true)
    expect(result.state.emergenceAtPulse).toBe(result.state.pulse)
    expect(result.state.attention.tree).toBe(TOTAL_ATTENTION)
    expect(result.events.filter(({ type }) => type === 'EMERGENCE_REACHED')).toEqual([
      { type: 'EMERGENCE_REACHED', pulse: result.state.pulse },
    ])

    const durationMinutes = (result.state.pulse * PULSE_INTERVAL_MS) / 60_000
    expect(durationMinutes).toBeGreaterThanOrEqual(19.9)
    expect(durationMinutes).toBeLessThanOrEqual(30)
  }
})
