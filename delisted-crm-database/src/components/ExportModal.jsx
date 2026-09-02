import React from "react";
import { X, Download, FileSpreadsheet, FileJson, FileText, CheckCircle2 } from "lucide-react";

export default function ExportModal({ issuers, selectedIds, onClose }) {
  const exportItems = selectedIds && selectedIds.size > 0 
    ? issuers.filter(i => selectedIds.has(i.id))
    : issuers;

  const count = exportItems.length;

  const exportCSV = () => {
    if (!exportItems || exportItems.length === 0) return;
    
    const headers = [
      "ID", "Region", "Ticker", "Company Name", "Delist Date", "SEC / Form Type", 
      "Exchange", "Location", "Clean Shell Score", "Shell Rating", "Primary Email", "Phone Number", 
      "CEO Name", "CFO Name", "Legal Counsel Firm", "Auditor / Accounting Firm", "Market Cap", 
      "EDGAR Link", "OTC Link", "Outreach Status"
    ];

    const rows = exportItems.map((i) => {
      const lc = typeof i.legalCounsel === "string" ? i.legalCounsel : (i.legalCounsel?.firmName || "Not Available");
      const aud = typeof i.auditor === "string" ? i.auditor : (i.auditor?.firmName || "Not Available");
      return [
        `"${i.id || ""}"`,
        `"${i.region || "US"}"`,
        `"${i.ticker || ""}"`,
        `"${(i.companyName || "").replace(/"/g, '""')}"`,
        `"${i.delistDate || ""}"`,
        `"${i.form || ""}"`,
        `"${i.exchange || ""}"`,
        `"${(i.location || "").replace(/"/g, '""')}"`,
        `"${i.cleanShellScore || 75}"`,
        `"${i.shellRating || "Prime Asset"}"`,
        `"${i.email || ""}"`,
        `"${i.phone || ""}"`,
        `"${(i.ceo || "").replace(/"/g, '""')}"`,
        `"${(i.cfo || "").replace(/"/g, '""')}"`,
        `"${(lc || "").replace(/"/g, '""')}"`,
        `"${(aud || "").replace(/"/g, '""')}"`,
        `"${i.marketCap || ""}"`,
        `"${i.secLandingPage || ""}"`,
        `"${i.otcProfileUrl || ""}"`,
        `"${i.status || "new"}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GLOBAL_DELISTED_CRM_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!exportItems || exportItems.length === 0) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportItems, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `GLOBAL_DELISTED_CRM_EXPORT_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMarkdownDossier = () => {
    if (!exportItems || exportItems.length === 0) return;

    let md = `# GLOBAL DELISTED CORPORATE CRM INTELLIGENCE REPORT\nGenerated: ${new Date().toLocaleString()}\nTotal Assets: ${count}\n\n---\n\n`;

    exportItems.forEach((item, idx) => {
      const lc = typeof item.legalCounsel === "string" ? item.legalCounsel : (item.legalCounsel?.firmName || "Not Available");
      md += `### ${idx + 1}. ${item.companyName} (${item.ticker})
- **Region / Exchange**: ${item.region || "US"} • ${item.exchange}
- **Delist Date / Filing**: ${item.delistDate} • ${item.form}
- **Clean Shell Opportunity Score**: ${item.cleanShellScore || 75}/100 (${item.shellRating || "Prime Clean Shell"})
- **Legal Counsel**: ${lc}
- **CEO / CFO**: ${item.ceo || "Not Disclosed"} / ${item.cfo || "Not Disclosed"}
- **Direct Contacts**: ${item.email || "N/A"} | ${item.phone || "N/A"}
- **Summary**: ${item.details || "Delisted public issuer filing."}

---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `GLOBAL_DELISTED_DEAL_DOSSIERS_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080B]/85 backdrop-blur-md p-4 animate-fadeIn">
      
      <div className="w-full max-w-lg rounded-3xl border border-[#1B2030] bg-[#0A0C10] p-6 shadow-2xl space-y-6">
        
        <div className="flex items-start justify-between pb-3 border-b border-[#1B2030]">
          <div>
            <h3 className="text-base font-black text-[#E8ECF4]">Export Delisted CRM Database</h3>
            <p className="text-xs text-[#8892A6]">
              {selectedIds && selectedIds.size > 0 
                ? `Exporting ${count} selected issuers` 
                : `Exporting all ${count} active filtered issuers`}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8892A6] hover:text-[#E8ECF4]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          
          <button
            onClick={exportCSV}
            className="flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 hover:bg-cyan-500/20 transition-all text-xs font-bold text-cyan-400 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-cyan-400" />
              <div className="text-left">
                <p className="text-sm font-extrabold text-[#E8ECF4]">Export CSV (Full Intelligence Data)</p>
                <p className="text-[10px] text-[#8892A6]">Formatted for Excel, Salesforce, Bloomberg CRM</p>
              </div>
            </div>
            <Download className="h-5 w-5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={exportMarkdownDossier}
            className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 hover:bg-emerald-500/20 transition-all text-xs font-bold text-emerald-400 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-emerald-400" />
              <div className="text-left">
                <p className="text-sm font-extrabold text-[#E8ECF4]">Export Markdown Deal Dossiers</p>
                <p className="text-[10px] text-[#8892A6]">Executive deal sheets and restructuring briefs</p>
              </div>
            </div>
            <Download className="h-5 w-5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center justify-between rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 hover:border-[#2A3050] transition-all text-xs font-bold text-[#E8ECF4] group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileJson className="h-6 w-6 text-amber-400" />
              <div className="text-left">
                <p className="text-sm font-extrabold text-[#E8ECF4]">Export Structured JSON</p>
                <p className="text-[10px] text-[#8892A6]">Includes all CIK, score, notes and activity history</p>
              </div>
            </div>
            <Download className="h-5 w-5 text-[#8892A6] group-hover:translate-y-0.5 transition-transform" />
          </button>

        </div>

      </div>

    </div>
  );
}
