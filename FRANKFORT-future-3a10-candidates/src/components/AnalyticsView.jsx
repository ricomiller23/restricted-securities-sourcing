import React from 'react';
import { BarChart3, Scale, Building, DollarSign, PieChart, ShieldCheck } from 'lucide-react';

export default function AnalyticsView({ candidates }) {
  const totalVolumeEur = "€3.26B EUR";
  const starugCount = candidates.filter((c) => c.mechanism.includes('StaRUG')).length;
  const insoCount = candidates.filter((c) => c.mechanism.includes('Insolvenzplan')).length;
  const squeezeCount = candidates.filter((c) => c.mechanism.includes('Squeeze')).length;

  const courts = {};
  candidates.forEach((c) => {
    courts[c.courtJurisdiction] = (courts[c.courtJurisdiction] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Restructuring Volume</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{totalVolumeEur}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across German listed AG proceedings</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">StaRUG Pre-Insolvency</div>
          <div className="text-xl font-bold font-mono text-teal-300 mt-1">{starugCount} Plans</div>
          <div className="text-[10px] text-slate-500 mt-1">Court confirmed (§ 60 StaRUG)</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Insolvenzplan Swaps</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{insoCount} In Progress</div>
          <div className="text-[10px] text-slate-500 mt-1">§ 225a InsO Debt-to-Equity</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cross-Border 3(a)(10)</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">100% Eligible</div>
          <div className="text-[10px] text-slate-500 mt-1">Court fairness hearing compliance</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            German Statutory Mechanism Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>StaRUG Restrukturierungsplan</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round((starugCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(starugCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Insolvenzplanverfahren (§§ 217 ff. InsO)</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round((insoCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(insoCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Squeeze-Out / Spruchverfahren (§ 327a AktG)</span>
                <span className="font-mono text-purple-400 font-bold">{Math.round((squeezeCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(squeezeCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            Restrukturierungsgerichte (*District Courts*)
          </h3>
          <div className="space-y-2.5 text-xs">
            {Object.entries(courts).map(([court, count]) => (
              <div key={court} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">{court}</span>
                <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {count} proceeding{count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
