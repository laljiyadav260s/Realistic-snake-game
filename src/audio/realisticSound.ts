/**
 * Procedural Web Audio API sound generator for realistic snake sounds:
 * - Air hiss through fangs
 * - Substrate slithering rustle
 * - Rattlesnake tail buzz
 * - Prey squeaks and swallow gulps
 */

class RealisticAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    try {
      this.isMuted = localStorage.getItem('realistic_snake_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.buildNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private buildNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('realistic_snake_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  /**
   * Realistic Snake Hiss (bandpass filtered white noise)
   */
  public playHiss(intensity = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(3.5, now);

      const gain = this.ctx.createGain();
      const peakVol = Math.min(0.25, 0.15 * intensity);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.4);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Rattlesnake tail buzz (rapid percussive clicks)
   */
  public playRattle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.28;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      // Highpass to isolate dry shaker frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4500, now);

      // Tremolo/LFO effect for rattling bead vibration
      const tremolo = this.ctx.createGain();
      const tremOsc = this.ctx.createOscillator();
      tremOsc.frequency.setValueAtTime(36, now); // 36 Hz rattle frequency
      tremOsc.connect(tremolo.gain);

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(tremolo);
      tremolo.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      tremOsc.start(now);
      noise.start(now);
      noise.stop(now + duration);
      tremOsc.stop(now + duration);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Realistic slithering rustle in dry leaves or soil
   */
  public playSlitherRustle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.14);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Field mouse squeak when surprised/captured
   */
  public playMouseSqueak() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(3800, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(1900, now + 0.09);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Organic swallow / gulp sound as prey is digested
   */
  public playSwallow() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Strike thud when head strikes prey
   */
  public playStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio playback failed silently
    }
  }
}

export const realisticSound = new RealisticAudioController();
