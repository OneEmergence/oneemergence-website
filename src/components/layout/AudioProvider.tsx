"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface AudioContextValue {
  isPlaying: boolean;
  toggle: () => void;
}

const AudioCtx = createContext<AudioContextValue>({
  isPlaying: false,
  toggle: () => {},
});

export function useAudio() {
  return useContext(AudioCtx);
}

interface AudioNodes {
  ctx: AudioContext;
  masterGain: GainNode;
  lfo: OscillatorNode;
  oscillators: OscillatorNode[];
}

function buildDrone(ctx: AudioContext): AudioNodes {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // LFO for slow breathing / wumming (0.07 Hz ≈ 14 s cycle)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
  lfoGain.gain.setValueAtTime(0.018, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();

  // Partials: A1 root + perfect fifth + octave, each slightly detuned for warmth
  const partials: Array<{ freq: number; detune: number; gain: number }> = [
    { freq: 55, detune: 0, gain: 0.55 },   // A1 – deep root
    { freq: 55, detune: 4, gain: 0.3 },    // A1 detuned +4 ¢ for beating
    { freq: 82.5, detune: 0, gain: 0.25 }, // E2 – sacred fifth
    { freq: 110, detune: -3, gain: 0.18 }, // A2 – octave, slightly flat
    { freq: 165, detune: 2, gain: 0.09 },  // E3 – upper fifth, whisper
  ];

  const oscillators = partials.map(({ freq, detune, gain: g }) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.detune.setValueAtTime(detune, ctx.currentTime);
    oscGain.gain.setValueAtTime(g, ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    return osc;
  });

  return { ctx, masterGain, lfo, oscillators };
}

const FADE_TIME = 3.5; // seconds for fade in/out

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const nodesRef = useRef<AudioNodes | null>(null);

  const toggle = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;

      if (next) {
        // Build drone lazily on first activation (browser autoplay policy)
        if (!nodesRef.current) {
          const ctx = new AudioContext();
          nodesRef.current = buildDrone(ctx);
        } else if (nodesRef.current.ctx.state === "suspended") {
          nodesRef.current.ctx.resume();
        }

        const { masterGain, ctx } = nodesRef.current;
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.06, now + FADE_TIME);
      } else {
        if (!nodesRef.current) return false;
        const { masterGain, ctx } = nodesRef.current;
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + FADE_TIME);
      }

      return next;
    });
  }, []);

  return (
    <AudioCtx.Provider value={{ isPlaying, toggle }}>
      {children}
    </AudioCtx.Provider>
  );
}
