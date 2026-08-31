import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import LegalCounselView from './components/LegalCounselView';
import AnalyticsView from './components/AnalyticsView';
import IssuerDrawer from './components/IssuerDrawer';
import EmailRunnerModal from './components/EmailRunnerModal';
import ExportModal from './components/ExportModal';
import seedData from './data/australia_delisted_issuers_seed.json';
import { Search, Filter, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'AUSTRALIA_DELISTED_CRM_V1';

export default function App() {
  const [issuers, setIssuers] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed loading local storage CRM state:", e);
    }
    return seedData;
  });

  const [activeView, setActiveView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [emailIssuer, setEmailIssuer] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issuers));
    } catch (e) {
      console.error("Failed saving CRM state to local storage:", e);
    }
  }, [issuers]);

  // Filter logic
  const filteredIssuers = useMemo(() => {
    return issuers.filter((item) => {
      const matchesSearch =
        item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.delistingReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.legalCounsel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.administratorOrLiquidator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesExchange = exchangeFilter === 'all' || item.exchange.toLowerCase().includes(exchangeFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.crmStage === statusFilter;

      return matchesSearch && matchesExchange && matchesStatus;
    });
  }, [issuers, searchTerm, exchangeFilter, statusFilter]);

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
        {/* Banner Alert for LR 17.12 2-Year Automatic Removal Clock */}
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/40 border border-rose-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-rose-400">ASX Listing Rule 17.12 Warning:</strong> Entities suspended for &gt; 2 years face automatic removal from the official list. Real-time countdown timers highlighted below.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">
            LR Chapter 17
          </span>
        </div>

        {/* Search and Filters */}
        {activeView !== 'analytics' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticker, company, legal counsel, liquidator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={exchangeFilter}
                onChange={(e) => setExchangeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
              >
                <option value="all">All Exchanges (ASX & NSX)</option>
                <option value="asx">ASX Listed Only</option>
                <option value="nsx">NSX Listed Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
              >
                <option value="all">All CRM Stages</option>
                <option value="Identified">Identified</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Advisors Contacted">Advisors Contacted</option>
                <option value="DOCA Proposed">DOCA Proposed</option>
                <option value="RTO In Progress">RTO In Progress</option>
                <option value="Closed/Re-listed">Closed / Re-listed</option>
              </select>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'table' && (
          <TableView
            issuers={filteredIssuers}
            onSelect={(item) => setSelectedIssuer(item)}
            onOpenEmail={(item) => setEmailIssuer(item)}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanView
            issuers={filteredIssuers}
            onSelect={(item) => setSelectedIssuer(item)}
            onOpenEmail={(item) => setEmailIssuer(item)}
          />
        )}

        {activeView === 'counsel' && (
          <LegalCounselView
            issuers={filteredIssuers}
            onSelect={(item) => setSelectedIssuer(item)}
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
        onOpenEmail={(item) => setEmailIssuer(item)}
      />

      {/* Email Outreach Modal */}
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
