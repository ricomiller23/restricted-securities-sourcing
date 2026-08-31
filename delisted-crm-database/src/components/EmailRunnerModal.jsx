import React, { useState } from "react";
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
  Check,
  Sliders,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

const STRATEGY_TEMPLATES = [
  {
    id: "restructuring",
    category: "Capital Restructuring",
    name: "Capital Restructuring & Advisory Inquiry",
    badge: "Restructuring",
    subject: "Strategic Inquiry: {company_name} ({ticker}) - Post-Delisting Advisory",
    body: `Dear {contact_name},

I hope this message finds you well. I am reaching out regarding {company_name} ({ticker}), following your recent regulatory filing ({form}).

We specialize in corporate restructuring, private recapitalization, and secondary liquidity solutions for non-reporting and delisted public issuers.

Given {company_name}'s current positioning, we would welcome the opportunity to discuss options for advisory support, debt restructuring, or strategic alternatives.

Are you available for a brief 10-minute introductory call later this week?

Best regards,

{sender_name}
{sender_firm}
Phone: {sender_phone}`
  },
  {
    id: "section_3a10",
    category: "Debt-for-Equity",
    name: "Section 3(a)(10) Debt Settlement Strategy",
    badge: "3(a)(10) Settlement",
    subject: "Confidential: Section 3(a)(10) Debt Settlement & Clean Balance Sheet Proposal for {ticker}",
    body: `Dear {contact_name},

Re: {company_name} ({ticker}) - Balance Sheet Liability Settle-Out

Following your recent SEC filing ({form}), our distressed capital advisory group is actively structuring Section 3(a)(10) court-approved fairness transactions for former exchange-listed companies.

Under Section 3(a)(10) of the Securities Act of 1933, public issuers can extinguish outstanding bona fide vendor debt, legal fees, or creditor claims in exchange for exempt, unrestricted shares without cash depletion.

We have structured similar transactions across OTC and delisted issuers to clean corporate balance sheets and prepare entities for reverse mergers.

Can we provide your executive team and legal counsel ({legal_counsel}) with a brief structure overview?

Sincerely,

{sender_name}
{sender_firm}
Direct: {sender_phone}`
  },
  {
    id: "clean_shell",
    category: "M&A / Shell",
    name: "Clean Shell Acquisition / Reverse Merger Offer",
    badge: "Reverse Merger",
    subject: "Strategic M&A Inquiry: Asset Injection & Merger Interest for {company_name} ({ticker})",
    body: `Dear {contact_name},

I am writing directly to your executive office regarding the corporate vehicle of {company_name} ({ticker}, CIK: {cik}).

We represent well-capitalized private growth operating companies seeking a seasoned public company vehicle with an established shareholder base and SEC reporting history for a reverse takeover / asset injection transaction.

Key elements we provide to the legacy management and shareholders:
1. Significant equity participation in the new operating entity.
2. Complete assumption or settlement of legacy corporate liabilities.
3. Full funding of necessary SEC audit and reinstatement filings.

Please let us know if you are open to an exploratory discussion under standard NDA.

Respectfully,

{sender_name}
Managing Director | {sender_firm}`
  },
  {
    id: "otc_liquidity",
    category: "Secondary Liquidity",
    name: "OTC Pink Markets Liquidity & Rule 15c2-11",
    badge: "Market Making",
    subject: "OTC Secondary Market Liquidity & Form 15c2-11 Advisory for {ticker}",
    body: `Dear {contact_name},

Following {company_name}'s transition ({exchange}), we assist corporate officers in maintaining orderly secondary market liquidity, Form 15 compliance, and shareholder transparency under FINRA Rule 6432.

We have compiled a tailored secondary market dossier for {company_name} ({location}).

Please let us know if we may forward this briefing to your executive office or legal counsel ({legal_counsel}).

Kind regards,

{sender_name}
Institutional Markets Group | {sender_firm}`
  },
  {
    id: "form15_advisory",
    category: "Compliance",
    name: "Form 15 De-Registration & SEC Compliance",
    badge: "Compliance",
    subject: "SEC Compliance & Post-Form 15 Advisory for {company_name}",
    body: `Dear {contact_name},

We noted the filing of Form {form} on EDGAR for {company_name} (CIK: {cik}).

Navigating the 90-day suspension period and ongoing Section 12(g) / Section 15(d) compliance obligations requires careful coordination with transfer agents and share registries.

Our regulatory advisory practice provides turnkey support for corporate secretary functions, shareholder registers, and eventual relisting readiness.

Would you be open to a 10-minute briefing on key post-filing risk considerations?

Best regards,

{sender_name}
{sender_firm}`
  },
  {
    id: "general_outreach",
    category: "Direct Introduction",
    name: "Confidential Executive Introduction & Briefing",
    badge: "Executive Intro",
    subject: "Direct Executive Contact: {company_name} ({ticker})",
    body: `Dear {contact_name},

Re: {company_name} ({ticker}) - Strategic Alternatives Following {form}

I am reaching out regarding your recent regulatory disclosures. We work closely with officers and legal advisors of former exchange-listed issuers to explore value-maximizing strategic alternatives.

I would welcome the opportunity to connect with you or {cfo_name} (CFO) at your earliest convenience.

Kind regards,

{sender_name}
Managing Partner | {sender_firm}
Phone: {sender_phone}`
  }
];

export default function EmailRunnerModal({ 
  issuer, 
  onClose, 
  onMarkContacted 
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("restructuring");
  const [tone, setTone] = useState("institutional");
  const [senderName, setSenderName] = useState("Senior Partner");
  const [senderFirm, setSenderFirm] = useState("Capital Advisory & Restructuring Group");
  const [senderPhone, setSenderPhone] = useState("+1 (800) 555-0199");
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const template = STRATEGY_TEMPLATES.find((t) => t.id === selectedTemplateId) || STRATEGY_TEMPLATES[0];

  const contactName = issuer?.ceo && issuer.ceo !== "Not Available" ? issuer.ceo : "Executive Officer";
  const cfoName = issuer?.cfo && issuer.cfo !== "Not Available" ? issuer.cfo : "Chief Financial Officer";
  const companyName = issuer ? issuer.companyName : "Delisted Issuer";
  const ticker = issuer ? issuer.ticker : "OTC";
  const cik = issuer ? issuer.cik : "0000000000";
  const form = issuer ? issuer.form : "15-12G";
  const exchange = issuer ? issuer.exchange : "Delisted → OTC";
  const location = issuer ? issuer.location : "United States";
  const email = issuer?.email && issuer.email !== "Not Available" ? issuer.email : "ir@company.com";
  const legalCounsel = typeof issuer?.legalCounsel === "string" ? issuer.legalCounsel : (issuer?.legalCounsel?.firmName || "Legal Advisors");

  const replaceTags = (text) => {
    let res = text
      .replace(/{company_name}/g, companyName)
      .replace(/{ticker}/g, ticker)
      .replace(/{cik}/g, cik)
      .replace(/{form}/g, form)
      .replace(/{exchange}/g, exchange)
      .replace(/{location}/g, location)
      .replace(/{contact_name}/g, contactName)
      .replace(/{cfo_name}/g, cfoName)
      .replace(/{legal_counsel}/g, legalCounsel)
      .replace(/{sender_name}/g, senderName)
      .replace(/{sender_firm}/g, senderFirm)
      .replace(/{sender_phone}/g, senderPhone);

    if (tone === "direct") {
      res = res.replace(/I hope this message finds you well\. /g, "");
    } else if (tone === "legal") {
      res = res.replace(/We specialize in/g, "Our legal and regulatory advisory group advises on");
    }
    return res;
  };

  const currentSubject = replaceTags(template.subject);
  const currentBody = replaceTags(template.body);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${currentSubject}\n\n${currentBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMailto = () => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(currentSubject)}&body=${encodeURIComponent(currentBody)}`;
    window.open(mailtoUrl, "_blank");
    setSentSuccess(true);
    if (issuer && onMarkContacted) {
      onMarkContacted(issuer.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080B]/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      
      <div className="w-full max-w-4xl rounded-3xl border border-[#1B2030] bg-[#0A0C10] p-6 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1B2030]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30">
                {ticker}
              </span>
              <span className="text-xs text-[#8892A6]">CIK: {cik}</span>
              <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
                {form}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-black text-[#E8ECF4]">
              AI Strategic Outreach & Proposal Generator
            </h2>
            <p className="text-xs text-[#8892A6]">
              Target: <strong className="text-[#E8ECF4]">{companyName}</strong> • Recipient: <span className="text-cyan-400 font-semibold">{contactName}</span> ({email})
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#1B2030] bg-[#0F1218] p-2 text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Strategy Selector Grid */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8892A6] block mb-2">
            Select Outreach Strategy / Proposal Template:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {STRATEGY_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedTemplateId === t.id
                    ? "bg-cyan-500/15 border-cyan-400/60 shadow-lg shadow-cyan-500/10"
                    : "bg-[#0F1218] border-[#1B2030] hover:border-[#2A3050] text-[#8892A6]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-cyan-400">
                    {t.badge}
                  </span>
                  {selectedTemplateId === t.id && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <span className="text-xs font-bold text-[#E8ECF4] mt-1 line-clamp-1">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-[#1B2030] bg-[#0F1218]">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] block mb-1">Tone Modifier</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
            >
              <option value="institutional">Institutional & Authoritative</option>
              <option value="direct">Direct & Concise</option>
              <option value="legal">Legal & Regulatory</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] block mb-1">Sender Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] block mb-1">Firm / Group</label>
            <input
              type="text"
              value={senderFirm}
              onChange={(e) => setSenderFirm(e.target.value)}
              className="w-full rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] block mb-1">Direct Phone</label>
            <input
              type="text"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="w-full rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Email Preview Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8892A6]">
            <span>Generated Live Pitch Preview</span>
            <span className="font-mono text-[11px] text-cyan-400">To: {email}</span>
          </div>

          <div className="rounded-2xl border border-[#1B2030] bg-[#07080B] p-4 space-y-3 font-sans">
            <div className="border-b border-[#1B2030] pb-2">
              <span className="text-xs font-bold text-[#8892A6]">Subject: </span>
              <span className="text-xs font-bold text-[#E8ECF4]">{currentSubject}</span>
            </div>
            <div className="text-xs leading-relaxed text-[#C0C8D8] whitespace-pre-wrap font-sans max-h-60 overflow-y-auto pr-2">
              {currentBody}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-[#1B2030] bg-[#0F1218] px-4 py-2.5 text-xs font-semibold text-[#8892A6] hover:text-[#E8ECF4] hover:border-[#2A3050] transition-all cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Pitch & Subject"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSendMailto}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2.5 text-xs font-black text-[#07080B] hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Launch Mail Client & Mark Contacted</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
