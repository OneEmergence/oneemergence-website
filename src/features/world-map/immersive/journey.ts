import {
  ATTUNED_RESONANCE,
  getPairForPlace,
  isPairReady,
  PLACE_ATTENTION_CAPACITY,
  RESONANCE_PAIRS,
  type AttentionNodeId,
  type ResonanceGameState,
  type ResonancePair,
  type ResonancePlaceId,
} from './game'

/** Keep the partner supplied whenever another stream is available. */
export function getAttentionSource(
  game: ResonanceGameState,
  to: ResonancePlaceId
): AttentionNodeId | undefined {
  if (game.attention.tree > 0) return 'tree'

  const pair = getPairForPlace(to)
  const partner = pair?.personalId === to ? pair.globalId : pair?.personalId
  if (partner && game.attention[partner] > 1) return partner

  const other = RESONANCE_PAIRS.flatMap(({ personalId, globalId }) => [personalId, globalId]).find(
    (id) => id !== to && id !== partner && game.attention[id] > 0
  )
  return other ?? (partner && game.attention[partner] > 0 ? partner : undefined)
}

/** A suggestion, never a restriction: every unlocked place remains explorable. */
export function getJourneyStep(game: ResonanceGameState, selectedPair?: ResonancePair) {
  const pair =
    selectedPair ?? RESONANCE_PAIRS.find(({ id }) => game.pairs[id].completedAtPulse === null)
  if (!pair) return { stage: 'complete', target: 'tree' } as const
  const progress = game.pairs[pair.id]
  if (progress.completedAtPulse !== null)
    return { stage: 'harmonized', target: pair.personalId } as const
  if (isPairReady(game, pair.id)) {
    return {
      stage: progress.stabilizing ? 'stabilizing' : 'ready',
      target: pair.personalId,
    } as const
  }
  if (!progress.globalUnlocked || game.resonance[pair.personalId] < ATTUNED_RESONANCE) {
    return {
      stage: game.attention[pair.personalId] < PLACE_ATTENTION_CAPACITY ? 'begin' : 'awakening',
      target: pair.personalId,
    } as const
  }
  if (game.attention[pair.personalId] === 0) {
    return { stage: 'restore', target: pair.personalId } as const
  }
  if (game.resonance[pair.globalId] < ATTUNED_RESONANCE) {
    return {
      stage: game.attention[pair.globalId] < PLACE_ATTENTION_CAPACITY ? 'connect' : 'awakening',
      target: pair.globalId,
    } as const
  }
  return { stage: 'restore', target: pair.globalId } as const
}
