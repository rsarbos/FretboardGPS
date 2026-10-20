/**
 * BluesZone: Pentatonic & Triad Soloing Engine
 * Intuitive Studio Layout with Dynamic Fretboard, Savage Green Next-Note GPS,
 * Companion Chords Matrix ([C] / [1-8] key combination), Call & Response Improvisation Engine,
 * Real-Time Backing Track Sync, and Master Lick Studio
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  NOTES_SHARP,
  SCALES,
  ScaleDefinition,
  CAGED_ZONES,
  TUNINGS,
  Tuning,
  FretboardNote,
  NextNoteHint,
  AnswerStarterNote,
  generateNextNoteHints,
  getRecommendedAnswerStarters,
  getNextZoneId,
  getZoneFretRange,
  getNoteName,
  PROGRESSIONS,
  ChordProgressionStep,
  KeyChordInfo,
  getKeyChordFamily,
} from './utils/guitarTheory';
import { audioEngine } from './utils/audioEngine';
import { Fretboard } from './components/Fretboard';
import { NextNoteCompass } from './components/NextNoteCompass';
import { BackingTrackPlayer } from './components/BackingTrackPlayer';
import { ZoneSelector } from './components/ZoneSelector';
import { TriadOverlayControls } from './components/TriadOverlayControls';
import { LickGenerator } from './components/LickGenerator';
import { CallResponseBar } from './components/CallResponseBar';
import { CompanionChordsBar } from './components/CompanionChordsBar';
import { CompanionChordsDetail } from './components/CompanionChordsDetail';
import {
  Music2,
  Play,
  Pause,
  Compass,
  Disc3,
  Flame,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight,
  Volume2,
  MessageSquare,
  Music,
} from 'lucide-react';

export default function App() {
  // Key state: Default to Key of A (note index 9)
  const [rootNoteIndex, setRootNoteIndex] = useState<number>(9);
  const [selectedScaleId, setSelectedScaleId] = useState<string>('minorBlues');
  const [selectedTuningId, setSelectedTuningId] = useState<string>('standard');
  const [activeZoneId, setActiveZoneId] = useState<string>('box1');
  const [displayMode, setDisplayMode] = useState<'intervals' | 'noteNames' | 'degrees'>('intervals');

  // Triad state
  const [triadMode, setTriadMode] = useState<'off' | 'activeChord' | 'allInversions' | 'i_iv_v'>('activeChord');
  const [selectedTriadType, setSelectedTriadType] = useState<string>('dom7');
  const [isolatedStringRange, setIsolatedStringRange] = useState<'all' | 'top3' | 'middle3'>('all');

  // Backing Track State
  const [activeProgression, setActiveProgression] = useState(PROGRESSIONS[0]);
  const [isPlayingBacking, setIsPlayingBacking] = useState(false);
  const [currentBar, setCurrentBar] = useState<number>(1);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [bpm, setBpm] = useState<number>(PROGRESSIONS[0].defaultBpm);
  const [autoSyncTriads, setAutoSyncTriads] = useState<boolean>(true);

  // Active workspace tab below fretboard
  const [activeTab, setActiveTab] = useState<'compass' | 'chords' | 'backing' | 'licks'>('compass');

  // Determine if active scale is minor blues
  const isMinorBlues = selectedScaleId === 'minorBlues' || selectedScaleId === 'minorPentatonic';

  // Compute Companion Chords Family for the active root
  const companionChords = useMemo(() => {
    return getKeyChordFamily(rootNoteIndex, isMinorBlues);
  }, [rootNoteIndex, isMinorBlues]);

  const [activeCompanionChordIndex, setActiveCompanionChordIndex] = useState<number>(0);

  // Active Companion Chord
  const activeCompanionChord = useMemo(() => {
    return companionChords[activeCompanionChordIndex] || companionChords[0];
  }, [companionChords, activeCompanionChordIndex]);

  // Keep index in bounds if chord list size changes
  useEffect(() => {
    if (activeCompanionChordIndex >= companionChords.length) {
      setActiveCompanionChordIndex(0);
    }
  }, [companionChords, activeCompanionChordIndex]);

  // Active progression bars computed for current key
  const progressionBars = useMemo(() => {
    return activeProgression.getBars(rootNoteIndex);
  }, [activeProgression, rootNoteIndex]);

  const [currentChord, setCurrentChord] = useState<ChordProgressionStep>(progressionBars[0]);

  // Keep current chord synced when key or progression changes
  useEffect(() => {
    const updated = progressionBars[Math.min(currentBar - 1, progressionBars.length - 1)] || progressionBars[0];
    setCurrentChord(updated);
  }, [progressionBars, currentBar]);

  // Selected note for Next-Note Compass
  const [selectedNote, setSelectedNote] = useState<FretboardNote | null>(null);

  // Phrase history for Call & Response improvisation
  const [phraseHistory, setPhraseHistory] = useState<FretboardNote[]>([]);
  const [phraseMode, setPhraseMode] = useState<'call' | 'answer'>('call');

  // Highlighted note for Lick Sequencer
  const [highlightedLickNote, setHighlightedLickNote] = useState<{ stringIndex: number; fret: number } | null>(null);

  // Active scale object
  const activeScale = useMemo(() => {
    return SCALES.find((s) => s.id === selectedScaleId) || SCALES[0];
  }, [selectedScaleId]);

  // Active tuning object
  const activeTuning = useMemo(() => {
    return TUNINGS[selectedTuningId] || TUNINGS.standard;
  }, [selectedTuningId]);

  // Zone fret range
  const zoneFretRange = useMemo(() => {
    return getZoneFretRange(activeZoneId, rootNoteIndex, activeTuning);
  }, [activeZoneId, rootNoteIndex, activeTuning]);

  // Active zone name
  const activeZoneName = useMemo(() => {
    return CAGED_ZONES.find((z) => z.id === activeZoneId)?.name || 'Full Fretboard';
  }, [activeZoneId]);

  // Cycle to next/prev companion chord (Key combination 'C' or 'Shift+C')
  const handleCycleCompanionChord = useCallback((direction: 'next' | 'prev' = 'next') => {
    setActiveCompanionChordIndex((prev) => {
      const len = companionChords.length;
      const nextIdx = direction === 'next' ? (prev + 1) % len : (prev - 1 + len) % len;
      const chord = companionChords[nextIdx];
      audioEngine.strumGuitarChord(chord.rootIndex, chord.quality);
      return nextIdx;
    });
  }, [companionChords]);

  // Generate dynamic next-note hints
  const nextNoteHints = useMemo(() => {
    if (!selectedNote) return [];
    return generateNextNoteHints(
      selectedNote,
      rootNoteIndex,
      activeScale,
      currentChord,
      activeTuning,
      zoneFretRange.minFret,
      zoneFretRange.maxFret,
      phraseHistory
    );
  }, [selectedNote, rootNoteIndex, activeScale, currentChord, activeTuning, zoneFretRange, phraseHistory]);

  // Compute recommended Answer Starters when in answer mode
  const answerStarters = useMemo(() => {
    return getRecommendedAnswerStarters(
      phraseHistory,
      rootNoteIndex,
      activeScale,
      currentChord,
      activeTuning,
      zoneFretRange.minFret,
      zoneFretRange.maxFret
    );
  }, [phraseHistory, rootNoteIndex, activeScale, currentChord, activeTuning, zoneFretRange]);

  // Helper to pick starter note for compass
  const handlePickStarterNote = useCallback((role: 'root' | 'b3' | 'b5' | '5') => {
    const targetInterval = role === 'root' ? 0 : role === 'b3' ? 3 : role === 'b5' ? 6 : 7;
    const targetNoteIdx = (rootNoteIndex + targetInterval) % 12;

    for (let s = 0; s < 6; s++) {
      for (let f = zoneFretRange.minFret; f <= zoneFretRange.maxFret; f++) {
        const noteIdx = (activeTuning.strings[s].noteIndex + f) % 12;
        if (noteIdx === targetNoteIdx) {
          const noteName = getNoteName(noteIdx);
          const freq = 440 * Math.pow(2, ((activeTuning.strings[s].octave * 12 + activeTuning.strings[s].noteIndex + 12 + f) - 69) / 12);
          const intervalName = activeScale.intervalNames[activeScale.intervals.indexOf(targetInterval)] || `${role}`;
          const dummyNote: FretboardNote = {
            stringIndex: s,
            fret: f,
            noteIndex: noteIdx,
            noteName,
            octave: 3,
            frequency: freq,
            interval: targetInterval,
            intervalName,
            role: role === 'root' ? 'root' : role === 'b5' ? 'blue' : 'triad',
            isScaleNote: true,
            isTriadNote: role === 'root' || role === '5',
            inZone: true,
          };
          audioEngine.playGuitarNote(freq, 1.2, 0.85);
          setSelectedNote(dummyNote);
          setPhraseHistory((prev) => [...prev, dummyNote]);
          setActiveTab('compass');
          return;
        }
      }
    }
  }, [rootNoteIndex, activeTuning, zoneFretRange, activeScale]);

  // Jump to target note
  const handleSelectTarget = useCallback((targetString: number, targetFret: number) => {
    const noteIdx = (activeTuning.strings[targetString].noteIndex + targetFret) % 12;
    const noteName = getNoteName(noteIdx);
    const freq = 440 * Math.pow(2, ((activeTuning.strings[targetString].octave * 12 + activeTuning.strings[targetString].noteIndex + 12 + targetFret) - 69) / 12);
    const interval = (noteIdx - rootNoteIndex + 12) % 12;
    const intervalIndex = activeScale.intervals.indexOf(interval);
    const intervalName = intervalIndex !== -1 ? activeScale.intervalNames[intervalIndex] : undefined;

    const targetNote: FretboardNote = {
      stringIndex: targetString,
      fret: targetFret,
      noteIndex: noteIdx,
      noteName,
      octave: 3,
      frequency: freq,
      interval,
      intervalName,
      role: activeScale.roleMap[interval],
      isScaleNote: intervalIndex !== -1,
      isTriadNote: false,
      inZone: true,
    };

    audioEngine.playGuitarNote(freq, 1.2, 0.85);
    setSelectedNote(targetNote);
    setPhraseHistory((prev) => [...prev, targetNote]);
  }, [activeTuning, rootNoteIndex, activeScale]);

  // Select note directly on fretboard click
  const handleFretboardNoteClick = useCallback((note: FretboardNote) => {
    setSelectedNote(note);
    setPhraseHistory((prev) => [...prev, note]);
  }, []);

  // Step to best next note (Right Arrow key)
  const handleStepNextBestNote = useCallback(() => {
    if (nextNoteHints.length > 0) {
      const prevNote = phraseHistory.length > 1 ? phraseHistory[phraseHistory.length - 2] : null;

      // Pick first candidate that is not current note and not immediately preceding
      let candidate = nextNoteHints.find(
        (h) =>
          !(h.targetString === selectedNote?.stringIndex && h.targetFret === selectedNote?.fret) &&
          (!prevNote || !(h.targetString === prevNote.stringIndex && h.targetFret === prevNote.fret))
      );

      if (!candidate) {
        candidate = nextNoteHints.find(
          (h) => !(h.targetString === selectedNote?.stringIndex && h.targetFret === selectedNote?.fret)
        );
      }

      if (!candidate) {
        candidate = nextNoteHints[0];
      }

      handleSelectTarget(candidate.targetString, candidate.targetFret);
    } else if (!selectedNote) {
      handlePickStarterNote('root');
    }
  }, [nextNoteHints, selectedNote, phraseHistory, handleSelectTarget, handlePickStarterNote]);

  // Step to previous note (Left Arrow key)
  const handleStepPrevNote = useCallback(() => {
    if (phraseHistory.length > 1) {
      const updated = phraseHistory.slice(0, phraseHistory.length - 1);
      const prevNote = updated[updated.length - 1];
      setPhraseHistory(updated);
      setSelectedNote(prevNote);
      audioEngine.playGuitarNote(prevNote.frequency, 0.9, 0.85);
    }
  }, [phraseHistory]);

  // Shift Zone frets (Up/Down Arrow keys)
  const handleShiftZone = useCallback((direction: 'up' | 'down') => {
    const nextZ = getNextZoneId(activeZoneId, direction);
    setActiveZoneId(nextZ);
  }, [activeZoneId]);

  // Toggle Call / Answer (Spacebar)
  const handleTogglePhraseMode = useCallback(() => {
    if (phraseMode === 'call') {
      setPhraseMode('answer');
    } else {
      setPhraseMode('call');
      setPhraseHistory([]);
    }
  }, [phraseMode]);

  // Select Answer Starter Note
  const handleSelectAnswerStarter = useCallback((starter: AnswerStarterNote) => {
    const noteIdx = starter.noteIndex;
    const interval = (noteIdx - rootNoteIndex + 12) % 12;
    const targetNote: FretboardNote = {
      stringIndex: starter.stringIndex,
      fret: starter.fret,
      noteIndex: starter.noteIndex,
      noteName: starter.noteName,
      octave: 3,
      frequency: starter.frequency,
      interval,
      intervalName: starter.intervalName,
      role: activeScale.roleMap[interval],
      isScaleNote: true,
      isTriadNote: starter.type === 'sweet3rd' || starter.type === 'resolution',
      inZone: true,
    };
    audioEngine.playGuitarNote(starter.frequency, 1.2, 0.85);
    setSelectedNote(targetNote);
    setPhraseHistory([targetNote]);
    setPhraseMode('call');
  }, [rootNoteIndex, activeScale]);

  // Global Keyboard Listener for Arrow Keys, Spacebar, [C] Chord Switcher, and [1-8]
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepNextBestNote();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepPrevNote();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleShiftZone('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleShiftZone('down');
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleTogglePhraseMode();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCycleCompanionChord(e.shiftKey ? 'prev' : 'next');
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key >= '1' && e.key <= '8') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < companionChords.length) {
          e.preventDefault();
          setActiveCompanionChordIndex(idx);
          const targetChord = companionChords[idx];
          audioEngine.strumGuitarChord(targetChord.rootIndex, targetChord.quality);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleStepNextBestNote,
    handleStepPrevNote,
    handleShiftZone,
    handleTogglePhraseMode,
    handleCycleCompanionChord,
    companionChords,
  ]);

  // Toggle backing track
  const handleToggleBacking = () => {
    if (isPlayingBacking) {
      audioEngine.stopBackingTrack();
      setIsPlayingBacking(false);
    } else {
      audioEngine.startBackingTrack(progressionBars, bpm, (bar, beat, chord) => {
        setCurrentBar(bar);
        setCurrentBeat(beat);
        if (chord) setCurrentChord(chord);
      });
      setIsPlayingBacking(true);
    }
  };

  const COMMON_BLUES_KEYS = [
    { label: 'A', index: 9 },
    { label: 'E', index: 4 },
    { label: 'G', index: 7 },
    { label: 'C', index: 0 },
    { label: 'D', index: 2 },
    { label: 'B', index: 11 },
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-stone-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* 1. TOP BAR */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-stone-800/80 bg-[#121317]/95 sticky top-0 z-50 backdrop-blur-md">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-md shadow-amber-500/20">
            <Music2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-stone-100 font-mono leading-tight">
              BluesZone
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono font-medium">
              Soloing & Chord Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('compass')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compass'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Green Solo GPS</span>
            {nextNoteHints.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chords')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chords'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>Companion Chords</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backing')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backing'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>12-Bar Backing Station</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('licks')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'licks'
                ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/40 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-yellow-400" />
            <span>Master Licks</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleBacking}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md ${
              isPlayingBacking
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-2 ring-amber-300'
            }`}
          >
            {isPlayingBacking ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Stop Backing
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Jam Track
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Top Control Deck (Key, Scale & Mode) */}
        <div className="rounded-xl border border-stone-800 bg-[#141519] p-3.5 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-center">
            {/* Key Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-stone-400">Key Root:</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {getNoteName(rootNoteIndex)} Blues
                </span>
              </div>
              <div className="flex items-center gap-1">
                {COMMON_BLUES_KEYS.map((k) => (
                  <button
                    key={k.index}
                    type="button"
                    onClick={() => setRootNoteIndex(k.index)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                      rootNoteIndex === k.index
                        ? 'bg-amber-500 text-stone-950 font-bold shadow'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
                <select
                  value={rootNoteIndex}
                  aria-label="All chromatic keys"
                  onChange={(e) => setRootNoteIndex(Number(e.target.value))}
                  className="bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded px-1.5 py-1 focus:outline-none focus:border-amber-400"
                >
                  {NOTES_SHARP.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scale Selector */}
            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">
                Scale Engine:
              </label>
              <select
                value={selectedScaleId}
                onChange={(e) => setSelectedScaleId(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-medium"
              >
                {SCALES.map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Note Display Mode */}
            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">
                Note Label Mode:
              </label>
              <div className="flex items-center gap-1 p-0.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDisplayMode('intervals')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    displayMode === 'intervals'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Intervals
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('noteNames')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    displayMode === 'noteNames'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Notes
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('degrees')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    displayMode === 'degrees'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Chord Degrees
                </button>
              </div>
            </div>

            {/* Triad Overlay Toggle */}
            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">
                Chord Tone Overlay:
              </label>
              <div className="flex items-center gap-1 p-0.5 bg-stone-900 rounded-lg border border-stone-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTriadMode('activeChord')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    triadMode === 'activeChord'
                      ? 'bg-rose-500 text-white font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Highlight active companion chord tones"
                >
                  Active Chord
                </button>
                <button
                  type="button"
                  onClick={() => setTriadMode('i_iv_v')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    triadMode === 'i_iv_v'
                      ? 'bg-rose-500 text-white font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Highlight I, IV, and V chord triad notes"
                >
                  I · IV · V
                </button>
                <button
                  type="button"
                  onClick={() => setTriadMode('off')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    triadMode === 'off'
                      ? 'bg-stone-800 text-stone-200 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. COMPANION CHORDS RAIL (Chords for the active root + [C] switcher) */}
        <section id="companion-chords-rail">
          <CompanionChordsBar
            companionChords={companionChords}
            activeChordIndex={activeCompanionChordIndex}
            onSelectChordIndex={setActiveCompanionChordIndex}
            rootNoteName={getNoteName(rootNoteIndex)}
          />
        </section>

        {/* 3. DYNAMIC FRETBOARD (The Visual Centerpiece) */}
        <section id="fretboard-stage">
          <Fretboard
            rootNoteIndex={rootNoteIndex}
            scale={activeScale}
            activeZoneId={activeZoneId}
            onSelectZone={setActiveZoneId}
            zoneFretRange={zoneFretRange}
            activeChord={currentChord}
            activeCompanionChord={activeCompanionChord}
            onCycleCompanionChord={() => handleCycleCompanionChord('next')}
            tuning={activeTuning}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            triadMode={triadMode}
            setTriadMode={setTriadMode}
            selectedTriadType={selectedTriadType}
            isolatedStringRange={isolatedStringRange}
            onSelectStringRange={setIsolatedStringRange}
            selectedNote={selectedNote}
            onSelectNote={handleFretboardNoteClick}
            nextNoteHints={nextNoteHints}
            highlightedLickNote={highlightedLickNote}
            phraseHistory={phraseHistory}
            answerStarters={answerStarters}
            phraseMode={phraseMode}
            onStepNextBestNote={handleStepNextBestNote}
            onStepPrevNote={handleStepPrevNote}
            numFrets={20}
          />
        </section>

        {/* 4. CALL & RESPONSE IMPROVISATION & KEYBOARD HUD */}
        <section id="call-response-engine">
          <CallResponseBar
            phraseHistory={phraseHistory}
            phraseMode={phraseMode}
            onTogglePhraseMode={handleTogglePhraseMode}
            onClearPhrase={() => setPhraseHistory([])}
            onStepNextBestNote={handleStepNextBestNote}
            onStepPrevNote={handleStepPrevNote}
            onShiftZone={handleShiftZone}
            answerStarters={answerStarters}
            onSelectAnswerStarter={handleSelectAnswerStarter}
            activeChord={currentChord}
            activeZoneName={activeZoneName}
            activeCompanionChord={activeCompanionChord}
            onCycleCompanionChord={() => handleCycleCompanionChord('next')}
          />
        </section>

        {/* 5. MINI BACKING GROOVE BAR */}
        <div className="rounded-xl border border-stone-800 bg-[#16171d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleBacking}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlayingBacking
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
              }`}
            >
              {isPlayingBacking ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Jam Track
                </>
              )}
            </button>

            <div className="text-stone-300">
              <span className="text-stone-500">Bar:</span>{' '}
              <strong className="text-amber-400 font-bold">
                {currentBar} of {progressionBars.length}
              </strong>
            </div>

            <div className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">
              Backing Chord: <strong className="text-amber-300 font-bold">{currentChord.chordName}</strong>{' '}
              <span className="text-stone-400 text-[10px]">[{currentChord.chordLabel}]</span>
            </div>

            {/* 4 Beat LEDs */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((b) => (
                <span
                  key={b}
                  className={`w-2 h-2 rounded-full transition-all duration-75 ${
                    isPlayingBacking && currentBeat === b
                      ? b === 1
                        ? 'bg-amber-400 ring-2 ring-amber-200 scale-125'
                        : 'bg-cyan-400 scale-110'
                      : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-Sync Toggle */}
            <button
              type="button"
              onClick={() => setAutoSyncTriads(!autoSyncTriads)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                autoSyncTriads ? 'text-amber-400 font-semibold' : 'text-stone-500'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Auto-Sync: {autoSyncTriads ? 'ON' : 'OFF'}</span>
            </button>

            {/* Tempo */}
            <div className="flex items-center gap-1 text-stone-300">
              <span className="text-stone-500">BPM:</span>
              <button
                type="button"
                onClick={() => setBpm(Math.max(45, bpm - 5))}
                className="w-4 h-4 rounded bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="text-amber-400 font-bold tabular-nums min-w-[32px] text-center">
                {bpm}
              </span>
              <button
                type="button"
                onClick={() => setBpm(Math.min(180, bpm + 5))}
                className="w-4 h-4 rounded bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 6. WORKSPACE TABS SELECTOR */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('compass')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'compass'
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Green Solo GPS</span>
            {nextNoteHints.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-950 text-emerald-400 font-bold">
                {nextNoteHints.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chords')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chords'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>2. Companion Chords & Voicings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backing')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backing'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>3. 12-Bar Backing Station</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('licks')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'licks'
                ? 'bg-yellow-400 text-stone-950 shadow-md shadow-yellow-400/20'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>4. Master Blues Licks</span>
          </button>
        </div>

        {/* 7. TAB CONTENT PANELS */}
        <div>
          {/* TAB 1: GREEN SOLO GPS */}
          {activeTab === 'compass' && (
            <NextNoteCompass
              selectedNote={selectedNote}
              rootNoteIndex={rootNoteIndex}
              scale={activeScale}
              activeChord={currentChord}
              nextNoteHints={nextNoteHints}
              onSelectTarget={handleSelectTarget}
              onPickStarterNote={handlePickStarterNote}
            />
          )}

          {/* TAB 2: COMPANION CHORDS & VOICINGS */}
          {activeTab === 'chords' && (
            <div className="space-y-4">
              <CompanionChordsDetail
                companionChords={companionChords}
                activeChordIndex={activeCompanionChordIndex}
                onSelectChordIndex={setActiveCompanionChordIndex}
                rootNoteName={getNoteName(rootNoteIndex)}
              />
              <ZoneSelector
                activeZoneId={activeZoneId}
                onSelectZone={setActiveZoneId}
                zoneFretRange={zoneFretRange}
                keyRootName={getNoteName(rootNoteIndex)}
                isolatedStringRange={isolatedStringRange}
                onSelectStringRange={setIsolatedStringRange}
              />
            </div>
          )}

          {/* TAB 3: BACKING TRACK 12-BAR STATION */}
          {activeTab === 'backing' && (
            <BackingTrackPlayer
              rootNoteIndex={rootNoteIndex}
              activeProgression={activeProgression}
              onSelectProgression={setActiveProgression}
              isPlaying={isPlayingBacking}
              setIsPlaying={setIsPlayingBacking}
              currentBar={currentBar}
              setCurrentBar={setCurrentBar}
              currentBeat={currentBeat}
              setCurrentBeat={setCurrentBeat}
              currentChord={currentChord}
              setCurrentChord={setCurrentChord}
              bpm={bpm}
              setBpm={setBpm}
              autoSyncTriads={autoSyncTriads}
              setAutoSyncTriads={setAutoSyncTriads}
              bars={progressionBars}
            />
          )}

          {/* TAB 4: SIGNATURE LICKS */}
          {activeTab === 'licks' && (
            <LickGenerator
              rootNoteIndex={rootNoteIndex}
              activeZoneId={activeZoneId}
              zoneBaseFret={zoneFretRange.baseFret}
              tuning={activeTuning}
              onHighlightNote={setHighlightedLickNote}
            />
          )}
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="mt-8 border-t border-stone-800/80 bg-[#101115] py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-stone-400 font-mono">
            <span className="font-bold text-stone-300">BluesZone Soloing Engine</span>
            <span>·</span>
            <span className="text-emerald-400">Arrows (← → ↑ ↓)</span>
            <span>·</span>
            <span className="text-amber-400">Chord Key [C] / [1–8]</span>
            <span>·</span>
            <span className="text-cyan-400">Call ⇄ Answer [Space]</span>
          </div>
          <div className="text-stone-500 font-mono text-[11px]">
            Engineered for expressive blues improvisation over real chord changes
          </div>
        </div>
      </footer>
    </div>
  );
}
