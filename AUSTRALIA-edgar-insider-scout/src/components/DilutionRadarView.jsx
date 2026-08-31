import React from 'react';
import { Radar, ExternalLink, AlertCircle, ChevronRight, DollarSign, Calendar } from 'lucide-react';

export default function DilutionRadarView({ signals, onSelect }) {
  const dilutions = signals.filter((s) => s.signalType.includes('2A') || s.signalType.includes('Cleansing'));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Radar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Australian Secondary Dilution & Cleansing Radar (App 2A / s708A)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking placement tranches and convertible note conversions entering quotation without lockup restrictions under Section 708A.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dilutions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s)}
            className="bg-[#0e1424]/80 border border-pink-500/30 rounded-xl p-5 shadow-lg hover:border-pink-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-pink-400">{s.ticker}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {s.asxCode}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold">
                  {s.signalType}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{s.companyName}</h3>
              <div className="text-xs text-slate-400 mb-3">{s.sector}</div>

              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Dilution Event:</span>
                  <span className="font-semibold text-slate-200">{s.subCategory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Shares Quoted:</span>
                  <span className="font-mono font-bold text-pink-300">{s.sharesTraded} shares</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Issue Price:</span>
                  <span className="font-mono text-emerald-400">{s.pricePerShare}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Capital Raised / Cleansed:</span>
                  <span className="font-mono font-bold text-white">{s.totalValueAud}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-pink-300 transition-colors">
              <span>Quotation Date: {s.filingDate}</span>
              <div className="flex items-center gap-1">
                <span>View Appendix 2A</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
