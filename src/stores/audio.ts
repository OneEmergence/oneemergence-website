'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SOUNDSCAPES = [
  'rain',
  'forest',
  'ocean',
  'singing-bowl',
  'silence',
] as const

export type Soundscape = (typeof SOUNDSCAPES)[number]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AudioState {
  /** Ob gerade Audio abgespielt wird */
  isPlaying: boolean
  /** Lautstärke zwischen 0 und 1 */
  volume: number
  /** Aktuell gewählte Klanglandschaft */
  currentSoundscape: Soundscape | null
}

interface AudioActions {
  /** Wiedergabe starten */
  play: () => void
  /** Wiedergabe pausieren */
  pause: () => void
  /** Wiedergabe umschalten */
  toggle: () => void
  /** Lautstärke setzen (wird auf 0–1 begrenzt) */
  setVolume: (v: number) => void
  /** Klanglandschaft wechseln */
  setSoundscape: (name: Soundscape | null) => void
}

type AudioStore = AudioState & AudioActions

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      isPlaying: false,
      volume: 0.5,
      currentSoundscape: null,

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),

      setSoundscape: (name) =>
        set({ currentSoundscape: name, isPlaying: name !== null }),
    }),
    {
      name: 'oe-audio-state',
      partialize: (state) => ({ volume: state.volume }),
    }
  )
)
