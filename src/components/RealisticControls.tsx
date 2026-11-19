import React from 'react';
import { Play, Pause, RotateCcw, Zap, Navigation, ArrowLeft, ArrowRight } from 'lucide-react';
import { ControlMode } from '../types/realistic';

interface RealisticControlsProps {
  controlMode: ControlMode;
  isPaused: boolean;
  isSprinting: boolean;
  stamina: number;
  onTogglePause: () => void;
  onReset: () => void;
  onSetControlMode: (mode: ControlMode) => void;
  onStartSprint: () => void;
  onStopSprint: () => void;
  onSteerLeft: () => void;
  onSteerRight: () => void;
}

export const RealisticControls: React.FC<RealisticControlsProps> = ({
  controlMode,
  isPaused,
  isSprinting,
  stamina,
  onTogglePause,
  onReset,
  onSetControlMode,
  onStartSprint,
  onStopSprint,
  onSteerLeft,
  onSteerRight,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[340px] select-none">
      {/* Control Mode Switch (Tabs) */}
      <div className="flex items-center justify-between w-full p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => onSetControlMode('POINTER')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center ${
            controlMode === 'POINTER'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pointer / Touch
        </button>

        <button
          type="button"
          onClick={() => onSetControlMode('STEERING')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center ${
            controlMode === 'STEERING'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Left / Right Steer
        </button>
      </div>

      {/* Main Touch Controls Bar */}
      <div className="flex items-center justify-between w-full gap-2">
        {controlMode === 'STEERING' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onSteerLeft();
              }}
              className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 active:bg-emerald-600 active:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Steer Left"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onSteerRight();
              }}
              className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 active:bg-emerald-600 active:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Steer Right"
            >
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Sprint / Slither Surge Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onStartSprint();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onStopSprint();
          }}
          onPointerLeave={onStopSprint}
          disabled={stamina <= 5}
          className={`flex-1 h-14 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer shadow-md ${
            isSprinting
              ? 'bg-amber-400 border-amber-300 text-slate-950 scale-95 shadow-amber-500/30'
              : 'bg-slate-900 border-slate-800 text-amber-400 hover:border-amber-500/50 hover:bg-slate-850'
          }`}
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>Sprint Slither</span>
        </button>
      </div>

      {/* Utility Actions (Pause, Reset) */}
      <div className="flex items-center justify-between w-full gap-2 pt-1">
        <button
          type="button"
          onClick={onTogglePause}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Respawn</span>
        </button>
      </div>

      {/* Helper text */}
      <div className="text-[11px] text-slate-500 text-center leading-relaxed">
        {controlMode === 'POINTER' ? (
          <span>Move mouse or glide finger across ground to lead the serpent. Hold <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> or Sprint to strike!</span>
        ) : (
          <span>Use <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">A</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">D</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Arrow Keys</kbd> to steer. Hold <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> to sprint.</span>
        )}
      </div>
    </div>
  );
};
