/**
 * CAGED Zone & Fretboard Region Selector with Style Signatures
 */

import React from 'react';
import { CAGED_ZONES, ZoneDefinition } from '../utils/guitarTheory';
import { Layers, MapPin, Sparkles } from 'lucide-react';

interface ZoneSelectorProps {
  activeZoneId: string;
  onSelectZone: (zoneId: string) => void;
  zoneFretRange: { minFret: number; maxFret: number; baseFret: number };
  keyRootName: string;
  isolatedStringRange: 'all' | 'top3' | 'middle3';
  onSelectStringRange: (range: 'all' | 'top3' | 'middle3') => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  activeZoneId,
  onSelectZone,
  zoneFretRange,
  keyRootName,
  isolatedStringRange,
  onSelectStringRange,
}) => {
  const activeZone = CAGED_ZONES.find((z) => z.id === activeZoneId);

  return (
    <div className="rounded-xl border border-stone-800 bg-[#141519] p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              Fretboard Zones & CAGED Boxes
            </h3>
            <p className="text-xs text-stone-400">
              Isolate soloing positions, box connections, or famous master blues zones
            </p>
          </div>
        </div>

        {/* Lead String Filter Tabs (Top 3 strings for vocal soloing vs all 6) */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-lg border border-stone-800 text-xs font-medium">
          <span className="text-stone-400 px-2 font-mono text-[11px]">Strings:</span>
          <button
            type="button"
            onClick={() => onSelectStringRange('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              isolatedStringRange === 'all'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All 6 Strings
          </button>
          <button
            type="button"
            onClick={() => onSelectStringRange('top3')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              isolatedStringRange === 'top3'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Strings 1, 2, 3 (High E, B, G) - Ideal for vocal leads"
          >
            Top 3 (Lead Solo)
          </button>
          <button
            type="button"
            onClick={() => onSelectStringRange('middle3')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              isolatedStringRange === 'middle3'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Strings 2, 3, 4 (B, G, D) - Hendrix & Mayfield style"
          >
            Middle 3 (Riffs)
          </button>
        </div>
      </div>

      {/* Zone Selector Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-4">
        {/* Full Neck Button */}
        <button
          type="button"
          onClick={() => onSelectZone('full')}
          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
            activeZoneId === 'full'
              ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow-sm'
              : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
          }`}
        >
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
            Entire Neck
          </div>
          <div className="text-xs font-bold text-stone-100 truncate mt-0.5">
            Full Fretboard
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-1">
            Frets 0–22
          </div>
        </button>

        {/* 5 CAGED Boxes + 2 Specials */}
        {CAGED_ZONES.map((zone) => {
          const isSelected = activeZoneId === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone.id)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow-sm'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
              }`}
            >
              <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                {zone.cagedShape === 'Special' ? 'Signature Box' : `${zone.cagedShape}-Shape`}
              </div>
              <div className="text-xs font-bold text-stone-100 truncate mt-0.5">
                {zone.shortName}
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-1">
                {isSelected
                  ? `Frets ${zoneFretRange.minFret}–${zoneFretRange.maxFret}`
                  : `Zone ${zone.id.replace('box', '')}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Zone Description & Soloing Signature */}
      {activeZone && activeZoneId !== 'full' && (
        <div className="mt-3 p-3 rounded-lg bg-stone-900/80 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">
              {activeZone.name} in Key of {keyRootName}:
            </span>
            <span className="text-stone-300">{activeZone.description}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Signature: {activeZone.signatureStyle}</span>
          </div>
        </div>
      )}
    </div>
  );
};
