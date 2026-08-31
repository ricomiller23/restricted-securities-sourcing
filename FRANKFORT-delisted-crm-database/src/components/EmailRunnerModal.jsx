import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail } from 'lucide-react';

export default function EmailRunnerModal({ issuer, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !issuer) return null;

  const emailSubject = `Inquiry: Acquisition of AG Shell Vehicle / Reverse Takeover Mandate - ${issuer.companyName} (${issuer.ticker} / WKN: ${issuer.wkn})`;

  const emailBody = `Sehr geehrte Damen und Herren / Sehr geehrter ${issuer.insolvenzverwalter || 'Insolvenzverwalter & Rechtsberater'},

I am contacting your office on behalf of our European corporate finance & private equity acquisition desk regarding the listed corporate shell of ${issuer.companyName} (${issuer.ticker} / ISIN: ${issuer.isin}).

We represent high-growth private operating assets seeking a public listing structure via Reverse Takeover (RTO / *Umkehrübernahme*) on the Frankfurt Stock Exchange (Open Market / Scale / General Standard).

We are interested in reviewing the acquisition of this corporate shell (*Börsenmantel*), specifically:
1. Clean capital structure and verification of zero legacy liabilities in the Commercial Register (*Handelsregister*).
2. Coordination of debt settlement / Insolvenzplan confirmation with the creditor assembly.
3. Rapid closing with immediate cash compensation for the insolvency estate.

Could we schedule a brief 15-minute introductory call this week with your team (${issuer.legalCounsel}) to discuss an indicative acquisition proposal?

Mit freundlichen Grüßen / Best regards,

Acquisitions & Capital Markets Desk
Frankfurt am Main | Zurich | London`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Contact Shell Administrator / Counsel</h2>
            <p className="text-xs text-slate-400">Targeting {issuer.companyName} ({issuer.ticker})</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To (*Insolvenzverwalter / Counsel*):</label>
            <input
              type="text"
              readOnly
              value={`${issuer.email} (${issuer.insolvenzverwalter})`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Subject:</label>
            <input
              type="text"
              readOnly
              value={emailSubject}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-rose-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Message Body:</label>
            <textarea
              rows={11}
              readOnly
              value={emailBody}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-sans leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied to Clipboard' : 'Copy Pitch'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sent}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-rose-600/30"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4" /> Sent to Pipeline
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Inquiry
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
