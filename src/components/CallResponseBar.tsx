/**
 * Call & Response Phrase Architecture & Keyboard Navigation HUD
 * Makes blues improvisation stick through structured musical dialogue
 */

import React from 'react';
import {
  FretboardNote,
  AnswerStarterNote,
  ChordProgressionStep,
  KeyChordInfo,
} from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Play,
  RotateCcw,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  CornerDownRight,
  BookmarkCheck,
  Music,
} from 'lucide-react';

interface CallResponseBarProps {
  phraseHistory: FretboardNote[];
  phraseMode: 'call' | 'answer';
  onTogglePhraseMode: () => void;
  onClearPhrase: () => void;
  onStepNextBestNote: () => void;
  onStepPrevNote: () => void;
  onShiftZone: (dir: 'up' | 'down') => void;
  answerStarters: AnswerStarterNote[];
  onSelectAnswerStarter: (starter: AnswerStarterNote) => void;
  activeChord: ChordProgressionStep;
  activeZoneName: string;
  activeCompanionChord?: KeyChordInfo;
  onCycleCompanionChord?: () => void;
}

export const CallResponseBar: React.FC<CallResponseBarProps> = ({
  phraseHistory,
  phraseMode,
  onTogglePhraseMode,
  onClearPhrase,
  onStepNextBestNote,
  onStepPrevNote,
  onShiftZone,
  answerStarters,
  onSelectAnswerStarter,
  activeChord,
  activeZoneName,
  activeCompanionChord,
  onCycleCompanionChord,
}) => {
  // Replay user's phrase sequentially through Web Audio
  const handleReplayPhrase = () => {
    if (phraseHistory.length === 0) return;

    phraseHistory.forEach((note, idx) => {
      setTimeout(() => {
        audioEngine.playGuitarNote(note.frequency, 0.75, 0.85);
      }, idx * 360);
    });
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-[#141519] p-4 sm:p-5 shadow-xl space-y-4">
      {/* 1. Header with Mode Badge & Keyboard Controls HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-100 font-mono">
                Call & Response Improvisation Engine
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  phraseMode === 'call'
                    ? 'bg-amber-400 text-stone-950 ring-1 ring-amber-300'
                    : 'bg-emerald-400 text-stone-950 ring-1 ring-emerald-300'
                }`}
              >
                {phraseMode === 'call' ? 'Step 1: The Call (Question)' : 'Step 2: The Answer (Resolution)'}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Improvise in musical sentences instead of endless scale noodling
            </p>
          </div>
        </div>

        {/* Keyboard Arrow Navigation HUD */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-lg border border-stone-800 text-xs font-mono">
          <button
            type="button"
            onClick={onStepPrevNote}
            disabled={phraseHistory.length <= 1}
            className="flex items-center gap-1 px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Step back to previous note in phrase [Left Arrow]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <kbd className="text-[10px] bg-stone-950 px-1 py-0.5 rounded border border-stone-700">←</kbd>
            <span className="hidden sm:inline">Prev Note</span>
          </button>

          <button
            type="button"
            onClick={onStepNextBestNote}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer font-bold transition-all shadow-sm"
            title="Play the best next follow-up note [Right Arrow]"
          >
            <span className="hidden sm:inline">Next Best</span>
            <kbd className="text-[10px] bg-stone-950 px-1 py-0.5 rounded border border-emerald-500/40 text-emerald-400">→</kbd>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <div className="w-[1px] h-4 bg-stone-800 mx-1" />

          {/* Up / Down zone shift */}
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <span className="text-stone-500 hidden md:inline">Zone:</span>
            <button
              type="button"
              onClick={() => onShiftZone('down')}
              className="px-1.5 py-1 rounded bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
              title="Shift zone frets down [Down Arrow]"
            >
              <kbd className="text-[10px] bg-stone-950 px-1 py-0.5 rounded border border-stone-700">↓</kbd>
            </button>
            <button
              type="button"
              onClick={() => onShiftZone('up')}
              className="px-1.5 py-1 rounded bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
              title="Shift zone frets up [Up Arrow]"
            >
              <kbd className="text-[10px] bg-stone-950 px-1 py-0.5 rounded border border-stone-700">↑</kbd>
            </button>
          </div>

          {onCycleCompanionChord && (
            <>
              <div className="w-[1px] h-4 bg-stone-800 mx-1" />
              <button
                type="button"
                onClick={onCycleCompanionChord}
                className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer font-bold transition-all"
                title="Switch companion chord for active root [Press C or 1-8]"
              >
                <Music className="w-3 h-3 text-amber-400" />
                <kbd className="text-[10px] bg-stone-950 px-1 py-0.5 rounded border border-amber-500/40 text-amber-300">C</kbd>
                <span className="hidden sm:inline">{activeCompanionChord?.chordName || 'Chord'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Current Phrase Breadcrumbs Trail */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-mono text-stone-400 shrink-0">
            Current Phrase ({phraseHistory.length} notes):
          </span>

          {phraseHistory.length === 0 ? (
            <span className="text-xs text-stone-500 italic">
              Click any note on the fretboard or press <kbd className="font-mono text-stone-300 bg-stone-900 px-1 py-0.5 rounded border border-stone-800">→</kbd> to start
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              {phraseHistory.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => audioEngine.playGuitarNote(note.frequency, 0.75, 0.85)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900 border border-stone-700 text-xs font-mono hover:border-amber-400 text-stone-200 transition-colors cursor-pointer"
                    title={`Replay ${note.noteName} (Fret ${note.fret}, Str ${6 - note.stringIndex})`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <strong className="text-amber-400">{note.noteName}</strong>
                    <span className="text-[10px] text-stone-400">({note.intervalName || 'T'})</span>
                  </button>
                  {idx < phraseHistory.length - 1 && (
                    <CornerDownRight className="w-3 h-3 text-stone-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phrase Action Buttons */}
        {phraseHistory.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReplayPhrase}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Hear your full improvised phrase played with guitar tone"
            >
              <Play className="w-3.5 h-3.5 fill-amber-300" />
              Replay Phrase
            </button>

            <button
              type="button"
              onClick={onTogglePhraseMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                phraseMode === 'call'
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-1 ring-amber-300'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 ring-1 ring-emerald-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {phraseMode === 'call' ? 'Finish Call (Get Answer) [Space]' : 'Start New Call [Space]'}
            </button>

            <button
              type="button"
              onClick={onClearPhrase}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors cursor-pointer"
              title="Clear phrase history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. The Recommended Answer Starters (When Call is finished) */}
      {phraseMode === 'answer' && answerStarters.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-emerald-950/40 border border-emerald-500/40 shadow-inner">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              Recommended Starting Notes for "The Answer" (Resolving your call):
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              Pick one or hit <kbd className="text-emerald-400">→</kbd> to launch the answer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {answerStarters.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectAnswerStarter(starter)}
                className="p-3 rounded-lg bg-stone-900/90 hover:bg-stone-850 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer shadow group"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black flex items-center justify-center">
                      {starter.noteName}
                    </span>
                    {starter.title}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Str {6 - starter.stringIndex} · Fret {starter.fret}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug mb-1">
                  {starter.explanation}
                </p>
                <div className="text-[10px] font-mono text-amber-400 font-semibold truncate">
                  {starter.vibe}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Why This Sticks for Improvisation (Educational Wisdom) */}
      <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            3 Sticky Rules for Intuitive Soloing:
          </span>
          <span className="text-stone-300 font-mono">
            <strong>1.</strong> 3 notes out (The Call), 3 notes back (The Answer)
          </span>
          <span className="text-stone-500">·</span>
          <span className="text-stone-300 font-mono">
            <strong>2.</strong> End question on tension ($b3, 4, b5$), start answer on resolution ($R, 3$)
          </span>
          <span className="text-stone-500">·</span>
          <span className="text-stone-300 font-mono">
            <strong>3.</strong> When chord shifts to {activeChord.chordName}, target its 3rd
          </span>
        </div>

        <div className="text-[11px] font-mono text-stone-500">
          Keys: <kbd className="text-stone-300 bg-stone-900 px-1 py-0.5 rounded border border-stone-700">←</kbd> Back · <kbd className="text-stone-300 bg-stone-900 px-1 py-0.5 rounded border border-stone-700">→</kbd> Best Next · <kbd className="text-stone-300 bg-stone-900 px-1 py-0.5 rounded border border-stone-700">↑↓</kbd> Zone Frets · <kbd className="text-stone-300 bg-stone-900 px-1 py-0.5 rounded border border-stone-700">Space</kbd> Call/Answer
        </div>
      </div>
    </div>
  );
};
