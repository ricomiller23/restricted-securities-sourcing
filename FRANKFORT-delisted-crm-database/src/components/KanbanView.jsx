import React from 'react';
import { Mail, ChevronRight, Building } from 'lucide-react';

const STAGES = [
  'Identified',
  'Reviewing',
  'Advisors Contacted',
  'LOI / Term Sheet',
  'RTO In Progress',
  'Closed/Re-listed'
];

export default function KanbanView({ issuers, onSelect, onOpenEmail, onStageChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageIssuers = issuers.filter((i) => i.crmStage === stage);

        return (
          <div
            key={stage}
            className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3 flex flex-col min-w-[220px]"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">{stage}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-400">
                {stageIssuers.length}
              </span>
            </div>

            {/* Issuer Cards */}
            <div className="space-y-2.5 flex-1">
              {stageIssuers.map((i) => (
                <div
                  key={i.id}
                  onClick={() => onSelect(i)}
                  className="bg-[#151f38] border border-slate-700/60 hover:border-rose-500/50 rounded-lg p-3 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-rose-400 text-xs">{i.ticker}</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Score: {i.cleanShellScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white mb-1">
                    {i.companyName}
                  </h4>

                  <div className="text-[10px] text-slate-400 truncate mb-2">
                    {i.insolvenzverwalter}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500">{i.lastPriceEur}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmail(i);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Email Administrator / Counsel"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {stageIssuers.length === 0 && (
                <div className="h-24 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-[11px] text-slate-600">
                  No shells in stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
