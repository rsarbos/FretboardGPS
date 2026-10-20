/**
 * Triad Overlays & Inversion Matrix Control Panel
 */

import React from 'react';
import {
  TRIADS,
  TriadDefinition,
  ChordProgressionStep,
  getNoteName,
  getNoteFrequency,
} from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import { Disc, PlayCircle, Eye, EyeOff } from 'lucide-react';

interface TriadOverlayControlsProps {
  triadMode: 'off' | 'activeChord' | 'allInversions' | 'i_iv_v';
  setTriadMode: (mode: 'off' | 'activeChord' | 'allInversions' | 'i_iv_v') => void;
  selectedTriadType: string;
  setSelectedTriadType: (type: string) => void;
  activeChord: ChordProgressionStep;
  rootNoteIndex: number;
}

export const TriadOverlayControls: React.FC<TriadOverlayControlsProps> = ({
  triadMode,
  setTriadMode,
  selectedTriadType,
  setSelectedTriadType,
  activeChord,
  rootNoteIndex,
}) => {
  const isFlat = [1, 3, 6, 8, 10].includes(rootNoteIndex);

  // Strum active triad voicing through Web Audio
  const handleStrumTriad = () => {
    const triad = TRIADS[selectedTriadType] || TRIADS.dom7;
    const chordRoot = activeChord.rootIndex;

    // Pick 3 or 4 frequencies in an idiomatic guitar register
    const freqs: number[] = triad.intervals.map((interval) => {
      const noteIdx = (chordRoot + interval) % 12;
      // Octave 3/4 register
      const midi = 48 + noteIdx + (noteIdx < chordRoot ? 12 : 0);
      return 440 * Math.pow(2, (midi - 69) / 12);
    });

    audioEngine.playTriadNotes(freqs, 1.8);
  };

  return (
    <div className="rounded-xl border border-stone-800 bg-[#141519] p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Disc className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              Zone Triad & Chord Tone Overlays
            </h3>
            <p className="text-xs text-stone-400">
              Target chord roots, 3rds, and 5ths directly inside your pentatonic boxes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStrumTriad}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-rose-300 border border-rose-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 text-rose-400" />
          Strum Active Triad ({activeChord.chordName})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Triad Layering Mode Selector */}
        <div>
          <label className="block text-xs font-mono text-stone-400 mb-2">
            Triad Overlay Mode:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTriadMode('off')}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                triadMode === 'off'
                  ? 'border-amber-400 bg-stone-800 text-stone-100 ring-1 ring-amber-400'
                  : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold">Scale Only</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Hide triad badges</div>
            </button>

            <button
              type="button"
              onClick={() => setTriadMode('activeChord')}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                triadMode === 'activeChord'
                  ? 'border-rose-400 bg-rose-500/15 text-rose-200 ring-1 ring-rose-400'
                  : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold text-rose-300">Active Chord Tone</div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Target {activeChord.chordName}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTriadMode('i_iv_v')}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                triadMode === 'i_iv_v'
                  ? 'border-rose-400 bg-rose-500/15 text-rose-200 ring-1 ring-rose-400'
                  : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold">I - IV - V Triads</div>
              <div className="text-[10px] text-stone-400 mt-0.5">All 3 blues chords</div>
            </button>

            <button
              type="button"
              onClick={() => setTriadMode('allInversions')}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                triadMode === 'allInversions'
                  ? 'border-rose-400 bg-rose-500/15 text-rose-200 ring-1 ring-rose-400'
                  : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold">All Inversions</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Full neck chord grid</div>
            </button>
          </div>
        </div>

        {/* Triad Chord Type Selector */}
        <div>
          <label className="block text-xs font-mono text-stone-400 mb-2">
            Triad / Chord Structure:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TRIADS).map(([key, def]) => {
              const isSelected = selectedTriadType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTriadType(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-400 bg-rose-500/15 text-rose-200 ring-1 ring-rose-400'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="font-semibold truncate">{def.name}</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                    Degrees: {def.names.join(' · ')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
