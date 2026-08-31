import React from 'react';
import { X, ExternalLink, Mail, Phone, Building, Calendar, Scale, Shield, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function IssuerDrawer({ issuer, onClose, onOpenEmail }) {
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
                {issuer.asxCode}
              </span>
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                {issuer.exchange}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{issuer.companyName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{issuer.status}</div>
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
            <div className="text-[10px] text-slate-400 uppercase font-semibold">LR 17.12 Clock</div>
            <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">{issuer.daysRemaining} days</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">MC at Suspension</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{issuer.marketCapAtSuspension}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Clean Shell Score</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{issuer.cleanShellScore}/100</div>
          </div>
        </div>

        {/* Delisting & Rule Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Listing Rule & Statutory Trigger</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Rule Category:</span>
              <span className="font-semibold text-rose-400">{issuer.ruleCategory}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Reason:</span>
              <span className="text-slate-200">{issuer.delistingReason}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Suspension Date:</span>
              <span className="font-mono text-slate-300">{issuer.suspensionDate}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Automatic Delisting Date:</span>
              <span className="font-mono font-bold text-rose-400">{issuer.automaticRemovalDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">CRM Pipeline Stage:</span>
              <span className="font-semibold text-amber-400">{issuer.crmStage}</span>
            </div>
          </div>
        </div>

        {/* Legal Counsel & Liquidator Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointees & Legal Representation</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Scale className="w-4 h-4 text-rose-400" />
              <span>Legal Counsel: <strong className="text-white">{issuer.legalCounsel}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Administrator / Liquidator: <strong className="text-white">{issuer.administratorOrLiquidator}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Share Registry: <strong className="text-white">{issuer.shareRegistry}</strong></span>
            </div>
          </div>
        </div>

        {/* Summary Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shell Intelligence & Background</h3>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {issuer.details}
          </div>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Contacts</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">Company Secretary: {issuer.companySecretary}</div>
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
            Send Shell Acquisition Pitch
          </button>
        </div>
      </div>
    </div>
  );
}
