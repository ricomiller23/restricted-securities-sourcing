import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import PdmrDealingsView from './components/PdmrDealingsView';
import Tr1MajorHoldersView from './components/Tr1MajorHoldersView';
import DilutionRadarView from './components/DilutionRadarView';
import AnalyticsView from './components/AnalyticsView';
import SignalDrawer from './components/SignalDrawer';
import seedData from './data/london_insider_signals_seed.json';
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
        s.sedol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [signals, searchTerm]);

  const handleExport = () => {
    const headers = [
      'TIDM',
      'Company Name',
      'LSE Code',
      'ISIN',
      'SEDOL',
      'Signal Type',
      'Sub Category',
      'Filing Date',
      'Director / Holder',
      'Position / Role',
      'Transaction Type',
      'Shares Volume',
      'Price Per Share',
      'Total Value GBP',
      'Holding Delta',
      'Market Cap GBP',
      'Conviction Score',
      '30-Day ADV'
    ];

    const rows = filteredSignals.map((s) => [
      s.ticker,
      `"${s.companyName}"`,
      s.lseTicker,
      s.isin,
      s.sedol,
      `"${s.signalType}"`,
      `"${s.subCategory}"`,
      s.filingDate,
      `"${s.directorOrHolder}"`,
      `"${s.positionRole}"`,
      `"${s.transactionType}"`,
      `"${s.sharesTraded}"`,
      `"${s.pricePerShare}"`,
      `"${s.totalValueGbp}"`,
      `"${s.holdingChangePercent}"`,
      `"${s.marketCapGbp}"`,
      s.score,
      `"${s.adv30d}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LONDON_PDMR_TR1_Signals_${new Date().toISOString().slice(0, 10)}.csv`);
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
        {/* Banner Alert for UK MAR Article 19 & DTR 5 TR-1 */}
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900/40 border border-purple-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-purple-400">UK Regulatory Signal Intelligence:</strong> Live ingestion of UK MAR Article 19 PDMR Dealings (Executive & NED Director open-market buys), FCA DTR 5 TR-1 Major Holdings (3%+, 5%, 10%+), and Section 570 CA 2006 dilution radar.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-semibold">
            FCA & RNS Feed
          </span>
        </div>

        {/* Search Bar */}
        {activeView !== 'analytics' && (
          <div className="flex items-center justify-between gap-3 bg-[#0e1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search TIDM, director, fund, ISIN, SEDOL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'trades' && (
          <PdmrDealingsView
            signals={filteredSignals}
            onSelect={(s) => setSelectedSignal(s)}
          />
        )}

        {activeView === 'substantial' && (
          <Tr1MajorHoldersView
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
