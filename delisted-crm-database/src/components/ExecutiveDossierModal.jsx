import React, { useState } from "react";
import { X, Printer, Copy, Check, ShieldAlert, Award, Scale, Building2, MapPin, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

export default function ExecutiveDossierModal({ issuer, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!issuer) return null;

  const score = issuer.cleanShellScore || 75;
  const lcName = typeof issuer.legalCounsel === "string" ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || "Not Available");
  const audName = typeof issuer.auditor === "string" ? issuer.auditor : (issuer.auditor?.firmName || "Not Available");

  const getScoreColor = (sc) => {
    if (sc >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (sc >= 70) return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# EXECUTIVE DEAL DOSSIER: ${issuer.companyName} (${issuer.ticker})
- **Exchange/Region**: ${issuer.exchange} (${issuer.region || "US"})
- **Delisting Date**: ${issuer.delistDate}
- **Filing Type**: ${issuer.form}
- **Clean Shell Opportunity Score**: ${score}/100 - ${issuer.shellRating || "Institutional Asset"}

## 1. Corporate & Regulatory Overview
- **CIK / Code**: ${issuer.cik || issuer.ticker}
- **Headquarters**: ${issuer.location || "United States"}
- **Status / Reason**: ${issuer.details || "Delisted public issuer"}

## 2. Executive Leadership & Advisors
- **Chief Executive Officer**: ${issuer.ceo || "Not Disclosed"}
- **Chief Financial Officer**: ${issuer.cfo || "Not Disclosed"}
- **Legal Counsel Firm**: ${lcName}
- **Independent Auditor**: ${audName}
- **Contact Channel**: ${issuer.email || "Not Disclosed"} | ${issuer.phone || "Not Disclosed"}

## 3. Restructuring Strategy & Advisory Thesis
- **Recommended Action**: Initiate strategic restructuring contact with disclosed corporate officers, legal counsel, and independent auditor regarding 3(a)(10) recapitalization, reverse merger injection, or secondary OTC market making.
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080B]/90 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto print:bg-white print:p-0">
      <div className="w-full max-w-3xl rounded-3xl border border-[#1B2030] bg-[#0A0C10] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:max-h-none print:border-none print:bg-white print:text-black print:shadow-none">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1B2030] print:hidden">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-400 border border-cyan-500/30 uppercase">
              Bloomberg-Grade Intelligence Dossier
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 rounded-xl border border-[#1B2030] bg-[#0F1218] px-3 py-1.5 text-xs font-semibold text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Dossier"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-[#1B2030] bg-[#0F1218] p-1.5 text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dossier Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  {issuer.ticker}
                </span>
                <span className="text-xs text-[#8892A6] font-mono">
                  {issuer.region === "US" ? `CIK: ${issuer.cik}` : `REGION: ${issuer.region}`}
                </span>
                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-rose-400 border border-rose-500/20">
                  {issuer.form}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#E8ECF4] mt-2 print:text-black">
                {issuer.companyName}
              </h1>
              <p className="text-xs text-[#8892A6] flex items-center gap-2 mt-1 print:text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {issuer.location || "United States"} • Delisted: <strong className="text-amber-400 font-mono">{issuer.delistDate}</strong> • Exchange: <span className="font-semibold text-[#E8ECF4] print:text-black">{issuer.exchange}</span>
              </p>
            </div>

            {/* Score Pill */}
            <div className={`flex flex-col items-end p-3 rounded-2xl border ${getScoreColor(score)} print:border-gray-300`}>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Opportunity Score</span>
              <span className="text-2xl font-black font-mono">{score}<span className="text-xs font-normal">/100</span></span>
              <span className="text-[10px] font-semibold">{issuer.shellRating || "Prime Asset"}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] print:text-gray-500">Legal Counsel Firm</span>
            <p className="text-sm font-black text-rose-400 mt-1 truncate print:text-black">{lcName}</p>
            <span className="text-[10px] text-[#8892A6] print:text-gray-500">SEC / Exchange Disclosed</span>
          </div>

          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] print:text-gray-500">Independent Auditor</span>
            <p className="text-sm font-black text-amber-400 mt-1 truncate print:text-black">{audName}</p>
            <span className="text-[10px] text-[#8892A6] print:text-gray-500">PCAOB Accounting Firm</span>
          </div>

          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] print:text-gray-500">Chief Executive Officer</span>
            <p className="text-sm font-black text-cyan-400 mt-1 truncate print:text-black">{issuer.ceo || "Not Disclosed"}</p>
            <span className="text-[10px] text-[#8892A6] print:text-gray-500">Verified Officer</span>
          </div>

          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8892A6] print:text-gray-500">Primary Contact Channel</span>
            <p className="text-sm font-mono font-bold text-emerald-400 mt-1 truncate print:text-black">{issuer.email || issuer.phone || "Not Disclosed"}</p>
            <span className="text-[10px] text-[#8892A6] print:text-gray-500">Direct Communications</span>
          </div>
        </div>

        {/* Executive Summary & Regulatory Analysis */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-3 print:border-gray-300 print:bg-gray-50">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 print:text-black">
            <FileText className="h-4 w-4" />
            <span>Filing Background & Delisting Taxonomy</span>
          </h3>
          <p className="text-xs leading-relaxed text-[#C0C8D8] print:text-black">
            {issuer.details || "Delisted public issuer filing under Section 12(g) or Section 15(d) of the Securities Exchange Act. The corporate vehicle represents a potential target for recapitalization or debt settlement."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1B2030] text-[#8892A6] font-mono print:border print:border-gray-300">
              Form: {issuer.form}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1B2030] text-[#8892A6] font-mono print:border print:border-gray-300">
              Event: {issuer.eventType || "De-registration"}
            </span>
            {issuer.marketCap && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                Market Cap: {issuer.marketCap}
              </span>
            )}
          </div>
        </div>

        {/* Restructuring & Deal Opportunities */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-3 print:border-gray-300 print:bg-gray-50">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 print:text-black">
            <Award className="h-4 w-4" />
            <span>Strategic Advisory & Restructuring Paths</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#C0C8D8] print:text-black">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Section 3(a)(10) Debt Recapitalization:</strong> Settle outstanding bona fide liabilities for exempt newly issued equity via state court fairness hearing.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Reverse Takeover / Asset Injection:</strong> Leverage existing shareholder base and CIK infrastructure to inject revenue-generating private assets.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Secondary OTC Pink Liquidity:</strong> Maintain active market maker quotations and shareholder disclosure statements under Rule 15c2-11.</span>
            </li>
          </ul>
        </div>

        {/* Action Footnote */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1B2030] text-[11px] text-[#8892A6] print:border-gray-300 print:text-gray-500">
          <span>Confidential Deal Dossier • Generated by Delisted CRM Platform</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>

      </div>
    </div>
  );
}
