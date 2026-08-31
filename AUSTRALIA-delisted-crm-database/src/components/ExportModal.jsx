import React from 'react';
import { X, Download, FileSpreadsheet, FileJson, Check } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, issuers }) {
  if (!isOpen) return null;

  const downloadCsv = () => {
    const headers = [
      'Ticker',
      'Company Name',
      'Exchange',
      'Status',
      'Delisting Reason',
      'Rule Category',
      'Suspension Date',
      'Automatic Removal Date',
      'Days Remaining',
      'MC at Suspension',
      'Clean Shell Score',
      'Legal Counsel',
      'Liquidator / Admin',
      'Share Registry',
      'CRM Stage'
    ];

    const rows = issuers.map((i) => [
      i.ticker,
      `"${i.companyName}"`,
      i.exchange,
      `"${i.status}"`,
      `"${i.delistingReason}"`,
      `"${i.ruleCategory}"`,
      i.suspensionDate,
      i.automaticRemovalDate,
      i.daysRemaining,
      `"${i.marketCapAtSuspension}"`,
      i.cleanShellScore,
      `"${i.legalCounsel}"`,
      `"${i.administratorOrLiquidator}"`,
      `"${i.shareRegistry}"`,
      `"${i.crmStage}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUSTRALIA_Delisted_CRM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(issuers, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `AUSTRALIA_Delisted_CRM_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Export Australian Shells CRM</h2>
            <p className="text-xs text-slate-400">Export {issuers.length} records with full LR 17.12 metrics</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={downloadCsv}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-rose-400 transition-colors">
                  CSV Spreadsheet (.csv)
                </div>
                <div className="text-[11px] text-slate-400">Formatted for Excel, Google Sheets, & Salesforce</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={downloadJson}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-rose-400 transition-colors">
                  JSON Data Feed (.json)
                </div>
                <div className="text-[11px] text-slate-400">Raw programmatic format for custom API ingestion</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
