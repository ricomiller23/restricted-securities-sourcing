import React from 'react';
import { BarChart3, Flame, PauseCircle, Users, DollarSign, PieChart } from 'lucide-react';

export default function AnalyticsView({ companies }) {
  const criticalCount = companies.filter((c) => c.quartersOfFundingRemaining < 1.5).length;
  const haltCount = companies.filter((c) => c.inTradingHalt).length;
  const miningCount = companies.filter((c) => c.filingForm.includes('5B')).length;
  const techCount = companies.filter((c) => c.filingForm.includes('4C')).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">High Distress (&lt; 1.5 Qtrs)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{criticalCount} Entities</div>
          <div className="text-[10px] text-slate-500 mt-1">Immediate capital requirement</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Trading Halts</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{haltCount} Halts</div>
          <div className="text-[10px] text-slate-500 mt-1">Pending placement announcements</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Appendix 5B (Mining)</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{miningCount} Issuers</div>
          <div className="text-[10px] text-slate-500 mt-1">Junior exploration cash flow</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Appendix 4C (Tech/Bio)</div>
          <div className="text-xl font-bold font-mono text-teal-400 mt-1">{techCount} Issuers</div>
          <div className="text-[10px] text-slate-500 mt-1">Commitment entity cash flow</div>
        </div>
      </div>

      {/* Runway Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            Cash Runway Distribution (Item 8.6)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex justify-between items-center">
              <span className="text-rose-200">&lt; 1.0 Quarter (Emergency Rescue)</span>
              <span className="font-mono font-bold text-rose-400">
                {companies.filter((c) => c.quartersOfFundingRemaining < 1.0).length} Companies
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex justify-between items-center">
              <span className="text-amber-200">1.0 - 2.0 Quarters (Urgent Placement)</span>
              <span className="font-mono font-bold text-amber-400">
                {companies.filter((c) => c.quartersOfFundingRemaining >= 1.0 && c.quartersOfFundingRemaining < 2.0).length} Companies
              </span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center">
              <span className="text-emerald-200">&gt; 2.0 Quarters (Stable Runway)</span>
              <span className="font-mono font-bold text-emerald-400">
                {companies.filter((c) => c.quartersOfFundingRemaining >= 2.0).length} Companies
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Outreach Pipeline Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            {['Term Sheet Drafted', 'Pitch Sent', 'Advisors Contacted', 'Call Scheduled', 'Monitoring Only'].map((st) => {
              const count = companies.filter((c) => c.outreachStatus === st).length;
              const percent = Math.round((count / companies.length) * 100);

              return (
                <div key={st}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{st}</span>
                    <span className="font-mono text-indigo-400 font-bold">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
