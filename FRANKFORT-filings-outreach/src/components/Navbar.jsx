import React from 'react';
import { Flame, Table, AlertTriangle, Users, BarChart3, Download, RefreshCw } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onExport, count, onSync, isSyncing }) {
  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 sm:px-2 py-0.5 rounded-md">
                  FRANKFORT
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">Art. 17 MAR & § 92 AktG</span>
              </div>
              <h1 className="text-xs sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
                Capital Distress & Outreach Workbench
              </h1>
            </div>
          </div>

          {/* Desktop Navigation tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('screener')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'screener'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              Capital Distress ({count})
            </button>

            <button
              onClick={() => setActiveView('adhoc')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'adhoc'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              § 92 AktG Alerts
            </button>

            <button
              onClick={() => setActiveView('sponsors')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'sponsors'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Designated Sponsors
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
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
              title="Sync Latest EQS/DGAP Ad-Hoc Wire"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Ad-Hoc'}</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
              title="Export Distress Leads"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Leads</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation sub-bar */}
        <div className="grid grid-cols-4 md:hidden gap-1 py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveView('screener')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'screener'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3 h-3" />
            <span>Distress</span>
          </button>

          <button
            onClick={() => setActiveView('adhoc')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'adhoc'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>§ 92 Alerts</span>
          </button>

          <button
            onClick={() => setActiveView('sponsors')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'sponsors'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Sponsors</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'analytics'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
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
