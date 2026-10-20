/**
 * Guitar Theory, Scales, Triads, CAGED Zones, and Next-Note Suggester
 */

export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type NoteName = typeof NOTES_SHARP[number] | typeof NOTES_FLAT[number];

export interface TuningString {
  noteIndex: number; // 0 = C, 4 = E, 9 = A...
  octave: number;
  openName: string;
}

export interface Tuning {
  id: string;
  name: string;
  strings: TuningString[]; // string 0 = high E, string 5 = low E
}

export const TUNINGS: Record<string, Tuning> = {
  standard: {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    strings: [
      { noteIndex: 4, octave: 4, openName: 'E' }, // High E (String 1)
      { noteIndex: 11, octave: 3, openName: 'B' }, // B (String 2)
      { noteIndex: 7, octave: 3, openName: 'G' },  // G (String 3)
      { noteIndex: 2, octave: 3, openName: 'D' },  // D (String 4)
      { noteIndex: 9, octave: 2, openName: 'A' },  // A (String 5)
      { noteIndex: 4, octave: 2, openName: 'E' },  // Low E (String 6)
    ],
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D (D A D G B E)',
    strings: [
      { noteIndex: 4, octave: 4, openName: 'E' },
      { noteIndex: 11, octave: 3, openName: 'B' },
      { noteIndex: 7, octave: 3, openName: 'G' },
      { noteIndex: 2, octave: 3, openName: 'D' },
      { noteIndex: 9, octave: 2, openName: 'A' },
      { noteIndex: 2, octave: 2, openName: 'D' },
    ],
  },
  halfStepDown: {
    id: 'halfStepDown',
    name: 'Eb Standard (Eb Ab Db Gb Bb Eb)',
    strings: [
      { noteIndex: 3, octave: 4, openName: 'Eb' },
      { noteIndex: 10, octave: 3, openName: 'Bb' },
      { noteIndex: 6, octave: 3, openName: 'Gb' },
      { noteIndex: 1, octave: 3, openName: 'Db' },
      { noteIndex: 8, octave: 2, openName: 'Ab' },
      { noteIndex: 3, octave: 2, openName: 'Eb' },
    ],
  },
};

export interface ScaleDefinition {
  id: string;
  name: string;
  subtitle: string;
  intervals: number[]; // semitones from root (0-11)
  intervalNames: string[]; // e.g. ["R", "b3", "4", "b5", "5", "b7"]
  roleMap: Record<number, 'root' | 'blue' | 'triad' | 'color'>;
  description: string;
}

export const SCALES: ScaleDefinition[] = [
  {
    id: 'minorBlues',
    name: 'Minor Blues Scale',
    subtitle: 'The quintessential 6-note blues voice with the b5 blue note',
    intervals: [0, 3, 5, 6, 7, 10],
    intervalNames: ['R', 'b3', '4', 'b5', '5', 'b7'],
    roleMap: {
      0: 'root',
      3: 'triad',
      5: 'color',
      6: 'blue',
      7: 'triad',
      10: 'color',
    },
    description: 'The foundation of Chicago, British, and Delta blues. The b5 adds searing tension between the 4th and 5th.',
  },
  {
    id: 'minorPentatonic',
    name: 'Minor Pentatonic',
    subtitle: 'Pure 5-note rock and blues engine',
    intervals: [0, 3, 5, 7, 10],
    intervalNames: ['R', 'b3', '4', '5', 'b7'],
    roleMap: {
      0: 'root',
      3: 'triad',
      5: 'color',
      7: 'triad',
      10: 'color',
    },
    description: 'Universally applicable over minor and dominant blues. Zero clash notes with high melodic momentum.',
  },
  {
    id: 'majorBlues',
    name: 'Major Blues Scale',
    subtitle: 'Sweet southern blues, Allman Brothers & BB King major color',
    intervals: [0, 2, 3, 4, 7, 9],
    intervalNames: ['R', '2', 'b3', '3', '5', '6'],
    roleMap: {
      0: 'root',
      2: 'color',
      3: 'blue',
      4: 'triad',
      7: 'triad',
      9: 'color',
    },
    description: 'Bright, gospel, and country-blues sweet tones. The b3 functions as the passing blue note into the major 3rd.',
  },
  {
    id: 'majorPentatonic',
    name: 'Major Pentatonic',
    subtitle: 'Soulful, vocal phrasing (B.B. King & Eric Clapton)',
    intervals: [0, 2, 4, 7, 9],
    intervalNames: ['R', '2', '3', '5', '6'],
    roleMap: {
      0: 'root',
      2: 'color',
      4: 'triad',
      7: 'triad',
      9: 'color',
    },
    description: 'Warm, uplifting sound ideal over the I chord in a blues progression. Sweetens the vocal phrasing.',
  },
  {
    id: 'hybridBlues',
    name: 'Mixolydian Blues (Hybrid)',
    subtitle: 'The master blend of minor pentatonic bite with major 3rd sweet spot',
    intervals: [0, 3, 4, 5, 6, 7, 10],
    intervalNames: ['R', 'b3', '3', '4', 'b5', '5', 'b7'],
    roleMap: {
      0: 'root',
      3: 'color',
      4: 'triad',
      5: 'color',
      6: 'blue',
      7: 'triad',
      10: 'color',
    },
    description: 'Combines both minor and major thirds with the blue note. The hallmark sound of SRV, Hendrix, and Freddie King.',
  },
  {
    id: 'dorianBlues',
    name: 'Dorian Blues',
    subtitle: 'Santana & Robben Ford minor jazz-blues with natural 6th',
    intervals: [0, 2, 3, 5, 6, 7, 9, 10],
    intervalNames: ['R', '2', 'b3', '4', 'b5', '5', '6', 'b7'],
    roleMap: {
      0: 'root',
      2: 'color',
      3: 'triad',
      5: 'color',
      6: 'blue',
      7: 'triad',
      9: 'color',
      10: 'color',
    },
    description: 'Sophisticated modal blues flavor highlighting the sweet natural 6th degree.',
  },
];

export interface TriadDefinition {
  id: string;
  name: string;
  intervals: number[];
  names: string[];
}

export const TRIADS: Record<string, TriadDefinition> = {
  major: { id: 'major', name: 'Major Triad (1 - 3 - 5)', intervals: [0, 4, 7], names: ['1', '3', '5'] },
  minor: { id: 'minor', name: 'Minor Triad (1 - b3 - 5)', intervals: [0, 3, 7], names: ['1', 'b3', '5'] },
  dom7: { id: 'dom7', name: 'Dominant 7th (1 - 3 - 5 - b7)', intervals: [0, 4, 7, 10], names: ['1', '3', '5', 'b7'] },
  min7: { id: 'min7', name: 'Minor 7th (1 - b3 - 5 - b7)', intervals: [0, 3, 7, 10], names: ['1', 'b3', '5', 'b7'] },
  dim: { id: 'dim', name: 'Diminished Triad (1 - b3 - b5)', intervals: [0, 3, 6], names: ['1', 'b3', 'b5'] },
  sus4: { id: 'sus4', name: 'Sus4 Triad (1 - 4 - 5)', intervals: [0, 5, 7], names: ['1', '4', '5'] },
};

export interface ZoneDefinition {
  id: string;
  name: string;
  shortName: string;
  cagedShape: 'C' | 'A' | 'G' | 'E' | 'D' | 'Special';
  fretOffset: number; // offset relative to root on 6th string
  fretSpan: number;   // number of frets wide
  description: string;
  signatureStyle: string;
}

export const CAGED_ZONES: ZoneDefinition[] = [
  {
    id: 'box1',
    name: 'Zone 1: E-Shape Box (The Home Box)',
    shortName: 'Box 1 (E-Shape)',
    cagedShape: 'E',
    fretOffset: 0,
    fretSpan: 4,
    description: 'The iconic fundamental box. Root notes are on string 6, string 4, and string 1. Houses the standard blues curl.',
    signatureStyle: 'Clapton / SRV foundation, unison bends, standard blues riffing',
  },
  {
    id: 'box2',
    name: 'Zone 2: D-Shape Box (The Connect Box)',
    shortName: 'Box 2 (D-Shape)',
    cagedShape: 'D',
    fretOffset: 2,
    fretSpan: 4,
    description: 'Transitions smoothly from Box 1. Root notes on strings 4 and 2. Ideal for sweet sliding thirds.',
    signatureStyle: 'Melodic slides, Duane Allman melodic runs, double stops',
  },
  {
    id: 'box3',
    name: 'Zone 3: C-Shape Box (The B.B. Sweet Zone)',
    shortName: 'Box 3 (C-Shape)',
    cagedShape: 'C',
    fretOffset: 5,
    fretSpan: 4,
    description: 'Centered around the 5th and 2nd string roots. Holds the famous B.B. King vocal vibrato box on top strings.',
    signatureStyle: 'B.B. King singing vibrato, Freddie King punchy stabs',
  },
  {
    id: 'box4',
    name: 'Zone 4: A-Shape Box (High Register Drive)',
    shortName: 'Box 4 (A-Shape)',
    cagedShape: 'A',
    fretOffset: 7,
    fretSpan: 4,
    description: 'Root on 5th string and 3rd string. Clean layout, very popular for aggressive blues-rock soloing and chord accents.',
    signatureStyle: 'Jimi Hendrix chord-melody, Gary Moore soaring bends',
  },
  {
    id: 'box5',
    name: 'Zone 5: G-Shape Box (Low/High Bridge)',
    shortName: 'Box 5 (G-Shape)',
    cagedShape: 'G',
    fretOffset: 9,
    fretSpan: 4,
    description: 'Wraps around back into Box 1 an octave higher. Roots on string 6 and string 3.',
    signatureStyle: 'Albert King heavy bends, Stevie Ray Vaughan octave turnarounds',
  },
  {
    id: 'bb_box',
    name: 'Special: The B.B. King Box',
    shortName: 'B.B. King Box',
    cagedShape: 'Special',
    fretOffset: 5,
    fretSpan: 3,
    description: 'Strings 1, 2, and 3 only! Root under index finger on string 2. Easy half-step & whole-step bends on string 1 with signature butterfly vibrato.',
    signatureStyle: 'The Thrill Is Gone vocal call-and-response phrasing',
  },
  {
    id: 'albert_box',
    name: 'Special: Albert King Box',
    shortName: 'Albert King Box',
    cagedShape: 'Special',
    fretOffset: 0,
    fretSpan: 4,
    description: 'High strings 1 and 2 centered at the top of Box 1 with emphasis on massive 1.5 and 2-step over-bends on string 1.',
    signatureStyle: 'Born Under a Bad Sign searing over-bends',
  },
];

export interface FretboardNote {
  stringIndex: number; // 0 = high E, 5 = low E
  fret: number;
  noteIndex: number; // 0-11
  noteName: string;
  octave: number;
  frequency: number;
  interval?: number;
  intervalName?: string;
  role?: 'root' | 'blue' | 'triad' | 'color';
  isScaleNote: boolean;
  isTriadNote: boolean;
  triadDegreeName?: string; // "1", "3", "5", "b7"
  triadChordLabel?: string; // "I7", "IV7", "V7"
  inZone: boolean;
  fingerSuggestion?: number;
}

export interface NextNoteHint {
  targetString: number;
  targetFret: number;
  targetNoteName: string;
  targetIntervalName: string;
  actionType: 'resolve' | 'bend' | 'slide' | 'triad' | 'step' | 'octave';
  technique: string;
  reason: string;
  emotionalVibe: string;
  degreeChange: string;
}

// Helper to get standard note name in key
export function getNoteName(noteIndex: number, preferFlats = false): string {
  const norm = ((noteIndex % 12) + 12) % 12;
  return preferFlats ? NOTES_FLAT[norm] : NOTES_SHARP[norm];
}

// Calculate frequency for string + fret
export function getNoteFrequency(stringIndex: number, fret: number, tuning = TUNINGS.standard): number {
  const openString = tuning.strings[stringIndex];
  // MIDI number: C4 is 60, A4 is 69 (440Hz)
  const openMidi = openString.octave * 12 + openString.noteIndex + 12;
  const noteMidi = openMidi + fret;
  return 440 * Math.pow(2, (noteMidi - 69) / 12);
}

// Calculate note index (0-11) for string + fret
export function getFretNoteIndex(stringIndex: number, fret: number, tuning = TUNINGS.standard): number {
  const openString = tuning.strings[stringIndex];
  return (openString.noteIndex + fret) % 12;
}

// Find base root fret on 6th string (low E)
export function getRootFretOn6thString(rootNoteIndex: number, tuning = TUNINGS.standard): number {
  const lowE = tuning.strings[5].noteIndex;
  let fret = (rootNoteIndex - lowE + 12) % 12;
  return fret;
}

// Compute zone fret range for a key
export function getZoneFretRange(
  zoneId: string,
  rootNoteIndex: number,
  tuning = TUNINGS.standard
): { minFret: number; maxFret: number; baseFret: number } {
  if (zoneId === 'full') {
    return { minFret: 0, maxFret: 22, baseFret: 0 };
  }

  const rootOn6th = getRootFretOn6thString(rootNoteIndex, tuning);
  const zoneDef = CAGED_ZONES.find((z) => z.id === zoneId);

  if (!zoneDef) {
    return { minFret: 0, maxFret: 22, baseFret: 0 };
  }

  if (zoneId === 'bb_box') {
    // Root on 2nd string (B string). B string open is note 11.
    const bStringOpen = tuning.strings[1].noteIndex;
    const rootOnBString = (rootNoteIndex - bStringOpen + 12) % 12;
    // B.B. box is usually rootOnBString to rootOnBString + 2
    const minFret = Math.max(0, rootOnBString - 1);
    const maxFret = Math.min(22, rootOnBString + 3);
    return { minFret, maxFret, baseFret: rootOnBString };
  }

  if (zoneId === 'albert_box') {
    // Root on 1st string (High E)
    const eStringOpen = tuning.strings[0].noteIndex;
    const rootOnE = (rootNoteIndex - eStringOpen + 12) % 12;
    const minFret = Math.max(0, rootOnE);
    const maxFret = Math.min(22, rootOnE + 3);
    return { minFret, maxFret, baseFret: rootOnE };
  }

  let minFret = rootOn6th + zoneDef.fretOffset;
  if (minFret > 12) {
    minFret -= 12;
  }
  let maxFret = minFret + zoneDef.fretSpan;
  return { minFret, maxFret, baseFret: minFret };
}

// Backing track progression structures
export interface ChordProgressionStep {
  barNumber: number; // 1 to 12
  chordLabel: string; // e.g. "I7", "IV7", "V7"
  chordName: string;  // e.g. "A7", "D7", "E7"
  rootIndex: number;
  triadType: 'dom7' | 'min7' | 'major' | 'minor';
  durationBeats: number;
}

export interface BluesProgression {
  id: string;
  name: string;
  styleDescription: string;
  defaultBpm: number;
  totalBars: number;
  beatsPerBar: number;
  getBars: (rootNoteIndex: number, isMinorBlues?: boolean) => ChordProgressionStep[];
}

export const PROGRESSIONS: BluesProgression[] = [
  {
    id: 'standard12Bar',
    name: '12-Bar Standard Chicago Shuffle',
    styleDescription: 'Classic I - IV - V shuffle with quick change to IV in bar 2 and turnaround in bar 12',
    defaultBpm: 105,
    totalBars: 12,
    beatsPerBar: 4,
    getBars: (root) => {
      const I = root;
      const IV = (root + 5) % 12;
      const V = (root + 7) % 12;
      const iname = (idx: number) => getNoteName(idx);

      return [
        { barNumber: 1, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 2, chordLabel: 'IV7', chordName: `${iname(IV)}7`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 3, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 4, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 5, chordLabel: 'IV7', chordName: `${iname(IV)}7`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 6, chordLabel: 'IV7', chordName: `${iname(IV)}7`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 7, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 8, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 9, chordLabel: 'V7', chordName: `${iname(V)}7`, rootIndex: V, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 10, chordLabel: 'IV7', chordName: `${iname(IV)}7`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 11, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 12, chordLabel: 'V7', chordName: `${iname(V)}7`, rootIndex: V, triadType: 'dom7', durationBeats: 4 },
      ];
    },
  },
  {
    id: 'minor12Bar',
    name: '12-Bar Minor Blues (B.B. / Gary Moore style)',
    styleDescription: 'Dark, melancholic minor blues: Im7 - IVm7 - V7(or bVI7-V7)',
    defaultBpm: 80,
    totalBars: 12,
    beatsPerBar: 4,
    getBars: (root) => {
      const Im = root;
      const IVm = (root + 5) % 12;
      const V7 = (root + 7) % 12;
      const iname = (idx: number) => getNoteName(idx);

      return [
        { barNumber: 1, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 2, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 3, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 4, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 5, chordLabel: 'IVm7', chordName: `${iname(IVm)}m7`, rootIndex: IVm, triadType: 'min7', durationBeats: 4 },
        { barNumber: 6, chordLabel: 'IVm7', chordName: `${iname(IVm)}m7`, rootIndex: IVm, triadType: 'min7', durationBeats: 4 },
        { barNumber: 7, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 8, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 9, chordLabel: 'V7', chordName: `${iname(V7)}7`, rootIndex: V7, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 10, chordLabel: 'IVm7', chordName: `${iname(IVm)}m7`, rootIndex: IVm, triadType: 'min7', durationBeats: 4 },
        { barNumber: 11, chordLabel: 'Im7', chordName: `${iname(Im)}m7`, rootIndex: Im, triadType: 'min7', durationBeats: 4 },
        { barNumber: 12, chordLabel: 'V7', chordName: `${iname(V7)}7`, rootIndex: V7, triadType: 'dom7', durationBeats: 4 },
      ];
    },
  },
  {
    id: 'slowTexas',
    name: 'Texas Slow Blues (SRV / Albert King)',
    styleDescription: 'Intense 65 BPM slow burn blues with heavy vibrato room and space to breathe',
    defaultBpm: 64,
    totalBars: 12,
    beatsPerBar: 4,
    getBars: (root) => {
      const I = root;
      const IV = (root + 5) % 12;
      const V = (root + 7) % 12;
      const iname = (idx: number) => getNoteName(idx);

      return [
        { barNumber: 1, chordLabel: 'I9', chordName: `${iname(I)}9`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 2, chordLabel: 'IV9', chordName: `${iname(IV)}9`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 3, chordLabel: 'I9', chordName: `${iname(I)}9`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 4, chordLabel: 'I7', chordName: `${iname(I)}7`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 5, chordLabel: 'IV9', chordName: `${iname(IV)}9`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 6, chordLabel: 'IV9', chordName: `${iname(IV)}9`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 7, chordLabel: 'I9', chordName: `${iname(I)}9`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 8, chordLabel: 'I9', chordName: `${iname(I)}9`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 9, chordLabel: 'V9', chordName: `${iname(V)}9`, rootIndex: V, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 10, chordLabel: 'IV9', chordName: `${iname(IV)}9`, rootIndex: IV, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 11, chordLabel: 'I9', chordName: `${iname(I)}9`, rootIndex: I, triadType: 'dom7', durationBeats: 4 },
        { barNumber: 12, chordLabel: 'V9', chordName: `${iname(V)}9`, rootIndex: V, triadType: 'dom7', durationBeats: 4 },
      ];
    },
  },
];

export interface KeyChordInfo {
  id: string;
  numeral: string;
  chordName: string;
  rootIndex: number;
  quality: 'dom7' | 'min7' | '9th' | '7#9' | '13th' | 'dim7' | 'major7';
  triadType: 'dom7' | 'min7';
  roleLabel: string;
  intervals: number[];
  degreeNames: string[];
  chordNoteNames: string[];
  sweetNote: {
    noteIndex: number;
    noteName: string;
    degreeName: string;
    reason: string;
  };
  voicingDescription: string;
  hotkey: string;
}

export function getKeyChordFamily(rootNoteIndex: number, isMinorBlues = false): KeyChordInfo[] {
  const isFlat = [1, 3, 6, 8, 10].includes(rootNoteIndex);
  const I_root = rootNoteIndex;
  const IV_root = (rootNoteIndex + 5) % 12;
  const V_root = (rootNoteIndex + 7) % 12;
  const vi_root = (rootNoteIndex + 9) % 12;
  const bVI_root = (rootNoteIndex + 8) % 12;
  const sharpIV_root = (rootNoteIndex + 6) % 12;

  const iname = (idx: number) => getNoteName(idx, isFlat);

  if (isMinorBlues) {
    return [
      {
        id: 'Im7',
        numeral: 'Im7',
        chordName: `${iname(I_root)}m7`,
        rootIndex: I_root,
        quality: 'min7',
        triadType: 'min7',
        roleLabel: 'Minor Tonic (Home)',
        intervals: [0, 3, 7, 10],
        degreeNames: ['1', 'b3', '5', 'b7'],
        chordNoteNames: [iname(I_root), iname(I_root + 3), iname(I_root + 7), iname(I_root + 10)],
        sweetNote: {
          noteIndex: (I_root + 3) % 12,
          noteName: iname((I_root + 3) % 12),
          degreeName: 'b3',
          reason: 'Minor 3rd defines the soulful weeping blues tone.',
        },
        voicingDescription: 'Root 5/6 Minor 7th Barre grip',
        hotkey: '1',
      },
      {
        id: 'IVm7',
        numeral: 'IVm7',
        chordName: `${iname(IV_root)}m7`,
        rootIndex: IV_root,
        quality: 'min7',
        triadType: 'min7',
        roleLabel: 'Subdominant (Lift)',
        intervals: [0, 3, 7, 10],
        degreeNames: ['1', 'b3', '5', 'b7'],
        chordNoteNames: [iname(IV_root), iname(IV_root + 3), iname(IV_root + 7), iname(IV_root + 10)],
        sweetNote: {
          noteIndex: (IV_root + 3) % 12,
          noteName: iname((IV_root + 3) % 12),
          degreeName: 'b3 of IV',
          reason: `Minor 3rd (${iname(IV_root + 3)}) creates melancholy lift.`,
        },
        voicingDescription: 'Root 5 minor 7th shape',
        hotkey: '2',
      },
      {
        id: 'V7',
        numeral: 'V7',
        chordName: `${iname(V_root)}7`,
        rootIndex: V_root,
        quality: 'dom7',
        triadType: 'dom7',
        roleLabel: 'Dominant (Turnaround)',
        intervals: [0, 4, 7, 10],
        degreeNames: ['1', '3', '5', 'b7'],
        chordNoteNames: [iname(V_root), iname(V_root + 4), iname(V_root + 7), iname(V_root + 10)],
        sweetNote: {
          noteIndex: (V_root + 4) % 12,
          noteName: iname((V_root + 4) % 12),
          degreeName: '3rd of V',
          reason: `Major 3rd (${iname(V_root + 4)}) creates tension that resolves back to Im.`,
        },
        voicingDescription: 'Classic open or barre 7th grip',
        hotkey: '3',
      },
      {
        id: 'bVI7',
        numeral: 'bVI7',
        chordName: `${iname(bVI_root)}7`,
        rootIndex: bVI_root,
        quality: 'dom7',
        triadType: 'dom7',
        roleLabel: 'bVI Turnaround',
        intervals: [0, 4, 7, 10],
        degreeNames: ['1', '3', '5', 'b7'],
        chordNoteNames: [iname(bVI_root), iname(bVI_root + 4), iname(bVI_root + 7), iname(bVI_root + 10)],
        sweetNote: {
          noteIndex: (bVI_root + 4) % 12,
          noteName: iname((bVI_root + 4) % 12),
          degreeName: '3rd of bVI',
          reason: 'Gary Moore signature chromatic turnaround step into V.',
        },
        voicingDescription: 'Half-step drop into V7 chord',
        hotkey: '4',
      },
      {
        id: 'I9',
        numeral: 'I9',
        chordName: `${iname(I_root)}9`,
        rootIndex: I_root,
        quality: '9th',
        triadType: 'dom7',
        roleLabel: 'Funky 9th Color',
        intervals: [0, 4, 7, 10, 14],
        degreeNames: ['1', '3', '5', 'b7', '9'],
        chordNoteNames: [iname(I_root), iname(I_root + 4), iname(I_root + 7), iname(I_root + 10), iname(I_root + 2)],
        sweetNote: {
          noteIndex: (I_root + 2) % 12,
          noteName: iname((I_root + 2) % 12),
          degreeName: '9th',
          reason: 'Adds sophisticated jazz-blues chime.',
        },
        voicingDescription: 'Root 5 James Brown / T-Bone Walker 9th grip',
        hotkey: '5',
      },
      {
        id: 'hendrix7s9',
        numeral: '7#9',
        chordName: `${iname(I_root)}7#9`,
        rootIndex: I_root,
        quality: '7#9',
        triadType: 'dom7',
        roleLabel: 'Texas Hendrix Chord',
        intervals: [0, 4, 7, 10, 15],
        degreeNames: ['1', '3', '5', 'b7', '#9'],
        chordNoteNames: [iname(I_root), iname(I_root + 4), iname(I_root + 7), iname(I_root + 10), iname(I_root + 3)],
        sweetNote: {
          noteIndex: (I_root + 3) % 12,
          noteName: iname((I_root + 3) % 12),
          degreeName: '#9',
          reason: 'Combines the major 3rd and minor 3rd for searing blues attitude.',
        },
        voicingDescription: 'Root 5 Jimi Hendrix grip (e.g. x-7-6-7-8-x)',
        hotkey: '6',
      },
      {
        id: 'IV9',
        numeral: 'IV9',
        chordName: `${iname(IV_root)}9`,
        rootIndex: IV_root,
        quality: '9th',
        triadType: 'dom7',
        roleLabel: 'Subdominant 9th',
        intervals: [0, 4, 7, 10, 14],
        degreeNames: ['1', '3', '5', 'b7', '9'],
        chordNoteNames: [iname(IV_root), iname(IV_root + 4), iname(IV_root + 7), iname(IV_root + 10), iname(IV_root + 2)],
        sweetNote: {
          noteIndex: (IV_root + 2) % 12,
          noteName: iname((IV_root + 2) % 12),
          degreeName: '9th of IV',
          reason: 'Creates airy motion over the IV chord.',
        },
        voicingDescription: 'Root 5 9th chord voicing',
        hotkey: '7',
      },
      {
        id: 'dimPassing',
        numeral: '#IV°7',
        chordName: `${iname(sharpIV_root)}°7`,
        rootIndex: sharpIV_root,
        quality: 'dim7',
        triadType: 'min7',
        roleLabel: 'Passing Diminished',
        intervals: [0, 3, 6, 9],
        degreeNames: ['1', 'b3', 'b5', 'bb7'],
        chordNoteNames: [iname(sharpIV_root), iname(sharpIV_root + 3), iname(sharpIV_root + 6), iname(sharpIV_root + 9)],
        sweetNote: {
          noteIndex: sharpIV_root,
          noteName: iname(sharpIV_root),
          degreeName: 'b5 Blue Note',
          reason: 'The exact blue note chord bridging bars 6 and 7.',
        },
        voicingDescription: 'Symmetrical 4-note diminished grip',
        hotkey: '8',
      },
    ];
  }

  // Standard Blues Companion Chords
  return [
    {
      id: 'I7',
      numeral: 'I7',
      chordName: `${iname(I_root)}7`,
      rootIndex: I_root,
      quality: 'dom7',
      triadType: 'dom7',
      roleLabel: 'Tonic Blues (Home)',
      intervals: [0, 4, 7, 10],
      degreeNames: ['1', '3', '5', 'b7'],
      chordNoteNames: [iname(I_root), iname(I_root + 4), iname(I_root + 7), iname(I_root + 10)],
      sweetNote: {
        noteIndex: (I_root + 4) % 12,
        noteName: iname((I_root + 4) % 12),
        degreeName: '3 (Maj)',
        reason: 'Major 3rd brings sweet sunshine to the blues curl (b3 → 3).',
      },
      voicingDescription: 'Root 6 barre or open dominant 7th grip',
      hotkey: '1',
    },
    {
      id: 'IV7',
      numeral: 'IV7',
      chordName: `${iname(IV_root)}7`,
      rootIndex: IV_root,
      quality: 'dom7',
      triadType: 'dom7',
      roleLabel: 'Subdominant (Lift)',
      intervals: [0, 4, 7, 10],
      degreeNames: ['1', '3', '5', 'b7'],
      chordNoteNames: [iname(IV_root), iname(IV_root + 4), iname(IV_root + 7), iname(IV_root + 10)],
      sweetNote: {
        noteIndex: (IV_root + 4) % 12,
        noteName: iname((IV_root + 4) % 12),
        degreeName: '3rd of IV',
        reason: `Target ${iname(IV_root + 4)} on the IV chord to outline the change like a master!`,
      },
      voicingDescription: 'Root 5 dominant 7th shape',
      hotkey: '2',
    },
    {
      id: 'V7',
      numeral: 'V7',
      chordName: `${iname(V_root)}7`,
      rootIndex: V_root,
      quality: 'dom7',
      triadType: 'dom7',
      roleLabel: 'Dominant (Turnaround Peak)',
      intervals: [0, 4, 7, 10],
      degreeNames: ['1', '3', '5', 'b7'],
      chordNoteNames: [iname(V_root), iname(V_root + 4), iname(V_root + 7), iname(V_root + 10)],
      sweetNote: {
        noteIndex: (V_root + 4) % 12,
        noteName: iname((V_root + 4) % 12),
        degreeName: '3rd of V',
        reason: `Target ${iname(V_root + 4)} on beat 1 of ${iname(V_root)}7 to create tension before the turnaround!`,
      },
      voicingDescription: 'Root 5 or Root 6 dominant 7th barre',
      hotkey: '3',
    },
    {
      id: 'I9',
      numeral: 'I9',
      chordName: `${iname(I_root)}9`,
      rootIndex: I_root,
      quality: '9th',
      triadType: 'dom7',
      roleLabel: 'Funky Dominant 9th',
      intervals: [0, 4, 7, 10, 14],
      degreeNames: ['1', '3', '5', 'b7', '9'],
      chordNoteNames: [iname(I_root), iname(I_root + 4), iname(I_root + 7), iname(I_root + 10), iname(I_root + 2)],
      sweetNote: {
        noteIndex: (I_root + 2) % 12,
        noteName: iname((I_root + 2) % 12),
        degreeName: '9th',
        reason: 'Soulful T-Bone Walker / Stormy Monday chord extension.',
      },
      voicingDescription: 'Root 5 funky 9th grip (e.g. x-A-G#-G-B-x)',
      hotkey: '4',
    },
    {
      id: 'hendrix7s9',
      numeral: '7#9',
      chordName: `${iname(I_root)}7#9`,
      rootIndex: I_root,
      quality: '7#9',
      triadType: 'dom7',
      roleLabel: 'Texas Blues / Hendrix #9',
      intervals: [0, 4, 7, 10, 15],
      degreeNames: ['1', '3', '5', 'b7', '#9'],
      chordNoteNames: [iname(I_root), iname(I_root + 4), iname(I_root + 7), iname(I_root + 10), iname(I_root + 3)],
      sweetNote: {
        noteIndex: (I_root + 3) % 12,
        noteName: iname((I_root + 3) % 12),
        degreeName: '#9 Blues Curl',
        reason: 'Contains both major 3rd and minor 3rd for stinging Texas grit!',
      },
      voicingDescription: 'The legendary Purple Haze / SRV chord grip',
      hotkey: '5',
    },
    {
      id: 'Im7',
      numeral: 'Im7',
      chordName: `${iname(I_root)}m7`,
      rootIndex: I_root,
      quality: 'min7',
      triadType: 'min7',
      roleLabel: 'Minor Pentatonic Home',
      intervals: [0, 3, 7, 10],
      degreeNames: ['1', 'b3', '5', 'b7'],
      chordNoteNames: [iname(I_root), iname(I_root + 3), iname(I_root + 7), iname(I_root + 10)],
      sweetNote: {
        noteIndex: (I_root + 3) % 12,
        noteName: iname((I_root + 3) % 12),
        degreeName: 'b3',
        reason: 'Deep, moody minor blues feel; ideal for slow weeping phrases.',
      },
      voicingDescription: 'Root 6 minor 7th barre shape',
      hotkey: '6',
    },
    {
      id: 'vi7',
      numeral: 'vi7',
      chordName: `${iname(vi_root)}m7`,
      rootIndex: vi_root,
      quality: 'min7',
      triadType: 'min7',
      roleLabel: 'Relative Minor Sweetener',
      intervals: [0, 3, 7, 10],
      degreeNames: ['1', 'b3', '5', 'b7'],
      chordNoteNames: [iname(vi_root), iname(vi_root + 3), iname(vi_root + 7), iname(vi_root + 10)],
      sweetNote: {
        noteIndex: vi_root,
        noteName: iname(vi_root),
        degreeName: 'Maj 6th of Key',
        reason: 'Major 6th note brings sweet southern rock / Allman Brothers sunshine.',
      },
      voicingDescription: 'Relative minor 7th shape',
      hotkey: '7',
    },
    {
      id: 'dimPassing',
      numeral: '#IV°7',
      chordName: `${iname(sharpIV_root)}°7`,
      rootIndex: sharpIV_root,
      quality: 'dim7',
      triadType: 'min7',
      roleLabel: 'Passing Diminished Chord',
      intervals: [0, 3, 6, 9],
      degreeNames: ['1', 'b3', 'b5', 'bb7'],
      chordNoteNames: [iname(sharpIV_root), iname(sharpIV_root + 3), iname(sharpIV_root + 6), iname(sharpIV_root + 9)],
      sweetNote: {
        noteIndex: sharpIV_root,
        noteName: iname(sharpIV_root),
        degreeName: 'b5 Blue Note',
        reason: 'The exact blue note chord connecting IV back down to I.',
      },
      voicingDescription: '4-string diminished 7th shape',
      hotkey: '8',
    },
  ];
}

/**
 * Generates the "What notes follow" recommendations based on:
 * - Current note on fretboard
 * - Key root & active scale
 * - Active chord in backing track (e.g. A7, D7, or E7)
 * - Active zone boundaries
 */
export function generateNextNoteHints(
  currentNote: FretboardNote,
  rootNoteIndex: number,
  scale: ScaleDefinition,
  activeChord: ChordProgressionStep,
  tuning = TUNINGS.standard,
  zoneMin = 0,
  zoneMax = 22,
  phraseHistory: FretboardNote[] = []
): NextNoteHint[] {
  const hints: NextNoteHint[] = [];
  const currInterval = (currentNote.noteIndex - rootNoteIndex + 12) % 12;
  const isFlat = [1, 3, 6, 8, 10].includes(rootNoteIndex);

  // Helper to find nearby note on fretboard that is NEVER the current note
  const findFretCoords = (
    targetNoteIdx: number,
    preferSameString = false,
    preferHigherPitch = true
  ): { stringIndex: number; fret: number } | null => {
    // 1. Check same string first if requested
    if (preferSameString) {
      const deltas = preferHigherPitch ? [1, 2, 3, -1, -2, -3] : [-1, -2, -3, 1, 2, 3];
      for (const delta of deltas) {
        const testFret = currentNote.fret + delta;
        if (testFret >= zoneMin && testFret <= zoneMax && testFret >= 0 && testFret <= 22) {
          if (getFretNoteIndex(currentNote.stringIndex, testFret, tuning) === targetNoteIdx) {
            return { stringIndex: currentNote.stringIndex, fret: testFret };
          }
        }
      }
    }

    // 2. Search higher pitch strings (lower stringIndex) if preferHigherPitch, or lower pitch strings
    const stringOrder = preferHigherPitch
      ? [
          currentNote.stringIndex - 1, // higher string (towards high E)
          currentNote.stringIndex,     // same string
          currentNote.stringIndex + 1, // lower string
          currentNote.stringIndex - 2,
          currentNote.stringIndex + 2,
        ].filter((s) => s >= 0 && s < 6)
      : [
          currentNote.stringIndex + 1, // lower string (towards low E)
          currentNote.stringIndex,     // same string
          currentNote.stringIndex - 1, // higher string
          currentNote.stringIndex + 2,
          currentNote.stringIndex - 2,
        ].filter((s) => s >= 0 && s < 6);

    for (const strIdx of stringOrder) {
      for (let f = Math.max(0, zoneMin); f <= Math.min(22, zoneMax); f++) {
        if (strIdx === currentNote.stringIndex && f === currentNote.fret) continue;
        if (getFretNoteIndex(strIdx, f, tuning) === targetNoteIdx) {
          return { stringIndex: strIdx, fret: f };
        }
      }
    }

    // 3. Fallback: anywhere in zone
    for (let strIdx = 0; strIdx < 6; strIdx++) {
      for (let f = zoneMin; f <= zoneMax; f++) {
        if (strIdx === currentNote.stringIndex && f === currentNote.fret) continue;
        if (getFretNoteIndex(strIdx, f, tuning) === targetNoteIdx) {
          return { stringIndex: strIdx, fret: f };
        }
      }
    }

    return null;
  };

  // Case 1: If on the Root (interval 0) -> Drive forward up to b3 or 4
  if (currInterval === 0) {
    // R -> b3 (Forward upward step to Minor 3rd)
    const b3Coords = findFretCoords((rootNoteIndex + 3) % 12, false, true);
    if (b3Coords) {
      hints.push({
        targetString: b3Coords.stringIndex,
        targetFret: b3Coords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 3) % 12, isFlat),
        targetIntervalName: 'b3',
        actionType: 'step',
        technique: 'Step up to minor 3rd (blues fire)',
        reason: 'Launches forward into the essential blues minor 3rd to begin building melodic tension.',
        emotionalVibe: 'Blues ignition & forward climb',
        degreeChange: 'R → b3',
      });
    }

    // R -> 4th (Melodic Leap)
    const fourthCoords = findFretCoords((rootNoteIndex + 5) % 12, false, true);
    if (fourthCoords) {
      hints.push({
        targetString: fourthCoords.stringIndex,
        targetFret: fourthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 5) % 12, isFlat),
        targetIntervalName: '4',
        actionType: 'step',
        technique: 'Melodic leap to 4th',
        reason: 'Skips the 3rd to hit the powerful 4th, setting up a bend into the blue note or 5th.',
        emotionalVibe: 'Assertive melodic leap',
        degreeChange: 'R → 4',
      });
    }

    // R -> b7 (Drop down below root - alternative)
    const b7Coords = findFretCoords((rootNoteIndex + 10) % 12, true, false);
    if (b7Coords) {
      hints.push({
        targetString: b7Coords.stringIndex,
        targetFret: b7Coords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 10) % 12, isFlat),
        targetIntervalName: 'b7',
        actionType: 'step',
        technique: 'Drop down into b7',
        reason: 'Opens up a blues phrase backwards, teasing the dominant 7th color.',
        emotionalVibe: 'Mysterious swagger',
        degreeChange: 'R → b7',
      });
    }

    // R -> Octave Jump
    const octaveCoords = findFretCoords(rootNoteIndex, false, true);
    if (octaveCoords && (octaveCoords.stringIndex !== currentNote.stringIndex || octaveCoords.fret !== currentNote.fret)) {
      hints.push({
        targetString: octaveCoords.stringIndex,
        targetFret: octaveCoords.fret,
        targetNoteName: getNoteName(rootNoteIndex, isFlat),
        targetIntervalName: 'R (Octave)',
        actionType: 'octave',
        technique: 'Octave leap to higher string',
        reason: 'Soaring octave expansion across the neck for high vocal contrast.',
        emotionalVibe: 'Singing octave contrast',
        degreeChange: 'R → 8ve',
      });
    }
  }

  // Case 2: If on the Minor 3rd (interval 3) -> Step forward to 4th, sweet major 3rd, or blue note
  else if (currInterval === 3) {
    // b3 -> 4th (Forward upward step)
    const fourthCoords = findFretCoords((rootNoteIndex + 5) % 12, false, true);
    if (fourthCoords) {
      hints.push({
        targetString: fourthCoords.stringIndex,
        targetFret: fourthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 5) % 12, isFlat),
        targetIntervalName: '4',
        actionType: 'step',
        technique: 'Step up to 4th (melodic lift)',
        reason: 'Builds upward melodic lift toward the blue note and the 5th.',
        emotionalVibe: 'Ascending momentum',
        degreeChange: 'b3 → 4',
      });
    }

    // b3 -> Major 3rd (Sweet blues curl / slide into fret + 1)
    const maj3Idx = (rootNoteIndex + 4) % 12;
    const maj3Coords = findFretCoords(maj3Idx, true, true);
    if (maj3Coords) {
      hints.push({
        targetString: maj3Coords.stringIndex,
        targetFret: maj3Coords.fret,
        targetNoteName: getNoteName(maj3Idx, isFlat),
        targetIntervalName: '3 (Maj)',
        actionType: 'bend',
        technique: 'Slide or micro-curl into Major 3rd',
        reason: 'The legendary blues curl! Slides or bends into the sweet major 3rd for instant warmth.',
        emotionalVibe: 'Sweet soul daylight',
        degreeChange: 'b3 → 3',
      });
    }

    // b3 -> Blue Note b5 (Forward chromatic jump)
    const blueCoords = findFretCoords((rootNoteIndex + 6) % 12, false, true);
    if (blueCoords) {
      hints.push({
        targetString: blueCoords.stringIndex,
        targetFret: blueCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 6) % 12, isFlat),
        targetIntervalName: 'b5',
        actionType: 'slide',
        technique: 'Jump into Blue Note (b5)',
        reason: 'Injects sudden grit and friction right into the middle of the phrase.',
        emotionalVibe: 'Gritty friction',
        degreeChange: 'b3 → b5',
      });
    }

    // b3 -> Root (Only as phrase conclusion)
    const rootCoords = findFretCoords(rootNoteIndex, false, false);
    if (rootCoords) {
      hints.push({
        targetString: rootCoords.stringIndex,
        targetFret: rootCoords.fret,
        targetNoteName: getNoteName(rootNoteIndex, isFlat),
        targetIntervalName: 'R',
        actionType: 'resolve',
        technique: 'Pull-off / step down to Root',
        reason: 'Lands on the home tonic to finish the phrase.',
        emotionalVibe: 'Homecoming resolution',
        degreeChange: 'b3 → R',
      });
    }
  }

  // Case 3: If on the 4th (interval 5) -> Forward into Blue Note b5 or 5th
  else if (currInterval === 5) {
    // 4 -> b5 (Slide 1 fret up into Blue Note!)
    const blueCoords = findFretCoords((rootNoteIndex + 6) % 12, true, true);
    if (blueCoords) {
      hints.push({
        targetString: blueCoords.stringIndex,
        targetFret: blueCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 6) % 12, isFlat),
        targetIntervalName: 'b5',
        actionType: 'slide',
        technique: 'Slide 1 fret up into Blue Note',
        reason: 'The classic blues chromatic crawl. Injects delicious tension before resolving to 5.',
        emotionalVibe: 'Searing blues friction',
        degreeChange: '4 → b5',
      });
    }

    // 4 -> 5th (Step or whole-step bend to 5th!)
    const fifthCoords = findFretCoords((rootNoteIndex + 7) % 12, false, true);
    if (fifthCoords) {
      hints.push({
        targetString: fifthCoords.stringIndex,
        targetFret: fifthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 7) % 12, isFlat),
        targetIntervalName: '5',
        actionType: 'bend',
        technique: 'Full bend or step up to 5th',
        reason: 'SRV signature scream. Whole-step vocal bend up into the Perfect 5th.',
        emotionalVibe: 'High-energy climax',
        degreeChange: '4 → 5',
      });
    }

    // 4 -> b3 (Descent)
    const b3Coords = findFretCoords((rootNoteIndex + 3) % 12, false, false);
    if (b3Coords) {
      hints.push({
        targetString: b3Coords.stringIndex,
        targetFret: b3Coords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 3) % 12, isFlat),
        targetIntervalName: 'b3',
        actionType: 'step',
        technique: 'Drop down to minor 3rd',
        reason: 'Descending pentatonic flow, setting up the low root.',
        emotionalVibe: 'Bluesy sigh',
        degreeChange: '4 → b3',
      });
    }
  }

  // Case 4: If on the Blue Note (interval 6) -> Resolve into 5th or 4th!
  else if (currInterval === 6) {
    // b5 -> 5 (Primary resolution up 1 fret or adjacent string!)
    const fifthCoords = findFretCoords((rootNoteIndex + 7) % 12, true, true);
    if (fifthCoords) {
      hints.push({
        targetString: fifthCoords.stringIndex,
        targetFret: fifthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 7) % 12, isFlat),
        targetIntervalName: '5',
        actionType: 'slide',
        technique: 'Slide 1 fret up into 5th',
        reason: 'Instantly resolves the stinging tension of the blue note cleanly into the solid 5th.',
        emotionalVibe: 'Tension release & stability',
        degreeChange: 'b5 → 5',
      });
    }

    // b5 -> 4 (Resolution down 1 fret or pull-off)
    const fourthCoords = findFretCoords((rootNoteIndex + 5) % 12, true, false);
    if (fourthCoords) {
      hints.push({
        targetString: fourthCoords.stringIndex,
        targetFret: fourthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 5) % 12, isFlat),
        targetIntervalName: '4',
        actionType: 'slide',
        technique: 'Slide down 1 fret or pull-off',
        reason: 'Descent into the 4th keeps the groove greasy and grounded.',
        emotionalVibe: 'Greasy blues descent',
        degreeChange: 'b5 → 4',
      });
    }

    // b5 -> b7 (Surprise octave leap)
    const b7Coords = findFretCoords((rootNoteIndex + 10) % 12, false, true);
    if (b7Coords) {
      hints.push({
        targetString: b7Coords.stringIndex,
        targetFret: b7Coords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 10) % 12, isFlat),
        targetIntervalName: 'b7',
        actionType: 'step',
        technique: 'Leap to minor 7th',
        reason: 'Bypasses the 5th for a funky, unexpected dominant leap.',
        emotionalVibe: 'Funky swagger',
        degreeChange: 'b5 → b7',
      });
    }
  }

  // Case 5: If on the 5th (interval 7) -> Forward up to b7 or high Root!
  else if (currInterval === 7) {
    // 5 -> b7 (Primary forward step)
    const b7Coords = findFretCoords((rootNoteIndex + 10) % 12, false, true);
    if (b7Coords) {
      hints.push({
        targetString: b7Coords.stringIndex,
        targetFret: b7Coords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 10) % 12, isFlat),
        targetIntervalName: 'b7',
        actionType: 'step',
        technique: 'Step up to minor 7th',
        reason: 'Pushes into the upper register to prepare for the soaring high root climax.',
        emotionalVibe: 'Ascending tension & vocal cry',
        degreeChange: '5 → b7',
      });
    }

    // 5 -> High Root (Octave climax)
    const rootCoords = findFretCoords(rootNoteIndex, false, true);
    if (rootCoords) {
      hints.push({
        targetString: rootCoords.stringIndex,
        targetFret: rootCoords.fret,
        targetNoteName: getNoteName(rootNoteIndex, isFlat),
        targetIntervalName: 'R (High)',
        actionType: 'resolve',
        technique: 'Climb to high Root',
        reason: 'Lands on the high octave root with piercing vocal clarity.',
        emotionalVibe: 'High register triumph',
        degreeChange: '5 → R (8ve)',
      });
    }

    // 5 -> b5 (Descending blues chromatic)
    const blueCoords = findFretCoords((rootNoteIndex + 6) % 12, true, false);
    if (blueCoords) {
      hints.push({
        targetString: blueCoords.stringIndex,
        targetFret: blueCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 6) % 12, isFlat),
        targetIntervalName: 'b5',
        actionType: 'slide',
        technique: 'Slide down 1 fret into Blue Note',
        reason: 'Descending blue note slide adds immediate greasy soul to a descending lick.',
        emotionalVibe: 'Descending blues grease',
        degreeChange: '5 → b5',
      });
    }
  }

  // Case 6: If on the Minor 7th (interval 10) -> Resolve up to high Root!
  else if (currInterval === 10) {
    // b7 -> Root (Primary resolution)
    const rootCoords = findFretCoords(rootNoteIndex, false, true);
    if (rootCoords) {
      hints.push({
        targetString: rootCoords.stringIndex,
        targetFret: rootCoords.fret,
        targetNoteName: getNoteName(rootNoteIndex, isFlat),
        targetIntervalName: 'R',
        actionType: 'resolve',
        technique: 'Step 2 frets up or bend to Root',
        reason: 'The ultimate blues release. Resolves the leading 7th into the home tonic.',
        emotionalVibe: 'Victorious arrival on tonic',
        degreeChange: 'b7 → R',
      });
    }

    // b7 -> 5th (Descent)
    const fifthCoords = findFretCoords((rootNoteIndex + 7) % 12, false, false);
    if (fifthCoords) {
      hints.push({
        targetString: fifthCoords.stringIndex,
        targetFret: fifthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 7) % 12, isFlat),
        targetIntervalName: '5',
        actionType: 'step',
        technique: 'Drop down into 5th',
        reason: 'Smooth descending pentatonic bridge; sets up the chord change.',
        emotionalVibe: 'Groove relaxation',
        degreeChange: 'b7 → 5',
      });
    }
  }

  // Case 7: If on Major 3rd (interval 4)
  else if (currInterval === 4) {
    const fifthCoords = findFretCoords((rootNoteIndex + 7) % 12, false, true);
    if (fifthCoords) {
      hints.push({
        targetString: fifthCoords.stringIndex,
        targetFret: fifthCoords.fret,
        targetNoteName: getNoteName((rootNoteIndex + 7) % 12, isFlat),
        targetIntervalName: '5',
        actionType: 'step',
        technique: 'Step up to 5th',
        reason: 'Harmonic triad continuation (3 to 5).',
        emotionalVibe: 'Bright harmonic lift',
        degreeChange: '3 → 5',
      });
    }
  }

  // Case 8: Harmonic Chord Tone Connection for current active backing chord
  const activeChordRoot = activeChord.rootIndex;
  const isIVChord = activeChord.chordLabel.includes('IV');
  const isVChord = activeChord.chordLabel.includes('V');

  if (isIVChord) {
    const ivThirdNoteIdx = (activeChordRoot + 4) % 12;
    const ivThirdCoords = findFretCoords(ivThirdNoteIdx, false, true);
    if (ivThirdCoords && (ivThirdCoords.stringIndex !== currentNote.stringIndex || ivThirdCoords.fret !== currentNote.fret)) {
      hints.push({
        targetString: ivThirdCoords.stringIndex,
        targetFret: ivThirdCoords.fret,
        targetNoteName: getNoteName(ivThirdNoteIdx, isFlat),
        targetIntervalName: '3rd of IV',
        actionType: 'triad',
        technique: `Target ${getNoteName(ivThirdNoteIdx)} on IV chord`,
        reason: `Targeting the 3rd of the IV chord (${getNoteName(ivThirdNoteIdx)}) outlines the chord change like a pro.`,
        emotionalVibe: 'Pro harmonic landing',
        degreeChange: `Current → ${getNoteName(ivThirdNoteIdx)} (3rd of IV)`,
      });
    }
  } else if (isVChord) {
    const vThirdNoteIdx = (activeChordRoot + 4) % 12;
    const vThirdCoords = findFretCoords(vThirdNoteIdx, false, true);
    if (vThirdCoords && (vThirdCoords.stringIndex !== currentNote.stringIndex || vThirdCoords.fret !== currentNote.fret)) {
      hints.push({
        targetString: vThirdCoords.stringIndex,
        targetFret: vThirdCoords.fret,
        targetNoteName: getNoteName(vThirdNoteIdx, isFlat),
        targetIntervalName: '3rd of V',
        actionType: 'triad',
        technique: `Target ${getNoteName(vThirdNoteIdx)} on V chord`,
        reason: `The 3rd of the V chord creates peak tension before resolving home.`,
        emotionalVibe: 'Peak tension outline',
        degreeChange: `Current → ${getNoteName(vThirdNoteIdx)} (3rd of V)`,
      });
    }
  }

  // Deduplicate and ensure no hint matches the current note!
  const uniqueHints: NextNoteHint[] = [];
  const seen = new Set<string>();

  // Check if we have a previous note in phraseHistory to avoid immediate ping-pong
  const prevNote = phraseHistory && phraseHistory.length > 1
    ? phraseHistory[phraseHistory.length - 2]
    : null;

  // Separate hints into forward hints vs previous note backtrack
  const forwardHints: NextNoteHint[] = [];
  const backtrackHints: NextNoteHint[] = [];

  for (const h of hints) {
    // STRICT CHECK: Never allow target to be the same string and fret as current note!
    if (h.targetString === currentNote.stringIndex && h.targetFret === currentNote.fret) {
      continue;
    }

    const key = `${h.targetString}-${h.targetFret}`;
    if (!seen.has(key)) {
      seen.add(key);
      if (prevNote && h.targetString === prevNote.stringIndex && h.targetFret === prevNote.fret) {
        backtrackHints.push(h);
      } else {
        forwardHints.push(h);
      }
    }
  }

  // Forward hints take priority at the top, backtrack hints are placed at the end!
  return [...forwardHints, ...backtrackHints].slice(0, 5);
}

// Preset blues licks with tabs and timing
export interface BluesLick {
  id: string;
  title: string;
  masterArtist: string;
  recommendedZoneId: string;
  notes: {
    stringIndex: number; // 0 = high E, 5 = low E
    fretOffset: number; // relative to baseFret of the zone
    durationBeats: number;
    technique?: 'pick' | 'bend1/2' | 'bendFull' | 'release' | 'vibrato' | 'slide' | 'hammer' | 'resolve';
    lyricCue: string;
  }[];
  explanation: string;
}

export const PRESET_LICKS: BluesLick[] = [
  {
    id: 'bb_vocal_sing',
    title: 'The "Lucille" Singing Vibrato',
    masterArtist: 'B.B. King',
    recommendedZoneId: 'bb_box',
    explanation: 'Starts on the sweet 6th or root on string 2, leaps to string 1 for a whole-step bend with sustained butterfly vibrato.',
    notes: [
      { stringIndex: 1, fretOffset: 0, durationBeats: 0.5, technique: 'pick', lyricCue: 'Call...' },
      { stringIndex: 0, fretOffset: 0, durationBeats: 0.5, technique: 'pick', lyricCue: 'The...' },
      { stringIndex: 0, fretOffset: 2, durationBeats: 1.5, technique: 'bendFull', lyricCue: 'Cry!' },
      { stringIndex: 0, fretOffset: 2, durationBeats: 1.0, technique: 'vibrato', lyricCue: '~Vibrato~' },
      { stringIndex: 1, fretOffset: 0, durationBeats: 0.5, technique: 'resolve', lyricCue: 'Resolve home' },
    ],
  },
  {
    id: 'srv_texas_shuffle_riff',
    title: 'Texas Fast Shuffle Stutter',
    masterArtist: 'Stevie Ray Vaughan',
    recommendedZoneId: 'box1',
    explanation: 'Rapid Box 1 flurry: pull-offs on strings 1 & 2 down to the low blue note and root with aggressive snap.',
    notes: [
      { stringIndex: 0, fretOffset: 3, durationBeats: 0.25, technique: 'pick', lyricCue: 'Snap' },
      { stringIndex: 0, fretOffset: 0, durationBeats: 0.25, technique: 'pick', lyricCue: 'Pull' },
      { stringIndex: 1, fretOffset: 3, durationBeats: 0.5, technique: 'bend1/2', lyricCue: 'Grit' },
      { stringIndex: 1, fretOffset: 0, durationBeats: 0.5, technique: 'pick', lyricCue: 'Roll' },
      { stringIndex: 2, fretOffset: 3, durationBeats: 0.5, technique: 'slide', lyricCue: 'Blue b5!' },
      { stringIndex: 2, fretOffset: 2, durationBeats: 0.5, technique: 'pick', lyricCue: 'Fifth' },
      { stringIndex: 3, fretOffset: 2, durationBeats: 1.5, technique: 'vibrato', lyricCue: 'Root Power' },
    ],
  },
  {
    id: 'albert_overbend',
    title: 'Albert King Searing Over-Bend',
    masterArtist: 'Albert King',
    recommendedZoneId: 'albert_box',
    explanation: 'Heavy 1.5 step bend on high E string from the b7 all the way up to the 9th, screaming with finger meat tone.',
    notes: [
      { stringIndex: 0, fretOffset: 3, durationBeats: 1.5, technique: 'bendFull', lyricCue: 'Huge Bend!' },
      { stringIndex: 0, fretOffset: 0, durationBeats: 0.5, technique: 'pick', lyricCue: 'Release' },
      { stringIndex: 1, fretOffset: 3, durationBeats: 1.0, technique: 'bendFull', lyricCue: 'Sing' },
      { stringIndex: 2, fretOffset: 2, durationBeats: 1.0, technique: 'resolve', lyricCue: 'Settle' },
    ],
  },
  {
    id: 'clapton_cream_blues_breaker',
    title: 'Bluesbreaker Box 1 Turnaround',
    masterArtist: 'Eric Clapton',
    recommendedZoneId: 'box1',
    explanation: 'Smooth vocal triplet run sliding from the 4th through the blue note, resolving into the sweet major 3rd of the V chord.',
    notes: [
      { stringIndex: 2, fretOffset: 0, durationBeats: 0.33, technique: 'pick', lyricCue: 'Tri-' },
      { stringIndex: 2, fretOffset: 1, durationBeats: 0.33, technique: 'slide', lyricCue: '-ple-' },
      { stringIndex: 2, fretOffset: 2, durationBeats: 0.34, technique: 'pick', lyricCue: '-et' },
      { stringIndex: 1, fretOffset: 0, durationBeats: 1.0, technique: 'vibrato', lyricCue: 'Sweet note' },
      { stringIndex: 2, fretOffset: 0, durationBeats: 1.0, technique: 'resolve', lyricCue: 'Turnaround' },
    ],
  },
];

export interface AnswerStarterNote {
  stringIndex: number;
  fret: number;
  noteIndex: number;
  noteName: string;
  intervalName: string;
  type: 'resolution' | 'sweet3rd' | 'octave_contrast' | 'chord_tone' | 'low_groove';
  title: string;
  explanation: string;
  vibe: string;
  frequency: number;
}

/**
 * Given a completed phrase (The Call), recommends the most musical starting notes
 * to launch The Answer phrase in authentic blues improvisation.
 */
export function getRecommendedAnswerStarters(
  phraseNotes: FretboardNote[],
  rootNoteIndex: number,
  scale: ScaleDefinition,
  activeChord: ChordProgressionStep,
  tuning = TUNINGS.standard,
  zoneMin = 0,
  zoneMax = 22
): AnswerStarterNote[] {
  if (phraseNotes.length === 0) return [];

  const lastNote = phraseNotes[phraseNotes.length - 1];
  const lastInterval = (lastNote.noteIndex - rootNoteIndex + 12) % 12;
  const isFlat = [1, 3, 6, 8, 10].includes(rootNoteIndex);
  const answers: AnswerStarterNote[] = [];

  // Helper to locate coords in or near current zone
  const findCoords = (targetNoteIdx: number, preferredString?: number): { stringIndex: number; fret: number } | null => {
    // 1. Try preferred string within zone
    if (preferredString !== undefined) {
      for (let f = zoneMin; f <= zoneMax; f++) {
        if (getFretNoteIndex(preferredString, f, tuning) === targetNoteIdx) {
          return { stringIndex: preferredString, fret: f };
        }
      }
    }

    // 2. Try nearby strings in zone
    for (let s = 0; s < 6; s++) {
      for (let f = zoneMin; f <= zoneMax; f++) {
        if (getFretNoteIndex(s, f, tuning) === targetNoteIdx) {
          return { stringIndex: s, fret: f };
        }
      }
    }

    // 3. Fallback across neck
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= 20; f++) {
        if (getFretNoteIndex(s, f, tuning) === targetNoteIdx) {
          return { stringIndex: s, fret: f };
        }
      }
    }
    return null;
  };

  // Scenario A: The Call ended on high tension (b5 Blue note, 4th, b3, or b7)
  // The Call asked a question! The Answer should resolve or hit a sweet tone.
  if ([3, 5, 6, 10].includes(lastInterval)) {
    // 1. Definite Root Resolution Answer
    const rootCoords = findCoords(rootNoteIndex, lastNote.stringIndex <= 2 ? 1 : 3);
    if (rootCoords) {
      answers.push({
        stringIndex: rootCoords.stringIndex,
        fret: rootCoords.fret,
        noteIndex: rootNoteIndex,
        noteName: getNoteName(rootNoteIndex, isFlat),
        intervalName: 'R (Tonic)',
        type: 'resolution',
        title: 'Authoritative Root Resolution',
        explanation: 'Answers the tension question with solid closure and harmonic stability.',
        vibe: 'Definitive Statement · "Here is the truth"',
        frequency: getNoteFrequency(rootCoords.stringIndex, rootCoords.fret, tuning),
      });
    }

    // 2. Sweet Major 3rd Answer (The Blues Curl / Daylight)
    const maj3Idx = (rootNoteIndex + 4) % 12;
    const maj3Coords = findCoords(maj3Idx, 2);
    if (maj3Coords) {
      answers.push({
        stringIndex: maj3Coords.stringIndex,
        fret: maj3Coords.fret,
        noteIndex: maj3Idx,
        noteName: getNoteName(maj3Idx, isFlat),
        intervalName: '3 (Major)',
        type: 'sweet3rd',
        title: 'Sweet Major 3rd Relief',
        explanation: 'Brings immediate warmth, turning minor tension into gospel daylight.',
        vibe: 'Soulful Smile · "Things are looking up"',
        frequency: getNoteFrequency(maj3Coords.stringIndex, maj3Coords.fret, tuning),
      });
    }
  }

  // Scenario B: The Call ended on a stable note (Root 0 or Fifth 7)
  // The statement was made! The Answer should provide contrast or an octave scream.
  if ([0, 7].includes(lastInterval)) {
    // 1. High Register Vocal Cry (Octave Leap / B.B. Box)
    const highStr = 0; // high E
    for (let f = Math.max(0, zoneMin); f <= Math.min(20, zoneMax + 2); f++) {
      const idx = getFretNoteIndex(highStr, f, tuning);
      const interval = (idx - rootNoteIndex + 12) % 12;
      if (interval === 0 || interval === 10 || interval === 3) {
        answers.push({
          stringIndex: highStr,
          fret: f,
          noteIndex: idx,
          noteName: getNoteName(idx, isFlat),
          intervalName: scale.intervalNames[scale.intervals.indexOf(interval)] || '8ve',
          type: 'octave_contrast',
          title: 'High Register Cry (Vocal Leap)',
          explanation: 'Re-ignites the dialogue with a soaring high string bend or vibrato.',
          vibe: 'Passion & Contrast · "Listen to this!"',
          frequency: getNoteFrequency(highStr, f, tuning),
        });
        break;
      }
    }

    // 2. Low-Down Rhythmic Response (Strings 4 or 5)
    for (let s = 4; s <= 5; s++) {
      for (let f = zoneMin; f <= zoneMax; f++) {
        const idx = getFretNoteIndex(s, f, tuning);
        if (idx === rootNoteIndex || idx === (rootNoteIndex + 7) % 12) {
          answers.push({
            stringIndex: s,
            fret: f,
            noteIndex: idx,
            noteName: getNoteName(idx, isFlat),
            intervalName: idx === rootNoteIndex ? 'R (Low)' : '5 (Low)',
            type: 'low_groove',
            title: 'Low Register Grunt / Swagger',
            explanation: 'Drops down to the bass strings for a gritty Texas-style rhythmic counter-attack.',
            vibe: 'Heavy Swagger · "Deep in the pocket"',
            frequency: getNoteFrequency(s, f, tuning),
          });
          break;
        }
      }
      if (answers.some((a) => a.type === 'low_groove')) break;
    }
  }

  // Scenario C: Target Active Backing Chord 3rd
  const chordRoot = activeChord.rootIndex;
  const chord3rdIdx = (chordRoot + 4) % 12;
  const chord3rdCoords = findCoords(chord3rdIdx);
  if (chord3rdCoords && !answers.some((a) => a.noteIndex === chord3rdIdx)) {
    answers.push({
      stringIndex: chord3rdCoords.stringIndex,
      fret: chord3rdCoords.fret,
      noteIndex: chord3rdIdx,
      noteName: getNoteName(chord3rdIdx, isFlat),
      intervalName: `3rd of ${activeChord.chordName}`,
      type: 'chord_tone',
      title: `Outline ${activeChord.chordName} Chord Change`,
      explanation: `Lands cleanly on the 3rd of ${activeChord.chordName} right as the harmony shifts.`,
      vibe: 'Harmonic Wizardry · "Following the change"',
      frequency: getNoteFrequency(chord3rdCoords.stringIndex, chord3rdCoords.fret, tuning),
    });
  }

  return answers.slice(0, 3);
}

// Ordered zone cycle for Up/Down arrow navigation
const ZONE_CYCLE = ['box1', 'box2', 'box3', 'bb_box', 'box4', 'box5', 'albert_box'];

export function getNextZoneId(currentZoneId: string, direction: 'up' | 'down'): string {
  const currentIndex = ZONE_CYCLE.indexOf(currentZoneId);
  if (currentIndex === -1) {
    return direction === 'up' ? 'box2' : 'box1';
  }

  if (direction === 'up') {
    return ZONE_CYCLE[(currentIndex + 1) % ZONE_CYCLE.length];
  } else {
    return ZONE_CYCLE[(currentIndex - 1 + ZONE_CYCLE.length) % ZONE_CYCLE.length];
  }
}
