import React from 'react';
import { X, ExternalLink, Mail, Phone, Building, Calendar, Scale, Shield, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function CandidateDrawer({ candidate, onClose, onOpenEmail }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0e1424] border-l border-slate-700/80 shadow-2xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xl font-bold text-emerald-400">{candidate.ticker}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                {candidate.asxCode}
              </span>
              {candidate.usTicker && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-mono">
                  US: {candidate.usTicker}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">{candidate.companyName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{candidate.market}</div>
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
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Share Price</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{candidate.lastPriceAud}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Market Cap</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{candidate.marketCapAud}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Discount to VWAP</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{candidate.discountToVWAP}</div>
          </div>
        </div>

        {/* Restructuring Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restructuring Classification</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Statutory Mechanism:</span>
              <span className="font-semibold text-teal-400">{candidate.mechanism}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Category:</span>
              <span className="text-slate-200">{candidate.restructuringCategory}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Court / Jurisdiction:</span>
              <span className="text-slate-200">{candidate.courtJurisdiction}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Hearing Date:</span>
              <span className="font-mono font-bold text-white">{candidate.hearingDate}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Claim / Deal Size:</span>
              <span className="font-mono font-bold text-emerald-400">{candidate.claimOrDealValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Stage:</span>
              <span className="text-purple-300 font-medium">{candidate.stage}</span>
            </div>
          </div>
        </div>

        {/* Legal & Administrator Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advisory & Restructuring Counsel</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Counsel / Admin: <strong className="text-white">{candidate.administratorOrCounsel}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>Creditor / Funder: <strong className="text-white">{candidate.creditorFunder}</strong></span>
            </div>
          </div>
        </div>

        {/* Notes & Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis & Statutory Rationale</h3>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {candidate.notes}
          </div>
        </div>

        {/* Key Executive Contact */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Contacts</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">Company Secretary: {candidate.companySecretary}</div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <a href={`mailto:${candidate.email}`} className="text-emerald-400 hover:underline">{candidate.email}</a>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{candidate.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={() => onOpenEmail(candidate)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Mail className="w-4 h-4" />
            Send Term Sheet Pitch
          </button>
          <a
            href={candidate.docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            ASX Announcements
          </a>
        </div>
      </div>
    </div>
  );
}
