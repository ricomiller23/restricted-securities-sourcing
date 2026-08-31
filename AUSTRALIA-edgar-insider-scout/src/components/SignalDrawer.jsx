import React from 'react';
import { X, ExternalLink, Mail, Phone, Building, Target, Shield, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function SignalDrawer({ signal, onClose }) {
  if (!signal) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0e1424] border-l border-slate-700/80 shadow-2xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xl font-bold text-purple-400">{signal.ticker}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                {signal.asxCode}
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-semibold">
                Score: {signal.score}/100
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{signal.companyName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{signal.sector}</div>
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
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Signal Value</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{signal.totalValueAud}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Share Price</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{signal.lastPriceAud}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">30-Day ADV</div>
            <div className="text-xs font-mono font-bold text-purple-300 mt-0.5 truncate">{signal.adv30d}</div>
          </div>
        </div>

        {/* Signal Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regulatory Filing Details</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Signal Classification:</span>
              <span className="font-semibold text-purple-400">{signal.signalType}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Transacting Party:</span>
              <span className="text-slate-200 font-semibold">{signal.directorOrHolder}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Transaction Type:</span>
              <span className="text-slate-200">{signal.transactionType}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Shares / Volume:</span>
              <span className="font-mono text-slate-200">{signal.sharesTraded} shares @ {signal.pricePerShare}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Position Delta:</span>
              <span className="font-mono font-bold text-emerald-400">{signal.holdingChangePercent}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Signal Strength:</span>
              <span className="text-purple-300 font-semibold">{signal.signalStrength}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Filing Lodgement Date:</span>
              <span className="font-mono text-slate-300">{signal.filingDate}</span>
            </div>
          </div>
        </div>

        {/* Corporate Contacts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Contacts</h3>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">Company Secretary: {signal.companySecretary}</div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <a href={`mailto:${signal.email}`} className="text-purple-400 hover:underline">{signal.email}</a>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{signal.phone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <a
            href={signal.filingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
          >
            <ExternalLink className="w-4 h-4" />
            View ASX Announcement PDF
          </a>
        </div>
      </div>
    </div>
  );
}
