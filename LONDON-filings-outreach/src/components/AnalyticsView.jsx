import React from 'react';
import { BarChart3, AlertTriangle, Scale, Clock, PieChart, TrendingUp } from 'lucide-react';

export default function AnalyticsView({ companies }) {
  const criticalCount = companies.filter((c) => c.estimatedQuartersRunway < 2.0).length;
  const s656Count = companies.filter((c) => c.filingType.includes('Section 656') || c.statutoryDistressTrigger.includes('Section 656')).length;
  const avgRunway = (companies.reduce((acc, c) => acc + c.estimatedQuartersRunway, 0) / companies.length).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Critical Runway (&lt; 2.0 Qtrs)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{criticalCount} Issuers</div>
          <div className="text-[10px] text-slate-500 mt-1">Immediate capital requirement</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Section 656 CA 2006 Alerts</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{s656Count} Notices</div>
          <div className="text-[10px] text-slate-500 mt-1">Loss of 50%+ called-up capital</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Cash Runway</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{avgRunway} Quarters</div>
          <div className="text-[10px] text-slate-500 mt-1">Across monitored London issuers</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Executive Coverage</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">100% Direct</div>
          <div className="text-[10px] text-slate-500 mt-1">Chair, CEO, CFO & NOMAD desk</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Cash Runway Distribution
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Severe Distress (&lt; 1.0 Quarter)</span>
                <span className="font-mono text-rose-400 font-bold">
                  {companies.filter((c) => c.estimatedQuartersRunway < 1.0).length} issuers
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(companies.filter((c) => c.estimatedQuartersRunway < 1.0).length / companies.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Tight Working Capital (1.0 - 2.0 Quarters)</span>
                <span className="font-mono text-amber-400 font-bold">
                  {companies.filter((c) => c.estimatedQuartersRunway >= 1.0 && c.estimatedQuartersRunway < 2.0).length} issuers
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(companies.filter((c) => c.estimatedQuartersRunway >= 1.0 && c.estimatedQuartersRunway < 2.0).length / companies.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Adequate Reserves (&gt; 2.0 Quarters)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {companies.filter((c) => c.estimatedQuartersRunway >= 2.0).length} issuers
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(companies.filter((c) => c.estimatedQuartersRunway >= 2.0).length / companies.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Statutory Trigger Breakdown
          </h3>
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex justify-between">
              <span>Section 656 Capital Loss EGM Notice:</span>
              <span className="font-mono font-bold text-rose-400">2 Issuers</span>
            </div>
            <div className="flex justify-between">
              <span>UK MAR Working Capital Shortfall:</span>
              <span className="font-mono font-bold text-amber-400">2 Issuers</span>
            </div>
            <div className="flex justify-between">
              <span>Strategic Corporate Financing:</span>
              <span className="font-mono font-bold text-indigo-400">1 Issuer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
