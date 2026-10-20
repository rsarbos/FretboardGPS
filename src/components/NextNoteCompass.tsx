/**
 * Dynamic "What Notes Follow" Soloing Compass & Phrasing Coach
 * Features instant chain-soloing, technique audio previews, and musical rationale
 */

import React, { useState } from 'react';
import {
  FretboardNote,
  NextNoteHint,
  ScaleDefinition,
  ChordProgressionStep,
  getNoteName,
} from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Play,
  Volume2,
  Zap,
  Flame,
  CheckCircle2,
  CornerDownRight,
} from 'lucide-react';

interface NextNoteCompassProps {
  selectedNote: FretboardNote | null;
  rootNoteIndex: number;
  scale: ScaleDefinition;
  activeChord: ChordProgressionStep;
  nextNoteHints: NextNoteHint[];
  onSelectTarget: (stringIndex: number, fret: number) => void;
  onPickStarterNote: (role: 'root' | 'b3' | 'b5' | '5') => void;
}

export const NextNoteCompass: React.FC<NextNoteCompassProps> = ({
  selectedNote,
  rootNoteIndex,
  scale,
  activeChord,
  nextNoteHints,
  onSelectTarget,
  onPickStarterNote,
}) => {
  const isFlat = [1, 3, 6, 8, 10].includes(rootNoteIndex);
  const [filterType, setFilterType] = useState<'all' | 'bend' | 'resolve' | 'triad'>('all');

  // Filter hints based on user selection
  const filteredHints = nextNoteHints.filter((h) => {
    if (filterType === 'all') return true;
    if (filterType === 'bend') return h.actionType === 'bend' || h.actionType === 'slide';
    if (filterType === 'resolve') return h.actionType === 'resolve' || h.targetIntervalName === 'R';
    if (filterType === 'triad') return h.actionType === 'triad' || h.targetIntervalName.includes('3');
    return true;
  });

  // Play audio transition (Current note -> Target note)
  const handlePlayTransition = (hint: NextNoteHint) => {
    if (!selectedNote) return;

    // 1. Play current note
    audioEngine.playGuitarNote(selectedNote.frequency, 0.65, 0.85);

    // 2. Play follow-up note with appropriate technique
    setTimeout(() => {
      const openStrOctave = [4, 3, 3, 3, 2, 2][hint.targetString];
      const openStrNote = [4, 11, 7, 2, 9, 4][hint.targetString];
      const targetMidi = openStrOctave * 12 + openStrNote + 12 + hint.targetFret;
      const targetFreq = 440 * Math.pow(2, (targetMidi - 69) / 12);

      const tech = hint.actionType === 'bend'
        ? (hint.technique.includes('Full') ? 'bendFull' : 'bend1/2')
        : hint.actionType === 'slide'
        ? 'slide'
        : 'pick';

      audioEngine.playGuitarNote(targetFreq, 1.2, 0.9, tech as any);
    }, 450);
  };

  // One-click Chain Solo: plays the target note and immediately moves fretboard selection to it!
  const handleChainStep = (hint: NextNoteHint) => {
    onSelectTarget(hint.targetString, hint.targetFret);
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-[#141519] p-5 shadow-xl">
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2 font-mono">
              Green Solo Compass
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                Dynamic Follow-Up GPS
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Every green note glowing on the fretboard is a verified idiomatic blues transition
            </p>
          </div>
        </div>

        {selectedNote ? (
          <div className="flex items-center gap-2 bg-stone-900 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm">
            <span className="text-stone-400">Origin Fret:</span>
            <span className="text-amber-400 font-extrabold text-sm">{selectedNote.noteName}</span>
            <span className="text-stone-500">|</span>
            <span className="text-stone-300">
              String {6 - selectedNote.stringIndex}, Fret {selectedNote.fret}
            </span>
            <span className="text-stone-500">|</span>
            <span className="text-emerald-400 font-semibold">{selectedNote.intervalName || 'Tonic'}</span>
          </div>
        ) : (
          <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Click any fret above or pick a starter below</span>
          </div>
        )}
      </div>

      {/* Main Body */}
      {!selectedNote ? (
        // Starter Launchpad
        <div className="py-6 px-4 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-stone-200 mb-1">
            Pluck Any Fret Above to Ignite the Green Target Flow
          </h4>
          <p className="text-xs text-stone-400 max-w-lg mx-auto mb-5 leading-relaxed">
            Click on any fret on the guitar neck above to see the green target notes light up with real-time
            bend, slide, and chord-tone recommendations. Or kick off with an iconic starter:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => onPickStarterNote('root')}
              className="p-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/40 text-left transition-all group cursor-pointer hover:border-amber-400 shadow-sm"
            >
              <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                <span>Start on Root (1)</span>
                <span className="text-[10px] font-mono text-stone-500">HOME</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                Authoritative ground. Launches classic Box 1 riffs.
              </div>
            </button>

            <button
              type="button"
              onClick={() => onPickStarterNote('b3')}
              className="p-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700 text-left transition-all group cursor-pointer hover:border-stone-500 shadow-sm"
            >
              <div className="text-xs font-bold text-amber-200 flex items-center justify-between">
                <span>Start on Minor 3rd</span>
                <span className="text-[10px] font-mono text-stone-500">CURL</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                The blues curl starter. Micro-bend into Major 3rd.
              </div>
            </button>

            <button
              type="button"
              onClick={() => onPickStarterNote('b5')}
              className="p-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-cyan-500/40 text-left transition-all group cursor-pointer hover:border-cyan-400 shadow-sm"
            >
              <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                <span>The Blue Note (b5)</span>
                <span className="text-[10px] font-mono text-cyan-500">GRIT</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                Maximum harmonic friction. Ready to slide into 4 or 5.
              </div>
            </button>

            <button
              type="button"
              onClick={() => onPickStarterNote('5')}
              className="p-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700 text-left transition-all group cursor-pointer hover:border-stone-500 shadow-sm"
            >
              <div className="text-xs font-bold text-amber-200 flex items-center justify-between">
                <span>Start on 5th</span>
                <span className="text-[10px] font-mono text-stone-500">SOLID</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                Vocal singing anchor. Sustains with butterfly vibrato.
              </div>
            </button>
          </div>
        </div>
      ) : (
        // Active State: Next Note Recommendations
        <div className="pt-4 space-y-3">
          {/* Filter Bar & Replay */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-lg border border-stone-800 text-xs font-medium">
              <span className="text-stone-400 px-2 font-mono text-[11px]">Filter Vibe:</span>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All Targets ({nextNoteHints.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('bend')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'bend'
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Bends & Curls
              </button>
              <button
                type="button"
                onClick={() => setFilterType('resolve')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'resolve'
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Resolutions (Home)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('triad')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'triad'
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Chord Tone Targets
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => audioEngine.playGuitarNote(selectedNote.frequency, 1.2, 0.85)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-mono transition-colors border border-amber-500/30 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Replay Origin Note
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredHints.map((hint, idx) => {
              const isBend = hint.actionType === 'bend';
              const isSlide = hint.actionType === 'slide';
              const isResolve = hint.actionType === 'resolve';
              const isTriad = hint.actionType === 'triad';

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-stone-800 bg-[#181920] p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/30 transition-all duration-200 group"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded tracking-wide bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
                        {hint.degreeChange}
                      </span>

                      <span className="text-xs font-mono font-bold text-stone-200">
                        String {6 - hint.targetString} · Fret {hint.targetFret} ({hint.targetNoteName})
                      </span>
                    </div>

                    {/* Technique title */}
                    <h5 className="text-sm font-bold text-stone-100 flex items-center gap-1.5 mb-1.5">
                      {hint.technique}
                    </h5>

                    {/* Musical Rationale */}
                    <p className="text-xs text-stone-400 leading-relaxed mb-3">
                      {hint.reason}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2.5 border-t border-stone-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-amber-400/90 truncate font-medium">
                      {hint.emotionalVibe}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePlayTransition(hint)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
                        title="Hear 2-note transition audio"
                      >
                        <Play className="w-3 h-3 fill-amber-300" />
                        Hear
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChainStep(hint)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/30 hover:scale-105"
                        title="Pluck this note and move the green targets forward!"
                      >
                        Solo Forward
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
