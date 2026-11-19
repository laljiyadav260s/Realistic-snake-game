import React, { useState, useEffect } from 'react';
import { GeminiSerpentInsight, SnakeSpecies, Biome } from '../types/realistic';
import { Sparkles, Brain, Award, X, RefreshCw, Compass, ShieldAlert } from 'lucide-react';

interface GeminiInsightModalProps {
  species: SnakeSpecies;
  biome: Biome;
  lengthMeters: number;
  preyCount: number;
  calories: number;
  digestiveCount: number;
  onClose: () => void;
}

export const GeminiInsightModal: React.FC<GeminiInsightModalProps> = ({
  species,
  biome,
  lengthMeters,
  preyCount,
  calories,
  digestiveCount,
  onClose,
}) => {
  const [insight, setInsight] = useState<GeminiSerpentInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/serpent-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speciesName: species.commonName,
          scientificName: species.scientificName,
          biomeName: biome.name,
          lengthMeters,
          preyCaught: preyCount,
          calories,
          digestiveCount,
          topPrey: 'Field mice and tree frogs',
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      setInsight(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Unable to fetch live AI herpetology analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Gemini Serpent Intelligence</h2>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                  AI Herpetologist
                </span>
              </div>
              <p className="text-xs text-slate-400">Biological field evaluation & predatory tactical analysis</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Specimen Telemetry Strip */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-5 flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Specimen</span>
            <strong className="text-white">{species.commonName}</strong>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Length</span>
            <strong className="font-mono-numbers text-emerald-400">{lengthMeters.toFixed(2)}m</strong>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Prey Consumed</span>
            <strong className="font-mono-numbers text-amber-400">{preyCount} items</strong>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Digesting</span>
            <strong className="font-mono-numbers text-sky-400">{digestiveCount} bulges</strong>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">
              Gemini AI is analyzing biological telemetry & metabolic performance...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300 text-xs mb-4 text-center">
            <p className="mb-2">{error}</p>
            <button
              type="button"
              onClick={fetchInsight}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-xs font-semibold cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Results */}
        {insight && !loading && (
          <div className="space-y-4 mb-6">
            {/* Tactical Assessment */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Tactical Predatory Assessment</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.tacticalAssessment}
              </p>
            </div>

            {/* Metabolic Analysis */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Metabolic & Digestion Dynamics</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.metabolicAnalysis}
              </p>
            </div>

            {/* Predator Coaching Tip */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Herpetologist Hunting Tip</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {insight.predatorTip}
              </p>
            </div>

            {/* Biological Trivia */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Natural History & Species Fact</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.biologicalFact}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={fetchInsight}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer text-center font-bold"
          >
            Return to Hunt
          </button>
        </div>
      </div>
    </div>
  );
};
