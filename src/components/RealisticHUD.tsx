import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Zap,
  Sparkles,
  Bot,
  Swords,
  Brain,
} from 'lucide-react';
import { Biome, DigestiveBulge, SnakeSpecies } from '../types/realistic';

interface RealisticHUDProps {
  species: SnakeSpecies;
  biome: Biome;
  score: number;
  preyCount: number;
  lengthMeters: number;
  recordLengthMeters: number;
  stamina: number;
  isSprinting: boolean;
  isMuted: boolean;
  isAIAutopilot: boolean;
  rivalsCount: number;
  bulges: DigestiveBulge[];
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleAIAutopilot: () => void;
  onToggleRivals: () => void;
  onOpenSpeciesModal: () => void;
  onOpenGeminiModal: () => void;
}

export const RealisticHUD: React.FC<RealisticHUDProps> = ({
  species,
  biome,
  score,
  preyCount,
  lengthMeters,
  recordLengthMeters,
  stamina,
  isSprinting,
  isMuted,
  isAIAutopilot,
  rivalsCount,
  bulges,
  onToggleMute,
  onToggleFullscreen,
  onToggleAIAutopilot,
  onToggleRivals,
  onOpenSpeciesModal,
  onOpenGeminiModal,
}) => {
  const lengthFeet = (lengthMeters * 3.28084).toFixed(1);

  return (
    <div className="w-full max-w-[660px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Top zone: Species details & AI controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: species.baseColor }}
            />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {species.commonName}
            </h2>
          </div>
          <p className="text-xs italic text-slate-400">
            {species.scientificName} · {biome.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Gemini AI Herpetologist Button */}
          <button
            type="button"
            onClick={onOpenGeminiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60 hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">AI Insights</span>
          </button>

          {/* Change Species */}
          <button
            type="button"
            onClick={onOpenSpeciesModal}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Species
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Zone: Metrics (Length, Calorie Score, Digesting items) */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Body Length
          </span>
          <div className="text-lg font-bold text-white font-mono-numbers">
            {lengthMeters.toFixed(2)}m
            <span className="text-xs font-normal text-slate-400 ml-1">({lengthFeet}ft)</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Prey Consumed
          </span>
          <div className="text-lg font-bold text-emerald-400 font-mono-numbers">
            {preyCount}
            <span className="text-xs font-normal text-slate-400 ml-1">({score} kcal)</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Record Length
          </span>
          <div className="text-lg font-bold text-amber-400 font-mono-numbers">
            {recordLengthMeters.toFixed(2)}m
          </div>
        </div>
      </div>

      {/* AI Modes & Rivals Strip */}
      <div className="flex items-center justify-between gap-2 p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs">
        {/* AI Autopilot Toggle */}
        <button
          type="button"
          onClick={onToggleAIAutopilot}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
            isAIAutopilot
              ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Autopilot: {isAIAutopilot ? 'ON' : 'OFF'}</span>
        </button>

        {/* Rival Competitor Serpents Toggle */}
        <button
          type="button"
          onClick={onToggleRivals}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
            rivalsCount > 0
              ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Rival Serpents: {rivalsCount > 0 ? `${rivalsCount} Active` : 'Disabled'}</span>
        </button>
      </div>

      {/* Bottom Zone: Slither Sprint Stamina & Digestion Bar */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Zap className={`w-3.5 h-3.5 ${isSprinting ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>Sprint Stamina (Hold Space / Boost)</span>
          </span>
          <span className="font-mono-numbers">{Math.round(stamina)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-75 ${
              isSprinting ? 'bg-amber-400' : stamina > 30 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, stamina))}%` }}
          />
        </div>

        {/* Digestion Status */}
        {bulges.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>
              Digesting {bulges.length} item{bulges.length > 1 ? 's' : ''} (visible peristalsis lump moving down body)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
