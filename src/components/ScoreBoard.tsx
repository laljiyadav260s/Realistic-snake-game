import React from 'react';
import { Trophy, Flame, Apple, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Difficulty, GameMode } from '../types/game';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  snakeLength: number;
  applesEaten: number;
  mode: GameMode;
  difficulty: Difficulty;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleFullscreen?: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  highScore,
  snakeLength,
  applesEaten,
  mode,
  difficulty,
  isMuted,
  onToggleMute,
  onToggleFullscreen,
}) => {
  return (
    <div className="w-full max-w-[560px] bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg backdrop-blur-sm">
      {/* Top row: Primary Score & High Score */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Current Score</span>
          <div className="text-3xl font-extrabold text-white font-mono-numbers tracking-tight">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium uppercase tracking-wider text-amber-400">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>High Score</span>
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono-numbers tracking-tight">
              {highScore.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                title="Toggle Fullscreen"
                aria-label="Toggle Fullscreen"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Clean metadata indicators (Zero-Pill Discipline with typographic separators) */}
      <div className="flex items-center justify-between pt-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-slate-300 font-mono-numbers">
            <Apple className="w-3.5 h-3.5 text-rose-400" />
            <strong className="font-semibold text-white">{applesEaten}</strong> apples
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-slate-300 font-mono-numbers">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="font-semibold text-white">{snakeLength}</strong> length
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{mode === 'CLASSIC' ? 'Classic' : mode === 'PORTAL' ? 'Portal' : 'Obstacles'}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="capitalize">{difficulty.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
};
