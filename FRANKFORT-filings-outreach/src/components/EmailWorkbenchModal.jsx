import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail } from 'lucide-react';

export default function EmailWorkbenchModal({ company, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !company) return null;

  const emailSubject = `RE: ${company.companyName} (${company.ticker} / WKN: ${company.wkn}) - Strategic Equity Line & Growth Capital Proposal`;

  const emailBody = `Sehr geehrter Herr ${company.vorstandCeo || 'Vorstand & Aufsichtsrat'},

I am contacting you on behalf of our European microcap special situations investment desk regarding ${company.companyName} (${company.ticker} / ISIN: ${company.isin}).

We reviewed your recent Article 17 MAR disclosure regarding "${company.filingTitle}" (filed on ${company.filingDate}) and your estimated quarterly runway position (${company.estimatedQuartersRunway} quarters).

We provide non-dilutive and structured growth capital facilities specifically designed for Frankfurt Prime Standard and Scale issuers:
1. **Standby Equity Line of Credit (SEPAC)**: €2.0M to €20.0M EUR with 100% company-controlled drawdowns and zero warrant coverage.
2. **Pre-IPO / Bridge Convertible Note**: Senior secured bridge facilities with flexible amortization and conversion discounts.
3. **Co-Investment with Designated Sponsors**: Direct placement coordination alongside ${company.designatedSponsor}.

We would welcome an opportunity to schedule a 15-minute introductory call this week with you and your CFO to discuss an indicative term sheet.

Mit freundlichen Grüßen / Best regards,

European Capital Markets & Special Situations
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
            <label className="block text-xs font-semibold text-slate-400 mb-1">To (*Vorstand / Aufsichtsrat*):</label>
            <input
              type="text"
              readOnly
              value={`${company.email} (${company.vorstandCeo})`}
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
