import React from 'react';
import { Clock, Building, ShieldAlert, ArrowRight, Mail } from 'lucide-react';

const STAGES = [
  { id: 'Identified', label: 'Identified Shells', color: 'border-slate-700 bg-slate-900/40' },
  { id: 'Reviewing', label: 'Under Review', color: 'border-blue-500/30 bg-blue-950/20' },
  { id: 'Advisors Contacted', label: 'Advisors Contacted', color: 'border-amber-500/30 bg-amber-950/20' },
  { id: 'DOCA Proposed', label: 'DOCA Proposed', color: 'border-purple-500/30 bg-purple-950/20' },
  { id: 'RTO In Progress', label: 'RTO In Progress', color: 'border-rose-500/30 bg-rose-950/20' },
  { id: 'Closed/Re-listed', label: 'Closed / Re-listed', color: 'border-emerald-500/30 bg-emerald-950/20' }
];

export default function KanbanView({ issuers, onSelect, onOpenEmail }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageIssuers = issuers.filter((item) => item.crmStage === stage.id);

        return (
          <div key={stage.id} className="flex flex-col min-w-[240px]">
            {/* Column Header */}
            <div className={`p-3 rounded-xl border ${stage.color} mb-3 backdrop-blur-sm flex items-center justify-between`}>
              <h3 className="text-xs font-bold text-slate-200">{stage.label}</h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300">
                {stageIssuers.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1">
              {stageIssuers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="bg-[#0e1424]/90 border border-slate-800 hover:border-rose-500/40 rounded-xl p-3.5 shadow-md hover:shadow-rose-500/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono font-bold text-rose-400 text-xs">{item.ticker}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      item.daysRemaining < 60 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.daysRemaining > 0 ? `${item.daysRemaining}d left` : 'Delisted'}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                    {item.companyName}
                  </h4>

                  <div className="mt-2 text-[10px] text-slate-400">
                    <div className="truncate">MC: {item.marketCapAtSuspension}</div>
                    <div className="truncate text-slate-500 mt-0.5">Counsel: {item.legalCounsel}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-mono font-semibold">Score: {item.cleanShellScore}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmail(item);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Email Outreach"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {stageIssuers.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-slate-800/80 text-center text-xs text-slate-500">
                  No shells in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
