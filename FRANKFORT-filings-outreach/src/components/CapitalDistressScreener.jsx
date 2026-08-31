import React from 'react';
import { Flame, Mail, ExternalLink, ChevronRight, AlertCircle, TrendingDown, DollarSign } from 'lucide-react';

export default function CapitalDistressScreener({ companies, onSelect, onOpenEmail }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">FWB / Ticker</th>
            <th className="py-3 px-4">Company Name & Sector</th>
            <th className="py-3 px-4">Cash Runway (*Quarters*)</th>
            <th className="py-3 px-4">Quarterly Burn & Cash</th>
            <th className="py-3 px-4">Statutory Distress Alert</th>
            <th className="py-3 px-4">Designated Sponsor</th>
            <th className="py-3 px-4">Ad-Hoc Date</th>
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
                      {c.fwbTicker}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                    {c.lastPriceEur} | MC: {c.marketCapEur}
                  </div>
                </td>

                {/* Company Name */}
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span>{c.companyName}</span>
                    {isCritical && (
                      <span className="flex h-2 w-2 relative" title="Cash Runway Critical">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                    {c.sector} | ISIN: {c.isin}
                  </div>
                </td>

                {/* Runway */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      c.estimatedQuartersRunway < 1.0
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : c.estimatedQuartersRunway < 2.0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {c.estimatedQuartersRunway} Qtrs
                  </span>
                </td>

                {/* Cash vs Burn */}
                <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                  <div>Cash: <strong className="text-white">{c.cashBalanceEur}</strong></div>
                  <div className="text-[10px] text-rose-400">Burn: -{c.quarterlyCashBurnEur}/qtr</div>
                </td>

                {/* Distress Trigger */}
                <td className="py-3.5 px-4">
                  <div className="text-slate-200 font-semibold truncate max-w-[200px]">
                    {c.statutoryDistressTrigger}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                    {c.filingType}
                  </div>
                </td>

                {/* Sponsor */}
                <td className="py-3.5 px-4 text-slate-300 truncate max-w-[160px]">
                  {c.designatedSponsor}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                  {c.filingDate}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onOpenEmail(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Compose Capital Facility Proposal"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <a
                      href={c.filingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="View EQS Ad-Hoc"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onSelect(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="View Company Details"
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
