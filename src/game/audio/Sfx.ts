/**
 * Lightweight procedural SFX — a few short hits, no music, no spam.
 * Uses Web Audio so we don't need asset files.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private readonly master = 0.22;

  /** Call once from a user gesture (or anytime; safe to repeat). */
  unlock(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    this.unlocked = true;
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    freqEnd?: number,
  ): void {
    const ctx = this.ensureCtx();
    if (!ctx || !this.unlocked) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, freqEnd),
        t0 + dur,
      );
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(this.master * gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noiseBurst(dur: number, gain: number, filterFreq: number): void {
    const ctx = this.ensureCtx();
    if (!ctx || !this.unlocked) return;
    const t0 = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.master * gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /** Short metal whoosh when an attack fires. */
  swing(): void {
    this.noiseBurst(0.08, 0.35, 1800);
    this.tone(420, 0.07, 'square', 0.12, 180);
  }

  /** Impact clang on a successful hit. */
  hit(critical = false): void {
    this.noiseBurst(0.06, critical ? 0.45 : 0.32, critical ? 2400 : 1400);
    this.tone(critical ? 220 : 160, 0.1, 'triangle', critical ? 0.28 : 0.2, 70);
  }

  /** Soft cue when the match goes LIVE / FIGHT. */
  fight(): void {
    this.tone(520, 0.08, 'square', 0.14);
    this.tone(780, 0.12, 'square', 0.12);
  }

  /** Brief win / loss sting. */
  end(won: boolean): void {
    if (won) {
      this.tone(440, 0.1, 'triangle', 0.16);
      this.tone(660, 0.16, 'triangle', 0.14);
    } else {
      this.tone(280, 0.14, 'sawtooth', 0.12, 120);
    }
  }
}

export const sfx = new Sfx();
