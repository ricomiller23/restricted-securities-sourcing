import React from 'react';
import { TrendingUp, DollarSign, Calendar, ExternalLink, ChevronRight, CheckCircle2, Flame, UserCheck } from 'lucide-react';

export default function DirectorTradesView({ signals, onSelect }) {
  const trades = signals.filter((s) => s.signalType.includes('3Y'));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">ASX / Ticker</th>
            <th className="py-3 px-4">Director & Role</th>
            <th className="py-3 px-4">Trade Value ($AUD)</th>
            <th className="py-3 px-4">Price / Shares</th>
            <th className="py-3 px-4">Holding Change</th>
            <th className="py-3 px-4">Conviction Score</th>
            <th className="py-3 px-4">Filing Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {trades.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              {/* Ticker */}
              <td className="py-3.5 px-4 font-mono font-bold text-purple-400 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>{s.ticker}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  MC: {s.marketCapAud} | {s.lastPriceAud}
                </div>
              </td>

              {/* Director & Role */}
              <td className="py-3.5 px-4 font-medium text-slate-200">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{s.directorOrHolder}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                  {s.companyName}
                </div>
              </td>

              {/* Trade Value */}
              <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                {s.totalValueAud}
                <div className="text-[10px] text-slate-400 font-sans font-normal">
                  {s.transactionType}
                </div>
              </td>

              {/* Price / Shares */}
              <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                {s.sharesTraded} shares
                <div className="text-[10px] text-slate-500">
                  @{s.pricePerShare}
                </div>
              </td>

              {/* Holding Change */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {s.holdingChangePercent}
                </span>
              </td>

              {/* Conviction Score */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${s.score}%` }}></div>
                  </div>
                  <span className="font-mono font-bold text-purple-300 text-xs">{s.score}/100</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.subCategory}</div>
              </td>

              {/* Filing Date */}
              <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                {s.filingDate}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={s.filingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="View Appendix 3Y PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onSelect(s)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="View Signal Details"
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
