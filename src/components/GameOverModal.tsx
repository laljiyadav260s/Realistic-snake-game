import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Sliders, ArrowRight } from 'lucide-react';
import { Difficulty, GameMode } from '../types/game';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  snakeLength: number;
  applesEaten: number;
  mode: GameMode;
  difficulty: Difficulty;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  snakeLength,
  applesEaten,
  mode,
  difficulty,
  onRestart,
  onOpenSettings,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
        {/* Badge or Icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          {isNewHighScore ? (
            <Trophy className="w-7 h-7 text-amber-400 animate-bounce" />
          ) : (
            <RotateCcw className="w-7 h-7 text-rose-400" />
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          {isNewHighScore ? 'New High Score!' : 'Game Over'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isNewHighScore
            ? 'Incredible reflexes! You set a brand new personal record.'
            : 'A slithery mishap. Press space or tap Play Again to restart.'}
        </p>

        {/* Score Display Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-6">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Final Score</div>
          <div className="text-4xl font-extrabold text-white font-mono-numbers tracking-tight">
            {score.toLocaleString()}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
            <div>
              <span className="block text-slate-500 text-[11px]">Best</span>
              <span className="font-semibold text-amber-400 font-mono-numbers">{highScore.toLocaleString()}</span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div>
              <span className="block text-slate-500 text-[11px]">Length</span>
              <span className="font-semibold text-slate-200 font-mono-numbers">{snakeLength}</span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div>
              <span className="block text-slate-500 text-[11px]">Apples</span>
              <span className="font-semibold text-rose-400 font-mono-numbers">{applesEaten}</span>
            </div>
          </div>
        </div>

        {/* Mode context line */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
          <span>Mode: {mode === 'CLASSIC' ? 'Classic' : mode === 'PORTAL' ? 'Portal' : 'Obstacles'}</span>
          <span aria-hidden="true">·</span>
          <span>Speed: {difficulty}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again (Enter)</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Change Mode or Difficulty</span>
          </button>
        </div>
      </div>
    </div>
  );
};
