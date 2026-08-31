import React from 'react';
import { PauseCircle, AlertOctagon, Mail, Calendar, ArrowRight, DollarSign } from 'lucide-react';

export default function TradingHaltsView({ companies, onSelect, onOpenEmail }) {
  const halted = companies.filter((c) => c.inTradingHalt);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <PauseCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live ASX Trading Halts (Listing Rule 17.1)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Entities currently in a 2-day trading halt citing capital raises, convertible notes, or debt restructuring announcements.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {halted.map((c) => (
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
                    {c.asxCode}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold animate-pulse">
                  HALT ACTIVE
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{c.companyName}</h3>
              <p className="text-xs text-slate-400 mb-3">{c.sector}</p>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Halt Reason:</span>
                  <span className="font-semibold text-rose-300">{c.haltReason}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cash Runway (Item 8.6):</span>
                  <span className="font-mono font-bold text-amber-400">{c.quartersOfFundingRemaining} Quarters</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lead Manager / Broker:</span>
                  <span className="text-slate-200">{c.leadManagerOrBroker}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmail(c);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Pitch Cornerstone Debt / Equity
              </button>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
