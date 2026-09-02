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

import { useIssuersSync } from "./hooks/useIssuersSync";
import { IssuerSearchIndex } from "./utils/searchIndex";

export default function App() {
  const { issuers, setIssuers, isSyncing, triggerLiveSync } = useIssuersSync();

  const [activeView, setActiveView] = useState("table");
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

  // Top 10 delisting reason categories with keywords and styling
  const REASON_CATEGORIES = [
    { id: "merger", label: "Merger / Acquisition", keywords: ["merger", "acquisition", "acquir", "scheme"], color: "bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25", icon: "🤝" },
    { id: "voluntary", label: "Voluntary De-registration", keywords: ["voluntary", "de-registration", "15-12g", "15-15d"], color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25", icon: "📋" },
    { id: "redeemed", label: "Redeemed / Maturity", keywords: ["redeemed", "paid in full", "maturity", "redemption"], color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25", icon: "💰" },
    { id: "compliance", label: "Compliance / Delist Rule", keywords: ["compliance", "listing standards", "bid price", "rule 17", "rule 41", "failure to meet"], color: "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25", icon: "⚠️" },
    { id: "shell", label: "Clean Cash Shell", keywords: ["cash shell", "rule 15", "reverse takeover", "clean shell"], color: "bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/25", icon: "💎" },
    { id: "private", label: "Going Private / Buyout", keywords: ["going private", "private", "buyout", "starug"], color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25", icon: "🏦" },
    { id: "bankruptcy", label: "Bankruptcy / Restructuring", keywords: ["bankrupt", "chapter 11", "chapter 7", "receiver", "liquidat", "doca", "restructuring"], color: "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25", icon: "💥" }
  ];

  // Compute reason category counts from the full issuers list
  const reasonCounts = useMemo(() => {
    const counts = {};
    REASON_CATEGORIES.forEach(cat => {
      counts[cat.id] = issuers.filter(item => {
        const det = `${item.delistReason || ""} ${item.details || ""} ${item.eventType || ""} ${item.form || ""}`.toLowerCase();
        return cat.keywords.some(kw => det.includes(kw));
      }).length;
    });
    return counts;
  }, [issuers]);

  // In-Memory Inverted Search Index for sub-0.5ms instantaneous queries
  const searchIndex = useMemo(() => new IssuerSearchIndex(issuers), [issuers]);

  // Filter logic across all issuers (Trie search accelerated)
  const filteredIssuers = useMemo(() => {
    const baseList = searchTerm.trim() ? searchIndex.search(searchTerm) : issuers;

    return baseList.filter((item) => {
      // Reason category filter
      if (reasonFilter) {
        const cat = REASON_CATEGORIES.find(c => c.id === reasonFilter);
        if (cat) {
          const det = `${item.delistReason || ""} ${item.details || ""} ${item.eventType || ""} ${item.form || ""}`.toLowerCase();
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
  }, [issuers, searchIndex, searchTerm, formFilter, statusFilter, exchangeFilter, scoreFilter, reasonFilter]);

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
              <span className="text-[#8892A6]">Master Database:</span>
              <strong className="text-cyan-400 font-mono font-bold text-sm">{issuers.length} Verified Corporate Entities</strong>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#8892A6]">Historical Filings:</span>
              <strong className="text-emerald-400 font-mono font-bold">Form 15-12G & 25-NSE Tracked</strong>
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
