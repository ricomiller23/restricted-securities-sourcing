import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail, Building, Scale } from 'lucide-react';

export default function OutreachModal({ candidate, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !candidate) return null;

  const emailSubject = `RE: ${candidate.companyName} (${candidate.ticker} / WKN: ${candidate.wkn}) - StaRUG Debt-to-Equity & Restructuring Capital Facility`;

  const emailBody = `Sehr geehrter Herr / Frau ${candidate.vorstandCeo || 'Vorstand & Aufsichtsrat'},

I am contacting you on behalf of our European special situations & restructuring investment desk regarding ${candidate.companyName} (${candidate.ticker} / ISIN: ${candidate.isin}).

We have tracked your ongoing proceedings regarding the ${candidate.restructuringCategory} and the upcoming hearing schedule at ${candidate.courtJurisdiction} (scheduled for ${candidate.hearingDate}).

We specialize in structured pre-insolvency financing, StaRUG debtor-in-possession equity underwriting, and court-confirmed Debt-to-Equity Swaps under § 225a InsO and § 60 StaRUG, including:
1. Immediate provision of bridge restructuring liquidity (€1.0M to €25.0M EUR).
2. Underwriting capital increases against contribution of creditor claims with complete cramdown protection.
3. Cross-border US SEC Section 3(a)(10) fairness hearing coordination for dual-listed ADR / US debt holders.

We would be pleased to schedule an introductory discussion with you and your legal advisors (${candidate.administratorOrCounsel}) this week to present an indicative term sheet.

Mit freundlichen Grüßen / Best regards,

Special Situations & Restructuring Investments
Frankfurt am Main | London | New York`;

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
      <div className="bg-[#0c1324] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Generate StaRUG Restructuring Proposal</h2>
            <p className="text-xs text-slate-400">Targeting {candidate.companyName} ({candidate.ticker})</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To (*Vorstand*):</label>
            <input
              type="text"
              readOnly
              value={`${candidate.email} (${candidate.vorstandCeo})`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Subject:</label>
            <input
              type="text"
              readOnly
              value={emailSubject}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-400 font-semibold"
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
            {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
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
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-600/30"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4" /> Logged & Sent
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
