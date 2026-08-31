import React from 'react';
import { AlertTriangle, ExternalLink, Mail, ChevronRight, Flame } from 'lucide-react';

export default function AdhocAlertsView({ companies, onSelect, onOpenEmail }) {
  const critical = companies.filter((c) => c.estimatedQuartersRunway < 2.0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">German § 92 AktG & Emergency Capital Disclosures</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mandatory notifications for loss of half share capital (*Verlust der Hälfte des Grundkapitals*), bridge debt standstills, and distressed private placements.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {critical.map((c) => (
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
                    {c.fwbTicker}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                  {c.estimatedQuartersRunway} Qtrs Runway
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{c.companyName}</h3>
              <div className="text-xs text-slate-400 mb-3">{c.sector}</div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs mb-3">
                <div className="text-rose-300 font-semibold">{c.filingTitle}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{c.summary}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Cash Reserves:</div>
                  <div className="font-mono font-bold text-white">{c.cashBalanceEur}</div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Quarterly Burn:</div>
                  <div className="font-mono font-bold text-rose-400">-{c.quarterlyCashBurnEur}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Ad-hoc Filed: {c.filingDate}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmail(c);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors shadow-md shadow-rose-600/20"
              >
                <Mail className="w-3.5 h-3.5" />
                Capital Outreach
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
