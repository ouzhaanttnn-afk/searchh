import type { Material } from './types';

/**
 * Every collision is a note. Notes come from a pentatonic scale chosen per
 * level, so any chain sounds musical. Success ends on a major chord, failure
 * on an unresolved one. Everything is synthesised; no sample files.
 */

const PENTATONIC = [0, 2, 4, 7, 9];
const ROOTS = [57, 60, 62, 64, 67]; // A3, C4, D4, E4, G4 (MIDI)

interface Voice {
  type: OscillatorType;
  attack: number;
  decay: number;
  gain: number;
  /** Second partial ratio and level for timbre. */
  partial: number;
  partialGain: number;
  /** Octave offset. */
  octave: number;
}

const VOICES: Record<Material | 'ball', Voice> = {
  wood: { type: 'sine', attack: 0.002, decay: 0.28, gain: 0.5, partial: 2.76, partialGain: 0.25, octave: 0 }, // marimba
  glass: { type: 'sine', attack: 0.002, decay: 0.9, gain: 0.32, partial: 3.01, partialGain: 0.35, octave: 1 }, // bell
  steel: { type: 'triangle', attack: 0.003, decay: 0.5, gain: 0.3, partial: 2.4, partialGain: 0.2, octave: 0 }, // plate
  rubber: { type: 'sine', attack: 0.004, decay: 0.18, gain: 0.45, partial: 2, partialGain: 0.1, octave: -1 }, // pizzicato
  ball: { type: 'sine', attack: 0.002, decay: 0.3, gain: 0.4, partial: 2.5, partialGain: 0.2, octave: 0 },
};

export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private root = 60;
  private noteIndex = 0;
  private lastAt = 0;
  muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem('tp.muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  /** Must be called from a user gesture. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.6;
    this.master.connect(this.ctx.destination);
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try {
      localStorage.setItem('tp.muted', m ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  startLevel(seed: number): void {
    this.root = ROOTS[seed % ROOTS.length] ?? 60;
    this.noteIndex = 0;
  }

  /** Play the next note in the chain for a collision. */
  hit(material: Material | 'ball', speed: number): void {
    if (!this.ctx || !this.master || this.muted) return;
    const now = this.ctx.currentTime;
    if (now - this.lastAt < 0.035) return; // avoid machine-gun clusters
    this.lastAt = now;
    const degree = PENTATONIC[this.noteIndex % PENTATONIC.length] ?? 0;
    const octave = Math.floor(this.noteIndex / PENTATONIC.length) % 2;
    this.noteIndex++;
    const voice = VOICES[material];
    const midi = this.root + degree + 12 * (octave + voice.octave);
    const vel = Math.min(1, 0.35 + speed / 10);
    this.tone(midi, voice, vel, now);
  }

  success(): void {
    if (!this.ctx || !this.master || this.muted) return;
    const now = this.ctx.currentTime;
    const chord = [0, 4, 7, 12];
    chord.forEach((iv, i) => this.tone(this.root + iv, VOICES.glass, 0.7, now + i * 0.06, 1.6));
  }

  fail(): void {
    if (!this.ctx || !this.master || this.muted) return;
    const now = this.ctx.currentTime;
    // Unresolved: root + minor second + tritone.
    [0, 1, 6].forEach((iv, i) => this.tone(this.root + iv - 12, VOICES.wood, 0.5, now + i * 0.05, 0.6));
  }

  tap(): void {
    if (!this.ctx || !this.master || this.muted) return;
    this.tone(this.root + 24, VOICES.rubber, 0.3, this.ctx.currentTime, 0.08);
  }

  private tone(midi: number, v: Voice, vel: number, at: number, decayOverride?: number): void {
    if (!this.ctx || !this.master) return;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const decay = decayOverride ?? v.decay;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(v.gain * vel, at + v.attack);
    g.gain.exponentialRampToValueAtTime(0.0008, at + v.attack + decay);
    g.connect(this.master);

    const o1 = this.ctx.createOscillator();
    o1.type = v.type;
    o1.frequency.value = f;
    o1.connect(g);
    o1.start(at);
    o1.stop(at + v.attack + decay + 0.05);

    const g2 = this.ctx.createGain();
    g2.gain.value = v.partialGain;
    g2.connect(g);
    const o2 = this.ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = f * v.partial;
    o2.connect(g2);
    o2.start(at);
    o2.stop(at + v.attack + decay * 0.5 + 0.05);
  }
}
