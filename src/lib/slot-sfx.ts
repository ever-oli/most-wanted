// ============= Slot machine SFX + haptics =============
// Tiny Web Audio synth for the One-Armed Bandit. NO binary audio assets — every
// sound is generated from oscillators + noise + gain envelopes so the bundle
// stays lean and nothing has to be fetched.
//
// Hard rules baked in here:
//  - Default state is MUTED, persisted in localStorage (key `mw-sfx`). Nothing
//    can ever autoplay: every SFX is a no-op while muted.
//  - The AudioContext is created lazily, only once the user un-mutes or triggers
//    a sound after a real gesture (satisfies browser autoplay policies).
//  - Every function degrades to a silent no-op if Web Audio is unavailable.

const STORAGE_KEY = "mw-sfx";

type AudioContextCtor = typeof AudioContext;
type Listener = (muted: boolean) => void;

let muted = true;
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const listeners = new Set<Listener>();

function readStored(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "on") return false; // sound explicitly enabled
    if (v === "off") return true; // sound explicitly disabled
  } catch {
    /* localStorage may be unavailable (private mode) */
  }
  return true; // default: muted, so nothing autoplays
}

muted = readStored();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "off" : "on");
  } catch {
    /* ignore persistence failures */
  }
  // Un-muting happens inside a click handler — a valid gesture to spin up audio.
  if (!next) {
    const ac = ensureCtx();
    if (ac && ac.state === "suspended") void ac.resume();
  }
  listeners.forEach((l) => l(muted));
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

/** Subscribe to mute-state changes. Returns an unsubscribe fn. */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

function master(ac: AudioContext): GainNode {
  if (masterGain && masterGain.context === ac) return masterGain;
  const g = ac.createGain();
  g.gain.value = 0.5;
  g.connect(ac.destination);
  masterGain = g;
  return g;
}

/** Returns a live, resumed context only when sound is allowed. */
function active(): AudioContext | null {
  if (muted) return null;
  const ac = ensureCtx();
  if (!ac) return null;
  if (ac.state === "suspended") void ac.resume();
  return ac;
}

interface ToneOpts {
  type: OscillatorType;
  freq: number;
  freqEnd?: number;
  t0: number;
  dur: number;
  peak: number;
}

function tone(ac: AudioContext, { type, freq, freqEnd, t0, dur, peak }: ToneOpts): void {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
  }
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.012, dur * 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master(ac));
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function noise(
  ac: AudioContext,
  t0: number,
  dur: number,
  peak: number,
  filterType: BiquadFilterType,
  filterFreq: number,
): void {
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  const g = ac.createGain();
  g.gain.setValueAtTime(peak, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master(ac));
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** Mechanical "chk-chunk" — two quick clicks plus a low seat. */
export function leverPull(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  noise(ac, t, 0.035, 0.5, "highpass", 1600); // chk
  noise(ac, t + 0.07, 0.06, 0.45, "bandpass", 900); // chunk
  tone(ac, { type: "triangle", freq: 150, freqEnd: 60, t0: t + 0.07, dur: 0.12, peak: 0.28 });
}

/** Low "thunk" as a reel snaps home. */
export function reelStop(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  tone(ac, { type: "triangle", freq: 190, freqEnd: 72, t0: t, dur: 0.16, peak: 0.4 });
  noise(ac, t, 0.04, 0.22, "lowpass", 400);
}

/** Bright triumphant western sting — a quick ascending arpeggio with shimmer. */
export function jackpotSting(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  // G major-ish climb: G4, B4, D5, G5
  const notes = [392, 493.88, 587.33, 783.99];
  notes.forEach((f, i) => {
    tone(ac, { type: "sawtooth", freq: f, t0: t + i * 0.085, dur: 0.32, peak: 0.16 });
    tone(ac, { type: "triangle", freq: f * 2, t0: t + i * 0.085, dur: 0.22, peak: 0.07 });
  });
  // Final shimmer on top.
  tone(ac, { type: "sine", freq: 1567.98, t0: t + 0.34, dur: 0.5, peak: 0.12 });
}

/** Tiny coin "ting" — for an optional haul count-up. */
export function tallyTick(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  tone(ac, { type: "sine", freq: 1760, t0: t, dur: 0.08, peak: 0.16 });
  tone(ac, { type: "sine", freq: 2640, t0: t, dur: 0.05, peak: 0.06 });
}

/** Alias kept for readability at call sites. */
export const coinTally = tallyTick;

/** Soft glassy "clink" as a jar settles into the loot tray. */
export function jarDrop(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  tone(ac, { type: "sine", freq: 880, freqEnd: 760, t0: t, dur: 0.09, peak: 0.13 });
  tone(ac, { type: "sine", freq: 1320, t0: t + 0.005, dur: 0.12, peak: 0.09 });
  noise(ac, t, 0.02, 0.1, "highpass", 3200);
}

/** Wooden saloon-door swing — a low body thunk with a short creak. */
export function doorOpen(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  tone(ac, { type: "triangle", freq: 120, freqEnd: 78, t0: t, dur: 0.18, peak: 0.22 });
  noise(ac, t + 0.02, 0.18, 0.1, "bandpass", 1100);
  tone(ac, { type: "triangle", freq: 96, freqEnd: 66, t0: t + 0.14, dur: 0.16, peak: 0.18 });
}

/** Metallic "shing" for the free Duel re-roll — a quick rise then fall. */
export function duel(): void {
  const ac = active();
  if (!ac) return;
  const t = ac.currentTime;
  tone(ac, { type: "sawtooth", freq: 520, freqEnd: 1400, t0: t, dur: 0.12, peak: 0.11 });
  tone(ac, { type: "sawtooth", freq: 1400, freqEnd: 720, t0: t + 0.12, dur: 0.14, peak: 0.09 });
  noise(ac, t, 0.06, 0.13, "highpass", 2600);
}

// ---- Optional soft reel whir (looping filtered noise) ----
let whir: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

export function startWhir(): void {
  const ac = active();
  if (!ac || whir) return;
  const len = Math.floor(ac.sampleRate * 1);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 620;
  filter.Q.value = 0.6;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.09, ac.currentTime + 0.12);
  src.connect(filter).connect(g).connect(master(ac));
  src.start();
  whir = { src, gain: g };
}

export function stopWhir(): void {
  if (!whir || !ctx) {
    whir = null;
    return;
  }
  const { src, gain } = whir;
  const t = ctx.currentTime;
  try {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.stop(t + 0.16);
  } catch {
    /* node may already be stopped */
  }
  whir = null;
}

/** Haptics — gated on the same mute toggle, feature-detected, no-op otherwise. */
export function vibrate(pattern: number | number[]): void {
  if (muted) return;
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(pattern);
  } catch {
    /* some browsers throw if called without a gesture — ignore */
  }
}
