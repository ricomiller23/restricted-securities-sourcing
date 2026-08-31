import React from 'react';
import { BarChart3, Scale, Building, DollarSign, PieChart, ShieldCheck, CheckCircle } from 'lucide-react';

export default function AnalyticsView({ candidates }) {
  // Aggregate statistics
  const totalValueAud = "$122.9M AUD";
  const schemeCount = candidates.filter(c => c.mechanism.includes('Scheme')).length;
  const docaCount = candidates.filter(c => c.mechanism.includes('DOCA')).length;
  const directSwapCount = candidates.filter(c => c.mechanism.includes('708A')).length;

  const jurisdictions = {};
  candidates.forEach(c => {
    jurisdictions[c.courtJurisdiction] = (jurisdictions[c.courtJurisdiction] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Deal Value Tracked</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{totalValueAud}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 10 active restructurings</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Section 411 Schemes</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{schemeCount} Active</div>
          <div className="text-[10px] text-slate-500 mt-1">Court-sanctioned 3(a)(10) eligible</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Part 5.3A DOCA Rescues</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{docaCount} In Administration</div>
          <div className="text-[10px] text-slate-500 mt-1">Shell preservation & debt haircut</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">s708A Cleansing Swaps</div>
          <div className="text-xl font-bold font-mono text-teal-400 mt-1">{directSwapCount} Swaps</div>
          <div className="text-[10px] text-slate-500 mt-1">Immediate secondary liquidity</div>
        </div>
      </div>

      {/* Breakdown by Mechanism & Court */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            Australian Statutory Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Section 411 Schemes of Arrangement (Part 5.1)</span>
                <span className="font-mono text-purple-400 font-bold">{Math.round((schemeCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(schemeCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Deed of Company Arrangement (Part 5.3A DOCA)</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round((docaCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(docaCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Section 708A Cleansing Notice Debt Conversion</span>
                <span className="font-mono text-teal-400 font-bold">{Math.round((directSwapCount / candidates.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(directSwapCount / candidates.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            Court Hearing Venues
          </h3>
          <div className="space-y-2.5 text-xs">
            {Object.entries(jurisdictions).map(([court, count]) => (
              <div key={court} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">{court}</span>
                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {count} case{count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
