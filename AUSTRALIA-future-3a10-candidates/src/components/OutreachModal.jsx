import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail, Building, Scale, Sparkles } from 'lucide-react';

export default function OutreachModal({ candidate, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !candidate) return null;

  const emailSubject = `RE: ${candidate.companyName} (${candidate.ticker}) - Restructuring Capital & s411/DOCA Facility Proposal`;

  const emailBody = `Dear ${candidate.companySecretary || 'Board & Executive Management'},

I am reaching out from our special situations & restructuring investment group regarding ${candidate.companyName} (${candidate.ticker}). 

We have reviewed your recent announcements regarding the ${candidate.restructuringCategory} and the upcoming court/hearing timeline (${candidate.courtJurisdiction}, scheduled for ${candidate.hearingDate}).

We specialize in structured bridge facilities, Part 5.3A DOCA deed funding, and Section 411 Scheme equity underwriting, specifically tailored for ASX low-priced resources and commercial entities.

Our capabilities include:
1. Direct provision of immediate bridge liquidity ($500k to $10M AUD).
2. Court-approved debt compromise and equity settlement structures (with full s708 / s708A cleansing).
3. Cross-border US 3(a)(10) registration exemption coordination for dual-listed or US security holders.

We would welcome an introductory discussion with your Managing Director and restructuring counsel (${candidate.administratorOrCounsel}) this week to present an indicative term sheet.

Best regards,

Special Situations & Restructuring Investments
Capital Markets Syndicate
Sydney | Melbourne | New York`;

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
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Generate Restructuring Outreach Pitch</h2>
            <p className="text-xs text-slate-400">Targeting {candidate.companyName} ({candidate.ticker})</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To:</label>
            <input
              type="text"
              readOnly
              value={`${candidate.email} (${candidate.companySecretary})`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Subject:</label>
            <input
              type="text"
              readOnly
              value={emailSubject}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-semibold"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-600/30"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4" /> Logged & Sent
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send via Workbench
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
