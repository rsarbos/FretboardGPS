/**
 * Web Audio Engine for Guitar Tone Synthesis & Real-Time Blues Backing Tracks
 */

import { ChordProgressionStep } from './guitarTheory';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private guitarGain: GainNode | null = null;
  private backingGain: GainNode | null = null;

  // Backing track state
  private isPlayingBacking = false;
  private bpm = 100;
  private timerId: number | null = null;
  private nextBeatTime = 0;
  private currentBar = 1;
  private currentBeat = 1; // 1-4
  private bars: ChordProgressionStep[] = [];
  private onBeatCallback: ((bar: number, beat: number, chord: ChordProgressionStep) => void) | null = null;

  // Swing factor for authentic blues shuffle (0.66 = triplet swing)
  private swingFactor = 0.66;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Guitar solo track gain
      this.guitarGain = this.ctx.createGain();
      this.guitarGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.guitarGain.connect(this.masterGain);

      // Backing track gain
      this.backingGain = this.ctx.createGain();
      this.backingGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.backingGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setBackingVolume(val: number) {
    if (this.backingGain && this.ctx) {
      this.backingGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setGuitarVolume(val: number) {
    if (this.guitarGain && this.ctx) {
      this.guitarGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Synthesize a warm, plucked electric guitar tone with tube richness, pick attack, and vibrato/bend
   */
  public playGuitarNote(
    freq: number,
    duration = 1.2,
    velocity = 0.8,
    technique?: 'pick' | 'bend1/2' | 'bendFull' | 'vibrato' | 'slide' | 'resolve'
  ) {
    this.initContext();
    if (!this.ctx || !this.guitarGain) return;

    const t = this.ctx.currentTime;
    const dur = Math.max(0.3, duration);

    // Oscillator 1: Fundamental wave (slightly clipped triangle for woody magnetic pickup tone)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    // Oscillator 2: Overtone (sawtooth for metallic string brightness)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, t);

    // Filter to model guitar pickup + tube amp cabinet resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    // Frequency rolls off naturally like a vintage 12" Celestion speaker
    const cutoff = Math.min(4200, freq * 4.5 + 800);
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(300, cutoff * 0.35), t + dur);
    filter.Q.setValueAtTime(2.2, t);

    // Amp Gain Envelope (fast percussive pluck attack + natural exponential decay)
    const ampGain = this.ctx.createGain();
    ampGain.gain.setValueAtTime(0.0001, t);
    ampGain.gain.linearRampToValueAtTime(velocity * 0.85, t + 0.008); // snappy attack
    ampGain.gain.exponentialRampToValueAtTime(velocity * 0.45, t + 0.12);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    // Technique Handling (Bends & Vibrato)
    if (technique === 'bendFull') {
      // 1 whole step up (+2 semitones)
      const targetFreq = freq * Math.pow(2, 2 / 12);
      osc1.frequency.setValueAtTime(freq, t);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.35);
      osc2.frequency.setValueAtTime(freq, t);
      osc2.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.35);
    } else if (technique === 'bend1/2') {
      // Half-step bend (+1 semitone)
      const targetFreq = freq * Math.pow(2, 1 / 12);
      osc1.frequency.setValueAtTime(freq, t);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.3);
      osc2.frequency.setValueAtTime(freq, t);
      osc2.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.3);
    } else if (technique === 'vibrato') {
      // LFO for butterfly vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.8, t); // classic BB King 5.8 Hz flutter
      lfoGain.gain.setValueAtTime(0, t);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.035, t + 0.25);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);
      lfo.start(t);
      lfo.stop(t + dur);
    } else if (technique === 'slide') {
      // Short upward scoop
      const startFreq = freq * Math.pow(2, -1 / 12);
      osc1.frequency.setValueAtTime(startFreq, t);
      osc1.frequency.exponentialRampToValueAtTime(freq, t + 0.09);
      osc2.frequency.setValueAtTime(startFreq, t);
      osc2.frequency.exponentialRampToValueAtTime(freq, t + 0.09);
    }

    // Connect nodes
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(ampGain);
    ampGain.connect(this.guitarGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur);
    osc2.stop(t + dur);
  }

  /**
   * Play multiple notes at once (triad voicing)
   */
  public playTriadNotes(frequencies: number[], duration = 1.6) {
    frequencies.forEach((freq, idx) => {
      // Stagger slightly like a thumb/pick brush strum
      setTimeout(() => {
        this.playGuitarNote(freq, duration, 0.7);
      }, idx * 28);
    });
  }

  /**
   * Strum a full guitar chord voicing for the active key chord
   */
  public strumGuitarChord(
    rootIndex: number,
    quality: 'dom7' | 'min7' | '9th' | '7#9' | '13th' | 'dim7' | 'major7' = 'dom7'
  ) {
    this.initContext();
    // Base root note in low E/A string register (Midi 40 = E2, 45 = A2)
    const baseOctaveMidi = 40 + ((rootIndex - 4 + 12) % 12);

    let intervals: number[];
    switch (quality) {
      case '9th':
        // Root 5 9th grip: Root, 3rd, b7, 9th, 5th
        intervals = [0, 4, 10, 14, 19];
        break;
      case '7#9':
        // Hendrix Purple chord: Root, 3rd, b7, #9
        intervals = [0, 4, 10, 15, 19];
        break;
      case '13th':
        // 13th swing/jazz chord: Root, b7, 9th, 13th (21)
        intervals = [0, 10, 14, 21, 28];
        break;
      case 'dim7':
        // Passing diminished: Root, b5, bb7, b3
        intervals = [0, 6, 9, 15];
        break;
      case 'min7':
        intervals = [0, 7, 10, 15, 19];
        break;
      case 'major7':
        intervals = [0, 7, 11, 16, 19];
        break;
      case 'dom7':
      default:
        intervals = [0, 7, 10, 16, 19];
        break;
    }

    const freqs = intervals.map((interval) => {
      const midi = baseOctaveMidi + interval;
      return 440 * Math.pow(2, (midi - 69) / 12);
    });

    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playGuitarNote(f, 2.2, 0.72);
      }, idx * 32);
    });
  }

  // Backing track Drum & Bass Synthesizers
  private playKick(time: number) {
    if (!this.ctx || !this.backingGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.backingGain) return;

    // 1. Noise component (snare wires)
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(900, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.backingGain);

    noise.start(time);
    noise.stop(time + 0.18);

    // 2. Tonal shell pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  private playHiHat(time: number, isAccent = false) {
    if (!this.ctx || !this.backingGain) return;

    const bufferSize = this.ctx.sampleRate * (isAccent ? 0.08 : 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.28 : 0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isAccent ? 0.07 : 0.035));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.backingGain);

    noise.start(time);
    noise.stop(time + (isAccent ? 0.08 : 0.04));
  }

  private playBassNote(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.backingGain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.65, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playCompingChord(frequencies: number[], time: number, duration = 0.22) {
    if (!this.ctx || !this.backingGain) return;

    frequencies.forEach((f) => {
      if (!this.ctx || !this.backingGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine'; // warm Rhodes / organ timbre
      osc.frequency.setValueAtTime(f, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.backingGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  /**
   * Schedule the next beat of drums, walking bass, and comping
   */
  private scheduleBeat(time: number, barIdx: number, beatIdx: number) {
    const chord = this.bars[barIdx - 1];
    if (!chord) return;

    const secondsPerBeat = 60 / this.bpm;
    const rootNote = chord.rootIndex;
    // Calculate MIDI note for bass around octave 1 or 2
    const baseBassFreq = 440 * Math.pow(2, ((chord.rootIndex + 24) - 69) / 12);

    // 1. Drums
    if (beatIdx === 1) {
      this.playKick(time);
    } else if (beatIdx === 2) {
      this.playSnare(time);
    } else if (beatIdx === 3) {
      this.playKick(time);
      // Double kick syncopation on upbeat of 3
      this.playKick(time + secondsPerBeat * this.swingFactor);
    } else if (beatIdx === 4) {
      this.playSnare(time);
    }

    // Hi-hat shuffle (beat + swing upbeat)
    this.playHiHat(time, beatIdx === 2 || beatIdx === 4);
    this.playHiHat(time + secondsPerBeat * this.swingFactor, false);

    // 2. Walking Bass Line (12-bar shuffle pattern: Root -> 3rd -> 5th -> 6th / b7)
    let bassSemitone = 0;
    const isMinor = chord.triadType === 'min7' || chord.triadType === 'minor';
    const thirdDelta = isMinor ? 3 : 4;

    switch (beatIdx) {
      case 1:
        bassSemitone = 0; // Root
        break;
      case 2:
        bassSemitone = thirdDelta; // 3rd
        break;
      case 3:
        bassSemitone = 7; // 5th
        break;
      case 4:
        bassSemitone = isMinor ? 10 : 9; // 6th or b7
        break;
    }
    const bassNoteMidi = rootNote + 24 + bassSemitone;
    const bassFreq = 440 * Math.pow(2, (bassNoteMidi - 69) / 12);
    this.playBassNote(bassFreq, time, secondsPerBeat * 0.85);

    // 3. Rhythm Comping (syncopated chops on "2-and" and "4-and")
    if (beatIdx === 2 || beatIdx === 4) {
      // Build 9th / 7th chord voicings
      const chord3rd = (rootNote + thirdDelta) % 12;
      const chord7th = (rootNote + 10) % 12;
      const chord9th = (rootNote + 2) % 12;

      const getMidFreq = (semi: number, oct = 4) => 440 * Math.pow(2, (semi + 12 * oct - 69) / 12);
      const chordFreqs = [
        getMidFreq(chord3rd, 3),
        getMidFreq(chord7th, 3),
        getMidFreq(chord9th, 4),
      ];
      // Comp on the swing upbeat
      this.playCompingChord(chordFreqs, time + secondsPerBeat * (this.swingFactor * 0.5), secondsPerBeat * 0.4);
    }
  }

  private runScheduler = () => {
    if (!this.isPlayingBacking || !this.ctx) return;

    const secondsPerBeat = 60 / this.bpm;
    const lookahead = 0.12; // 120ms lookahead

    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      this.scheduleBeat(this.nextBeatTime, this.currentBar, this.currentBeat);

      // Notify React UI of bar/beat
      if (this.onBeatCallback) {
        const chord = this.bars[this.currentBar - 1];
        const bar = this.currentBar;
        const beat = this.currentBeat;
        // Schedule notification synchronized with audio time
        const delayMs = Math.max(0, (this.nextBeatTime - this.ctx.currentTime) * 1000);
        setTimeout(() => {
          if (this.isPlayingBacking && this.onBeatCallback) {
            this.onBeatCallback(bar, beat, chord);
          }
        }, delayMs);
      }

      // Advance beat
      this.nextBeatTime += secondsPerBeat;
      this.currentBeat += 1;
      if (this.currentBeat > 4) {
        this.currentBeat = 1;
        this.currentBar += 1;
        if (this.currentBar > this.bars.length) {
          this.currentBar = 1; // loop back to bar 1
        }
      }
    }

    this.timerId = window.setTimeout(this.runScheduler, 25);
  };

  public startBackingTrack(
    bars: ChordProgressionStep[],
    bpm: number,
    onBeat: (bar: number, beat: number, chord: ChordProgressionStep) => void
  ) {
    this.initContext();
    if (!this.ctx) return;

    this.stopBackingTrack();
    this.bars = bars;
    this.bpm = bpm;
    this.onBeatCallback = onBeat;
    this.isPlayingBacking = true;
    this.currentBar = 1;
    this.currentBeat = 1;
    this.nextBeatTime = this.ctx.currentTime + 0.05;

    this.runScheduler();
  }

  public stopBackingTrack() {
    this.isPlayingBacking = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(40, Math.min(220, newBpm));
  }

  public updateBars(bars: ChordProgressionStep[]) {
    this.bars = bars;
  }

  public getIsPlaying(): boolean {
    return this.isPlayingBacking;
  }
}

export const audioEngine = new AudioEngine();
