/**
 * Interactive Blues Lick & Solo Phrase Generator with Step-by-Step Animated Playback
 */

import React, { useState } from 'react';
import {
  PRESET_LICKS,
  BluesLick,
  getNoteName,
  getNoteFrequency,
  Tuning,
  CAGED_ZONES,
} from '../utils/guitarTheory';
import { audioEngine } from '../utils/audioEngine';
import { Flame, Play, Pause, RotateCcw, Award } from 'lucide-react';

interface LickGeneratorProps {
  rootNoteIndex: number;
  activeZoneId: string;
  zoneBaseFret: number;
  tuning: Tuning;
  onHighlightNote: (coord: { stringIndex: number; fret: number } | null) => void;
}

export const LickGenerator: React.FC<LickGeneratorProps> = ({
  rootNoteIndex,
  activeZoneId,
  zoneBaseFret,
  tuning,
  onHighlightNote,
}) => {
  const [selectedLick, setSelectedLick] = useState<BluesLick>(PRESET_LICKS[0]);
  const [isPlayingLick, setIsPlayingLick] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  // Play the lick sequentially with visual fretboard animation
  const handlePlayLick = async () => {
    if (isPlayingLick) return;
    setIsPlayingLick(true);

    const steps = selectedLick.notes;
    let accumulatedTime = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const actualFret = Math.max(0, Math.min(22, zoneBaseFret + step.fretOffset));
      const freq = getNoteFrequency(step.stringIndex, actualFret, tuning);

      setTimeout(() => {
        setActiveStepIndex(i);
        onHighlightNote({ stringIndex: step.stringIndex, fret: actualFret });

        const tech = step.technique === 'bendFull'
          ? 'bendFull'
          : step.technique === 'bend1/2'
          ? 'bend1/2'
          : step.technique === 'vibrato'
          ? 'vibrato'
          : step.technique === 'slide'
          ? 'slide'
          : 'pick';

        audioEngine.playGuitarNote(freq, step.durationBeats * 0.75, 0.85, tech);
      }, accumulatedTime * 1000);

      // Duration in seconds (assuming ~100 BPM: 60/100 = 0.6s per beat)
      accumulatedTime += step.durationBeats * 0.6;
    }

    // Reset after lick finishes
    setTimeout(() => {
      setIsPlayingLick(false);
      setActiveStepIndex(null);
      onHighlightNote(null);
    }, accumulatedTime * 1000 + 400);
  };

  return (
    <div className="rounded-xl border border-stone-800 bg-[#141519] p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              Blues Solo Phrases & Signature Licks
            </h3>
            <p className="text-xs text-stone-400">
              Hear phrasing in action with animated fretboard path and technique cues
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isPlayingLick}
          onClick={handlePlayLick}
          className={`px-4 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            isPlayingLick
              ? 'bg-yellow-400 text-stone-950 ring-2 ring-yellow-200 animate-pulse'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-1 ring-amber-300'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isPlayingLick ? 'Playing Lick on Fretboard...' : 'Play Lick on Fretboard'}
        </button>
      </div>

      {/* Lick Tabs Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4">
        {PRESET_LICKS.map((lick) => {
          const isSelected = selectedLick.id === lick.id;
          return (
            <button
              key={lick.id}
              type="button"
              onClick={() => {
                setSelectedLick(lick);
                setActiveStepIndex(null);
                onHighlightNote(null);
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-yellow-400 bg-yellow-500/10 ring-1 ring-yellow-400 shadow-sm'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1">
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <Award className="w-3 h-3" />
                  {lick.masterArtist}
                </span>
                <span className="text-[10px] text-stone-500">{lick.notes.length} notes</span>
              </div>
              <div className="text-xs font-bold text-stone-100 truncate">
                {lick.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Lick Breakdown & Step Sequencer Visual */}
      <div className="mt-4 p-4 rounded-lg bg-stone-900/90 border border-stone-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-xs text-stone-300">
            <strong className="text-yellow-400">{selectedLick.title}</strong> —{' '}
            <span>{selectedLick.explanation}</span>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            Target Zone: {selectedLick.recommendedZoneId}
          </span>
        </div>

        {/* Note-by-note Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {selectedLick.notes.map((step, idx) => {
            const actualFret = Math.max(0, Math.min(22, zoneBaseFret + step.fretOffset));
            const noteIdx = (tuning.strings[step.stringIndex].noteIndex + actualFret) % 12;
            const noteName = getNoteName(noteIdx);
            const isCurrentStep = activeStepIndex === idx;

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[70px] p-2 rounded-lg border text-center transition-all ${
                  isCurrentStep
                    ? 'border-yellow-400 bg-yellow-400 text-stone-950 font-bold scale-105 shadow-md shadow-yellow-400/40'
                    : 'border-stone-800 bg-stone-950/80 text-stone-300'
                }`}
              >
                <div className={`text-[10px] font-mono ${isCurrentStep ? 'text-stone-900' : 'text-stone-500'}`}>
                  Step {idx + 1}
                </div>
                <div className="text-sm font-bold font-mono my-0.5">
                  {noteName}
                </div>
                <div className={`text-[10px] font-mono ${isCurrentStep ? 'text-stone-950 font-bold' : 'text-amber-400/90'}`}>
                  Str {6 - step.stringIndex} · Fret {actualFret}
                </div>
                <div className={`text-[9px] mt-1 truncate ${isCurrentStep ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                  {step.technique ? `${step.technique}` : 'pick'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
