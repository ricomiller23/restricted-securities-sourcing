import React from 'react';
import { Calendar, Building, Scale, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CourtHearingCalendar({ candidates, onSelect }) {
  // Sort candidates by hearing date ascending
  const sorted = [...candidates].sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Australian Court Hearing Schedule (s411 & DOCA)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Statutory fairness hearings, first court convening orders, and deed administrator sanction dates across Federal and Supreme Courts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((c) => {
          return (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              className="bg-[#0d1322]/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{c.ticker}</span>
                    <span className="text-[11px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {c.lastPriceAud}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    c.mechanism.includes('Scheme')
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {c.mechanism}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                  {c.companyName}
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>Hearing: <strong className="text-white">{c.hearingDate}</strong></span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-400 text-[11px]">
                    <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{c.courtJurisdiction}</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2 mt-2">
                    <div className="text-[10px] text-slate-400 font-medium">Deal / Claim Size:</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">{c.claimOrDealValue}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                <span className="text-[11px] truncate max-w-[180px]">{c.stage}</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
