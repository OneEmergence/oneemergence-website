import { expect, test } from '@playwright/test'

import {
  ATTUNED_RESONANCE,
  createInitialGameState,
  isPairReady,
  reduceGame,
  RESONANCE_PAIRS,
  TOTAL_ATTENTION,
  type AttentionNodeId,
  type ResonanceGameCommand,
  type ResonanceGameState,
} from '../../src/features/world-map/immersive/game'
import { getAttentionSource, getJourneyStep } from '../../src/features/world-map/immersive/journey'

const FIRST_PAIR = RESONANCE_PAIRS[0]
const NEXT_PAIR = RESONANCE_PAIRS[1]

// Build reachable states exclusively through the real reducer. The journey
// helper is observed at milestones; it never decides how this trace advances.
function apply(game: ResonanceGameState, command: ResonanceGameCommand) {
  const result = reduceGame(game, command)
  expect(result.events).not.toContainEqual(expect.objectContaining({ type: 'COMMAND_REJECTED' }))
  return result.state
}

function move(game: ResonanceGameState, from: AttentionNodeId, to: AttentionNodeId) {
  return apply(game, { type: 'MOVE_ATTENTION', from, to })
}

function pulseUntil(game: ResonanceGameState, reached: (candidate: ResonanceGameState) => boolean) {
  let current = game
  for (let pulses = 0; pulses < 500; pulses += 1) {
    if (reached(current)) return current
    current = apply(current, { type: 'PULSE' })
  }
  throw new Error('The reducer did not reach the expected milestone within 500 pulses')
}

function readyFirstPair() {
  let game = move(createInitialGameState(), 'tree', FIRST_PAIR.personalId)
  game = move(game, 'tree', FIRST_PAIR.personalId)
  game = pulseUntil(game, (candidate) => candidate.pairs[FIRST_PAIR.id].globalUnlocked)
  game = move(game, FIRST_PAIR.personalId, FIRST_PAIR.globalId)
  game = move(game, 'tree', FIRST_PAIR.globalId)
  return pulseUntil(game, (candidate) => isPairReady(candidate, FIRST_PAIR.id))
}

test('the first-pair journey guides allocation, growth, stabilization and the next pair', () => {
  let game = createInitialGameState()
  expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'root-home' })

  game = move(game, 'tree', 'root-home')
  expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'root-home' })
  game = move(game, 'tree', 'root-home')
  expect(getJourneyStep(game)).toEqual({ stage: 'awakening', target: 'root-home' })

  game = move(game, 'root-home', 'tree')
  expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'root-home' })
  game = move(game, 'tree', 'root-home')
  game = pulseUntil(game, (candidate) => candidate.pairs[FIRST_PAIR.id].globalUnlocked)
  expect(getJourneyStep(game)).toEqual({ stage: 'connect', target: 'earth' })

  // One transferred stream holds Earth's zero resonance. Guidance must still
  // request the second stream instead of suggesting that waiting creates growth.
  game = move(game, 'root-home', 'earth')
  game = apply(game, { type: 'PULSE' })
  expect(game.resonance.earth).toBe(0)
  expect(getJourneyStep(game)).toEqual({ stage: 'connect', target: 'earth' })
  game = move(game, 'tree', 'earth')
  expect(getJourneyStep(game)).toEqual({ stage: 'awakening', target: 'earth' })

  game = pulseUntil(game, (candidate) => isPairReady(candidate, FIRST_PAIR.id))
  expect(getJourneyStep(game)).toEqual({ stage: 'ready', target: 'root-home' })
  game = apply(game, { type: 'STABILIZE_PAIR', pairId: FIRST_PAIR.id })
  expect(getJourneyStep(game)).toEqual({ stage: 'stabilizing', target: 'root-home' })
  game = pulseUntil(game, (candidate) => candidate.pairs[FIRST_PAIR.id].completedAtPulse !== null)

  expect(game.attention.tree).toBe(TOTAL_ATTENTION)
  expect(getJourneyStep(game, FIRST_PAIR)).toEqual({ stage: 'harmonized', target: 'root-home' })
  expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'creation-temple' })
  expect(game.pairs[NEXT_PAIR.id].support).toBe(1)
})

test('lost personal resonance must regrow before the journey sends attention onward', () => {
  let game = readyFirstPair()
  game = move(game, 'root-home', 'tree')
  expect(getJourneyStep(game)).toEqual({ stage: 'restore', target: 'root-home' })

  game = apply(game, { type: 'PULSE' })
  expect(game.resonance['root-home']).toBeLessThan(ATTUNED_RESONANCE)
  game = move(game, 'tree', 'root-home')
  const reducedResonance = game.resonance['root-home']
  game = apply(game, { type: 'PULSE' })
  expect(game.resonance['root-home']).toBe(reducedResonance)
  expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'root-home' })

  game = move(game, 'tree', 'root-home')
  expect(getJourneyStep(game)).toEqual({ stage: 'awakening', target: 'root-home' })
  game = pulseUntil(game, (candidate) => isPairReady(candidate, FIRST_PAIR.id))
  expect(getJourneyStep(game)).toEqual({ stage: 'ready', target: 'root-home' })
})

for (const place of ['root-home', 'earth'] as const) {
  test(`interrupted stabilization directs recovery to ${place} before claiming progress`, () => {
    let game = readyFirstPair()
    game = move(game, 'earth', 'tree')
    game = apply(game, { type: 'STABILIZE_PAIR', pairId: FIRST_PAIR.id })
    game = apply(game, { type: 'PULSE' })
    const previousCoherence = game.pairs[FIRST_PAIR.id].coherence

    game = move(game, place, 'tree')
    expect(getJourneyStep(game)).toEqual({ stage: 'restore', target: place })
    game = apply(game, { type: 'PULSE' })
    expect(game.pairs[FIRST_PAIR.id].stabilizing).toBe(true)
    expect(game.pairs[FIRST_PAIR.id].coherence).toBeLessThan(previousCoherence)
    expect(isPairReady(game, FIRST_PAIR.id)).toBe(false)

    game = move(game, 'tree', place)
    expect(getJourneyStep(game)).toEqual({
      stage: place === 'root-home' ? 'begin' : 'connect',
      target: place,
    })
    game = move(game, 'tree', place)
    expect(getJourneyStep(game)).toEqual({ stage: 'awakening', target: place })
    game = pulseUntil(game, (candidate) => isPairReady(candidate, FIRST_PAIR.id))

    // Stabilization resumes automatically; the user must not be told to start
    // it again or left waiting with a stream count that cannot repair resonance.
    expect(getJourneyStep(game)).toEqual({ stage: 'stabilizing', target: 'root-home' })
    game = pulseUntil(game, (candidate) => candidate.pairs[FIRST_PAIR.id].completedAtPulse !== null)
    expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'creation-temple' })
  })
}

test('an independently selected pair gets its own guidance without changing the suggested route', () => {
  let game = move(createInitialGameState(), 'tree', NEXT_PAIR.personalId)
  game = move(game, 'tree', NEXT_PAIR.personalId)
  expect(getJourneyStep(game, NEXT_PAIR)).toEqual({
    stage: 'awakening',
    target: 'creation-temple',
  })
  game = pulseUntil(game, (candidate) => candidate.pairs[NEXT_PAIR.id].globalUnlocked)
  expect(getJourneyStep(game, NEXT_PAIR)).toEqual({ stage: 'connect', target: 'creation' })
  expect(getJourneyStep(game)).toEqual({ stage: 'begin', target: 'root-home' })
})

test('an empty Tree borrows elsewhere so the partner keeps its last stream', () => {
  let game = move(createInitialGameState(), 'tree', 'root-home')
  game = move(game, 'tree', 'root-home')
  game = pulseUntil(game, (candidate) => candidate.pairs[FIRST_PAIR.id].globalUnlocked)
  game = move(game, 'root-home', 'earth')
  game = move(game, 'tree', 'creation-temple')
  game = move(game, 'tree', 'creation-temple')
  game = move(game, 'tree', 'solar-ark')
  expect(game.attention).toMatchObject({ tree: 0, 'root-home': 1, earth: 1 })
  expect(getJourneyStep(game)).toEqual({ stage: 'connect', target: 'earth' })

  const source = getAttentionSource(game, 'earth')
  expect(source).toBe('creation-temple')
  if (!source) throw new Error('Expected attention available outside the current pair')
  game = move(game, source, 'earth')
  expect(game.attention).toMatchObject({ tree: 0, 'root-home': 1, earth: 2 })
  expect(getJourneyStep(game)).toEqual({ stage: 'awakening', target: 'earth' })
  game = pulseUntil(game, (candidate) => isPairReady(candidate, FIRST_PAIR.id))
  expect(getJourneyStep(game)).toEqual({ stage: 'ready', target: 'root-home' })
})

test('allocation uses free Tree attention before borrowing a spare partner stream', () => {
  let game = move(createInitialGameState(), 'tree', 'root-home')
  game = move(game, 'tree', 'root-home')
  game = pulseUntil(game, (candidate) => candidate.pairs[FIRST_PAIR.id].globalUnlocked)
  expect(getAttentionSource(game, 'earth')).toBe('tree')

  game = move(game, 'tree', 'earth')
  game = move(game, 'tree', 'creation-temple')
  game = move(game, 'tree', 'creation-temple')
  expect(game.attention).toMatchObject({ tree: 0, 'root-home': 2, earth: 1 })
  const source = getAttentionSource(game, 'earth')
  expect(source).toBe('root-home')
  if (!source) throw new Error('Expected a spare partner stream')
  game = move(game, source, 'earth')
  expect(game.attention).toMatchObject({ 'root-home': 1, earth: 2, 'creation-temple': 2 })
})
