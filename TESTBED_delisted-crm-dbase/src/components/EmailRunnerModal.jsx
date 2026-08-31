import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Building2, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

const EMAIL_TEMPLATES = [
  {
    id: 'restructuring',
    name: 'Capital Restructuring & Advisory Inquiry',
    subject: 'Strategic Inquiry: {company_name} ({ticker}) - Post-Delisting Advisory',
    body: `Dear {contact_name},

I hope this email finds you well. I am reaching out regarding {company_name} ({ticker}), following your recent SEC filing ({form}) on EDGAR.

We specialize in corporate restructuring, private recapitalization, and secondary liquidity solutions for non-reporting and delisted public issuers.

Given {company_name}'s current position, we would welcome the opportunity to discuss options for advisory support or asset restructuring.

Are you available for a brief 10-minute introductory call later this week?

Best regards,

Senior Partner
Capital Advisory Group
Phone: +1 (800) 555-0199`
  },
  {
    id: 'otc_liquidity',
    name: 'OTC Pink Markets Liquidity & Market Making',
    subject: 'OTC Trading & Secondary Liquidity Inquiry for {ticker}',
    body: `Dear {contact_name},

I am contacting you directly as Chief Executive Officer of {company_name}.

Following {company_name}'s transition to the OTC Markets (CIK: {cik}), we are actively assisting corporate officers in maintaining shareholder communications, Form 15 compliance, and secondary market liquidity.

We have compiled a tailored briefing for {company_name} ({location}).

Please let me know if we can forward this briefing to your executive office.

Sincerely,

Institutional Relations Team`
  },
  {
    id: 'general_outreach',
    name: 'Direct Executive Contact & Introductory Note',
    subject: 'Direct Executive Contact - {company_name} ({ticker})',
    body: `Dear {contact_name},

Re: {company_name} ({ticker}) - SEC Filing {form}

I am reaching out regarding your recent regulatory disclosures filed with the SEC.

We work closely with corporate officers of former exchange-listed companies to navigate post-delisting strategic alternatives.

I would appreciate the chance to connect with you or {cfo_name} (CFO) at your earliest convenience.

Kind regards,

Managing Director`
  }
];

export default function EmailRunnerModal({ 
  issuer, 
  onClose, 
  onMarkContacted 
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('restructuring');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const template = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];

  const contactName = issuer ? issuer.ceo : 'Executive Officer';
  const cfoName = issuer ? issuer.cfo : 'Chief Financial Officer';
  const companyName = issuer ? issuer.companyName : 'Delisted Issuer';
  const ticker = issuer ? issuer.ticker : 'OTC';
  const cik = issuer ? issuer.cik : '0000000000';
  const form = issuer ? issuer.form : '15-12G';
  const location = issuer ? issuer.location : 'United States';
  const email = issuer ? issuer.email : 'ir@company.com';

  const replaceTags = (text) => {
    return text
      .replace(/{company_name}/g, companyName)
      .replace(/{ticker}/g, ticker)
      .replace(/{cik}/g, cik)
      .replace(/{form}/g, form)
      .replace(/{location}/g, location)
      .replace(/{contact_name}/g, contactName)
      .replace(/{cfo_name}/g, cfoName);
  };

  const formattedSubject = replaceTags(template.subject);
  const formattedBody = replaceTags(template.body);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${formattedSubject}\n\n${formattedBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchEmail = () => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(formattedSubject)}&body=${encodeURIComponent(formattedBody)}`;
    window.location.href = mailtoUrl;
    setSentSuccess(true);
    if (issuer && onMarkContacted) {
      onMarkContacted(issuer.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080B]/85 backdrop-blur-md p-4 animate-fadeIn">
      
      <div className="w-full max-w-3xl rounded-3xl border border-[#1B2030] bg-[#0A0C10] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1B2030]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#E8ECF4] tracking-tight">
                Outreach Email Campaign Runner
              </h2>
              <p className="text-xs text-[#8892A6]">
                Target Issuer: <strong className="text-cyan-400 font-mono">{companyName} ({ticker})</strong> • CIK: {cik}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#1B2030] bg-[#0F1218] p-2 text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Recipient Details Card */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8892A6]">Target Executive</span>
              <p className="font-bold text-[#E8ECF4]">{contactName} (CEO)</p>
              <p className="font-mono text-cyan-400">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-400 border border-cyan-400/20">
              Form {form}
            </span>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-400 border border-amber-500/20">
              {location}
            </span>
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">
            Select Outreach Email Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {EMAIL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`flex flex-col text-left rounded-xl p-3 border transition-all text-xs cursor-pointer ${
                  selectedTemplateId === t.id
                    ? 'border-cyan-400 bg-cyan-400/10 text-[#E8ECF4] shadow-md shadow-cyan-400/10'
                    : 'border-[#1B2030] bg-[#0F1218] text-[#8892A6] hover:border-[#2A3050] hover:text-[#E8ECF4]'
                }`}
              >
                <span className="font-bold">{t.name}</span>
                <span className="mt-1 text-[10px] opacity-70 line-clamp-1">{t.subject}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generated Email Preview */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#07080B] p-4 space-y-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#8892A6]">Subject Line</span>
            <p className="mt-1 font-bold text-xs text-[#E8ECF4] font-mono bg-[#0F1218] p-2.5 rounded-xl border border-[#1B2030]">
              {formattedSubject}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#8892A6]">Email Message Body</span>
            <textarea
              readOnly
              value={formattedBody}
              rows={10}
              className="mt-1 w-full rounded-xl border border-[#1B2030] bg-[#0F1218] p-3 text-xs text-[#E8ECF4] font-mono focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1B2030]">
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-[#1B2030] bg-[#0F1218] px-4 py-2 text-xs font-semibold text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-3">
            {sentSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-pulse">
                <CheckCircle2 className="h-4 w-4" /> Outreach Logged & Mail App Launched!
              </span>
            )}

            <button
              onClick={handleLaunchEmail}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-6 py-2.5 text-xs font-extrabold text-[#07080B] hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-xl shadow-cyan-400/20 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Launch Mail Client ({email})</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
