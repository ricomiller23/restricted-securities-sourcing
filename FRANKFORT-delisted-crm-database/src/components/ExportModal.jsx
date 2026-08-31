import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Code2 } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, issuers }) {
  const [format, setFormat] = useState('csv');

  if (!isOpen) return null;

  const handleDownload = () => {
    if (format === 'csv') {
      const headers = [
        'Ticker',
        'Company Name',
        'FWB Code',
        'ISIN',
        'WKN',
        'Segment',
        'Suspension Date',
        'Clean Shell Score',
        'Shell Rating',
        'Insolvenzverwalter',
        'Legal Counsel',
        'CRM Stage'
      ];

      const rows = issuers.map((i) => [
        i.ticker,
        `"${i.companyName}"`,
        i.fwbTicker,
        i.isin,
        i.wkn,
        `"${i.segment}"`,
        i.suspensionDate,
        i.cleanShellScore,
        `"${i.shellRating}"`,
        `"${i.insolvenzverwalter}"`,
        `"${i.legalCounsel}"`,
        `"${i.crmStage}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `FRANKFORT_Delisted_AG_Shells_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(issuers, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', jsonContent);
      link.setAttribute('download', `FRANKFORT_Delisted_AG_Shells_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
            <h2 className="text-lg font-bold text-white">Export AG Shell Database</h2>
            <p className="text-xs text-slate-400">Export {issuers.length} German shell records</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div
            onClick={() => setFormat('csv')}
            className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
              format === 'csv'
                ? 'bg-rose-500/10 border-rose-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-xs font-bold">CSV Spreadsheet Format</div>
              <div className="text-[11px] text-slate-400">Compatible with Excel, Google Sheets & CRMs</div>
            </div>
          </div>

          <div
            onClick={() => setFormat('json')}
            className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
              format === 'json'
                ? 'bg-rose-500/10 border-rose-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Code2 className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-xs font-bold">JSON Data Object</div>
              <div className="text-[11px] text-slate-400">For direct API feeds & software ingestion</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-rose-600/30"
          >
            <Download className="w-4 h-4" /> Download Export
          </button>
        </div>
      </div>
    </div>
  );
}
