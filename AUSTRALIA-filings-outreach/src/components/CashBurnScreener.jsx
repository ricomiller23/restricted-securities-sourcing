import React from 'react';
import { Flame, Mail, AlertTriangle, ExternalLink, PauseCircle, ChevronRight, CheckCircle2, TrendingDown } from 'lucide-react';

export default function CashBurnScreener({ companies, onSelect, onOpenEmail }) {
  const getRunwayBadge = (quarters) => {
    if (quarters < 1.0) return 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold animate-pulse';
    if (quarters < 2.0) return 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">ASX / Ticker</th>
            <th className="py-3 px-4">Company & Sector</th>
            <th className="py-3 px-4">Item 8.6 Cash Runway (Qtrs)</th>
            <th className="py-3 px-4">Cash at Qtr End</th>
            <th className="py-3 px-4">Qtrly Burn Rate</th>
            <th className="py-3 px-4">Lead Manager / Broker</th>
            <th className="py-3 px-4">Outreach Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {companies.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              {/* Ticker */}
              <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>{c.ticker}</span>
                  {c.inTradingHalt && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-sans font-semibold">
                      HALT
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  MC: {c.marketCapAud} | {c.lastPriceAud}
                </div>
              </td>

              {/* Company & Sector */}
              <td className="py-3.5 px-4 font-medium text-slate-200">
                <div className="flex items-center gap-1.5">
                  <span>{c.companyName}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {c.sector}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {c.filingForm}
                </div>
              </td>

              {/* Quarters of Funding Available */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${getRunwayBadge(c.quartersOfFundingRemaining)}`}>
                  <Flame className="w-3.5 h-3.5" />
                  {c.quartersOfFundingRemaining} Quarters
                </span>
                <div className="text-[10px] text-slate-500 mt-1">
                  {c.distressLevel}
                </div>
              </td>

              {/* Cash at Qtr End */}
              <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold whitespace-nowrap">
                {c.cashAtQuarterEnd}
                <div className="text-[10px] text-slate-500 font-sans font-normal">
                  Unused: {c.unusedFacilities}
                </div>
              </td>

              {/* Quarterly Burn */}
              <td className="py-3.5 px-4 font-mono text-rose-400 whitespace-nowrap">
                {c.quarterlyOperatingBurn}
                <div className="text-[10px] text-slate-500 font-sans">
                  Operating net flow
                </div>
              </td>

              {/* Lead Manager / Broker */}
              <td className="py-3.5 px-4 text-slate-300">
                <div className="text-[11px] font-medium text-slate-200 truncate max-w-[170px]">
                  {c.leadManagerOrBroker}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                  Counsel: {c.legalCounsel}
                </div>
              </td>

              {/* Outreach Status */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {c.outreachStatus}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onOpenEmail(c)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Send Bridge Facility / Placement Pitch"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <a
                    href={c.filingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="View ASX Filings"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onSelect(c)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="View Company File"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
