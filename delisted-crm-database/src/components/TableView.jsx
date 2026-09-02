import React, { useState, useMemo } from "react";
import { 
  FileText, 
  ExternalLink, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Scale,
  Award,
  CheckSquare,
  Square,
  MinusSquare,
  Sparkles,
  Download,
  Trash2
} from "lucide-react";

export default function TableView({ 
  issuers, 
  onSelectIssuer, 
  onOpenEmailModal,
  onOpenDossierModal,
  onUpdateStatus,
  onBulkUpdateStatus,
  onOpenExportModal,
  formFilter,
  setFormFilter,
  statusFilter,
  setStatusFilter,
  exchangeFilter,
  setExchangeFilter,
  scoreFilter,
  setScoreFilter,
  selectedIds,
  setSelectedIds
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState("delistDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Multi-column sorting
  const sortedIssuers = useMemo(() => {
    return [...issuers].sort((a, b) => {
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";

      if (sortField === "legalCounsel") {
        valA = typeof a.legalCounsel === "string" ? a.legalCounsel : (a.legalCounsel?.firmName || "Not Available");
        valB = typeof b.legalCounsel === "string" ? b.legalCounsel : (b.legalCounsel?.firmName || "Not Available");
      }
      
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [issuers, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedIssuers.length / pageSize) || 1;
  const paginatedIssuers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedIssuers.slice(start, start + pageSize);
  }, [sortedIssuers, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getCountryFlag = (region) => {
    switch (region) {
      case "UK": return "🇬🇧";
      case "DE": return "🇩🇪";
      case "AU": return "🇦🇺";
      default: return "🇺🇸";
    }
  };

  const getScoreBadge = (score) => {
    const sc = score || 75;
    if (sc >= 85) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold font-mono text-emerald-400 border border-emerald-500/20" title="Prime Clean Shell">
          <Award className="h-3 w-3" /> {sc}
        </span>
      );
    }
    if (sc >= 70) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold font-mono text-cyan-400 border border-cyan-500/20" title="High Quality Shell">
          {sc}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold font-mono text-amber-400 border border-amber-500/20" title="Standard Asset">
        {sc}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Contacted
          </span>
        );
      case "queued":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Queued
          </span>
        );
      case "discussion":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
            <Send className="h-3 w-3" /> In Discussion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1B2030] px-2 py-0.5 text-[11px] font-medium text-[#8892A6]">
            New Issuer
          </span>
        );
    }
  };

  // Selection helpers
  const isAllPageSelected = paginatedIssuers.length > 0 && paginatedIssuers.every(i => selectedIds.has(i.id));
  const isSomePageSelected = paginatedIssuers.some(i => selectedIds.has(i.id));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedIds);
    if (isAllPageSelected) {
      paginatedIssuers.forEach(i => next.delete(i.id));
    } else {
      paginatedIssuers.forEach(i => next.add(i.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectItem = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(issuers.map(i => i.id));
    setSelectedIds(next);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn pb-20 md:pb-6 relative">
      
      {/* Table Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4">
        
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#8892A6]" />
            <span className="text-xs font-bold text-[#8892A6]">Filter:</span>
          </div>

          {/* Form Filter */}
          <select
            value={formFilter}
            onChange={(e) => {
              setFormFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All Filing Types</option>
            <option value="15-12G">Form 15-12G (Section 12g)</option>
            <option value="15-15D">Form 15-15D (Section 15d)</option>
            <option value="15F">Form 15F (Foreign Issuer)</option>
            <option value="25">Form 25 (Exchange Delist)</option>
            <option value="8-K">Form 8-K / Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All CRM Stages</option>
            <option value="new">New Issuers</option>
            <option value="queued">Outreach Queued</option>
            <option value="contacted">Contacted</option>
            <option value="discussion">In Discussion</option>
          </select>

          {/* Score Filter */}
          {setScoreFilter && (
            <select
              value={scoreFilter || "all"}
              onChange={(e) => {
                setScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none"
            >
              <option value="all">All Shell Scores</option>
              <option value="prime">Prime Shells (Score 85+)</option>
              <option value="high">High Quality (Score 70+)</option>
              <option value="counsel">Law Firm Disclosed Only</option>
            </select>
          )}

        </div>

        {/* Page Size & Pagination Summary */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8892A6]">
            Showing <strong className="text-[#E8ECF4] font-mono">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-[#E8ECF4] font-mono">{Math.min(currentPage * pageSize, sortedIssuers.length)}</strong> of <strong className="text-cyan-400 font-mono">{sortedIssuers.length}</strong>
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#1B2030] bg-[#07080B] px-2 py-1 text-xs text-[#8892A6] focus:outline-none"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

      </div>

      {/* Floating Bulk Action Bar (When items are selected) */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-cyan-500/40 bg-[#0A0C10]/95 backdrop-blur-md shadow-2xl shadow-cyan-500/10 animate-slideDown">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-400/20 text-cyan-300 font-mono font-black text-xs border border-cyan-400/40">
              <CheckSquare className="h-4 w-4" />
              {selectedIds.size} Selected
            </span>
            <button
              onClick={selectAllFiltered}
              className="text-xs text-[#8892A6] hover:text-[#E8ECF4] underline cursor-pointer"
            >
              Select All {issuers.length}
            </button>
            <button
              onClick={clearSelection}
              className="text-xs text-[#8892A6] hover:text-red-400 underline cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#8892A6] hidden sm:inline">Bulk Move:</span>
            <button
              onClick={() => onBulkUpdateStatus("queued")}
              className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              Move to Queued
            </button>
            <button
              onClick={() => onBulkUpdateStatus("contacted")}
              className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              Move to Contacted
            </button>
            <button
              onClick={() => onOpenExportModal && onOpenExportModal()}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export {selectedIds.size}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Table Container */}
      <div className="rounded-2xl border border-[#1B2030] bg-[#0A0C10] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#1B2030] bg-[#0F1218]/90 text-[#8892A6] uppercase tracking-wider font-semibold">
                
                {/* Select Checkbox Column */}
                <th className="p-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAllPage}
                    className="text-[#8892A6] hover:text-cyan-400 cursor-pointer"
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="h-4 w-4 text-cyan-400" />
                    ) : isSomePageSelected ? (
                      <MinusSquare className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>

                <th 
                  onClick={() => handleSort("cleanShellScore")}
                  className="p-3 cursor-pointer hover:text-[#E8ECF4] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort("ticker")}
                  className="p-3 cursor-pointer hover:text-[#E8ECF4] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Ticker / Region</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort("companyName")}
                  className="p-3 cursor-pointer hover:text-[#E8ECF4] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Company Name & Form</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort("delistDate")}
                  className="p-3 cursor-pointer hover:text-[#E8ECF4] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Delist Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort("legalCounsel")}
                  className="p-3 cursor-pointer hover:text-[#E8ECF4] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Legal Counsel / Advisors</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

                <th className="p-3">Verified Officers & Contacts</th>

                <th 
                  onClick={() => handleSort("status")}
                  className="p-3 cursor-pointer hover:text-[#E8ECF4] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CRM Pipeline</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

                <th className="p-3 text-right">Actions</th>

              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#1B2030]/60">
              {paginatedIssuers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-sm text-[#8892A6]">
                    No delisted issuers match the specified filters.
                  </td>
                </tr>
              ) : (
                paginatedIssuers.map((issuer) => {
                  const isSelected = selectedIds.has(issuer.id);
                  const lcName = typeof issuer.legalCounsel === "string" 
                    ? issuer.legalCounsel 
                    : (issuer.legalCounsel?.firmName || "Not Available");

                  const audName = typeof issuer.auditor === "string"
                    ? issuer.auditor
                    : (issuer.auditor?.firmName || "Not Available");

                  const otcUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;

                  return (
                    <tr
                      key={issuer.id}
                      className={`hover:bg-[#0F1218]/70 transition-colors group ${isSelected ? "bg-cyan-500/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSelectItem(issuer.id)}
                          className="text-[#8892A6] hover:text-cyan-400 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-cyan-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Clean Shell Score */}
                      <td className="p-3 whitespace-nowrap">
                        {getScoreBadge(issuer.cleanShellScore)}
                      </td>

                      {/* Ticker & Region */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base" title={issuer.region || "US"}>
                            {getCountryFlag(issuer.region)}
                          </span>
                          <a
                            href={otcUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 hover:bg-cyan-400/20 flex items-center gap-1"
                            title="Open Market Profile"
                          >
                            <span>{issuer.ticker}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </a>
                        </div>
                        <span className="text-[10px] text-[#8892A6] font-mono mt-0.5 block">
                          {issuer.cik ? `CIK: ${issuer.cik}` : (issuer.exchange || "Delisted")}
                        </span>
                      </td>

                      {/* Company Name & Form */}
                      <td className="p-3 max-w-xs">
                        <p 
                          onClick={() => onSelectIssuer(issuer)}
                          className="font-bold text-[#E8ECF4] group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1 text-xs"
                        >
                          {issuer.companyName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/20">
                            {issuer.form}
                          </span>
                          <span className="text-[10px] text-[#8892A6] truncate">
                            {issuer.location}
                          </span>
                        </div>
                      </td>

                      {/* Delist Date */}
                      <td className="p-3 whitespace-nowrap font-mono text-amber-400/90 text-xs">
                        {issuer.delistDate}
                      </td>

                      {/* Legal Counsel */}
                      <td className="p-3 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5 text-rose-400/70 shrink-0" />
                          <span className={`font-mono text-xs truncate ${
                            lcName !== "Not Available" ? "text-rose-300 font-bold" : "text-[#8892A6]"
                          }`}>
                            {lcName}
                          </span>
                        </div>
                        {audName !== "Not Available" && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] truncate">
                            <span className="text-[#8892A6]">Aud:</span>
                            <span className="font-mono text-amber-400/90 truncate font-semibold">{audName}</span>
                          </div>
                        )}
                        {issuer.nomad && (
                          <span className="text-[10px] text-cyan-400 block truncate mt-0.5">
                            Nomad: {issuer.nomad}
                          </span>
                        )}
                      </td>

                      {/* Verified Officers & Contacts */}
                      <td className="p-3 max-w-[200px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[#E8ECF4] truncate">
                            <User className="h-3 w-3 text-cyan-400 shrink-0" />
                            <span className="font-semibold text-[11px] truncate">{issuer.ceo || "Not Available"}</span>
                          </div>
                          {issuer.email && issuer.email !== "Not Available" ? (
                            <a href={`mailto:${issuer.email}`} className="font-mono text-[10px] text-cyan-400 hover:underline flex items-center gap-1 truncate">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{issuer.email}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-[#8892A6] font-mono">No Direct Email</span>
                          )}
                        </div>
                      </td>

                      {/* CRM Status */}
                      <td className="p-3 whitespace-nowrap">
                        <select
                          value={issuer.status || "new"}
                          onChange={(e) => onUpdateStatus(issuer.id, e.target.value)}
                          className="rounded-xl border border-[#1B2030] bg-[#07080B] px-2 py-1 text-[11px] text-[#E8ECF4] focus:outline-none cursor-pointer"
                        >
                          <option value="new">New</option>
                          <option value="queued">Queued</option>
                          <option value="contacted">Contacted</option>
                          <option value="discussion">Discussion</option>
                        </select>
                      </td>

                      {/* Quick Actions */}
                      <td className="p-3 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => onOpenDossierModal && onOpenDossierModal(issuer)}
                          className="rounded-lg border border-[#1B2030] bg-[#0F1218] p-1.5 text-[#8892A6] hover:text-cyan-400 hover:border-cyan-400/30 transition-all cursor-pointer inline-block"
                          title="Generate Deal Dossier"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenEmailModal(issuer)}
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-1.5 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer inline-block"
                          title="AI Strategic Pitch"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-[#1B2030] bg-[#0F1218]/90">
          <span className="text-xs text-[#8892A6]">
            Page <strong className="text-[#E8ECF4] font-mono">{currentPage}</strong> of <strong className="text-[#E8ECF4] font-mono">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#8892A6] hover:text-[#E8ECF4] disabled:opacity-40 disabled:hover:text-[#8892A6] cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs text-[#8892A6] hover:text-[#E8ECF4] disabled:opacity-40 disabled:hover:text-[#8892A6] cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
