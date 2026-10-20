/**
 * Real-Time 12-Bar Blues Backing Track Player & Chord Progression Synchronizer
 */

import React, { useEffect } from 'react';
import {
  BluesProgression,
  ChordProgressionStep,
  PROGRESSIONS,
} from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import { Play, Pause, Volume2, Music, Radio, Sliders } from 'lucide-react';

interface BackingTrackPlayerProps {
  rootNoteIndex: number;
  activeProgression: BluesProgression;
  onSelectProgression: (prog: BluesProgression) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentBar: number;
  setCurrentBar: (bar: number) => void;
  currentBeat: number;
  setCurrentBeat: (beat: number) => void;
  currentChord: ChordProgressionStep;
  setCurrentChord: (chord: ChordProgressionStep) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  autoSyncTriads: boolean;
  setAutoSyncTriads: (sync: boolean) => void;
  bars: ChordProgressionStep[];
}

export const BackingTrackPlayer: React.FC<BackingTrackPlayerProps> = ({
  rootNoteIndex,
  activeProgression,
  onSelectProgression,
  isPlaying,
  setIsPlaying,
  currentBar,
  setCurrentBar,
  currentBeat,
  setCurrentBeat,
  currentChord,
  setCurrentChord,
  bpm,
  setBpm,
  autoSyncTriads,
  setAutoSyncTriads,
  bars,
}) => {
  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stopBackingTrack();
      setIsPlaying(false);
    } else {
      audioEngine.startBackingTrack(bars, bpm, (bar, beat, chord) => {
        setCurrentBar(bar);
        setCurrentBeat(beat);
        if (chord) {
          setCurrentChord(chord);
        }
      });
      setIsPlaying(true);
    }
  };

  // Update audio engine when BPM or bars change while playing
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    audioEngine.updateBars(bars);
  }, [bars]);

  // Handle bar click to preview or set chord
  const handleBarClick = (bar: ChordProgressionStep) => {
    setCurrentBar(bar.barNumber);
    setCurrentChord(bar);
  };

  return (
    <div className="rounded-xl border border-stone-800 bg-[#141519] p-5 shadow-xl">
      {/* Top Bar: Controls & Progression Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-2 ring-amber-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Stop Backing Track
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Play Backing Track
              </>
            )}
          </button>

          {/* Beat Indicator Meter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800">
            <span className="text-[11px] font-mono text-stone-400 mr-1">Beat:</span>
            {[1, 2, 3, 4].map((b) => (
              <span
                key={b}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-100 ${
                  isPlaying && currentBeat === b
                    ? b === 1
                      ? 'bg-amber-400 ring-2 ring-amber-200 scale-125'
                      : 'bg-cyan-400 ring-1 ring-cyan-200 scale-110'
                    : 'bg-stone-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progression Selection & BPM */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono">Progression:</span>
            <select
              value={activeProgression.id}
              onChange={(e) => {
                const found = PROGRESSIONS.find((p) => p.id === e.target.value);
                if (found) {
                  onSelectProgression(found);
                  setBpm(found.defaultBpm);
                  if (isPlaying) {
                    audioEngine.stopBackingTrack();
                    setIsPlaying(false);
                  }
                }
              }}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-medium"
            >
              {PROGRESSIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tempo BPM Controller */}
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1 rounded-lg">
            <span className="text-xs font-mono text-stone-400">Tempo:</span>
            <button
              type="button"
              onClick={() => setBpm(Math.max(45, bpm - 5))}
              className="w-5 h-5 rounded bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center text-xs cursor-pointer font-bold"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums min-w-[48px] text-center">
              {bpm} BPM
            </span>
            <button
              type="button"
              onClick={() => setBpm(Math.min(180, bpm + 5))}
              className="w-5 h-5 rounded bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center text-xs cursor-pointer font-bold"
            >
              +
            </button>
          </div>

          {/* Auto-sync Triad toggle */}
          <button
            type="button"
            onClick={() => setAutoSyncTriads(!autoSyncTriads)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              autoSyncTriads
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Automatically update fretboard chord tones as backing track changes chords"
          >
            <Radio className="w-3.5 h-3.5" />
            Auto-Sync Fretboard Triads
          </button>
        </div>
      </div>

      {/* 12-Bar Interactive Chord Progression Grid */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono text-stone-400">
            Current Measure:{' '}
            <strong className="text-amber-400">
              Bar {currentBar} of {bars.length}
            </strong>{' '}
            (Playing <span className="text-stone-100 font-bold">{currentChord.chordName}</span> [{currentChord.chordLabel}])
          </div>
          <span className="text-[11px] text-stone-500 font-mono">Click any measure to preview chord notes</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {bars.map((bar) => {
            const isCurrent = isPlaying && currentBar === bar.barNumber;
            const isSelected = currentChord.barNumber === bar.barNumber;

            const isI = bar.chordLabel.includes('I') && !bar.chordLabel.includes('IV') && !bar.chordLabel.includes('V');
            const isIV = bar.chordLabel.includes('IV');
            const isV = bar.chordLabel.includes('V') && !bar.chordLabel.includes('IV');

            return (
              <button
                key={bar.barNumber}
                type="button"
                onClick={() => handleBarClick(bar)}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20 scale-105 z-10'
                    : isSelected
                    ? 'border-amber-500/40 bg-stone-800'
                    : 'border-stone-800/80 bg-stone-900/60 hover:border-stone-700'
                }`}
              >
                <div className="text-[10px] font-mono text-stone-500 mb-0.5">
                  Bar {bar.barNumber}
                </div>
                <div
                  className={`text-sm font-bold font-mono ${
                    isCurrent
                      ? 'text-amber-300'
                      : isI
                      ? 'text-stone-200'
                      : isIV
                      ? 'text-cyan-300'
                      : 'text-rose-300'
                  }`}
                >
                  {bar.chordName}
                </div>
                <div className="text-[10px] font-mono text-stone-400">
                  {bar.chordLabel}
                </div>

                {/* Live Beat Progress Bar inside current measure */}
                {isCurrent && (
                  <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-amber-400/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-100"
                      style={{ width: `${(currentBeat / 4) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
