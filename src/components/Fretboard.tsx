/**
 * Interactive Guitar Fretboard Component with Pentatonic Blues Scales,
 * Triad Overlays, Zone Framing, Neon Green Next-Note Flow Trajectories,
 * and In-Board Zone Controls
 */

import React, { useMemo, useState } from 'react';
import {
  Tuning,
  ScaleDefinition,
  ChordProgressionStep,
  FretboardNote,
  NextNoteHint,
  AnswerStarterNote,
  getFretNoteIndex,
  getNoteName,
  getNoteFrequency,
  TRIADS,
  CAGED_ZONES,
  KeyChordInfo,
} from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import { Zap, Volume2, Sparkles, SlidersHorizontal, Eye, MessageSquare, ArrowRight, ArrowLeft, Music } from 'lucide-react';

interface FretboardProps {
  rootNoteIndex: number;
  scale: ScaleDefinition;
  activeZoneId: string;
  onSelectZone: (zoneId: string) => void;
  zoneFretRange: { minFret: number; maxFret: number; baseFret: number };
  activeChord: ChordProgressionStep;
  activeCompanionChord?: KeyChordInfo;
  onCycleCompanionChord?: () => void;
  tuning: Tuning;
  displayMode: 'intervals' | 'noteNames' | 'degrees';
  setDisplayMode: (mode: 'intervals' | 'noteNames' | 'degrees') => void;
  triadMode: 'off' | 'activeChord' | 'allInversions' | 'i_iv_v';
  setTriadMode: (mode: 'off' | 'activeChord' | 'allInversions' | 'i_iv_v') => void;
  selectedTriadType: string;
  isolatedStringRange: 'all' | 'top3' | 'middle3';
  onSelectStringRange: (range: 'all' | 'top3' | 'middle3') => void;
  selectedNote: FretboardNote | null;
  onSelectNote: (note: FretboardNote) => void;
  nextNoteHints: NextNoteHint[];
  highlightedLickNote: { stringIndex: number; fret: number } | null;
  phraseHistory?: FretboardNote[];
  answerStarters?: AnswerStarterNote[];
  phraseMode?: 'call' | 'answer';
  onStepNextBestNote?: () => void;
  onStepPrevNote?: () => void;
  numFrets?: number;
}

// Traditional fret marker positions
const SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_DOT_FRETS = [12, 24];

// String gauges (physical thickness in px)
const STRING_GAUGES = [1.2, 1.8, 2.4, 3.2, 4.0, 5.0]; // String 0 (high E) to String 5 (low E)

export const Fretboard: React.FC<FretboardProps> = ({
  rootNoteIndex,
  scale,
  activeZoneId,
  onSelectZone,
  zoneFretRange,
  activeChord,
  activeCompanionChord,
  onCycleCompanionChord,
  tuning,
  displayMode,
  setDisplayMode,
  triadMode,
  setTriadMode,
  selectedTriadType,
  isolatedStringRange,
  onSelectStringRange,
  selectedNote,
  onSelectNote,
  nextNoteHints,
  highlightedLickNote,
  phraseHistory = [],
  answerStarters = [],
  phraseMode = 'call',
  onStepNextBestNote,
  onStepPrevNote,
  numFrets = 20,
}) => {
  const isFlat = [1, 3, 6, 8, 10].includes(rootNoteIndex);
  const [showEnergyBeams, setShowEnergyBeams] = useState(true);
  const [hoveredHint, setHoveredHint] = useState<NextNoteHint | null>(null);
  const [isAuditioning, setIsAuditioning] = useState(false);

  // Determine active triad notes based on mode and active companion chord
  const activeTriadNoteIndices = useMemo(() => {
    if (triadMode === 'off') return new Set<number>();

    const targetChordRoot = activeCompanionChord ? activeCompanionChord.rootIndex : activeChord.rootIndex;
    const triadDef = TRIADS[selectedTriadType] || TRIADS.dom7;

    const indices = new Set<number>();

    if (activeCompanionChord && triadMode === 'activeChord') {
      activeCompanionChord.intervals.forEach((interval) => {
        indices.add((activeCompanionChord.rootIndex + interval) % 12);
      });
      return indices;
    }

    if (triadMode === 'activeChord') {
      triadDef.intervals.forEach((interval) => {
        indices.add((targetChordRoot + interval) % 12);
      });
    } else if (triadMode === 'i_iv_v') {
      const roots = [rootNoteIndex, (rootNoteIndex + 5) % 12, (rootNoteIndex + 7) % 12];
      roots.forEach((r) => {
        triadDef.intervals.forEach((interval) => {
          indices.add((r + interval) % 12);
        });
      });
    } else {
      triadDef.intervals.forEach((interval) => {
        indices.add((targetChordRoot + interval) % 12);
      });
    }

    return indices;
  }, [triadMode, activeChord, activeCompanionChord, rootNoteIndex, selectedTriadType]);

  // Compute all fretboard notes
  const fretGrid = useMemo(() => {
    const grid: FretboardNote[][] = [];

    for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
      const row: FretboardNote[] = [];
      const openStr = tuning.strings[stringIdx];

      for (let fret = 0; fret <= numFrets; fret++) {
        const noteIdx = getFretNoteIndex(stringIdx, fret, tuning);
        const noteName = getNoteName(noteIdx, isFlat);
        const freq = getNoteFrequency(stringIdx, fret, tuning);
        const octave = Math.floor((openStr.octave * 12 + openStr.noteIndex + fret) / 12);

        // Check if note belongs to current scale
        const scaleInterval = (noteIdx - rootNoteIndex + 12) % 12;
        const scaleIndex = scale.intervals.indexOf(scaleInterval);
        const isScaleNote = scaleIndex !== -1;
        const intervalName = isScaleNote ? scale.intervalNames[scaleIndex] : undefined;
        const role = isScaleNote ? scale.roleMap[scaleInterval] : undefined;

        // Check if note belongs to active triad
        const isTriadNote = activeTriadNoteIndices.has(noteIdx);

        // Zone check
        let inZone = false;
        if (activeZoneId === 'full') {
          inZone = true;
        } else {
          inZone = fret >= zoneFretRange.minFret && fret <= zoneFretRange.maxFret;
          if (activeZoneId === 'bb_box') {
            inZone = inZone && stringIdx <= 2; // high E, B, G
          } else if (activeZoneId === 'albert_box') {
            inZone = inZone && stringIdx <= 1; // high E, B
          }
        }

        // String isolation filter
        if (isolatedStringRange === 'top3' && stringIdx > 2) {
          inZone = false;
        } else if (isolatedStringRange === 'middle3' && (stringIdx < 1 || stringIdx > 3)) {
          inZone = false;
        }

        row.push({
          stringIndex: stringIdx,
          fret,
          noteIndex: noteIdx,
          noteName,
          octave,
          frequency: freq,
          interval: scaleInterval,
          intervalName,
          role,
          isScaleNote,
          isTriadNote,
          inZone,
        });
      }
      grid.push(row);
    }
    return grid;
  }, [tuning, numFrets, rootNoteIndex, isFlat, scale, activeTriadNoteIndices, activeZoneId, zoneFretRange, isolatedStringRange]);

  // Handle note click: plays audio, selects note, and cascades next green targets!
  const handleNoteClick = (note: FretboardNote) => {
    // Check if this was a hint to play with special technique
    const matchedHint = nextNoteHints.find(
      (h) => h.targetString === note.stringIndex && h.targetFret === note.fret
    );

    const tech = matchedHint?.actionType === 'bend'
      ? (matchedHint.technique.includes('Full') ? 'bendFull' : 'bend1/2')
      : matchedHint?.actionType === 'slide'
      ? 'slide'
      : 'pick';

    audioEngine.playGuitarNote(note.frequency, 1.4, 0.85, tech as any);
    onSelectNote(note);
  };

  // Audition all next-note suggestions in a seamless chain!
  const handleAuditionAllHints = () => {
    if (!selectedNote || nextNoteHints.length === 0 || isAuditioning) return;
    setIsAuditioning(true);

    // 1. Play current note
    audioEngine.playGuitarNote(selectedNote.frequency, 0.7, 0.85);

    // 2. Play each hint in succession
    nextNoteHints.forEach((hint, idx) => {
      setTimeout(() => {
        const openStrOctave = [4, 3, 3, 3, 2, 2][hint.targetString];
        const openStrNote = [4, 11, 7, 2, 9, 4][hint.targetString];
        const targetMidi = openStrOctave * 12 + openStrNote + 12 + hint.targetFret;
        const targetFreq = 440 * Math.pow(2, (targetMidi - 69) / 12);

        const tech = hint.actionType === 'bend' ? 'bend1/2' : hint.actionType === 'slide' ? 'slide' : 'pick';
        audioEngine.playGuitarNote(targetFreq, 0.9, 0.85, tech as any);

        if (idx === nextNoteHints.length - 1) {
          setTimeout(() => setIsAuditioning(false), 800);
        }
      }, 500 * (idx + 1));
    });
  };

  // Check if a note is one of the next-note recommendations
  const getNextNoteHintForCoord = (stringIdx: number, fret: number): NextNoteHint | undefined => {
    return nextNoteHints.find((h) => h.targetString === stringIdx && h.targetFret === fret);
  };

  // Calculate SVG beam coordinates
  // Nut center X = 84px, Fret 1..20 center X = 104 + (fret - 0.5) * 52px
  // String 0..5 center Y = stringIdx * 48 + 24px
  const getNoteCenterCoords = (stringIdx: number, fret: number) => {
    const x = fret === 0 ? 84 : 104 + (fret - 0.5) * 52;
    const y = stringIdx * 48 + 24;
    return { x, y };
  };

  const selectedCenter = selectedNote
    ? getNoteCenterCoords(selectedNote.stringIndex, selectedNote.fret)
    : null;

  return (
    <div className="relative w-full rounded-2xl border border-amber-950/40 bg-[#121316] shadow-2xl overflow-hidden">
      {/* 1. Quick Control Header Bar directly integrated inside Fretboard */}
      <div className="px-4 py-3 bg-[#18191e] border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* In-Fretboard Zone Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-mono text-amber-400/90 font-bold uppercase tracking-wider mr-1 shrink-0">
            Zone:
          </span>
          <button
            type="button"
            onClick={() => onSelectZone('full')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              activeZoneId === 'full'
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Full Neck
          </button>
          {CAGED_ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeZoneId === zone.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
              title={zone.description}
            >
              {zone.shortName}
            </button>
          ))}
        </div>

        {/* Quick Toggles: Energy Beams, Strings, Display Mode */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Energy Beams Toggle */}
          <button
            type="button"
            onClick={() => setShowEnergyBeams(!showEnergyBeams)}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showEnergyBeams
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
            }`}
            title="Toggle neon trajectory lines connecting the current note to follow-up targets"
          >
            <Zap className={`w-3.5 h-3.5 ${showEnergyBeams ? 'text-emerald-400' : 'text-stone-500'}`} />
            <span>Green GPS Beams</span>
          </button>

          {/* String Isolator */}
          <div className="flex items-center gap-1 p-0.5 bg-stone-900 rounded border border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => onSelectStringRange('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                isolatedStringRange === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              6 Strings
            </button>
            <button
              type="button"
              onClick={() => onSelectStringRange('top3')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                isolatedStringRange === 'top3'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Focus on Top 3 strings (High E, B, G) for vocal soloing"
            >
              Top 3 (Lead)
            </button>
          </div>

          {/* Keyboard Arrow Quick Controls */}
          <div className="flex items-center gap-1 p-0.5 bg-stone-900 rounded border border-stone-800 text-xs font-mono">
            {onStepPrevNote && (
              <button
                type="button"
                onClick={onStepPrevNote}
                disabled={phraseHistory.length <= 1}
                className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 hover:text-white disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-colors"
                title="Left Arrow: Step back to previous note in phrase"
              >
                <ArrowLeft className="w-3 h-3" />
                <kbd className="text-[10px] bg-stone-950 px-1 rounded border border-stone-700">←</kbd>
              </button>
            )}
            {onStepNextBestNote && (
              <button
                type="button"
                onClick={onStepNextBestNote}
                className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title="Right Arrow: Play best next note"
              >
                <kbd className="text-[10px] bg-stone-950 px-1 rounded border border-emerald-500/40 text-emerald-400">→</kbd>
                <span>Best Next</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Companion Chord Switcher Button */}
          {activeCompanionChord && onCycleCompanionChord && (
            <button
              type="button"
              onClick={onCycleCompanionChord}
              className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Cycle to next companion chord for this root [Press C]"
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeCompanionChord.chordName}</span>
              <kbd className="text-[10px] bg-stone-950 px-1 py-0.2 rounded border border-amber-500/40 text-amber-300">
                C ⟳
              </kbd>
            </button>
          )}

          {/* Audition Button if note is selected */}
          {selectedNote && nextNoteHints.length > 0 && (
            <button
              type="button"
              disabled={isAuditioning}
              onClick={handleAuditionAllHints}
              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Audition current note and all follow-up hints in sequence"
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isAuditioning ? 'Auditioning...' : 'Audition Green Hints'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Fretboard Neck */}
      <div className="relative w-full overflow-x-auto select-none pb-4">
        {/* Fret Numbers Header */}
        <div className="flex items-center text-xs font-mono font-medium text-amber-200/60 border-b border-amber-950/60 bg-[#16171b] px-3 py-2">
          <div className="w-16 shrink-0 text-center uppercase tracking-wider text-amber-400/80 font-bold">
            Tuning
          </div>
          <div className="w-10 shrink-0 text-center text-amber-400 font-bold border-r border-amber-950/40">
            Nut
          </div>
          <div className="flex-1 flex min-w-[1040px]">
            {Array.from({ length: numFrets }).map((_, i) => {
              const fret = i + 1;
              const isSingle = SINGLE_DOT_FRETS.includes(fret);
              const isDouble = DOUBLE_DOT_FRETS.includes(fret);
              const isInZone =
                activeZoneId === 'full' ||
                (fret >= zoneFretRange.minFret && fret <= zoneFretRange.maxFret);

              return (
                <div
                  key={fret}
                  className={`flex-1 text-center py-0.5 min-w-[52px] border-r border-stone-800/40 transition-colors ${
                    isInZone
                      ? 'text-amber-300 font-semibold bg-amber-500/5'
                      : 'text-stone-500'
                  }`}
                >
                  <span>{fret}</span>
                  {isDouble && <span className="block text-[10px] text-amber-400 font-bold">••</span>}
                  {isSingle && !isDouble && <span className="block text-[10px] text-stone-400">•</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Fretboard Stage */}
        <div className="relative px-3 pt-3 min-w-[1144px]">
          {/* Active Zone Highlight Backdrop */}
          {activeZoneId !== 'full' && (
            <div
              className="absolute top-2 bottom-2 rounded-lg border-2 border-amber-400/35 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 pointer-events-none transition-all duration-300 shadow-[inset_0_0_24px_rgba(245,158,11,0.08)]"
              style={{
                left: `${70 + Math.max(0, zoneFretRange.minFret) * 52}px`,
                width: `${(zoneFretRange.maxFret - zoneFretRange.minFret + 1) * 52}px`,
              }}
            >
              <div className="absolute -top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider bg-amber-500 text-stone-950 shadow">
                ZONE: FRETS {zoneFretRange.minFret}–{zoneFretRange.maxFret}
              </div>
            </div>
          )}

          {/* SVG NEON ENERGY BEAMS connecting selected note to green target notes */}
          {showEnergyBeams && selectedCenter && nextNoteHints.length > 0 && (
            <svg className="absolute inset-0 pointer-events-none z-20 w-full h-[288px]">
              <defs>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {nextNoteHints.map((hint, idx) => {
                const targetCoords = getNoteCenterCoords(hint.targetString, hint.targetFret);
                const x1 = selectedCenter.x;
                const y1 = selectedCenter.y;
                const x2 = targetCoords.x;
                const y2 = targetCoords.y;

                // Bezier curve with natural sag/arc
                const dx = x2 - x1;
                const dy = y2 - y1;
                const arcSag = Math.abs(dx) > 30 ? -22 : 0;
                const cx1 = x1 + dx * 0.35;
                const cy1 = y1 + dy * 0.2 + arcSag;
                const cx2 = x1 + dx * 0.65;
                const cy2 = y2 + dy * 0.8 + arcSag;

                return (
                  <g key={idx}>
                    {/* Shadow glow line */}
                    <path
                      d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeOpacity="0.4"
                      filter="url(#neonGlow)"
                    />
                    {/* Pulsing dashed laser */}
                    <path
                      d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="url(#beamGrad)"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* 6 Physical Guitar Strings */}
          {fretGrid.map((stringRow, stringIdx) => {
            const stringName = tuning.strings[stringIdx].openName;
            const gauge = STRING_GAUGES[stringIdx];
            const isIsolated =
              (isolatedStringRange === 'top3' && stringIdx > 2) ||
              (isolatedStringRange === 'middle3' && (stringIdx < 1 || stringIdx > 3));

            return (
              <div
                key={stringIdx}
                className={`relative flex items-center h-12 transition-opacity ${
                  isIsolated ? 'opacity-25 grayscale' : 'opacity-100'
                }`}
              >
                {/* String Tuning Indicator on left */}
                <div className="w-16 shrink-0 flex items-center justify-between pr-3">
                  <span className="text-xs font-mono font-bold text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {stringName}
                    <span className="text-[10px] text-stone-400 ml-1">{6 - stringIdx}</span>
                  </span>
                </div>

                {/* Nut (Fret 0 / Open String) */}
                <div className="w-10 shrink-0 h-full flex items-center justify-center border-r-4 border-amber-100/30 bg-[#16171b] relative z-10">
                  {(() => {
                    const openNote = stringRow[0];
                    const isScale = openNote.isScaleNote;
                    const isSelected =
                      selectedNote?.stringIndex === stringIdx && selectedNote?.fret === 0;
                    const nextHint = getNextNoteHintForCoord(stringIdx, 0);

                    return (
                      <button
                        type="button"
                        onClick={() => handleNoteClick(openNote)}
                        className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                          nextHint
                            ? 'ring-4 ring-emerald-400 bg-emerald-400 text-stone-950 shadow-[0_0_16px_rgba(52,211,153,0.9)] animate-pulse'
                            : isSelected
                            ? 'ring-2 ring-amber-400 bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/50'
                            : isScale
                            ? openNote.role === 'root'
                              ? 'bg-amber-400 text-stone-950 ring-1 ring-amber-200 font-extrabold'
                              : 'bg-stone-800 text-amber-200 border border-stone-600'
                            : 'bg-stone-900/60 text-stone-500 hover:text-stone-300'
                        }`}
                        title={`Open ${openNote.noteName} (Fret 0)`}
                      >
                        0
                      </button>
                    );
                  })()}
                </div>

                {/* Physical String Wire */}
                <div
                  className="absolute left-26 right-0 pointer-events-none z-0"
                  style={{
                    top: '50%',
                    height: `${gauge}px`,
                    transform: 'translateY(-50%)',
                    background:
                      stringIdx >= 3
                        ? 'linear-gradient(to bottom, #d4a373, #a66a38, #5a391e)'
                        : 'linear-gradient(to bottom, #e2e8f0, #94a3b8, #64748b)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.7)',
                  }}
                />

                {/* Fret Slots 1 to numFrets */}
                <div className="flex-1 flex h-full relative z-10">
                  {stringRow.slice(1).map((note) => {
                    const fret = note.fret;
                    const isSelected =
                      selectedNote?.stringIndex === stringIdx && selectedNote?.fret === fret;
                    const isLickCurrent =
                      highlightedLickNote?.stringIndex === stringIdx &&
                      highlightedLickNote?.fret === fret;
                    const nextHint = getNextNoteHintForCoord(stringIdx, fret);

                    // Note types
                    const isScale = note.isScaleNote;
                    const isRoot = note.role === 'root';
                    const isBlue = note.role === 'blue';
                    const isTriad = note.isTriadNote;
                    const inZone = note.inZone;

                    // Companion chord checks
                    const isSweetChordTarget = Boolean(activeCompanionChord && activeCompanionChord.sweetNote.noteIndex === note.noteIndex);
                    let chordToneDegreeName: string | undefined = undefined;
                    if (activeCompanionChord) {
                      const cInterval = (note.noteIndex - activeCompanionChord.rootIndex + 12) % 12;
                      const cIdx = activeCompanionChord.intervals.indexOf(cInterval);
                      if (cIdx !== -1) {
                        chordToneDegreeName = activeCompanionChord.degreeNames[cIdx];
                      }
                    }

                    let label = note.noteName;
                    if (displayMode === 'intervals' && note.intervalName) {
                      label = note.intervalName;
                    } else if (displayMode === 'degrees') {
                      if (chordToneDegreeName && triadMode !== 'off') {
                        label = chordToneDegreeName;
                      } else {
                        label = note.intervalName || note.noteName;
                      }
                    }

                    const phraseStep = phraseHistory.findIndex(
                      (n) => n.stringIndex === stringIdx && n.fret === fret
                    );
                    const isPhraseNote = phraseStep !== -1;
                    const answerStarter = answerStarters?.find(
                      (a) => a.stringIndex === stringIdx && a.fret === fret
                    );
                    const isAnswerStarter = phraseMode === 'answer' && Boolean(answerStarter);

                    return (
                      <div
                        key={fret}
                        className="flex-1 min-w-[52px] h-full flex items-center justify-center relative border-r-2 border-stone-700/60"
                      >
                        {(isScale || inZone || isTriad || nextHint || isSelected || isPhraseNote || isAnswerStarter || isSweetChordTarget) && (
                          <button
                            type="button"
                            onClick={() => handleNoteClick(note)}
                            onMouseEnter={() => nextHint && setHoveredHint(nextHint)}
                            onMouseLeave={() => setHoveredHint(null)}
                            className={`group relative w-8 h-8 rounded-full flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                              isAnswerStarter
                                ? 'scale-130 ring-4 ring-cyan-300 bg-cyan-400 text-stone-950 font-black shadow-[0_0_26px_rgba(34,211,238,0.95)] z-30 animate-bounce hover:scale-140'
                                : nextHint
                                ? 'scale-125 ring-4 ring-emerald-300 bg-emerald-400 text-stone-950 font-black shadow-[0_0_22px_rgba(52,211,153,0.95)] z-30 animate-pulse hover:scale-135'
                                : isLickCurrent
                                ? 'scale-125 ring-4 ring-yellow-400 bg-yellow-400 text-stone-950 font-black shadow-xl shadow-yellow-400/80 animate-pulse z-30'
                                : isSelected
                                ? 'scale-120 ring-4 ring-amber-400 bg-amber-400 text-stone-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.8)] z-30'
                                : isSweetChordTarget && triadMode !== 'off'
                                ? 'scale-115 ring-3 ring-amber-300 bg-gradient-to-br from-amber-300 to-amber-500 text-stone-950 font-black shadow-[0_0_18px_rgba(245,158,11,0.9)] animate-pulse z-25 hover:scale-125'
                                : isRoot
                                ? inZone
                                  ? 'bg-amber-400 text-stone-950 font-black ring-2 ring-amber-200 shadow-md shadow-amber-500/40 hover:scale-110'
                                  : 'bg-amber-500/70 text-stone-950 font-bold hover:scale-105'
                                : isBlue
                                ? inZone
                                  ? 'bg-cyan-400 text-stone-950 font-black ring-2 ring-cyan-200 shadow-lg shadow-cyan-400/50 hover:scale-110'
                                  : 'bg-cyan-600/70 text-cyan-100 font-bold hover:scale-105'
                                : isTriad && triadMode !== 'off'
                                ? inZone
                                  ? 'bg-rose-500 text-white font-bold ring-2 ring-rose-300 shadow-md shadow-rose-500/40 hover:scale-110'
                                  : 'bg-rose-900/80 text-rose-200 border border-rose-500/40 hover:scale-105'
                                : inZone && isScale
                                ? 'bg-stone-800 text-amber-100 border border-amber-500/40 font-semibold hover:border-amber-400 hover:scale-105'
                                : isScale
                                ? 'bg-stone-900/80 text-stone-400 border border-stone-800 text-xs hover:text-stone-200'
                                : 'bg-stone-950/60 text-stone-600 border border-stone-900 text-[10px]'
                            }`}
                            title={`${note.noteName} (Fret ${note.fret}, String ${6 - note.stringIndex})`}
                          >
                            <span className="text-[11px] leading-none tracking-tight font-mono font-bold">
                              {label}
                            </span>

                            {/* Sub-label indicators */}
                            {isAnswerStarter ? (
                              <span className="text-[7px] leading-none font-black tracking-tighter text-stone-950">
                                ANS
                              </span>
                            ) : nextHint ? (
                              <span className="text-[8px] leading-none font-black tracking-tighter text-stone-950">
                                NEXT
                              </span>
                            ) : isSweetChordTarget && triadMode !== 'off' ? (
                              <span className="text-[7px] leading-none font-black tracking-tighter text-stone-950">
                                SWEET
                              </span>
                            ) : isRoot ? (
                              <span className="text-[8px] leading-none font-bold tracking-tighter opacity-80">
                                ROOT
                              </span>
                            ) : isBlue ? (
                              <span className="text-[8px] leading-none font-bold tracking-tighter opacity-90">
                                BLUE
                              </span>
                            ) : isTriad && triadMode !== 'off' ? (
                              <span className="text-[8px] leading-none font-bold tracking-tighter opacity-80">
                                {chordToneDegreeName || 'CHORD'}
                              </span>
                            ) : null}

                            {/* Phrase Step Number Pin */}
                            {isPhraseNote && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black flex items-center justify-center ring-1 ring-stone-900 z-40 shadow">
                                {phraseStep + 1}
                              </span>
                            )}

                            {/* SAVAGE NEXT NOTE FLOATING BADGE */}
                            {nextHint && !isAnswerStarter && (
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950 text-emerald-300 border border-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-40">
                                {nextHint.degreeChange}
                              </div>
                            )}

                            {/* ANSWER STARTER FLOATING BADGE */}
                            {isAnswerStarter && answerStarter && (
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-950 text-cyan-300 border border-cyan-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-40 animate-pulse">
                                ANSWER: {answerStarter.intervalName}
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive HUD / Legend & Active Hint Live Banner */}
      <div className="px-4 py-3 bg-[#15161b] border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Dynamic Hover/Active Insight */}
        {hoveredHint ? (
          <div className="flex items-center gap-2 text-emerald-300 font-mono animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <strong className="font-bold">{hoveredHint.technique}:</strong>
            <span className="text-stone-300">{hoveredHint.reason}</span>
          </div>
        ) : selectedNote ? (
          <div className="flex items-center gap-2 text-stone-300 font-mono">
            <span className="text-amber-400 font-bold">Active Note: {selectedNote.noteName}</span>
            <span className="text-stone-500">·</span>
            <span className="text-emerald-400 font-bold">
              {nextNoteHints.length} Green Follow-Up Targets Glowing on Neck
            </span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400 text-[11px]">Click any green note to solo forward!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-400 font-mono">
            <span>Click any fret to drop the anchor and ignite the green follow-up targets</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3.5 text-stone-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 ring-1 ring-amber-200 shrink-0" />
            <span className="text-stone-200 font-medium">Root</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 ring-1 ring-cyan-200 shrink-0" />
            <span className="text-cyan-300 font-medium">Blue Note</span>
          </div>
          {triadMode !== 'off' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 ring-1 ring-rose-300 shrink-0" />
              <span className="text-rose-300 font-medium">Triad</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300 animate-pulse shrink-0" />
            <span className="text-emerald-300 font-bold">Green Next-Note Targets</span>
          </div>
        </div>
      </div>
    </div>
  );
};
