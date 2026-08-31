import React from 'react';
import { Calendar, Building, Scale, Clock, ArrowRight } from 'lucide-react';

export default function CourtHearingCalendar({ candidates, onSelect }) {
  const sorted = [...candidates].sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">UK High Court of Justice Restructuring Hearings (Part 26 / Part 26A)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Judicial convening and sanction hearings scheduled before the Companies Court (Rolls Building, Fetter Lane, London).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            className="bg-[#0d1424]/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-500/5 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{c.ticker}</span>
                  <span className="text-[11px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {c.lastPriceGbp}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  c.mechanism.includes('Part 26A')
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                }`}>
                  {c.mechanism.includes('Part 26A') ? 'Part 26A Cram Down' : 'Part 26 Scheme'}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                {c.companyName}
              </h3>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Hearing: <strong className="text-white">{c.hearingDate}</strong></span>
                </div>

                <div className="flex items-start gap-2 text-slate-400 text-[11px]">
                  <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{c.courtJurisdiction}</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2 mt-2">
                  <div className="text-[10px] text-slate-400 font-medium">Restructuring Facility:</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">{c.claimOrDealValue}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
              <span className="text-[11px] truncate max-w-[180px]">{c.stage}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
