import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import DirectorsDealingsView from './components/DirectorsDealingsView';
import MajorHoldersView from './components/MajorHoldersView';
import DilutionRadarView from './components/DilutionRadarView';
import AnalyticsView from './components/AnalyticsView';
import SignalDrawer from './components/SignalDrawer';
import seedData from './data/frankfurt_insider_signals_seed.json';
import { Search, Filter, Target, RefreshCw } from 'lucide-react';

export default function App() {
  const [signals, setSignals] = useState(seedData);
  const [activeView, setActiveView] = useState('trades');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter logic
  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      const matchesSearch =
        s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.directorOrHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [signals, searchTerm]);

  const handleExport = () => {
    const headers = [
      'Ticker',
      'Company Name',
      'FWB Code',
      'ISIN',
      'WKN',
      'Signal Type',
      'Sub Category',
      'Filing Date',
      'Management / Holder',
      'Position / Role',
      'Transaction Type',
      'Shares Volume',
      'Price Per Share',
      'Total Value EUR',
      'Holding Delta',
      'Market Cap EUR',
      'Conviction Score',
      '30-Day ADV'
    ];

    const rows = filteredSignals.map((s) => [
      s.ticker,
      `"${s.companyName}"`,
      s.fwbTicker,
      s.isin,
      s.wkn,
      `"${s.signalType}"`,
      `"${s.subCategory}"`,
      s.filingDate,
      `"${s.directorOrHolder}"`,
      `"${s.positionRole}"`,
      `"${s.transactionType}"`,
      `"${s.sharesTraded}"`,
      `"${s.pricePerShare}"`,
      `"${s.totalValueEur}"`,
      `"${s.holdingChangePercent}"`,
      `"${s.marketCapEur}"`,
      s.score,
      `"${s.adv30d}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FRANKFORT_Insider_Signals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync', { cache: 'no-store' });
    } catch (e) {
      console.warn("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetch('/api/sync', { cache: 'no-store' }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onExport={handleExport}
        count={filteredSignals.length}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert for Article 19 MAR & WpHG */}
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900/40 border border-purple-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-purple-400">German Regulatory Signal Intelligence:</strong> Live ingestion of Article 19 MAR Directors' Dealings (*Vorstand/Aufsichtsrat*), §§ 33 ff. WpHG Major Holdings (3%+ / 5%+), and § 186 AktG dilution radar.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-semibold">
            BaFin & EQS Feed
          </span>
        </div>

        {/* Search Bar */}
        {activeView !== 'analytics' && (
          <div className="flex items-center justify-between gap-3 bg-[#0e1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticker, management, fund, ISIN, sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'trades' && (
          <DirectorsDealingsView
            signals={filteredSignals}
            onSelect={(s) => setSelectedSignal(s)}
          />
        )}

        {activeView === 'substantial' && (
          <MajorHoldersView
            signals={filteredSignals}
            onSelect={(s) => setSelectedSignal(s)}
          />
        )}

        {activeView === 'dilution' && (
          <DilutionRadarView
            signals={filteredSignals}
            onSelect={(s) => setSelectedSignal(s)}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView signals={signals} />
        )}
      </main>

      {/* Signal Drawer */}
      <SignalDrawer
        signal={selectedSignal}
        onClose={() => setSelectedSignal(null)}
      />
    </div>
  );
}
