import React from 'react';
import { X, ExternalLink, Mail, Phone, Building, Scale, Shield, Calendar, Clock, DollarSign } from 'lucide-react';

export default function IssuerDrawer({ issuer, onClose, onOpenEmail, onStageChange }) {
  if (!issuer) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0e1424] border-l border-slate-700/80 shadow-2xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xl font-bold text-rose-400">{issuer.ticker}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                {issuer.lseTicker}
              </span>
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-mono">
                SEDOL: {issuer.sedol}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{issuer.companyName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{issuer.segment} | ISIN: {issuer.isin}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Score & Countdown Banner */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Clean Shell Score</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{issuer.cleanShellScore}<span className="text-xs text-slate-500">/100</span></div>
            <div className="text-[10px] text-slate-400 mt-0.5">{issuer.shellRating}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Rule 41 Cancel Clock</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {issuer.daysRemainingBeforeCancel > 0 ? `${issuer.daysRemainingBeforeCancel} Days` : 'Cancelled'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Until automatic cancellation</div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Last Price</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{issuer.lastPriceGbp}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Market Cap</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5 truncate">{issuer.marketCapAtSuspension}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Suspended Date</div>
            <div className="text-xs font-mono font-bold text-rose-400 mt-0.5">{issuer.suspensionDate}</div>
          </div>
        </div>

        {/* CRM Pipeline Stage Controller */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Update Pipeline Stage
          </label>
          <select
            value={issuer.crmStage}
            onChange={(e) => onStageChange(issuer.id, e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="Identified">Identified</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Advisors Contacted">Advisors Contacted</option>
            <option value="LOI / Term Sheet">LOI / Term Sheet</option>
            <option value="RTO In Progress">RTO In Progress</option>
            <option value="Closed/Re-listed">Closed/Re-listed</option>
          </select>
        </div>

        {/* NOMAD & Corporate Broker */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nominated Adviser & Joint Broker</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Scale className="w-4 h-4 text-rose-400" />
              <span>Nominated Adviser (NOMAD): <strong className="text-white">{issuer.nomad}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Corporate Broker: <strong className="text-white">{issuer.broker}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Share Registrar: <strong className="text-white">{issuer.shareRegistry}</strong></span>
            </div>
          </div>
        </div>

        {/* Corporate Details */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AIM Rule 15 Shell Details</h3>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {issuer.details}
          </div>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Contacts</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <a href={`mailto:${issuer.email}`} className="text-rose-400 hover:underline">{issuer.email}</a>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{issuer.phone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={() => onOpenEmail(issuer)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
          >
            <Mail className="w-4 h-4" />
            Send RTO Shell Inquiry
          </button>
        </div>
      </div>
    </div>
  );
}
