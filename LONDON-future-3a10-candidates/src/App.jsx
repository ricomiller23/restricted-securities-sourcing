import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import RestructuringTable from './components/RestructuringTable';
import CourtHearingCalendar from './components/CourtHearingCalendar';
import DealCalculatorModal from './components/DealCalculatorModal';
import CandidateDrawer from './components/CandidateDrawer';
import OutreachModal from './components/OutreachModal';
import AnalyticsView from './components/AnalyticsView';
import seedData from './data/london_3a10_scheme_seed.json';
import { Search, Filter, Scale, RefreshCw } from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState(seedData);
  const [activeView, setActiveView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [mechanismFilter, setMechanismFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [emailCandidate, setEmailCandidate] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sedol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.creditorFunder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.administratorOrCounsel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMechanism =
        mechanismFilter === 'all' ||
        (mechanismFilter === 'part26a' && c.mechanism.includes('Part 26A')) ||
        (mechanismFilter === 'part26' && c.mechanism.includes('Part 26 Scheme'));

      return matchesSearch && matchesMechanism;
    });
  }, [candidates, searchTerm, mechanismFilter]);

  const handleExport = () => {
    const headers = [
      'TIDM',
      'Company Name',
      'LSE Code',
      'ISIN',
      'SEDOL',
      'Market Cap GBP',
      'Share Price',
      'Mechanism',
      'Category',
      'Court Jurisdiction',
      'Hearing Date',
      'Debt Restructuring Value',
      'Creditor Funder',
      'Counsel',
      'Stage'
    ];

    const rows = filteredCandidates.map((c) => [
      c.ticker,
      `"${c.companyName}"`,
      c.lseTicker,
      c.isin,
      c.sedol,
      `"${c.marketCapGbp}"`,
      `"${c.lastPriceGbp}"`,
      `"${c.mechanism}"`,
      `"${c.restructuringCategory}"`,
      `"${c.courtJurisdiction}"`,
      c.hearingDate,
      `"${c.claimOrDealValue}"`,
      `"${c.creditorFunder}"`,
      `"${c.administratorOrCounsel}"`,
      `"${c.stage}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LONDON_Part26_3a10_Restructuring_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="min-h-screen flex flex-col bg-[#090e1a] text-slate-100">
      {/* Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onExport={handleExport}
        count={filteredCandidates.length}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Notification for Part 26/26A / 3(a)(10) Recognition */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-emerald-400">UK High Court Part 26 & 26A Framework:</strong> Judicial restructuring plan sanction hearings qualify for cross-border US SEC Section 3(a)(10) registration exemptions for dual-listed issuers.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
            Part 26 & Part 26A CA 2006
          </span>
        </div>

        {/* Search & Filters */}
        {activeView !== 'analytics' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search TIDM, company, ISIN, SEDOL, counsel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setMechanismFilter('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    mechanismFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setMechanismFilter('part26a')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    mechanismFilter === 'part26a' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Part 26A Cram Down
                </button>
                <button
                  onClick={() => setMechanismFilter('part26')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    mechanismFilter === 'part26' ? 'bg-teal-500/20 text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Part 26 Scheme
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'table' && (
          <RestructuringTable
            candidates={filteredCandidates}
            onSelect={(c) => setSelectedCandidate(c)}
            onOpenEmail={(c) => setEmailCandidate(c)}
          />
        )}

        {activeView === 'calendar' && (
          <CourtHearingCalendar
            candidates={filteredCandidates}
            onSelect={(c) => setSelectedCandidate(c)}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView candidates={candidates} />
        )}
      </main>

      {/* Candidate Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenEmail={(c) => setEmailCandidate(c)}
      />

      {/* Deal Math Calculator */}
      <DealCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Outreach Modal */}
      <OutreachModal
        candidate={emailCandidate}
        isOpen={!!emailCandidate}
        onClose={() => setEmailCandidate(null)}
      />
    </div>
  );
}
