import React from 'react';
import { X, ExternalLink, Mail, Phone, Building, Flame, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

export default function CompanyDrawer({ company, onClose, onOpenEmail }) {
  if (!company) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0e1424] border-l border-slate-700/80 shadow-2xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xl font-bold text-indigo-400">{company.ticker}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                {company.fwbTicker}
              </span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
                WKN: {company.wkn}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{company.companyName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{company.sector} | ISIN: {company.isin}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Runway Card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          company.estimatedQuartersRunway < 1.0
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
        }`}>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider">Estimated Cash Runway</div>
            <div className="text-2xl font-bold font-mono mt-0.5">{company.estimatedQuartersRunway} Quarters</div>
          </div>
          <div className="text-right text-xs">
            <div>Cash: <strong className="text-white">{company.cashBalanceEur}</strong></div>
            <div className="text-rose-400">Burn: -{company.quarterlyCashBurnEur}/qtr</div>
          </div>
        </div>

        {/* Filing Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Article 17 MAR Ad-Hoc</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-rose-400">{company.filingTitle}</div>
            <p className="text-slate-300 leading-relaxed text-[11px]">{company.summary}</p>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 text-[10px]">
              <span>Filed: {company.filingDate}</span>
              <a href={company.filingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                <span>View EQS Notice</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Corporate Governance */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Management & Supervisory Board</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Vorstand (CEO):</span>
              <span className="font-semibold text-slate-200">{company.vorstandCeo}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Aufsichtsrat (Chairman):</span>
              <span className="font-semibold text-slate-200">{company.aufsichtsratChair}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Designated Sponsor:</span>
              <span className="font-semibold text-indigo-300">{company.designatedSponsor}</span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Contacts</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <a href={`mailto:${company.email}`} className="text-indigo-400 hover:underline">{company.email}</a>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{company.phone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={() => onOpenEmail(company)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Mail className="w-4 h-4" />
            Send Capital Facility Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
