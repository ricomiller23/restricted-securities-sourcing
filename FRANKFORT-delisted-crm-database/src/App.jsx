import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import LegalCounselView from './components/LegalCounselView';
import AnalyticsView from './components/AnalyticsView';
import IssuerDrawer from './components/IssuerDrawer';
import EmailRunnerModal from './components/EmailRunnerModal';
import ExportModal from './components/ExportModal';
import seedData from './data/frankfurt_delisted_issuers_seed.json';
import { Search, Filter, Database, RefreshCw } from 'lucide-react';

export default function App() {
  const [issuers, setIssuers] = useState(seedData);
  const [activeView, setActiveView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [emailIssuer, setEmailIssuer] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter logic
  const filteredIssuers = useMemo(() => {
    return issuers.filter((i) => {
      const matchesSearch =
        i.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.wkn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.insolvenzverwalter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.legalCounsel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.segment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = stageFilter === 'all' || i.crmStage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [issuers, searchTerm, stageFilter]);

  const handleStageChange = (id, newStage) => {
    setIssuers((prev) =>
      prev.map((i) => (i.id === id ? { ...i, crmStage: newStage } : i))
    );
    if (selectedIssuer && selectedIssuer.id === id) {
      setSelectedIssuer((prev) => ({ ...prev, crmStage: newStage }));
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onExport={() => setIsExportOpen(true)}
        count={filteredIssuers.length}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert for BörsG § 39 & Freiverkehr Downgrades */}
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/40 border border-rose-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-rose-400">German AG Shells (*Börsenmäntel*):</strong> Tracking FWB suspensions, Freiverkehr segment downgrades, and clean commercial register (*Handelsregister*) entities for reverse mergers.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">
            BörsG § 39 & HÜSt
          </span>
        </div>

        {/* Search & Filters */}
        {activeView !== 'analytics' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticker, company, ISIN, WKN, administrator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="all">All CRM Stages ({issuers.length})</option>
                <option value="Identified">Identified</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Advisors Contacted">Advisors Contacted</option>
                <option value="LOI / Term Sheet">LOI / Term Sheet</option>
                <option value="RTO In Progress">RTO In Progress</option>
                <option value="Closed/Re-listed">Closed/Re-listed</option>
              </select>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'table' && (
          <TableView
            issuers={filteredIssuers}
            onSelect={(i) => setSelectedIssuer(i)}
            onOpenEmail={(i) => setEmailIssuer(i)}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanView
            issuers={filteredIssuers}
            onSelect={(i) => setSelectedIssuer(i)}
            onOpenEmail={(i) => setEmailIssuer(i)}
            onStageChange={handleStageChange}
          />
        )}

        {activeView === 'counsel' && (
          <LegalCounselView
            issuers={filteredIssuers}
            onOpenEmail={(i) => setEmailIssuer(i)}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView issuers={issuers} />
        )}
      </main>

      {/* Issuer Drawer */}
      <IssuerDrawer
        issuer={selectedIssuer}
        onClose={() => setSelectedIssuer(null)}
        onOpenEmail={(i) => setEmailIssuer(i)}
        onStageChange={handleStageChange}
      />

      {/* Email Modal */}
      <EmailRunnerModal
        issuer={emailIssuer}
        isOpen={!!emailIssuer}
        onClose={() => setEmailIssuer(null)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        issuers={filteredIssuers}
      />
    </div>
  );
}
