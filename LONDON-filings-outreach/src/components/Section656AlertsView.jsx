import React from 'react';
import { AlertTriangle, ChevronRight, Mail, ExternalLink, Calendar, Building, Scale } from 'lucide-react';

export default function Section656AlertsView({ companies, onSelect, onOpenEmail }) {
  const s656Companies = companies.filter((c) => c.filingType.includes('Section 656') || c.statutoryDistressTrigger.includes('Section 656'));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Section 656 Companies Act 2006 (Serious Loss of Capital Notices)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Public companies whose net assets have fallen to 50% or less of called-up share capital, requiring mandatory General Meeting within 28 days.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {s656Companies.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            className="bg-[#0e1424]/80 border border-rose-500/30 rounded-xl p-5 shadow-lg hover:border-rose-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-rose-400">{c.ticker}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {c.lseTicker}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                  S656 Mandatory EGM
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{c.companyName}</h3>
              <div className="text-xs text-slate-400 mb-3">{c.sector} | SEDOL: {c.sedol}</div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash Runway:</span>
                  <span className="font-mono font-bold text-rose-400">{c.estimatedQuartersRunway.toFixed(2)} Quarters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash on Hand:</span>
                  <span className="font-mono text-slate-200">{c.cashBalanceGbp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quarterly Burn:</span>
                  <span className="font-mono text-slate-200">{c.quarterlyCashBurnGbp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nominated Adviser:</span>
                  <span className="text-slate-200">{c.nomad}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmail(c);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Restructuring Term Sheet
              </button>

              <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-rose-300 transition-colors">
                View Notice <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
