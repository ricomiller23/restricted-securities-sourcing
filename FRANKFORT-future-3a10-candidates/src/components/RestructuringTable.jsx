import React from 'react';
import { ExternalLink, Mail, Calendar, Building, ChevronRight, Scale, CheckCircle2, DollarSign } from 'lucide-react';

export default function RestructuringTable({ candidates, onSelect, onOpenEmail }) {
  const getMechanismBadge = (mechanism) => {
    if (mechanism.includes('StaRUG')) {
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
    if (mechanism.includes('Insolvenzplan')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0d1527]/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">FWB / Ticker</th>
            <th className="py-3 px-4">Company Name & ISIN</th>
            <th className="py-3 px-4">Statutory Mechanism</th>
            <th className="py-3 px-4">Restrukturierungsgericht</th>
            <th className="py-3 px-4">Plan Hearing Date</th>
            <th className="py-3 px-4">Restructuring Volume</th>
            <th className="py-3 px-4">Procedure Stage</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {candidates.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              {/* Ticker */}
              <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
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
                  {c.urgentActionRequired && (
                    <span className="flex h-2 w-2 relative" title="Hearing Imminent">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                  ISIN: {c.isin} (WKN: {c.wkn})
                </div>
              </td>

              {/* Statutory Mechanism */}
              <td className="py-3.5 px-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getMechanismBadge(c.mechanism)}`}>
                  {c.mechanism}
                </span>
              </td>

              {/* Court */}
              <td className="py-3.5 px-4 text-slate-300">
                <div className="flex items-center gap-1 text-[11px]">
                  <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{c.courtJurisdiction}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Funder: {c.creditorFunder}
                </div>
              </td>

              {/* Hearing Date */}
              <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{c.hearingDate}</span>
                </div>
              </td>

              {/* Deal Value */}
              <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300 whitespace-nowrap">
                {c.claimOrDealValue}
                <div className="text-[10px] text-slate-400 font-sans font-normal">
                  {c.sharesIssued} shares ({c.discountToVWAP} disc)
                </div>
              </td>

              {/* Stage */}
              <td className="py-3.5 px-4">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {c.stage}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onOpenEmail(c)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Send Restructuring Term Sheet Pitch"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <a
                    href={c.docLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="View Börse Frankfurt Overview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onSelect(c)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="View Candidate File"
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
