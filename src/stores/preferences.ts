'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { IntensityMode } from './intensity'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserPreferences {
  /** Bevorzugter Intensitätsmodus (wird auch in intensity.ts verwaltet) */
  intensityMode: IntensityMode
  /** Ob Ambient-Audio standardmäßig aktiviert ist */
  audioEnabled: boolean
  /** Vom Nutzer gewählte Fokus-Themen */
  focusThemes: string[]
  /** Ob das Onboarding abgeschlossen wurde */
  onboardingCompleted: boolean
}

interface PreferencesState {
  /** Aktuelle Nutzer-Einstellungen */
  preferences: UserPreferences
  /** Ob der Store bereits aus localStorage/Server hydriert wurde */
  hydrated: boolean
  /** Einzelne Einstellung setzen */
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void
  /** Mehrere Einstellungen gleichzeitig setzen */
  setPreferences: (partial: Partial<UserPreferences>) => void
  /** Einstellungen vom Server übernehmen (nach Login / Seitenaufruf) */
  hydrateFromServer: (prefs: Partial<UserPreferences>) => void
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultPreferences: UserPreferences = {
  intensityMode: 'balanced',
  audioEnabled: false,
  focusThemes: [],
  onboardingCompleted: false,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: { ...defaultPreferences },
      hydrated: false,

      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      setPreferences: (partial) =>
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        })),

      hydrateFromServer: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
          hydrated: true,
        })),
    }),
    {
      name: 'oe-user-preferences',
      partialize: (state) => ({ preferences: state.preferences }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true
        }
      },
    }
  )
)
