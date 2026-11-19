import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Direction } from '../types/game';

interface ArcadeControlsProps {
  onDirection: (dir: Direction) => void;
  onTogglePause: () => void;
  onRestart: () => void;
  isPaused: boolean;
  isPlaying: boolean;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  onDirection,
  onTogglePause,
  onRestart,
  isPaused,
  isPlaying,
}) => {
  const triggerDir = (e: React.MouseEvent | React.TouchEvent, dir: Direction) => {
    e.preventDefault();
    onDirection(dir);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[320px] select-none">
      {/* Quick Utility Actions */}
      <div className="flex items-center justify-between w-full px-2">
        <button
          type="button"
          onClick={onTogglePause}
          disabled={!isPlaying}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* D-Pad Layout */}
      <div className="relative w-44 h-44 grid grid-cols-3 grid-rows-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-lg backdrop-blur-sm">
        {/* UP */}
        <div className="col-start-2 row-start-1 flex items-center justify-center">
          <button
            type="button"
            onPointerDown={(e) => triggerDir(e, 'UP')}
            aria-label="Move Up"
            className="w-13 h-13 rounded-xl bg-slate-900 active:bg-emerald-600 border border-slate-800 active:border-emerald-500 text-slate-200 active:text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* LEFT */}
        <div className="col-start-1 row-start-2 flex items-center justify-center">
          <button
            type="button"
            onPointerDown={(e) => triggerDir(e, 'LEFT')}
            aria-label="Move Left"
            className="w-13 h-13 rounded-xl bg-slate-900 active:bg-emerald-600 border border-slate-800 active:border-emerald-500 text-slate-200 active:text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* CENTER / PIVOT */}
        <div className="col-start-2 row-start-2 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800/60 border border-slate-700/50" />
        </div>

        {/* RIGHT */}
        <div className="col-start-3 row-start-2 flex items-center justify-center">
          <button
            type="button"
            onPointerDown={(e) => triggerDir(e, 'RIGHT')}
            aria-label="Move Right"
            className="w-13 h-13 rounded-xl bg-slate-900 active:bg-emerald-600 border border-slate-800 active:border-emerald-500 text-slate-200 active:text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* DOWN */}
        <div className="col-start-2 row-start-3 flex items-center justify-center">
          <button
            type="button"
            onPointerDown={(e) => triggerDir(e, 'DOWN')}
            aria-label="Move Down"
            className="w-13 h-13 rounded-xl bg-slate-900 active:bg-emerald-600 border border-slate-800 active:border-emerald-500 text-slate-200 active:text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
