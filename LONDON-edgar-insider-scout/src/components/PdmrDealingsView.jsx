import React from 'react';
import { TrendingUp, ExternalLink, ChevronRight, UserCheck } from 'lucide-react';

export default function PdmrDealingsView({ signals, onSelect }) {
  const pdmrSignals = signals.filter((s) => s.signalType.includes('UK MAR') || s.signalType.includes('PDMR'));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">TIDM / LSE</th>
            <th className="py-3 px-4">Company Name & SEDOL</th>
            <th className="py-3 px-4">PDMR / Transacting Director</th>
            <th className="py-3 px-4">Position / Role</th>
            <th className="py-3 px-4">Shares & Issue Price</th>
            <th className="py-3 px-4">Transaction Value</th>
            <th className="py-3 px-4">Conviction Score</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {pdmrSignals.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              {/* Ticker */}
              <td className="py-3.5 px-4 font-mono font-bold text-purple-400 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>{s.ticker}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {s.lseTicker}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  {s.lastPriceGbp} | MC: {s.marketCapGbp}
                </div>
              </td>

              {/* Company Name */}
              <td className="py-3.5 px-4 font-medium text-slate-200">
                <span>{s.companyName}</span>
                <div className="text-[10px] text-slate-400 truncate max-w-[190px] mt-0.5 font-mono">
                  SEDOL: {s.sedol} ({s.sector})
                </div>
              </td>

              {/* Director */}
              <td className="py-3.5 px-4 text-slate-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="truncate max-w-[170px]">{s.directorOrHolder}</span>
                </div>
                <div className="text-[10px] text-slate-500">{s.filingDate}</div>
              </td>

              {/* Role */}
              <td className="py-3.5 px-4 text-slate-300">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {s.positionRole}
                </span>
              </td>

              {/* Shares & Price */}
              <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                <div>{s.sharesTraded} shares</div>
                <div className="text-[10px] text-emerald-400">@{s.pricePerShare}</div>
              </td>

              {/* Total Value */}
              <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                {s.totalValueGbp}
                <div className="text-[10px] text-slate-500 font-sans font-normal">{s.holdingChangePercent}</div>
              </td>

              {/* Score */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${s.score}%` }}
                    ></div>
                  </div>
                  <span className="font-mono font-bold text-purple-300">{s.score}/100</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.adv30d}</div>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={s.filingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="View RNS PDMR Notice"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onSelect(s)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="View Full Signal"
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
