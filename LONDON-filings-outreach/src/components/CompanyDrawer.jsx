import React from 'react';
import { X, ExternalLink, Mail, Phone, Building, Scale, Shield, Calendar, Clock, DollarSign } from 'lucide-react';

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
                {company.lseTicker}
              </span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
                SEDOL: {company.sedol}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{company.companyName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{company.market} | ISIN: {company.isin}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cash Runway</div>
            <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">{company.estimatedQuartersRunway.toFixed(2)} Qtrs</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cash Balance</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{company.cashBalanceGbp}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Quarterly Burn</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{company.quarterlyCashBurnGbp}</div>
          </div>
        </div>

        {/* Filing Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statutory RNS Announcement</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Classification:</span>
              <span className="font-semibold text-indigo-400">{company.filingType}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Distress Category:</span>
              <span className="text-slate-200">{company.statutoryDistressTrigger}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Filing Date:</span>
              <span className="font-mono text-slate-200">{company.filingDate}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Nominated Adviser:</span>
              <span className="text-slate-200 font-semibold">{company.nomad}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Corporate Broker:</span>
              <span className="text-slate-200">{company.broker}</span>
            </div>
          </div>
        </div>

        {/* Announcement Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filing Summary & Financial Position</h3>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {company.summary}
          </div>
        </div>

        {/* Executive Management Contacts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Management & Board</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">Executive Chair / CEO: {company.executiveChair}</div>
            <div className="text-slate-300">Chief Financial Officer: {company.cfo}</div>
            <div className="flex items-center gap-2 text-slate-400 pt-1">
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
            Open Capital Proposal Workbench
          </button>
          <a
            href={company.filingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            LSE RNS
          </a>
        </div>
      </div>
    </div>
  );
}
