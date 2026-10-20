/**
 * Companion Chords & Voicings Studio: In-depth harmonic breakdown of chords that accompany the root
 * Displays chord formulas, intervals, sweet soloing target notes, and guitar grip voicings
 */

import React from 'react';
import { KeyChordInfo, getNoteName } from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import { Volume2, Sparkles, Disc, Check, Keyboard } from 'lucide-react';

interface CompanionChordsDetailProps {
  companionChords: KeyChordInfo[];
  activeChordIndex: number;
  onSelectChordIndex: (index: number) => void;
  rootNoteName: string;
}

export const CompanionChordsDetail: React.FC<CompanionChordsDetailProps> = ({
  companionChords,
  activeChordIndex,
  onSelectChordIndex,
  rootNoteName,
}) => {
  const activeChord = companionChords[activeChordIndex] || companionChords[0];

  const handleStrum = (chord: KeyChordInfo, idx: number) => {
    onSelectChordIndex(idx);
    audioEngine.strumGuitarChord(chord.rootIndex, chord.quality);
  };

  return (
    <div className="rounded-xl border border-stone-800 bg-[#14151a] p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 font-mono flex items-center gap-2">
              <span>Companion Chords & Voicing Matrix</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Key of {rootNoteName}
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              The harmonic backbone of blues progressions: switch anytime using key <kbd className="px-1.5 py-0.5 rounded bg-stone-900 text-amber-300 border border-stone-700 font-mono font-bold">C</kbd> or <kbd className="px-1 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700 font-mono">1–8</kbd>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleStrum(activeChord, activeChordIndex)}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4 fill-current" />
          <span>Strum Active Chord ({activeChord.chordName})</span>
        </button>
      </div>

      {/* Grid of Chord Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {companionChords.map((chord, idx) => {
          const isSelected = idx === activeChordIndex;

          return (
            <div
              key={chord.id}
              onClick={() => handleStrum(chord, idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/15 to-stone-900 border-amber-400/90 ring-1 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
              }`}
            >
              {/* Card Header: Numeral + Hotkey + Strum Button */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {chord.numeral}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-stone-500 px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800">
                    Key: {chord.hotkey}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStrum(chord, idx);
                    }}
                    className={`p-1 rounded transition-colors ${
                      isSelected
                        ? 'text-amber-400 hover:bg-amber-500/20'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                    title="Strum voicing"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chord Big Title & Role */}
              <div>
                <h4
                  className={`text-lg font-bold font-mono tracking-tight ${
                    isSelected ? 'text-amber-300' : 'text-stone-100'
                  }`}
                >
                  {chord.chordName}
                </h4>
                <p className="text-[11px] text-stone-400 font-medium">
                  {chord.roleLabel}
                </p>
              </div>

              {/* Formula & Degree Names */}
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Formula:</span>
                  <span className="text-amber-400 font-semibold">{chord.degreeNames.join(' – ')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Notes:</span>
                  <span className="text-stone-300 font-semibold">{chord.chordNoteNames.join(' · ')}</span>
                </div>
              </div>

              {/* Sweet Note Tip */}
              <div className="mt-2.5 p-2 rounded-lg bg-stone-950/80 border border-stone-800/90 text-[11px]">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-0.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Soloing Secret:</span>
                </div>
                <p className="text-stone-300 text-[10px] leading-relaxed">
                  Target <strong className="text-emerald-300 font-mono">{chord.sweetNote.noteName}</strong> ({chord.sweetNote.degreeName}): {chord.sweetNote.reason}
                </p>
              </div>

              {/* Voicing description */}
              <div className="mt-2 text-[10px] text-stone-400 italic">
                Voicing: {chord.voicingDescription}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
