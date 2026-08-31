import React from 'react';
import { Mail, ChevronRight, AlertTriangle, ExternalLink, Flame, Clock } from 'lucide-react';

export default function CapitalDistressScreener({ companies, onSelect, onOpenEmail }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">TIDM / LSE</th>
            <th className="py-3 px-4">Company Name & SEDOL</th>
            <th className="py-3 px-4">Estimated Cash Runway</th>
            <th className="py-3 px-4">Cash Balance vs Burn</th>
            <th className="py-3 px-4">Statutory Distress Trigger</th>
            <th className="py-3 px-4">Retained NOMAD</th>
            <th className="py-3 px-4">RNS Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {companies.map((c) => {
            const isCritical = c.estimatedQuartersRunway < 2.0;

            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Ticker */}
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{c.ticker}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {c.lseTicker}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                    {c.lastPriceGbp} | MC: {c.marketCapGbp}
                  </div>
                </td>

                {/* Company Name */}
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span>{c.companyName}</span>
                    {isCritical && (
                      <span className="flex h-2 w-2 relative" title="Cash Runway Under 2.0 Quarters">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5 font-mono">
                    SEDOL: {c.sedol} ({c.sector})
                  </div>
                </td>

                {/* Runway */}
                <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    c.estimatedQuartersRunway < 1.0
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : c.estimatedQuartersRunway < 2.0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {c.estimatedQuartersRunway.toFixed(2)} Quarters
                  </span>
                </td>

                {/* Cash vs Burn */}
                <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                  <div>Cash: <strong className="text-white">{c.cashBalanceGbp}</strong></div>
                  <div className="text-[10px] text-slate-500">Burn: {c.quarterlyCashBurnGbp}/qtr</div>
                </td>

                {/* Trigger */}
                <td className="py-3.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    c.statutoryDistressTrigger.includes('Section 656')
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {c.statutoryDistressTrigger}
                  </span>
                </td>

                {/* NOMAD */}
                <td className="py-3.5 px-4 text-slate-300 truncate max-w-[160px]">
                  <div className="text-xs text-slate-200 font-medium truncate">{c.nomad}</div>
                  <div className="text-[10px] text-slate-500 truncate">{c.broker}</div>
                </td>

                {/* RNS Date */}
                <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                  {c.filingDate}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onOpenEmail(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Send Emergency Facility Pitch"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <a
                      href={c.filingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="View Official RNS Notice"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onSelect(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
