import React from 'react';
import { BarChart3, Flame, AlertTriangle, Users, TrendingDown } from 'lucide-react';

export default function AnalyticsView({ companies }) {
  const criticalCount = companies.filter((c) => c.estimatedQuartersRunway < 2.0).length;
  const severeCount = companies.filter((c) => c.estimatedQuartersRunway < 1.0).length;
  const avgRunway = (
    companies.reduce((acc, c) => acc + c.estimatedQuartersRunway, 0) / companies.length
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Distressed Issuers (&lt; 2.0 Qtrs)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{criticalCount} Issuers</div>
          <div className="text-[10px] text-slate-500 mt-1">High urgency capital targets</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">§ 92 AktG Critical (&lt; 1.0 Qtr)</div>
          <div className="text-xl font-bold font-mono text-rose-500 mt-1">{severeCount} Emergency</div>
          <div className="text-[10px] text-slate-500 mt-1">Mandatory EGM loss of capital</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Cash Runway</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{avgRunway} Quarters</div>
          <div className="text-[10px] text-slate-500 mt-1">Sector weighted average</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tracked Issuers</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{companies.length} Issuers</div>
          <div className="text-[10px] text-slate-500 mt-1">Prime Standard, Scale & Open Market</div>
        </div>
      </div>

      {/* Runway Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            Cash Runway Tier Distribution
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Critical Distress (&lt; 1.0 Quarter Runway)</span>
                <span className="font-mono text-rose-400 font-bold">{severeCount}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(severeCount / companies.length) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Distressed Runway (1.0 – 2.0 Quarters)</span>
                <span className="font-mono text-amber-400 font-bold">
                  {companies.filter((c) => c.estimatedQuartersRunway >= 1.0 && c.estimatedQuartersRunway < 2.0).length}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${
                      (companies.filter((c) => c.estimatedQuartersRunway >= 1.0 && c.estimatedQuartersRunway < 2.0).length /
                        companies.length) *
                      100
                    }%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Stable Runway (&ge; 2.0 Quarters)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {companies.filter((c) => c.estimatedQuartersRunway >= 2.0).length}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${
                      (companies.filter((c) => c.estimatedQuartersRunway >= 2.0).length / companies.length) * 100
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Distress Trigger Classifications
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex justify-between items-center">
              <span className="text-rose-200">§ 92 AktG Capital Loss Notifications</span>
              <span className="font-mono font-bold text-rose-400">
                {companies.filter((c) => c.filingType.includes('§ 92')).length}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex justify-between items-center">
              <span className="text-amber-200">Debt Standstill / IDW S6 Reports</span>
              <span className="font-mono font-bold text-amber-400">
                {companies.filter((c) => c.filingTitle.includes('Stillhalte') || c.statutoryDistressTrigger.includes('IDW')).length}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">Restructuring & Cost Moratoriums</span>
              <span className="font-mono font-bold text-slate-400">
                {companies.filter((c) => c.filingTitle.includes('Restrukturierung')).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
