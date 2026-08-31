import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import TableView from "./components/TableView";
import KanbanView from "./components/KanbanView";
import LegalCounselView from "./components/LegalCounselView";
import AnalyticsView from "./components/AnalyticsView";
import IssuerDrawer from "./components/IssuerDrawer";
import EmailRunnerModal from "./components/EmailRunnerModal";
import ExportModal from "./components/ExportModal";
import ExecutiveDossierModal from "./components/ExecutiveDossierModal";

import { ALL_GLOBAL_ISSUERS } from "./data/global_issuers_seed";

const LOCAL_STORAGE_KEY = "DELISTED_CRM_DATABASE_V11_GLOBAL";

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
    return ALL_GLOBAL_ISSUERS;
  });

  const [activeView, setActiveView] = useState("table");
  const [activeRegion, setActiveRegion] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [formFilter, setFormFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exchangeFilter, setExchangeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [emailModalIssuer, setEmailModalIssuer] = useState(null);
  const [dossierIssuer, setDossierIssuer] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Top 10 delisting reason categories with keywords and styling
  const REASON_CATEGORIES = [
    { id: "merger", label: "Merger / Acquisition", keywords: ["merger", "acquisition", "acquir", "scheme"], color: "bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25", icon: "🤝" },
    { id: "voluntary", label: "Voluntary De-registration", keywords: ["voluntary", "de-registration", "15-12g", "15-15d"], color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25", icon: "📋" },
    { id: "redeemed", label: "Redeemed / Maturity", keywords: ["redeemed", "paid in full", "maturity"], color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25", icon: "💰" },
    { id: "compliance", label: "Compliance / Delist Rule", keywords: ["compliance", "listing standards", "bid price", "rule 17", "rule 41", "failure to meet"], color: "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25", icon: "⚠️" },
    { id: "shell", label: "Clean Cash Shell", keywords: ["cash shell", "rule 15", "reverse takeover", "clean shell"], color: "bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/25", icon: "💎" },
    { id: "private", label: "Going Private / Buyout", keywords: ["going private", "private", "buyout", "starug"], color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25", icon: "🏦" },
    { id: "bankruptcy", label: "Bankruptcy / Restructuring", keywords: ["bankrupt", "chapter 11", "chapter 7", "receiver", "liquidat", "doca"], color: "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25", icon: "💥" }
  ];

  // Compute reason category counts from the full issuers list
  const reasonCounts = useMemo(() => {
    const counts = {};
    REASON_CATEGORIES.forEach(cat => {
      counts[cat.id] = issuers.filter(item => {
        const det = `${item.details || ""} ${item.eventType || ""} ${item.form || ""}`.toLowerCase();
        return cat.keywords.some(kw => det.includes(kw));
      }).length;
    });
    return counts;
  }, [issuers]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issuers));
    } catch (e) {
      console.error("Failed saving CRM state to local storage:", e);
    }
  }, [issuers]);

  const LAST_SYNC_KEY = "DELISTED_CRM_LAST_SYNC_TIMESTAMP";
  const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Live Auto-Sync with Non-Destructive Data Population & Enrichment
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
              if (c.cik) contactMapCik[String(c.cik).replace(/^0+/, "")] = c;
              if (c.ticker) contactMapTicker[String(c.ticker).toUpperCase().trim()] = c;
            });
          }
        }
      } catch (e) {
        console.error("Error fetching live contacts map:", e);
      }

      let liveFetched = [];
      let offset = 0;
      const batchSize = 500;
      let hasMore = true;

      // Dynamically paginate until all available upstream records are fetched
      while (hasMore && offset <= 5000) {
        try {
          const res = await fetch(`https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from=${offset}&dateRange=all&exchange=all`);
          if (res.ok) {
            const json = await res.json();
            const batch = json.data;
            if (Array.isArray(batch) && batch.length > 0) {
              liveFetched = [...liveFetched, ...batch];
              offset += batch.length;
              if (batch.length < batchSize) hasMore = false;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } catch (e) {
          console.error(`Error fetching signals at offset ${offset}:`, e);
          hasMore = false;
        }
      }

      if (liveFetched.length > 0) {
        setIssuers((prev) => {
          const existingMap = new Map();
          prev.forEach(item => {
            const key = String(item.cik || item.id || "").replace(/^0+/, "");
            if (key) existingMap.set(key, { ...item });
          });

          const newItems = [];

          liveFetched.forEach((item) => {
            const normCik = String(item.cik || "").replace(/^0+/, "");
            if (!normCik) return;

            const ticker = (item.ticker || "OTC").toUpperCase().trim();
            const cMatch = contactMapCik[normCik] || contactMapTicker[ticker] || {};

            const rawLegal = cMatch.legal_counsel;
            const legalCounsel = (rawLegal && rawLegal.trim() && !["none", "null", "not available"].includes(rawLegal.toLowerCase())) 
              ? rawLegal.trim() 
              : "Not Available";

            const rawEmail = cMatch.email;
            const email = (rawEmail && !rawEmail.startsWith("ir@") && !rawEmail.startsWith("contact@") && rawEmail.includes("@")) 
              ? rawEmail 
              : "Not Available";

            const rawPhone = cMatch.phone;
            const phone = (rawPhone && rawPhone.trim().length >= 7) ? rawPhone.trim() : "Not Available";

            const rawCeo = cMatch.ceo || cMatch.contact_name;
            const ceo = (rawCeo && rawCeo !== item.companyName && rawCeo.trim().length > 2) ? rawCeo.trim() : "Not Available";

            if (existingMap.has(normCik)) {
              // Non-destructive enrichment: populate newly discovered contacts without overwriting user status/notes
              const current = existingMap.get(normCik);
              if ((!current.email || current.email === "Not Available") && email !== "Not Available") {
                current.email = email;
              }
              if ((!current.phone || current.phone === "Not Available") && phone !== "Not Available") {
                current.phone = phone;
              }
              if ((!current.ceo || current.ceo === "Not Available") && ceo !== "Not Available") {
                current.ceo = ceo;
              }
              if ((!current.legalCounsel || current.legalCounsel === "Not Available") && legalCounsel !== "Not Available") {
                current.legalCounsel = legalCounsel;
              }
              if (!current.details && item.details) {
                current.details = item.details;
              }
              existingMap.set(normCik, current);
            } else {
              // Newly discovered issuer
              newItems.push({
                id: item.id || `live-${item.cik}`,
                region: item.region || "US",
                cik: item.cik,
                companyName: item.companyName || "Unknown Issuer",
                ticker: ticker,
                delistDate: item.delistDate || new Date().toISOString().slice(0, 10),
                form: item.form || "15-12G",
                exchange: item.exchange || "Delisted → OTC",
                eventType: item.eventType || "Delisting Notice",
                secLandingPage: item.secLandingPage || `https://www.sec.gov/edgar/searchedgar/companysearch?CIK=${item.cik}`,
                secFullText: item.secFullText || "",
                location: item.location || "United States",
                email: email,
                phone: phone,
                ceo: ceo,
                cfo: "Not Available",
                otcProfileUrl: ticker && ticker !== "OTC" ? `https://www.otcmarkets.com/stock/${ticker}/profile` : "https://www.otcmarkets.com",
                legalCounsel: legalCounsel,
                status: "new",
                cleanShellScore: legalCounsel !== "Not Available" ? 88 : 72,
                shellRating: legalCounsel !== "Not Available" ? "Prime Clean Shell" : "Standard Distressed Asset",
                notes: [],
                activities: [],
                details: item.details || "Delisted issuer filing."
              });
            }
          });

          // Recombine enriched existing issuers and new items
          const updatedExisting = prev.map(item => {
            const key = String(item.cik || item.id || "").replace(/^0+/, "");
            return existingMap.get(key) || item;
          });

          return [...newItems, ...updatedExisting];
        });
      }

      try {
        localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
      } catch (e) {}
    } catch (err) {
      console.error("Live EDGAR sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 24-Hour Automated Synchronization Lifecycle
  useEffect(() => {
    const checkAndSync = () => {
      try {
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        const now = Date.now();
        if (!lastSync || now - parseInt(lastSync, 10) >= SYNC_INTERVAL_MS) {
          triggerLiveSync();
        }
      } catch (e) {
        triggerLiveSync();
      }
    };

    checkAndSync();
    // Hourly heartbeat check to trigger when 24-hour window arrives
    const timer = setInterval(checkAndSync, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter logic across all issuers
  const filteredIssuers = useMemo(() => {
    return issuers.filter((item) => {
      // Region filter
      if (activeRegion !== "ALL") {
        if ((item.region || "US") !== activeRegion) return false;
      }

      // Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = (item.companyName || "").toLowerCase().includes(query);
        const matchTicker = (item.ticker || "").toLowerCase().includes(query);
        const matchCik = (item.cik || "").toLowerCase().includes(query);
        const matchLocation = (item.location || "").toLowerCase().includes(query);
        const matchCeo = (item.ceo || "").toLowerCase().includes(query);
        const matchEmail = (item.email || "").toLowerCase().includes(query);
        const lcName = typeof item.legalCounsel === "string" ? item.legalCounsel : (item.legalCounsel?.firmName || "");
        const matchLegal = lcName.toLowerCase().includes(query);
        const matchDetails = (item.details || "").toLowerCase().includes(query);

        if (!matchName && !matchTicker && !matchCik && !matchLocation && !matchCeo && !matchEmail && !matchLegal && !matchDetails) {
          return false;
        }
      }

      // Reason category filter
      if (reasonFilter) {
        const cat = REASON_CATEGORIES.find(c => c.id === reasonFilter);
        if (cat) {
          const det = `${item.details || ""} ${item.eventType || ""} ${item.form || ""}`.toLowerCase();
          const matches = cat.keywords.some(kw => det.includes(kw));
          if (!matches) return false;
        }
      }

      // Form filter
      if (formFilter !== "all") {
        if (!item.form || !item.form.includes(formFilter)) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const st = item.status || "new";
        if (st !== statusFilter) return false;
      }

      // Exchange filter
      if (exchangeFilter !== "all") {
        const ex = item.exchange || "";
        if (!ex.toLowerCase().includes(exchangeFilter.toLowerCase())) return false;
      }

      // Shell Score filter
      if (scoreFilter === "prime") {
        if ((item.cleanShellScore || 75) < 85) return false;
      } else if (scoreFilter === "high") {
        if ((item.cleanShellScore || 75) < 70) return false;
      } else if (scoreFilter === "counsel") {
        const lc = typeof item.legalCounsel === "string" ? item.legalCounsel : item.legalCounsel?.firmName;
        if (!lc || lc === "Not Available" || lc === "None") return false;
      }

      return true;
    });
  }, [issuers, activeRegion, searchTerm, formFilter, statusFilter, exchangeFilter, scoreFilter, reasonFilter]);

  const handleUpdateStatus = (id, newStatus) => {
    setIssuers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleBulkUpdateStatus = (newStatus) => {
    if (selectedIds.size === 0) return;
    setIssuers((prev) =>
      prev.map((item) => (selectedIds.has(item.id) ? { ...item, status: newStatus } : item))
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

  const handleAddActivity = (id, activityObj) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      ...activityObj
    };
    setIssuers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, activities: [newActivity, ...(item.activities || [])] } : item
      )
    );
  };

  const handleSetReminder = (id, reminderDate) => {
    setIssuers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reminders: reminderDate } : item
      )
    );
  };

  const handleResetDatabase = () => {
    if (window.confirm("Reset all CRM outreach statuses, notes, and activity back to initial global dataset?")) {
      setIssuers(ALL_GLOBAL_ISSUERS);
      setSelectedIds(new Set());
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
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        onOpenEmailRunner={() => setEmailModalIssuer(filteredIssuers[0] || issuers[0])}
        onOpenExportModal={() => setIsExportOpen(true)}
        onLiveSync={triggerLiveSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Intelligence Stats Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1B2030] bg-[#0F1218] px-6 py-3 text-xs">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[#8892A6]">Global Database:</span>
              <strong className="text-cyan-400 font-mono font-bold text-sm">{issuers.length} Active Issuers & Shells</strong>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#8892A6]">International Markets:</span>
              <strong className="text-emerald-400 font-mono font-bold">🇺🇸 US • 🇬🇧 LSE • 🇩🇪 Frankfurt • 🇦🇺 ASX</strong>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-[#8892A6]">Prime Clean Shells:</span>
              <strong className="text-violet-400 font-mono font-bold">
                {issuers.filter(i => (i.cleanShellScore || 75) >= 85).length} High-Opportunity Vehicles
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
                    ? cat.color + " ring-1 ring-white/20 shadow-lg scale-105"
                    : "bg-[#12151C] text-[#8892A6] border-[#1B2030] hover:border-[#2A3050] hover:text-[#C0C8D8] hover:bg-[#161A24]"
                }`}
              >
                <span className="text-sm leading-none">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  isActive ? "bg-white/15" : "bg-[#1B2030] text-[#5A6478]"
                }`}>{count}</span>
              </button>
            );
          })}
          {reasonFilter && (
            <button
              onClick={() => setReasonFilter(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#1B2030] text-[11px] text-[#8892A6] hover:text-red-400 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {activeView === "table" && (
          <TableView
            issuers={filteredIssuers}
            onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
            onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
            onOpenDossierModal={(issuer) => setDossierIssuer(issuer)}
            onUpdateStatus={handleUpdateStatus}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onOpenExportModal={() => setIsExportOpen(true)}
            formFilter={formFilter}
            setFormFilter={setFormFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            exchangeFilter={exchangeFilter}
            setExchangeFilter={setExchangeFilter}
            scoreFilter={scoreFilter}
            setScoreFilter={setScoreFilter}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        )}

        {activeView === "kanban" && (
          <KanbanView
            issuers={filteredIssuers}
            onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
            onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
            onOpenDossierModal={(issuer) => setDossierIssuer(issuer)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeView === "legal" && (
          <LegalCounselView
            issuers={filteredIssuers}
            onSelectIssuer={(issuer) => setSelectedIssuer(issuer)}
            onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
            onOpenDossierModal={(issuer) => setDossierIssuer(issuer)}
          />
        )}

        {activeView === "analytics" && (
          <AnalyticsView issuers={issuers} />
        )}

      </main>

      {/* Drawer */}
      {selectedIssuer && (
        <IssuerDrawer
          issuer={selectedIssuer}
          onClose={() => setSelectedIssuer(null)}
          onOpenEmailModal={(issuer) => setEmailModalIssuer(issuer)}
          onOpenDossierModal={(issuer) => setDossierIssuer(issuer)}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
          onAddActivity={handleAddActivity}
          onSetReminder={handleSetReminder}
        />
      )}

      {/* Strategic Email Pitch Modal */}
      {emailModalIssuer && (
        <EmailRunnerModal
          issuer={emailModalIssuer}
          onClose={() => setEmailModalIssuer(null)}
          onMarkContacted={(id) => handleUpdateStatus(id, "contacted")}
        />
      )}

      {/* Bloomberg-Grade Deal Sheet Dossier Modal */}
      {dossierIssuer && (
        <ExecutiveDossierModal
          issuer={dossierIssuer}
          onClose={() => setDossierIssuer(null)}
        />
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <ExportModal
          issuers={filteredIssuers}
          selectedIds={selectedIds}
          onClose={() => setIsExportOpen(false)}
        />
      )}

    </div>
  );
}
