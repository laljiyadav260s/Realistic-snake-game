import React from 'react';
import { Play, Shield, Compass, Sparkles, Zap, Award } from 'lucide-react';
import { Difficulty, GameMode } from '../types/game';

interface StartMenuModalProps {
  mode: GameMode;
  difficulty: Difficulty;
  onChangeMode: (m: GameMode) => void;
  onChangeDifficulty: (d: Difficulty) => void;
  onStart: () => void;
  highScore: number;
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  mode,
  difficulty,
  onChangeMode,
  onChangeDifficulty,
  onStart,
  highScore,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl">
        {/* Title & Brand */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-1">
              Retro Arcade Edition
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Snake Arcade
            </h1>
          </div>
          {highScore > 0 && (
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                Personal Best
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono-numbers">
                {highScore.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Mode Selector (Interactive Segmented Buttons) */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Game Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onChangeMode('CLASSIC')}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                mode === 'CLASSIC'
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Shield className={`w-4 h-4 ${mode === 'CLASSIC' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold">Classic</span>
              <span className="text-[10px] text-slate-400">Deadly walls</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('PORTAL')}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                mode === 'PORTAL'
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Compass className={`w-4 h-4 ${mode === 'PORTAL' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold">Portal</span>
              <span className="text-[10px] text-slate-400">Pass-through</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('OBSTACLES')}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                mode === 'OBSTACLES'
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${mode === 'OBSTACLES' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold">Obstacles</span>
              <span className="text-[10px] text-slate-400">Rock hazards</span>
            </button>
          </div>
        </div>

        {/* Speed / Difficulty Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Speed Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChangeDifficulty(d)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  difficulty === d
                    ? 'bg-slate-800 border-slate-600 text-white shadow-inner'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d === 'EASY' ? 'Relaxed' : d === 'MEDIUM' ? 'Standard' : 'Turbo'}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions strip */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 mb-6 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Desktop Controls:</span>
            <span className="text-slate-200 font-medium">Arrow Keys or W / A / S / D</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Mobile Controls:</span>
            <span className="text-slate-200 font-medium">Swipe Canvas or On-Screen D-Pad</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Pause / Resume:</span>
            <span className="text-slate-200 font-medium">Spacebar</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-emerald-400">
            <span>Bonus Starfruit:</span>
            <span>Appears every 5 apples for 30 pts!</span>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Slithering</span>
        </button>
      </div>
    </div>
  );
};
