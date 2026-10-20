/**
 * Companion Chords Rail: Displays the chords that accompany each root in blues/guitar harmony
 * With keyboard shortcuts [C] to cycle, [1-8] to jump, and electric guitar strum preview
 */

import React from 'react';
import { KeyChordInfo } from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import { Volume2, Sparkles, Keyboard, Music, HelpCircle } from 'lucide-react';

interface CompanionChordsBarProps {
  companionChords: KeyChordInfo[];
  activeChordIndex: number;
  onSelectChordIndex: (index: number) => void;
  rootNoteName: string;
}

export const CompanionChordsBar: React.FC<CompanionChordsBarProps> = ({
  companionChords,
  activeChordIndex,
  onSelectChordIndex,
  rootNoteName,
}) => {
  const activeChord = companionChords[activeChordIndex] || companionChords[0];

  const handleStrum = (e: React.MouseEvent, chord: KeyChordInfo, idx: number) => {
    e.stopPropagation();
    onSelectChordIndex(idx);
    audioEngine.strumGuitarChord(chord.rootIndex, chord.quality);
  };

  return (
    <div className="rounded-xl border border-stone-800 bg-[#14151a] p-3.5 shadow-lg space-y-2.5">
      {/* Header with Title and Keyboard Key Combination Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Music className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-200 font-mono tracking-tight flex items-center gap-1.5">
              <span>Companion Chords for Key of {rootNoteName}</span>
              <span className="text-[10px] text-amber-400 font-normal">
                (Changes & Voicings)
              </span>
            </span>
          </div>
        </div>

        {/* Key Combination Indicator Pill */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400 bg-stone-900/90 px-2.5 py-1 rounded-md border border-stone-800">
          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-stone-300">Switch Chords:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-stone-950 text-amber-300 font-bold border border-amber-500/40 shadow-xs">
            C
          </kbd>
          <span className="text-stone-500 text-[10px]">cycle</span>
          <span className="text-stone-600">·</span>
          <kbd className="px-1 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-700 text-[10px]">
            1–{companionChords.length}
          </kbd>
          <span className="text-stone-500 text-[10px]">jump</span>
        </div>
      </div>

      {/* Companion Chords Horizontal List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {companionChords.map((chord, idx) => {
          const isActive = idx === activeChordIndex;

          return (
            <button
              key={chord.id}
              type="button"
              onClick={() => {
                onSelectChordIndex(idx);
                audioEngine.strumGuitarChord(chord.rootIndex, chord.quality);
              }}
              className={`group relative text-left p-2 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/10 border-amber-400/90 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
                  : 'bg-stone-900/60 border-stone-800/90 hover:bg-stone-850 hover:border-stone-700 text-stone-400'
              }`}
              title={`${chord.chordName} (${chord.roleLabel}) - Press [${chord.hotkey}] or [C]`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-1 rounded ${
                    isActive
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-800 text-stone-400 group-hover:text-stone-200'
                  }`}
                >
                  {chord.numeral}
                </span>

                {/* Hotkey Badge */}
                <span className="text-[9px] font-mono text-stone-500 px-1 rounded bg-stone-950/80 border border-stone-800">
                  {chord.hotkey}
                </span>
              </div>

              {/* Chord Name */}
              <div className="mt-1 flex items-baseline justify-between">
                <span
                  className={`text-sm font-bold font-mono tracking-tight ${
                    isActive ? 'text-amber-300' : 'text-stone-200'
                  }`}
                >
                  {chord.chordName}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleStrum(e, chord, idx)}
                  className={`p-1 rounded hover:bg-amber-500/20 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
                  }`}
                  title={`Strum ${chord.chordName} guitar voicing`}
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>

              {/* Chord Role subtitle */}
              <div className="text-[9px] leading-tight text-stone-400 truncate mt-0.5">
                {chord.roleLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Chord Sweet Note Coaching Tip */}
      {activeChord && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-stone-900/80 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-stone-300">
              <strong className="text-amber-300 font-mono">{activeChord.chordName} Target:</strong>{' '}
              Target <strong className="text-emerald-400 font-mono font-bold">{activeChord.sweetNote.noteName}</strong>{' '}
              ({activeChord.sweetNote.degreeName}) — {activeChord.sweetNote.reason}
            </span>
          </div>

          <div className="text-[11px] font-mono text-stone-400 shrink-0">
            Notes: <span className="text-amber-200">{activeChord.chordNoteNames.join(' · ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
