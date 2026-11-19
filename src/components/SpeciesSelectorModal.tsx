import React from 'react';
import { SNAKE_SPECIES, BIOMES } from '../data/speciesData';
import { BiomeId, SnakeSpeciesId } from '../types/realistic';
import { Check, X } from 'lucide-react';

interface SpeciesSelectorModalProps {
  currentSpecies: SnakeSpeciesId;
  currentBiome: BiomeId;
  onSelectSpecies: (id: SnakeSpeciesId) => void;
  onSelectBiome: (id: BiomeId) => void;
  onClose: () => void;
}

export const SpeciesSelectorModal: React.FC<SpeciesSelectorModalProps> = ({
  currentSpecies,
  currentBiome,
  onSelectSpecies,
  onSelectBiome,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Select Serpent Species & Biome</h2>
            <p className="text-xs text-slate-400">Authentic anatomical traits, scales, and behavioral sounds</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Species List */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Snake Species
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(SNAKE_SPECIES).map((sp) => {
              const isSelected = sp.id === currentSpecies;
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onSelectSpecies(sp.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-sm text-white">{sp.commonName}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: sp.baseColor }}
                    />
                  </div>
                  <span className="text-[11px] italic text-slate-400 mb-2">{sp.scientificName}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{sp.description}</p>

                  {sp.hasRattle && (
                    <span className="mt-2 text-[10px] font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/40 px-2 py-0.5 rounded-md inline-block w-fit">
                      Includes Auditory Tail Rattle
                    </span>
                  )}

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Biome Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Hunting Habitat / Ground Substrate
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(BIOMES).map((bm) => {
              const isSelected = bm.id === currentBiome;
              return (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => onSelectBiome(bm.id as BiomeId)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-6 h-6 mx-auto mb-1.5 rounded-full border border-white/10"
                    style={{ backgroundColor: bm.groundColor }}
                  />
                  <div className="text-xs font-semibold">{bm.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
        >
          Confirm & Hunt
        </button>
      </div>
    </div>
  );
};
