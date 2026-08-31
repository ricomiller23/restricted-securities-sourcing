import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail } from 'lucide-react';

export default function EmailWorkbenchModal({ company, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !company) return null;

  const emailSubject = `CONFIDENTIAL: Strategic Capital & Standby Facility Mandate - ${company.companyName} (${company.ticker} / SEDOL: ${company.sedol})`;

  const emailBody = `Dear ${company.executiveChair || 'Executive Chairman & Board of Directors'},

I am contacting you on behalf of our London & European microcap growth capital desk regarding ${company.companyName} (${company.ticker} / ISIN: ${company.isin}).

We have reviewed your recent RNS announcement ("${company.filingTitle}") and note the current working capital position (${company.estimatedQuartersRunway.toFixed(1)} quarters estimated runway).

Our fund specializes in underwriting direct structured equity lines, bridge notes, and accelerated bookbuilds for LSE & AIM-listed companies:
1. £500k to £15.0M GBP standby equity or secured bridge debt facilities.
2. Rapid execution with minimal market impact and custom pricing relative to 30-day VWAP.
3. Full coordination with your Nominated Adviser (${company.nomad}) and joint broker (${company.broker}).

Could we arrange a confidential 15-minute call this week with you and your CFO (${company.cfo}) to discuss an indicative term sheet?

Yours sincerely,

Capital Markets & Growth Investments Desk
London | New York | Zurich`;

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
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Generate Executive Capital Proposal</h2>
            <p className="text-xs text-slate-400">Targeting {company.companyName} ({company.ticker})</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To (Executive Chair / CFO / NOMAD):</label>
            <input
              type="text"
              readOnly
              value={`${company.email} (${company.executiveChair} / ${company.cfo})`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Subject:</label>
            <input
              type="text"
              readOnly
              value={emailSubject}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-indigo-400 font-semibold"
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
            {copied ? <Check className="w-4 h-4 text-indigo-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
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
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4" /> Dispatched
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Facility Pitch
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
