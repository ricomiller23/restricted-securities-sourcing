import React from 'react';
import { BarChart3, Scale, Building, DollarSign, PieChart } from 'lucide-react';

export default function AnalyticsView({ candidates }) {
  const totalVolumeGbp = "£1.36B GBP";
  const part26aCount = candidates.filter((c) => c.mechanism.includes('Part 26A')).length;
  const part26SchemeCount = candidates.filter((c) => c.mechanism.includes('Part 26 Scheme') || c.mechanism.includes('Demerger')).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Restructuring Debt</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{totalVolumeGbp}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across London listed PLC proceedings</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Part 26A Cram Downs</div>
          <div className="text-xl font-bold font-mono text-teal-300 mt-1">{part26aCount} Plans</div>
          <div className="text-[10px] text-slate-500 mt-1">CIGA 2020 cross-class cram down</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Part 26 Schemes</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{part26SchemeCount} Schemes</div>
          <div className="text-[10px] text-slate-500 mt-1">75% value & majority headcount</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SEC 3(a)(10) Exemption</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">100% Eligible</div>
          <div className="text-[10px] text-slate-500 mt-1">High Court fairness sanction order</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            UK Statutory Mechanism Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Part 26A Restructuring Plan (CIGA 2020)</span>
                <span className="font-mono text-emerald-400 font-bold">{Math.round((part26aCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(part26aCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Part 26 Scheme of Arrangement (CA 2006)</span>
                <span className="font-mono text-teal-400 font-bold">{Math.round((part26SchemeCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(part26SchemeCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            Judicial Hearing Venue
          </h3>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white">High Court of Justice (Chancery Division)</div>
            <div className="text-slate-400">Companies Court, The Rolls Building, 7 Rolls Passage, London EC4A 1NL</div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400">
              All 5 active restructurings fall under English High Court supervisory jurisdiction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
