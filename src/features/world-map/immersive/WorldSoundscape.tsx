'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX, Waves } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAudioStore } from '@/stores/audio'

export type WorldSoundscapeLabels = {
  controls: string
  start: string
  pause: string
  resume: string
  mute: string
  unmute: string
  volume: string
  unavailable: string
}

type AudioEngine = {
  context: AudioContext
  master: GainNode
  sources: AudioScheduledSourceNode[]
}

type WorldSoundscapeProps = {
  labels: WorldSoundscapeLabels
  className?: string
}

const MAX_GAIN = 0.32

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate)
  const samples = buffer.getChannelData(0)
  let seed = 0x9e3779b9

  for (let index = 0; index < samples.length; index += 1) {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    samples[index] = ((seed >>> 0) / 0xffffffff) * 2 - 1
  }

  return buffer
}

function createEngine(): AudioEngine {
  if (!window.AudioContext) throw new Error('Web Audio is unavailable')

  const context = new AudioContext()
  const master = context.createGain()
  const toneFilter = context.createBiquadFilter()
  const toneGain = context.createGain()
  const noiseFilter = context.createBiquadFilter()
  const noiseGain = context.createGain()
  const lowTone = context.createOscillator()
  const highTone = context.createOscillator()
  const noise = context.createBufferSource()

  master.gain.value = 0
  master.connect(context.destination)

  toneFilter.type = 'lowpass'
  toneFilter.frequency.value = 220
  toneFilter.Q.value = 0.5
  toneGain.gain.value = 0.025
  toneFilter.connect(toneGain).connect(master)

  lowTone.type = 'sine'
  lowTone.frequency.value = 55
  lowTone.detune.value = -4
  highTone.type = 'sine'
  highTone.frequency.value = 82.5
  highTone.detune.value = 3
  lowTone.connect(toneFilter)
  highTone.connect(toneFilter)

  noise.buffer = createNoiseBuffer(context)
  noise.loop = true
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 680
  noiseFilter.Q.value = 0.35
  noiseGain.gain.value = 0.012
  noise.connect(noiseFilter).connect(noiseGain).connect(master)

  lowTone.start()
  highTone.start()
  noise.start()

  return { context, master, sources: [lowTone, highTone, noise] }
}

function setEngineGain(engine: AudioEngine, volume: number, audible: boolean) {
  const now = engine.context.currentTime
  const gain = engine.master.gain

  gain.cancelScheduledValues(now)
  gain.setValueAtTime(gain.value, now)
  gain.linearRampToValueAtTime(audible ? volume * MAX_GAIN : 0, now + 0.14)
}

function closeEngine(engine: AudioEngine) {
  for (const source of engine.sources) {
    try {
      source.stop()
    } catch {
      // A source can already be stopped while its context is closing.
    }
    source.disconnect()
  }
  engine.master.disconnect()

  if (engine.context.state !== 'closed') {
    void engine.context.close().catch(() => undefined)
  }
}

export function WorldSoundscape({ labels, className }: WorldSoundscapeProps) {
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const volume = useAudioStore((state) => state.volume)
  const play = useAudioStore((state) => state.play)
  const pause = useAudioStore((state) => state.pause)
  const setVolume = useAudioStore((state) => state.setVolume)
  const [activated, setActivated] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const engineRef = useRef<AudioEngine | null>(null)
  const pauseTimerRef = useRef<number | null>(null)
  const lastAudibleVolumeRef = useRef(volume || 0.5)
  const volumeId = useId()
  const muted = volume === 0

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || engine.context.state === 'closed') return

    setEngineGain(engine, volume, isPlaying && engine.context.state === 'running')
  }, [isPlaying, volume])

  useEffect(() => {
    const handleVisibility = () => {
      const engine = engineRef.current
      if (!engine || engine.context.state === 'closed') return

      if (document.hidden) {
        setEngineGain(engine, volume, false)
        void engine.context.suspend()
        return
      }

      if (useAudioStore.getState().isPlaying) {
        void engine.context
          .resume()
          .then(() => setEngineGain(engine, volume, true))
          .catch(() => undefined)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [volume])

  useEffect(
    () => () => {
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current)
      }
      if (engineRef.current) closeEngine(engineRef.current)
      pause()
    },
    [pause]
  )

  const clearPauseTimer = () => {
    if (pauseTimerRef.current === null) return
    window.clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = null
  }

  const startOrResume = async () => {
    setIsStarting(true)
    clearPauseTimer()

    try {
      const engine = engineRef.current ?? createEngine()
      engineRef.current = engine
      setActivated(true)

      if (engine.context.state === 'suspended') {
        await engine.context.resume()
      }

      setEngineGain(engine, volume, true)
      setUnavailable(false)
      play()
    } catch {
      if (engineRef.current) closeEngine(engineRef.current)
      engineRef.current = null
      setActivated(false)
      setUnavailable(true)
      pause()
    } finally {
      setIsStarting(false)
    }
  }

  const togglePlayback = () => {
    const engine = engineRef.current

    if (!activated || !engine || !isPlaying) {
      void startOrResume()
      return
    }

    setEngineGain(engine, volume, false)
    pause()
    clearPauseTimer()
    pauseTimerRef.current = window.setTimeout(() => {
      if (!useAudioStore.getState().isPlaying && engine.context.state === 'running') {
        void engine.context.suspend()
      }
    }, 160)
  }

  const toggleMute = () => {
    if (muted) {
      setVolume(lastAudibleVolumeRef.current)
      return
    }

    lastAudibleVolumeRef.current = volume
    setVolume(0)
  }

  return (
    <div
      data-world-soundscape={!activated ? 'idle' : isPlaying ? 'playing' : 'paused'}
      className={cn('flex max-w-full flex-col items-end gap-1.5', className)}
    >
      <div
        role="group"
        aria-label={labels.controls}
        className="inline-flex max-w-full items-center gap-1 rounded-xl border border-oe-pure-light/10 bg-oe-deep-space/90 p-1"
      >
        <button
          type="button"
          data-motion-level="micro"
          aria-label={activated ? (isPlaying ? labels.pause : labels.resume) : labels.start}
          title={activated ? (isPlaying ? labels.pause : labels.resume) : labels.start}
          disabled={isStarting}
          onClick={togglePlayback}
          className={cn(
            'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan disabled:cursor-wait disabled:opacity-45',
            activated && isPlaying
              ? 'bg-oe-spirit-cyan/10 text-oe-spirit-cyan'
              : 'text-oe-pure-light/75 hover:bg-oe-pure-light/[0.06] hover:text-oe-pure-light'
          )}
        >
          {activated ? (
            isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )
          ) : (
            <Waves className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {activated ? (isPlaying ? labels.pause : labels.resume) : labels.start}
          </span>
        </button>

        {activated ? (
          <button
            type="button"
            data-motion-level="micro"
            aria-label={muted ? labels.unmute : labels.mute}
            title={muted ? labels.unmute : labels.mute}
            onClick={toggleMute}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-oe-pure-light/65 transition-colors hover:bg-oe-pure-light/[0.06] hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : null}

        <label htmlFor={volumeId} className="sr-only">
          {labels.volume}
        </label>
        <input
          id={volumeId}
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-valuetext={`${Math.round(volume * 100)}%`}
          onChange={(event) => {
            const nextVolume = event.currentTarget.valueAsNumber
            if (nextVolume > 0) lastAudibleVolumeRef.current = nextVolume
            setVolume(nextVolume)
          }}
          className="h-11 w-20 cursor-pointer accent-oe-spirit-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan sm:w-24"
        />
      </div>

      {unavailable ? (
        <p role="status" className="max-w-64 text-right text-xs leading-5 text-oe-pure-light/70">
          {labels.unavailable}
        </p>
      ) : null}
    </div>
  )
}
