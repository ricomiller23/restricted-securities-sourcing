import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import CashBurnScreener from './components/CashBurnScreener';
import TradingHaltsView from './components/TradingHaltsView';
import LeadManagerDirectory from './components/LeadManagerDirectory';
import AnalyticsView from './components/AnalyticsView';
import CompanyDrawer from './components/CompanyDrawer';
import EmailWorkbenchModal from './components/EmailWorkbenchModal';
import seedData from './data/australia_filings_outreach_seed.json';
import { Search, Filter, Flame, PauseCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState(seedData);
  const [activeView, setActiveView] = useState('screener');
  const [searchTerm, setSearchTerm] = useState('');
  const [formFilter, setFormFilter] = useState('all');
  const [runwayFilter, setRunwayFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [emailCompany, setEmailCompany] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter logic
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.managingDirector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.leadManagerOrBroker.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesForm = formFilter === 'all' || c.filingForm.toLowerCase().includes(formFilter.toLowerCase());

      let matchesRunway = true;
      if (runwayFilter === 'under1') matchesRunway = c.quartersOfFundingRemaining < 1.0;
      if (runwayFilter === 'under2') matchesRunway = c.quartersOfFundingRemaining < 2.0;

      return matchesSearch && matchesForm && matchesRunway;
    });
  }, [companies, searchTerm, formFilter, runwayFilter]);

  const handleExport = () => {
    const headers = [
      'Ticker',
      'Company Name',
      'Sector',
      'Filing Form',
      'Filing Date',
      'Quarters Funding Remaining',
      'Cash at Qtr End',
      'Qtrly Burn Rate',
      'In Trading Halt',
      'Halt Reason',
      'Managing Director',
      'Company Secretary',
      'Lead Manager / Broker',
      'Email',
      'Phone',
      'Outreach Status'
    ];

    const rows = filteredCompanies.map((c) => [
      c.ticker,
      `"${c.companyName}"`,
      `"${c.sector}"`,
      `"${c.filingForm}"`,
      c.filingDate,
      c.quartersOfFundingRemaining,
      `"${c.cashAtQuarterEnd}"`,
      `"${c.quarterlyOperatingBurn}"`,
      c.inTradingHalt ? 'YES' : 'NO',
      `"${c.haltReason}"`,
      `"${c.managingDirector}"`,
      `"${c.companySecretary}"`,
      `"${c.leadManagerOrBroker}"`,
      c.email,
      `"${c.phone}"`,
      `"${c.outreachStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUSTRALIA_Filings_Distress_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
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
        count={filteredCompanies.length}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert for Item 8.6 Distress */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-indigo-400">ASX Appendix 5B & 4C Distress Intelligence:</strong> Entities with Item 8.6 &lt; 2.0 quarters of cash runway are legally mandated to execute capital raisings or face quotation suspension.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-semibold">
            Item 8.6 Trigger
          </span>
        </div>

        {/* Search & Filters */}
        {activeView !== 'analytics' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticker, company, MD, lead manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Forms (5B Mining & 4C Tech)</option>
                <option value="5b">Appendix 5B (Mining)</option>
                <option value="4c">Appendix 4C (Commitment/Tech)</option>
              </select>

              <select
                value={runwayFilter}
                onChange={(e) => setRunwayFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Runways</option>
                <option value="under1">&lt; 1.0 Quarter (Emergency)</option>
                <option value="under2">&lt; 2.0 Quarters (Distressed)</option>
              </select>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'screener' && (
          <CashBurnScreener
            companies={filteredCompanies}
            onSelect={(c) => setSelectedCompany(c)}
            onOpenEmail={(c) => setEmailCompany(c)}
          />
        )}

        {activeView === 'halts' && (
          <TradingHaltsView
            companies={filteredCompanies}
            onSelect={(c) => setSelectedCompany(c)}
            onOpenEmail={(c) => setEmailCompany(c)}
          />
        )}

        {activeView === 'brokers' && (
          <LeadManagerDirectory
            companies={filteredCompanies}
            onSelect={(c) => setSelectedCompany(c)}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView companies={companies} />
        )}
      </main>

      {/* Company Drawer */}
      <CompanyDrawer
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onOpenEmail={(c) => setEmailCompany(c)}
      />

      {/* Email Workbench Modal */}
      <EmailWorkbenchModal
        company={emailCompany}
        isOpen={!!emailCompany}
        onClose={() => setEmailCompany(null)}
      />
    </div>
  );
}
