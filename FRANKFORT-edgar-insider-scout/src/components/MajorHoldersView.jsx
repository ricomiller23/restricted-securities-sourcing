import React from 'react';
import { Users, ExternalLink, ChevronRight, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function MajorHoldersView({ signals, onSelect }) {
  const substantial = signals.filter((s) => s.signalType.includes('WpHG'));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">German Major Holdings Radar (§§ 33, 34 WpHG – Stimmrechtsmitteilungen)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking institutional fund accumulation, activist cross-holdings, and statutory threshold notifications (3%, 5%, 10%, 15%, 20%, 25%, 30%, 50%, 75%).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {substantial.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s)}
            className="bg-[#0e1424]/80 border border-purple-500/30 rounded-xl p-5 shadow-lg hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-purple-400">{s.ticker}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {s.fwbTicker}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  {s.signalType}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{s.companyName}</h3>
              <div className="text-xs text-slate-400 mb-3">{s.sector}</div>

              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Notifying Holder:</span>
                  <span className="font-semibold text-slate-200">{s.directorOrHolder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Position Movement:</span>
                  <span className="font-mono font-bold text-emerald-400">{s.holdingChangePercent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Estimated Stake Value:</span>
                  <span className="font-mono font-semibold text-slate-200">{s.totalValueEur}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">30-Day ADV:</span>
                  <span className="font-mono text-slate-400">{s.adv30d}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-purple-300 transition-colors">
              <span>Notified: {s.filingDate}</span>
              <div className="flex items-center gap-1">
                <span>View Stimmrechtsmitteilung</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
