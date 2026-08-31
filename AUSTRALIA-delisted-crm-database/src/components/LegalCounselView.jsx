import React from 'react';
import { Scale, Building, UserCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export default function LegalCounselView({ issuers, onSelect }) {
  // Aggregate law firms and insolvency practitioners
  const counselMap = {};
  issuers.forEach((item) => {
    const firm = item.legalCounsel || 'Unspecified';
    if (!counselMap[firm]) counselMap[firm] = [];
    counselMap[firm].push(item);
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Australian Restructuring Law Firms & Liquidators Leaderboard</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Directory of corporate law firms and voluntary administrators controlling suspended ASX shells and distressed debt workouts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(counselMap).map(([firm, firmIssuers]) => (
          <div
            key={firm}
            className="bg-[#0e1424]/80 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="p-2 rounded-lg bg-slate-800 text-rose-400">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {firmIssuers.length} Shell{firmIssuers.length > 1 ? 's' : ''}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{firm}</h3>
              <p className="text-xs text-slate-400 mb-3">Active ASX Turnaround & Chapter 17 Mandates</p>

              <div className="space-y-2">
                {firmIssuers.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-rose-400 mr-2">{item.ticker}</span>
                      <span className="text-slate-300 truncate">{item.companyName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.daysRemaining}d</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
