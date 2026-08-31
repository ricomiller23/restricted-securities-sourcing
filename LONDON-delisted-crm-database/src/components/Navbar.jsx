import React from 'react';
import { Database, Table, Kanban, Scale, BarChart3, Download, RefreshCw, Clock } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onExport, count, onSync, isSyncing }) {
  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 sm:px-2 py-0.5 rounded-md">
                  LONDON
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">AIM Rule 15 Shells & Rule 41</span>
              </div>
              <h1 className="text-xs sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
                Suspended & Delisted Cash Shells CRM
              </h1>
            </div>
          </div>

          {/* Desktop Navigation tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'table'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              Table ({count})
            </button>

            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'kanban'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Kanban Pipeline
            </button>

            <button
              onClick={() => setActiveView('nomads')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'nomads'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              NOMADs & Brokers
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'analytics'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
              title="Sync Live AIM Suspensions & RNS"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-400' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync AIM'}</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/30"
              title="Export CRM records"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CRM</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation sub-bar */}
        <div className="grid grid-cols-4 md:hidden gap-1 py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'table'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3 h-3" />
            <span>Table</span>
          </button>

          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'kanban'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3 h-3" />
            <span>Pipeline</span>
          </button>

          <button
            onClick={() => setActiveView('nomads')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'nomads'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>NOMADs</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'analytics'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </header>
  );
}
