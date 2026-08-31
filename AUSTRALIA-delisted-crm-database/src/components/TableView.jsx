import React from 'react';
import { ExternalLink, Mail, Clock, ShieldAlert, Building, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TableView({ issuers, onSelect, onOpenEmail }) {
  const getDaysRemainingBadge = (days) => {
    if (days === 0) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (days < 60) return 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
    if (days < 180) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">ASX / Ticker</th>
            <th className="py-3 px-4">Company Name</th>
            <th className="py-3 px-4">LR 17.12 Countdown (2-Yr Clock)</th>
            <th className="py-3 px-4">Suspension / Delist Reason</th>
            <th className="py-3 px-4">Clean Shell Score</th>
            <th className="py-3 px-4">Legal Counsel / Liquidator</th>
            <th className="py-3 px-4">CRM Stage</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {issuers.map((item) => (
            <tr
              key={item.id}
              onClick={() => onSelect(item)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              {/* Ticker */}
              <td className="py-3.5 px-4 font-mono font-bold text-rose-400 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>{item.ticker}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {item.exchange}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  MC: {item.marketCapAtSuspension}
                </div>
              </td>

              {/* Company Name */}
              <td className="py-3.5 px-4 font-medium text-slate-200">
                <div className="flex items-center gap-1.5">
                  <span>{item.companyName}</span>
                  {item.urgentAction && (
                    <span className="flex h-2 w-2 relative" title="LR 17.12 Delisting Imminent">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                  {item.ruleCategory} - {item.status}
                </div>
              </td>

              {/* 2-Year Countdown Clock */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getDaysRemainingBadge(item.daysRemaining)}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {item.daysRemaining > 0 ? `${item.daysRemaining} days left` : 'Delisted'}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">
                  Cutoff: {item.automaticRemovalDate}
                </div>
              </td>

              {/* Delisting Reason */}
              <td className="py-3.5 px-4">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {item.delistingReason}
                </span>
              </td>

              {/* Clean Shell Score */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.cleanShellScore >= 80 ? 'bg-emerald-500' : item.cleanShellScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.cleanShellScore}%` }}
                    ></div>
                  </div>
                  <span className="font-mono font-bold text-slate-200 text-xs">{item.cleanShellScore}/100</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.shellRating}</div>
              </td>

              {/* Legal Counsel & Liquidator */}
              <td className="py-3.5 px-4 text-slate-300">
                <div className="text-[11px] font-medium text-slate-200 truncate max-w-[180px]">
                  {item.legalCounsel}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                  {item.administratorOrLiquidator}
                </div>
              </td>

              {/* CRM Stage */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {item.crmStage}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onOpenEmail(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Send Shell Acquisition / DOCA Pitch"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelect(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="View Issuer File"
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
