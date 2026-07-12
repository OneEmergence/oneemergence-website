'use client'

import { useEffect } from 'react'
import { useIntensityStore, type IntensityMode } from '@/stores/intensity'
import { usePreferencesStore } from '@/stores/preferences'

interface WorkspacePreferencesHydratorProps {
  workspaceId: string
  intensityMode: IntensityMode
  audioEnabled: boolean
  focusThemes: string[]
  onboardingCompleted: boolean
}

export function WorkspacePreferencesHydrator({
  workspaceId,
  intensityMode,
  audioEnabled,
  focusThemes,
  onboardingCompleted,
}: WorkspacePreferencesHydratorProps) {
  const setMode = useIntensityStore((state) => state.setMode)
  const hydrateFromServer = usePreferencesStore((state) => state.hydrateFromServer)

  useEffect(() => {
    if (!workspaceId) return
    setMode(intensityMode)
    hydrateFromServer({
      intensityMode,
      audioEnabled,
      focusThemes,
      onboardingCompleted,
    })
  }, [
    workspaceId,
    intensityMode,
    audioEnabled,
    focusThemes,
    onboardingCompleted,
    setMode,
    hydrateFromServer,
  ])

  return null
}
