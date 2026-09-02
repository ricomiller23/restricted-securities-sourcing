import React from "react";
import { 
  TrendingDown, 
  Table, 
  Kanban, 
  BarChart3, 
  Mail, 
  Download, 
  Search, 
  RefreshCw,
  Scale,
  Globe2,
  FileText,
  ClipboardCheck
} from "lucide-react";

export default function Navbar({ 
  activeView, 
  setActiveView, 
  searchTerm, 
  setSearchTerm, 
  totalCount, 
  filteredCount,
  activeRegion,
  setActiveRegion,
  onOpenEmailRunner,
  onOpenExportModal,
  onLiveSync,
  isSyncing
}) {
  const REGION_OPTIONS = [
    { id: "ALL", label: "Global All", flag: "🌐" },
    { id: "US", label: "US (EDGAR)", flag: "🇺🇸" },
    { id: "UK", label: "UK (AIM)", flag: "🇬🇧" },
    { id: "DE", label: "Frankfurt", flag: "🇩🇪" },
    { id: "AU", label: "ASX Shells", flag: "🇦🇺" }
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-[#1B2030] bg-[#0A0C10]/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/20 shrink-0">
              <TrendingDown className="h-5 w-5 text-[#07080B]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#E8ECF4]">DELISTED</span>
                <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border border-cyan-400/20">CRM</span>
                
                {/* Auto Sync Button */}
                <button
                  onClick={onLiveSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  title="Click to sync live EDGAR delisted issuers now"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
                  <span className="hidden xs:inline">{isSyncing ? "Syncing..." : "Auto-Sync"}</span>
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#8892A6] line-clamp-1">
                {totalCount} Delisted Issuers & Shells • SEC EDGAR, AIM, Frankfurt & ASX Verified
              </p>
            </div>
          </div>

          {/* Region Switcher Pills (Desktop & Tablet) */}
          <div className="hidden lg:flex items-center rounded-xl border border-[#1B2030] bg-[#0F1218] p-1 gap-1">
            {REGION_OPTIONS.map((reg) => {
              const isActive = activeRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => setActiveRegion(reg.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm"
                      : "text-[#8892A6] hover:text-[#E8ECF4] hover:bg-[#1B2030]/40"
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{reg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden xl:flex flex-1 max-w-xs mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8892A6]" />
              <input
                type="text"
                placeholder="Search ticker, counsel, CEO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#1B2030] bg-[#0F1218] pl-10 pr-4 py-2 text-xs text-[#E8ECF4] placeholder-[#8892A6]/50 focus:border-cyan-400/50 focus:bg-[#07080B] focus:outline-none transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-3 top-2.5 text-[10px] text-[#8892A6] hover:text-[#E8ECF4]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop View Switcher & Action Buttons */}
          <div className="flex items-center gap-2">
            
            <div className="hidden md:flex items-center rounded-xl border border-[#1B2030] bg-[#0F1218] p-1">
              <button
                onClick={() => setActiveView("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "table" 
                    ? "bg-cyan-400/15 text-cyan-400 shadow-sm border border-cyan-400/30" 
                    : "text-[#8892A6] hover:text-[#E8ECF4] hover:bg-[#1B2030]/40"
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>Grid Table</span>
              </button>

              <button
                onClick={() => setActiveView("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "kanban" 
                    ? "bg-cyan-400/15 text-cyan-400 shadow-sm border border-cyan-400/30" 
                    : "text-[#8892A6] hover:text-[#E8ECF4] hover:bg-[#1B2030]/40"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Pipeline</span>
              </button>

              <button
                onClick={() => setActiveView("legal")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "legal" 
                    ? "bg-rose-500/15 text-rose-400 shadow-sm border border-rose-500/30" 
                    : "text-[#8892A6] hover:text-[#E8ECF4] hover:bg-[#1B2030]/40"
                }`}
              >
                <Scale className="h-3.5 w-3.5 text-rose-400" />
                <span>Counsel</span>
              </button>

              <button
                onClick={() => setActiveView("auditor")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "auditor" 
                    ? "bg-amber-500/15 text-amber-400 shadow-sm border border-amber-500/30" 
                    : "text-[#8892A6] hover:text-[#E8ECF4] hover:bg-[#1B2030]/40"
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Auditors</span>
              </button>

              <button
                onClick={() => setActiveView("analytics")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "analytics" 
                    ? "bg-cyan-400/15 text-cyan-400 shadow-sm border border-cyan-400/30" 
                    : "text-[#8892A6] hover:text-[#E8ECF4] hover:bg-[#1B2030]/40"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Analytics</span>
              </button>
            </div>

            {/* Email Outreach Runner Button */}
            <button
              onClick={onOpenEmailRunner}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer min-h-[38px]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Pitch</span>
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 rounded-xl border border-[#1B2030] bg-[#0F1218] px-3 py-2 text-xs font-semibold text-[#8892A6] hover:text-[#E8ECF4] hover:border-[#2A3050] transition-all cursor-pointer min-h-[38px]"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

          </div>

        </div>

        {/* Mobile / Tablet Region & Search Bar Substrip */}
        <div className="px-4 py-2 border-t border-[#1B2030]/50 lg:hidden flex flex-col gap-2">
          {/* Region selector mobile */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {REGION_OPTIONS.map((reg) => {
              const isActive = activeRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => setActiveRegion(reg.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                      : "text-[#8892A6] bg-[#0F1218] border border-[#1B2030]"
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{reg.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8892A6]" />
            <input
              type="text"
              placeholder="Search ticker, company, counsel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#1B2030] bg-[#0F1218] pl-9 pr-3 py-1.5 text-xs text-[#E8ECF4] placeholder-[#8892A6]/50 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0A0C10]/95 backdrop-blur-xl border-t border-[#1B2030] pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-14 items-center justify-around px-2">
          
          <button
            onClick={() => setActiveView("table")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeView === "table" ? "text-cyan-400" : "text-[#8892A6]"
            }`}
          >
            <Table className="h-4 w-4" />
            <span>Grid</span>
          </button>

          <button
            onClick={() => setActiveView("kanban")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeView === "kanban" ? "text-cyan-400" : "text-[#8892A6]"
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>Pipeline</span>
          </button>

          <button
            onClick={() => setActiveView("legal")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeView === "legal" ? "text-rose-400" : "text-[#8892A6]"
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Counsel</span>
          </button>

          <button
            onClick={() => setActiveView("auditor")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeView === "auditor" ? "text-amber-400" : "text-[#8892A6]"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Auditors</span>
          </button>

          <button
            onClick={() => setActiveView("analytics")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeView === "analytics" ? "text-cyan-400" : "text-[#8892A6]"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>

        </div>
      </nav>
    </>
  );
}
