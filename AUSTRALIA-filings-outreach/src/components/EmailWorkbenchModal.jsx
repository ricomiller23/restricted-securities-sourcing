import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail, Building, Flame, Sparkles } from 'lucide-react';

export default function EmailWorkbenchModal({ company, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !company) return null;

  const emailSubject = `RE: ${company.companyName} (${company.ticker}) - Standby Convertible Facility & Placement Cornerstone Inquiry`;

  const emailBody = `Dear ${company.managingDirector || company.companySecretary || 'Board of Directors'},

I hope this email finds you well. I am contacting you on behalf of our institutional microcap investment group regarding ${company.companyName} (${company.ticker}).

We have reviewed your recent ${company.filingForm} lodged on ${company.filingDate}, and noted your current cash position (${company.cashAtQuarterEnd}) and reported funding runway of ${company.quartersOfFundingRemaining} quarters.

We specialize in structured growth capital and non-dilutive standby facilities for ASX-listed junior resources and innovative commercial entities, including:
1. $1M to $10M AUD Standby Convertible Note facilities with attractive conversion discounts.
2. Cornerstone equity participation in upcoming Listing Rule 7.1 / 7.1A placements.
3. Unsecured working capital bridge loans to accelerate ongoing drilling / commercial milestones.

We would be pleased to speak with you, your Company Secretary (${company.companySecretary}), or your Lead Manager (${company.leadManagerOrBroker}) this week to discuss custom financing structures.

Kind regards,

Institutional ECM & Special Situations Desk
Capital Markets Group
Sydney | Melbourne | Perth`;

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
            <h2 className="text-lg font-bold text-white">Send Capital Facility Pitch</h2>
            <p className="text-xs text-slate-400">Targeting {company.companyName} ({company.ticker})</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To:</label>
            <input
              type="text"
              readOnly
              value={`${company.email} (${company.managingDirector} / ${company.companySecretary})`}
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
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Body:</label>
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
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
                  <Check className="w-4 h-4" /> Logged & Sent
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send via Outreach
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
