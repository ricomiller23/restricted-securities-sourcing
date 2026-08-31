import React from 'react';
import { BarChart3, Database, ShieldCheck, PieChart, TrendingUp, Clock } from 'lucide-react';

export default function AnalyticsView({ issuers }) {
  const avgHealthScore = Math.round(issuers.reduce((acc, i) => acc + i.cleanShellScore, 0) / issuers.length);
  const primeShells = issuers.filter((i) => i.cleanShellScore >= 85).length;
  const activeClockShells = issuers.filter((i) => i.daysRemainingBeforeCancel > 0).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tracked AIM Shells</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{issuers.length} Vehicles</div>
          <div className="text-[10px] text-slate-500 mt-1">AIM Rule 15 & Rule 40 Suspended</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Prime Clean Shells (Score &ge; 85)</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{primeShells} Shells</div>
          <div className="text-[10px] text-slate-500 mt-1">Immediate RTO suitability</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Shell Health Score</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{avgHealthScore}/100</div>
          <div className="text-[10px] text-slate-500 mt-1">Clean capital & NOMAD status</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rule 41 Active Clocks</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{activeClockShells} Clocks</div>
          <div className="text-[10px] text-slate-500 mt-1">6-month countdown to cancel</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-400" />
            AIM Pipeline Distribution
          </h3>
          <div className="space-y-3 text-xs">
            {['Identified', 'Reviewing', 'Advisors Contacted', 'LOI / Term Sheet', 'RTO In Progress', 'Closed/Re-listed'].map((stg) => {
              const count = issuers.filter((i) => i.crmStage === stg).length;
              const percent = Math.round((count / issuers.length) * 100);

              return (
                <div key={stg}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{stg}</span>
                    <span className="font-mono text-rose-400 font-bold">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Shell Health Score Tier Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center">
              <span className="text-emerald-200">Tier 1: High Quality Cash Shells (90–100)</span>
              <span className="font-mono font-bold text-emerald-400">
                {issuers.filter((i) => i.cleanShellScore >= 90).length} Shells
              </span>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 flex justify-between items-center">
              <span className="text-blue-200">Tier 2: Distressed Sub-Penny Shells (75–89)</span>
              <span className="font-mono font-bold text-blue-400">
                {issuers.filter((i) => i.cleanShellScore >= 75 && i.cleanShellScore < 90).length} Shells
              </span>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex justify-between items-center">
              <span className="text-rose-200">Tier 3: NOMAD Resigned / Critical (&lt; 75)</span>
              <span className="font-mono font-bold text-rose-400">
                {issuers.filter((i) => i.cleanShellScore < 75).length} Shells
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
