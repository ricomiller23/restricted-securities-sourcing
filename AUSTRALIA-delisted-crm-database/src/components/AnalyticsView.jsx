import React from 'react';
import { BarChart3, PieChart, Clock, AlertTriangle, Building, CheckCircle2 } from 'lucide-react';

export default function AnalyticsView({ issuers }) {
  const urgentCount = issuers.filter((i) => i.daysRemaining > 0 && i.daysRemaining < 60).length;
  const docaCount = issuers.filter((i) => i.crmStage === 'DOCA Proposed').length;
  const rtoCount = issuers.filter((i) => i.crmStage === 'RTO In Progress').length;
  const avgShellScore = Math.round(issuers.reduce((acc, i) => acc + i.cleanShellScore, 0) / issuers.length);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">LR 17.12 Urgency Alert</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{urgentCount} Shells &lt; 60 Days</div>
          <div className="text-[10px] text-slate-500 mt-1">Automatic delisting deadline imminent</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">DOCA Recapitalizations</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{docaCount} In Pipeline</div>
          <div className="text-[10px] text-slate-500 mt-1">Deed fund compromise proposed</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Backdoor RTOs Active</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{rtoCount} Under Term Sheet</div>
          <div className="text-[10px] text-slate-500 mt-1">Re-compliance with Chapters 1 & 2</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Shell Health</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{avgShellScore}/100</div>
          <div className="text-[10px] text-slate-500 mt-1">Weighted cleanliness rating</div>
        </div>
      </div>

      {/* Breakdown Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-400" />
            Delisting / Suspension Categories
          </h3>
          <div className="space-y-3 text-xs">
            {['Failure to Lodge Periodic Reports', 'Insolvency / Chapter 11 Cross-Border Default', 'Insufficient Operations (Rule 12.1)', 'Disposal of Main Undertaking (LR 11.1.3)'].map((cat) => {
              const count = issuers.filter((i) => i.delistingReason.includes(cat) || cat.includes(i.delistingReason)).length;
              const percent = Math.round((count / issuers.length) * 100);

              return (
                <div key={cat}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="truncate pr-2">{cat}</span>
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
            <Clock className="w-4 h-4 text-amber-400" />
            2-Year Automatic Removal Distribution (LR 17.12)
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex justify-between items-center">
              <span className="text-rose-200">&lt; 60 Days (Critical Action)</span>
              <span className="font-mono font-bold text-rose-400">{issuers.filter((i) => i.daysRemaining > 0 && i.daysRemaining < 60).length} Shells</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex justify-between items-center">
              <span className="text-amber-200">60 - 180 Days (Active Restructuring)</span>
              <span className="font-mono font-bold text-amber-400">{issuers.filter((i) => i.daysRemaining >= 60 && i.daysRemaining <= 180).length} Shells</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center">
              <span className="text-emerald-200">&gt; 180 Days (Early Stage Pipeline)</span>
              <span className="font-mono font-bold text-emerald-400">{issuers.filter((i) => i.daysRemaining > 180).length} Shells</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
