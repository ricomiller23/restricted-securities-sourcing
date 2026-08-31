import React from 'react';
import { X, Download, FileSpreadsheet, FileJson } from 'lucide-react';

export default function ExportModal({ issuers, onClose }) {
  
  const exportCSV = () => {
    if (!issuers || issuers.length === 0) return;
    
    const headers = [
      'ID', 'CIK', 'Company Name', 'Ticker', 'Delist Date', 'SEC Form', 
      'Exchange', 'Location', 'Primary Email', 'Alt Email', 'Phone Number', 
      'CEO Name', 'CFO Name', 'Legal Counsel Firm', 'Lead Attorney', 'Attorney Email', 
      'EDGAR Link', 'OTC Link', 'Outreach Status'
    ];

    const rows = issuers.map((i) => {
      const lc = i.legalCounsel || {};
      return [
        `"${i.id || ''}"`,
        `"${i.cik || ''}"`,
        `"${(i.companyName || '').replace(/"/g, '""')}"`,
        `"${i.ticker || ''}"`,
        `"${i.delistDate || ''}"`,
        `"${i.form || ''}"`,
        `"${i.exchange || ''}"`,
        `"${(i.location || '').replace(/"/g, '""')}"`,
        `"${i.email || ''}"`,
        `"${i.altEmail || ''}"`,
        `"${i.phone || ''}"`,
        `"${(i.ceo || '').replace(/"/g, '""')}"`,
        `"${(i.cfo || '').replace(/"/g, '""')}"`,
        `"${(lc.firmName || '').replace(/"/g, '""')}"`,
        `"${(lc.leadAttorney || '').replace(/"/g, '""')}"`,
        `"${lc.attorneyEmail || ''}"`,
        `"${i.secLandingPage || ''}"`,
        `"${i.otcProfileUrl || ''}"`,
        `"${i.status || 'new'}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DELISTED_CRM_1704_ISSUERS_LEGAL_COUNSEL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!issuers || issuers.length === 0) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(issuers, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `DELISTED_CRM_1704_ISSUERS_LEGAL_COUNSEL_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080B]/85 backdrop-blur-md p-4 animate-fadeIn">
      
      <div className="w-full max-w-md rounded-3xl border border-[#1B2030] bg-[#0A0C10] p-6 shadow-2xl space-y-6">
        
        <div className="flex items-start justify-between pb-3 border-b border-[#1B2030]">
          <div>
            <h3 className="text-base font-black text-[#E8ECF4]">Export Delisted CRM Database</h3>
            <p className="text-xs text-[#8892A6]">Export all {issuers.length} issuers with Legal Counsel firm contacts.</p>
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
                <p className="text-sm font-extrabold text-[#E8ECF4]">Export CSV (With Legal Counsel)</p>
                <p className="text-[10px] text-[#8892A6]">Formatted for Excel, Salesforce, HubSpot</p>
              </div>
            </div>
            <Download className="h-5 w-5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center justify-between rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 hover:border-[#2A3050] transition-all text-xs font-bold text-[#E8ECF4] group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileJson className="h-6 w-6 text-amber-400" />
              <div className="text-left">
                <p className="text-sm font-extrabold text-[#E8ECF4]">Export JSON (With Legal Counsel)</p>
                <p className="text-[10px] text-[#8892A6]">Structured JSON with all CIK & SEC links</p>
              </div>
            </div>
            <Download className="h-5 w-5 text-[#8892A6] group-hover:translate-y-0.5 transition-transform" />
          </button>

        </div>

      </div>

    </div>
  );
}
