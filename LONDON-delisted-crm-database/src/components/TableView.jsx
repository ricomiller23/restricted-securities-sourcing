import React from 'react';
import { Mail, ChevronRight, Scale, ShieldCheck, Clock, FileText, AlertCircle } from 'lucide-react';

export default function TableView({ issuers, onSelect, onOpenEmail }) {
  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Identified':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Reviewing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Advisors Contacted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LOI / Term Sheet':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'RTO In Progress':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Closed/Re-listed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0e1424]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">TIDM / LSE</th>
            <th className="py-3 px-4">Company Name & SEDOL</th>
            <th className="py-3 px-4">AIM Rule 41 Cancellation Clock</th>
            <th className="py-3 px-4">Clean Shell Score</th>
            <th className="py-3 px-4">Retained NOMAD & Broker</th>
            <th className="py-3 px-4">Suspension Date</th>
            <th className="py-3 px-4">CRM Stage</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {issuers.map((i) => {
            const isUrgent = i.daysRemainingBeforeCancel > 0 && i.daysRemainingBeforeCancel <= 60;

            return (
              <tr
                key={i.id}
                onClick={() => onSelect(i)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Ticker */}
                <td className="py-3.5 px-4 font-mono font-bold text-rose-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{i.ticker}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {i.lseTicker}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                    {i.lastPriceGbp} | MC: {i.marketCapAtSuspension}
                  </div>
                </td>

                {/* Company Name */}
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span>{i.companyName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5 font-mono">
                    SEDOL: {i.sedol} (ISIN: {i.isin})
                  </div>
                </td>

                {/* Cancellation Clock */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {i.daysRemainingBeforeCancel > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${
                        isUrgent
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {i.daysRemainingBeforeCancel} Days Left
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 font-mono text-xs">Cancelled / RTO</span>
                  )}
                  <div className="text-[10px] text-slate-500 mt-0.5">{i.segment}</div>
                </td>

                {/* Clean Shell Score */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          i.cleanShellScore >= 80
                            ? 'bg-emerald-500'
                            : i.cleanShellScore >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${i.cleanShellScore}%` }}
                      ></div>
                    </div>
                    <span className="font-mono font-bold text-slate-200 text-xs">{i.cleanShellScore}/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{i.shellRating}</div>
                </td>

                {/* NOMAD */}
                <td className="py-3.5 px-4 text-slate-300">
                  <div className="text-xs text-slate-200 font-medium truncate max-w-[170px]">{i.nomad}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{i.broker}</div>
                </td>

                {/* Suspension Date */}
                <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                  {i.suspensionDate}
                </td>

                {/* CRM Stage */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStageBadge(i.crmStage)}`}>
                    {i.crmStage}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onOpenEmail(i)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Send Shell Acquisition Pitch"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelect(i)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="View Shell Record"
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
