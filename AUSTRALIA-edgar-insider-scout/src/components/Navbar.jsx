import React from 'react';
import { Target, Users, TrendingUp, Radar, BarChart3, Download, RefreshCw } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, onExport, count, onSync, isSyncing }) {
  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-bold flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 sm:px-2 py-0.5 rounded-md">
                  AUSTRALIA
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">App 3Y & 603/604</span>
              </div>
              <h1 className="text-xs sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
                Regulatory Signal & Insider Scout
              </h1>
            </div>
          </div>

          {/* Desktop Navigation tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('trades')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'trades'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Director Buys (3Y) ({count})
            </button>

            <button
              onClick={() => setActiveView('substantial')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'substantial'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Substantial 5%+
            </button>

            <button
              onClick={() => setActiveView('dilution')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'dilution'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radar className="w-4 h-4" />
              Dilution Radar
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'analytics'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
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
              title="Sync Latest ASX Announcements"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-400' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/30"
              title="Export Feed to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Feed</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation sub-bar */}
        <div className="grid grid-cols-4 md:hidden gap-1 py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveView('trades')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'trades'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>3Y Buys</span>
          </button>

          <button
            onClick={() => setActiveView('substantial')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'substantial'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>5%+ Flow</span>
          </button>

          <button
            onClick={() => setActiveView('dilution')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'dilution'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar className="w-3 h-3" />
            <span>Dilution</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
              activeView === 'analytics'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
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
