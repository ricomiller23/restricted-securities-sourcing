import React from 'react';
import { BarChart3, TrendingUp, Users, Radar, DollarSign, PieChart } from 'lucide-react';

export default function AnalyticsView({ signals }) {
  const tradeCount = signals.filter((s) => s.signalType.includes('3Y')).length;
  const substantialCount = signals.filter((s) => s.signalType.includes('603') || s.signalType.includes('604')).length;
  const dilutionCount = signals.filter((s) => s.signalType.includes('2A')).length;
  const avgScore = Math.round(signals.reduce((acc, s) => acc + s.score, 0) / signals.length);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Appendix 3Y Director Buys</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{tradeCount} Signals</div>
          <div className="text-[10px] text-slate-500 mt-1">On-market insider accumulation</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Substantial 5%+ Moves</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{substantialCount} Filings</div>
          <div className="text-[10px] text-slate-500 mt-1">Form 603 / 604 institutional flow</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dilution Events (2A/s708A)</div>
          <div className="text-xl font-bold font-mono text-pink-400 mt-1">{dilutionCount} Quotations</div>
          <div className="text-[10px] text-slate-500 mt-1">Zero lockup secondary shares</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Conviction Score</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{avgScore}/100</div>
          <div className="text-[10px] text-slate-500 mt-1">Weighted signal algorithm</div>
        </div>
      </div>

      {/* Signal Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            Signal Intelligence Composition
          </h3>
          <div className="space-y-3 text-xs">
            {['Appendix 3Y (Director Trade)', 'Form 603 (Initial Substantial Holder)', 'Form 604 (Change of Substantial Holder)', 'Appendix 2A & s708A Cleansing'].map((sig) => {
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
