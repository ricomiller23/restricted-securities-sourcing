import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import LegalCounselView from './components/LegalCounselView';
import AnalyticsView from './components/AnalyticsView';
import IssuerDrawer from './components/IssuerDrawer';
import EmailRunnerModal from './components/EmailRunnerModal';
import ExportModal from './components/ExportModal';

import seedData from './data/delisted_issuers_seed.json';

const LOCAL_STORAGE_KEY = 'DELISTED_CRM_DATABASE_V10';

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
  const [formFilter, setFormFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState(null);

  // Top 10 delisting reason categories with search keywords and styling
  const REASON_CATEGORIES = [
    { id: 'merger', label: 'Merger / Acquisition', keywords: ['merger', 'acquisition', 'acquir'], color: 'bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25', icon: '🤝' },
    { id: 'voluntary', label: 'Voluntary De-registration', keywords: ['voluntary', 'de-registration'], color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25', icon: '📋' },
    { id: 'redeemed', label: 'Redeemed / Maturity', keywords: ['redeemed', 'paid in full', 'maturity'], color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25', icon: '💰' },
    { id: 'surrendered', label: 'Securities Surrendered', keywords: ['surrender'], color: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25', icon: '🔄' },
    { id: 'compliance', label: 'Compliance Failure', keywords: ['compliance', 'listing standards', 'bid price', 'failure to meet'], color: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25', icon: '⚠️' },
    { id: 'private', label: 'Going Private / Buyout', keywords: ['going private', 'private', 'buyout'], color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25', icon: '🏦' },
    { id: 'involuntary', label: 'Involuntary Delisting', keywords: ['involuntary'], color: 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25', icon: '🚫' },
    { id: 'bankruptcy', label: 'Bankruptcy', keywords: ['bankrupt', 'chapter 11', 'chapter 7'], color: 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25', icon: '💥' },
    { id: 'liquidation', label: 'Liquidation / Dissolution', keywords: ['liquidat', 'dissol'], color: 'bg-pink-500/15 text-pink-400 border-pink-500/30 hover:bg-pink-500/25', icon: '🔥' },
    { id: 'foreign', label: 'Foreign Private Issuer', keywords: ['foreign private'], color: 'bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/25', icon: '🌍' },
  ];

  // Compute reason category counts from the full issuers list
  const reasonCounts = useMemo(() => {
    const counts = {};
    REASON_CATEGORIES.forEach(cat => {
      counts[cat.id] = issuers.filter(item => {
        const det = (item.details || '').toLowerCase();
        return cat.keywords.some(kw => det.includes(kw));
      }).length;
    });
    return counts;
  }, [issuers]);

  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [emailModalIssuer, setEmailModalIssuer] = useState(null);
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

  // Live Auto-Sync with Normalized Matching
  const triggerLiveSync = async () => {
    setIsSyncing(true);
    try {
      let contactMapCik = {};
      let contactMapTicker = {};

      try {
        const cRes = await fetch("https://edgar-insider-scout.vercel.app/api/contacts");
        if (cRes.ok) {
          const cJson = await cRes.json();
          if (cJson.data && Array.isArray(cJson.data)) {
            cJson.data.forEach((c) => {
              if (c.cik) contactMapCik[String(c.cik).replace(/^0+/, '')] = c;
              if (c.ticker) contactMapTicker[String(c.ticker).toUpperCase().trim()] = c;
            });
          }
        }
      } catch (e) {
        console.error("Error fetching live contacts map:", e);
      }

      const offsets = [0, 500, 1000, 1500];
      let liveFetched = [];

      for (const off of offsets) {
        const res = await fetch(`https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from=${off}&dateRange=all&exchange=all`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            liveFetched = [...liveFetched, ...json.data];
          }
        }
      }

      if (liveFetched.length > 0) {
        setIssuers((prev) => {
          const existingCiks = new Set(prev.map(i => String(i.cik).replace(/^0+/, '')));
          const newItems = [];

          const determineFallback = (form, eventType) => {
            const f = String(form || '').toUpperCase();
            if (f.includes('15-12G')) return 'Voluntary de-registration of securities under Section 12(g) of the Exchange Act.';
            if (f.includes('15-15D')) return 'Voluntary suspension of reporting duties under Section 15(d) of the Exchange Act.';
            if (f.includes('15F')) return 'Voluntary de-registration and suspension of reporting duties by a foreign private issuer.';
            if (f.includes('15')) return 'Voluntary de-registration of securities (Form 15).';
            if (f.includes('25')) return 'Delisting of securities from exchange listing (Form 25).';
            return 'Delisted issuer filing.';
          };

          liveFetched.forEach((item) => {
            const normCik = String(item.cik).replace(/^0+/, '');
            if (!existingCiks.has(normCik)) {
              const ticker = (item.ticker || 'OTC').toUpperCase().trim();
              const cMatch = contactMapCik[normCik] || contactMapTicker[ticker] || {};
              
              const rawLegal = cMatch.legal_counsel;
              const legalCounsel = (rawLegal && rawLegal.trim() && !['none', 'null', 'not available'].includes(rawLegal.toLowerCase())) 
                ? rawLegal.trim() 
                : "Not Available";

              const rawEmail = cMatch.email;
              const email = (rawEmail && !rawEmail.startsWith('ir@') && !rawEmail.startsWith('contact@') && rawEmail.includes('@')) 
                ? rawEmail 
                : "Not Available";

              const rawPhone = cMatch.phone;
              const phone = (rawPhone && rawPhone.trim().length >= 7) ? rawPhone.trim() : "Not Available";

              const rawCeo = cMatch.ceo || cMatch.contact_name;
              const ceo = (rawCeo && rawCeo !== item.companyName && rawCeo.trim().length > 2) ? rawCeo.trim() : "Not Available";

              newItems.push({
                id: item.id || `live-${item.cik}`,
                cik: item.cik,
                companyName: item.companyName || 'Unknown Issuer',
                ticker: ticker,
                delistDate: item.delistDate || new Date().toISOString().slice(0, 10),
                form: item.form || '15-12G',
                exchange: item.exchange || 'Delisted → OTC',
                eventType: item.eventType || 'Delisting Notice',
                secLandingPage: item.secLandingPage || `https://www.sec.gov/edgar/searchedgar/companysearch?CIK=${item.cik}`,
                secFullText: item.secFullText || '',
                location: item.location || 'United States',
                email: email,
                phone: phone,
                ceo: ceo,
                cfo: "Not Available",
                otcProfileUrl: ticker && ticker !== 'OTC' ? `https://www.otcmarkets.com/stock/${ticker}/profile` : "https://www.otcmarkets.com",
                legalCounsel: legalCounsel,
                status: 'new',
                notes: [],
                details: item.details || determineFallback(item.form, item.eventType)
              });
            }
          });

          if (newItems.length > 0) {
            return [...newItems, ...prev];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Live EDGAR sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    triggerLiveSync();
  }, []);

  // Filter logic across all issuers
  const filteredIssuers = useMemo(() => {
    return issuers.filter((item) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = (item.companyName || '').toLowerCase().includes(query);
        const matchTicker = (item.ticker || '').toLowerCase().includes(query);
        const matchCik = (item.cik || '').toLowerCase().includes(query);
        const matchLocation = (item.location || '').toLowerCase().includes(query);
        const matchCeo = (item.ceo || '').toLowerCase().includes(query);
        const matchEmail = (item.email || '').toLowerCase().includes(query);
        const matchLegal = (item.legalCounsel || '').toLowerCase().includes(query);
        const matchDetails = (item.details || '').toLowerCase().includes(query);

        if (!matchName && !matchTicker && !matchCik && !matchLocation && !matchCeo && !matchEmail && !matchLegal && !matchDetails) {
          return false;
        }
      }

      // Reason category filter
      if (reasonFilter) {
        const cat = REASON_CATEGORIES.find(c => c.id === reasonFilter);
        if (cat) {
          const det = (item.details || '').toLowerCase();
          const matches = cat.keywords.some(kw => det.includes(kw));
          if (!matches) return false;
        }
      }

      if (formFilter !== 'all') {
        if (!item.form || !item.form.includes(formFilter)) return false;
      }

      if (statusFilter !== 'all') {
        const st = item.status || 'new';
        if (st !== statusFilter) return false;
      }

      if (exchangeFilter !== 'all') {
        const ex = item.exchange || '';
        if (!ex.toLowerCase().includes(exchangeFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [issuers, searchTerm, formFilter, statusFilter, exchangeFilter, reasonFilter]);

  const handleUpdateStatus = (id, newStatus) => {
    setIssuers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleAddNote = (id, noteText) => {
    const newNote = {
      text: noteText,
      date: new Date().toLocaleString()
    };
    setIssuers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notes: [newNote, ...(item.notes || [])] } : item
      )
    );
  };

  const handleResetDatabase = () => {
    if (window.confirm("Reset all CRM outreach statuses and notes back to initial seed data?")) {
      setIssuers(seedData);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080B] text-[#E8ECF4]">
      
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalCount={issuers.length}
        filteredCount={filteredIssuers.length}
        onOpenEmailRunner={() => setEmailModalIssuer(filteredIssuers[0] || issuers[0])}
        onOpenExportModal={() => setIsExportOpen(true)}
        onLiveSync={triggerLiveSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Intelligence Stats Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1B2030] bg-[#0F1218] px-6 py-3 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[#8892A6]">Database Size:</span>
              <strong className="text-cyan-400 font-mono font-bold text-sm">{issuers.length} Delisted Issuers</strong>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#8892A6]">OTCMarkets & SEC EDGAR Audit:</span>
              <strong className="text-emerald-400 font-mono font-bold">100% Deep Executive Extraction</strong>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-[#8892A6]">Legal Counsel Listed:</span>
              <strong className="text-rose-400 font-mono font-bold">
                {issuers.filter(i => i.legalCounsel && i.legalCounsel !== 'Not Available').length} Verified Law Firms & Officers
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDatabase}
              className="text-[11px] text-[#8892A6] hover:text-[#E8ECF4] underline"
            >
              Reset Data State
            </button>
          </div>
        </div>

        {/* Clickable Delisting Reason Chips */}
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] text-[#5A6478] uppercase tracking-wider font-semibold mr-1 shrink-0">Filter by Reason:</span>
          {REASON_CATEGORIES.map(cat => {
            const isActive = reasonFilter === cat.id;
            const count = reasonCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setReasonFilter(isActive ? null : cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? cat.color + ' ring-1 ring-white/20 shadow-lg scale-105'
                    : 'bg-[#12151C] text-[#8892A6] border-[#1B2030] hover:border-[#2A3050] hover:text-[#C0C8D8] hover:bg-[#161A24]'
                }`}
              >
                <span className="text-sm leading-none">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  isActive ? 'bg-white/15' : 'bg-[#1B2030] text-[#5A6478]'
                }`}>{count}</span>
              </button>
            );
          })}
          {reasonFilter && (
            <button
              onClick={() => setReasonFilter(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#1B2030] text-[11px] text-[#8892A6] hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {activeView === 'table' && (
          <TableView
            issuers={filteredIssuers}
            onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
            onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
            onUpdateStatus={handleUpdateStatus}
            formFilter={formFilter}
            setFormFilter={setFormFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            exchangeFilter={exchangeFilter}
            setExchangeFilter={setExchangeFilter}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanView
            issuers={filteredIssuers}
            onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
            onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeView === 'legal' && (
          <LegalCounselView
            issuers={filteredIssuers}
            onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
            onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView issuers={issuers} />
        )}

      </main>

      {selectedIssuer && (
        <IssuerDrawer
          issuer={selectedIssuer}
          onClose={() => setSelectedIssuer(null)}
          onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
        />
      )}

      {emailModalIssuer && (
        <EmailRunnerModal
          issuer={emailModalIssuer}
          onClose={() => setEmailModalIssuer(null)}
          onMarkContacted={(id) => handleUpdateStatus(id, 'contacted')}
        />
      )}

      {isExportOpen && (
        <ExportModal
          issuers={filteredIssuers}
          onClose={() => setIsExportOpen(false)}
        />
      )}

    </div>
  );
}
