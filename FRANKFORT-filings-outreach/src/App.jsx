import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import CapitalDistressScreener from './components/CapitalDistressScreener';
import AdhocAlertsView from './components/AdhocAlertsView';
import DesignatedSponsorsView from './components/DesignatedSponsorsView';
import AnalyticsView from './components/AnalyticsView';
import CompanyDrawer from './components/CompanyDrawer';
import EmailWorkbenchModal from './components/EmailWorkbenchModal';
import seedData from './data/frankfurt_filings_outreach_seed.json';
import { Search, Filter, Flame, RefreshCw } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState(seedData);
  const [activeView, setActiveView] = useState('screener');
  const [searchTerm, setSearchTerm] = useState('');
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
        c.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.designatedSponsor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vorstandCeo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRunway =
        runwayFilter === 'all' ||
        (runwayFilter === 'critical' && c.estimatedQuartersRunway < 2.0) ||
        (runwayFilter === 'severe' && c.estimatedQuartersRunway < 1.0);

      return matchesSearch && matchesRunway;
    });
  }, [companies, searchTerm, runwayFilter]);

  const handleExport = () => {
    const headers = [
      'Ticker',
      'Company Name',
      'FWB Code',
      'ISIN',
      'WKN',
      'Sector',
      'Runway (Quarters)',
      'Cash Balance EUR',
      'Quarterly Cash Burn EUR',
      'Statutory Distress Trigger',
      'Filing Type',
      'Designated Sponsor',
      'Vorstand (CEO)',
      'Aufsichtsrat (Chair)',
      'Ad-hoc Date'
    ];

    const rows = filteredCompanies.map((c) => [
      c.ticker,
      `"${c.companyName}"`,
      c.fwbTicker,
      c.isin,
      c.wkn,
      `"${c.sector}"`,
      c.estimatedQuartersRunway,
      `"${c.cashBalanceEur}"`,
      `"${c.quarterlyCashBurnEur}"`,
      `"${c.statutoryDistressTrigger}"`,
      `"${c.filingType}"`,
      `"${c.designatedSponsor}"`,
      `"${c.vorstandCeo}"`,
      `"${c.aufsichtsratChair}"`,
      c.filingDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FRANKFORT_Capital_Distress_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        onExport={handleExport}
        count={filteredCompanies.length}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert for Article 17 MAR & § 92 AktG */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-slate-300">
              <strong className="text-indigo-400">German Capital Distress Engine:</strong> Monitoring Article 17 MAR ad-hocs, § 92 AktG loss of half share capital notices, and cash runway alerts across Frankfurt Prime Standard & Scale.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-semibold">
            EQS & DGAP Feed
          </span>
        </div>

        {/* Search & Filters */}
        {activeView !== 'analytics' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1424]/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticker, company, ISIN, WKN, sponsor, CEO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setRunwayFilter('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    runwayFilter === 'all' ? 'bg-indigo-500/20 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({companies.length})
                </button>
                <button
                  onClick={() => setRunwayFilter('critical')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    runwayFilter === 'critical' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  &lt; 2.0 Qtrs Runway
                </button>
                <button
                  onClick={() => setRunwayFilter('severe')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    runwayFilter === 'severe' ? 'bg-rose-500/20 text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  &lt; 1.0 Qtr (§ 92 AktG)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeView === 'screener' && (
          <CapitalDistressScreener
            companies={filteredCompanies}
            onSelect={(c) => setSelectedCompany(c)}
            onOpenEmail={(c) => setEmailCompany(c)}
          />
        )}

        {activeView === 'adhoc' && (
          <AdhocAlertsView
            companies={filteredCompanies}
            onSelect={(c) => setSelectedCompany(c)}
            onOpenEmail={(c) => setEmailCompany(c)}
          />
        )}

        {activeView === 'sponsors' && (
          <DesignatedSponsorsView
            companies={filteredCompanies}
            onOpenEmail={(c) => setEmailCompany(c)}
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
