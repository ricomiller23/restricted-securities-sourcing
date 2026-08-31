import React from 'react';
import { BarChart3, TrendingUp, Users, Radar, DollarSign, PieChart } from 'lucide-react';

export default function AnalyticsView({ signals }) {
  const pdmrCount = signals.filter((s) => s.signalType.includes('UK MAR') || s.signalType.includes('PDMR')).length;
  const tr1Count = signals.filter((s) => s.signalType.includes('TR-1') || s.signalType.includes('DTR 5')).length;
  const dilutionCount = signals.filter((s) => s.signalType.includes('570')).length;
  const avgScore = Math.round(signals.reduce((acc, s) => acc + s.score, 0) / signals.length);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">UK MAR PDMR Dealings</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{pdmrCount} Signals</div>
          <div className="text-[10px] text-slate-500 mt-1">Executive & NED Director buys</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">FCA DTR 5 TR-1 Filings</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{tr1Count} Filings</div>
          <div className="text-[10px] text-slate-500 mt-1">3%, 5%, 10%+ institutional accumulation</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Section 570 Dilution Tranches</div>
          <div className="text-xl font-bold font-mono text-pink-400 mt-1">{dilutionCount} Placements</div>
          <div className="text-[10px] text-slate-500 mt-1">Block admissions & placing shares</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Conviction Score</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{avgScore}/100</div>
          <div className="text-[10px] text-slate-500 mt-1">Weighted liquidity vs. volume metric</div>
        </div>
      </div>

      {/* Signal Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            UK Regulatory Signal Composition
          </h3>
          <div className="space-y-3 text-xs">
            {['UK MAR Art. 19 (PDMR Dealing)', 'FCA DTR 5 TR-1 (Major Holding 10%+)', 'FCA DTR 5 TR-1 (Major Holding 27%+)', 'Section 570 CA 2006 (Dilution Tranche)'].map((sig) => {
              const count = signals.filter((s) => s.signalType.includes(sig) || sig.includes(s.signalType)).length;
              const percent = Math.round((count / signals.length) * 100);

              return (
                <div key={sig}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="truncate pr-2">{sig}</span>
                    <span className="font-mono text-purple-400 font-bold">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Conviction Tier Distribution
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 flex justify-between items-center">
              <span className="text-purple-200">Tier 1 Conviction (Score &ge; 90)</span>
              <span className="font-mono font-bold text-purple-400">
                {signals.filter((s) => s.score >= 90).length} Signals
              </span>
            </div>
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex justify-between items-center">
              <span className="text-indigo-200">Tier 2 Moderate (Score 80 - 89)</span>
              <span className="font-mono font-bold text-indigo-400">
                {signals.filter((s) => s.score >= 80 && s.score < 90).length} Signals
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">Tier 3 Standard (Score &lt; 80)</span>
              <span className="font-mono font-bold text-slate-400">
                {signals.filter((s) => s.score < 80).length} Signals
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
