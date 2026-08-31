import React, { useState, useMemo } from 'react';
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
  Scale
} from 'lucide-react';

export default function TableView({ 
  issuers, 
  onSelectIssuer, 
  onOpenEmailModal,
  onUpdateStatus,
  formFilter,
  setFormFilter,
  statusFilter,
  setStatusFilter,
  exchangeFilter,
  setExchangeFilter
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState('delistDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Multi-column sorting
  const sortedIssuers = useMemo(() => {
    return [...issuers].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'legalCounsel') {
        valA = typeof a.legalCounsel === 'string' ? a.legalCounsel : (a.legalCounsel?.firmName || 'Not Available');
        valB = typeof b.legalCounsel === 'string' ? b.legalCounsel : (b.legalCounsel?.firmName || 'Not Available');
      }
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
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
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Contacted
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Outreach Queued
          </span>
        );
      case 'discussion':
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

  return (
    <div className="flex flex-col gap-4 pb-16 md:pb-0">
      
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8892A6]">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          <select
            value={formFilter}
            onChange={(e) => { setFormFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border border-[#1B2030] bg-[#07080B] px-2.5 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none min-h-[36px]"
          >
            <option value="all">All Forms</option>
            <option value="15-12G">Form 15-12G</option>
            <option value="25-NSE">Form 25-NSE</option>
            <option value="8-K">Form 8-K</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border border-[#1B2030] bg-[#07080B] px-2.5 py-1.5 text-xs text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none min-h-[36px]"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Lead</option>
            <option value="queued">Queued</option>
            <option value="contacted">Contacted</option>
            <option value="discussion">In Discussion</option>
          </select>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3 text-xs text-[#8892A6]">
          <span>
            Showing <strong className="text-[#E8ECF4] font-mono">{issuers.length}</strong> issuers
          </span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="rounded-xl border border-[#1B2030] bg-[#07080B] px-2 py-1 text-xs text-[#8892A6] focus:border-cyan-400/50 focus:outline-none"
          >
            <option value={25}>25 / pg</option>
            <option value={50}>50 / pg</option>
            <option value={100}>100 / pg</option>
          </select>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {paginatedIssuers.length === 0 ? (
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-8 text-center text-[#8892A6]">
            No delisted issuers match the selected filters.
          </div>
        ) : (
          paginatedIssuers.map((issuer) => {
            const lcName = typeof issuer.legalCounsel === 'string' ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || 'Not Available');
            const otcUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;

            return (
              <div 
                key={issuer.id}
                className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 flex flex-col gap-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {/* Clickable Ticker Badge to OTCMarkets */}
                      <a
                        href={otcUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all"
                        title="Click to view profile on otcmarkets.com"
                      >
                        <span>{issuer.ticker}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/20">
                        {issuer.form}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectIssuer(issuer)}
                      className="mt-1.5 font-bold text-sm text-[#E8ECF4] text-left hover:text-cyan-400 line-clamp-1 cursor-pointer"
                    >
                      {issuer.companyName}
                    </button>
                    <span className="text-[10px] font-mono text-[#8892A6]">CIK: {issuer.cik} • {issuer.location}</span>
                  </div>

                  <span className="font-mono text-xs text-amber-400 shrink-0">
                    {issuer.delistDate}
                  </span>
                </div>

                {/* Mobile Legal Counsel */}
                <div className="rounded-xl border border-[#1B2030] bg-[#07080B] p-2.5 text-xs flex items-center justify-between">
                  <span className="text-[#8892A6]">Legal Counsel:</span>
                  <span className={`font-bold font-mono ${lcName !== 'Not Available' ? 'text-rose-400' : 'text-[#8892A6]'}`}>
                    {lcName}
                  </span>
                </div>

                {/* Mobile Corporate Contact */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#1B2030]/60 pt-2">
                  <div>
                    <span className="text-[10px] text-[#8892A6] block">Corporate Email</span>
                    {issuer.email && issuer.email !== 'Not Available' ? (
                      <a href={`mailto:${issuer.email}`} className="font-mono text-cyan-400 block truncate">
                        {issuer.email}
                      </a>
                    ) : (
                      <span className="font-mono text-[#8892A6] block">Not Available</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8892A6] block">Corporate Phone</span>
                    {issuer.phone && issuer.phone !== 'Not Available' ? (
                      <a href={`tel:${issuer.phone}`} className="font-mono text-[#E8ECF4] block truncate">
                        {issuer.phone}
                      </a>
                    ) : (
                      <span className="font-mono text-[#8892A6] block">Not Available</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-[#1B2030]/60 pt-2.5 mt-1">
                  {getStatusBadge(issuer.status)}
                  <button
                    onClick={() => onSelectIssuer(issuer)}
                    className="rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs font-semibold text-[#8892A6]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-[#1B2030] bg-[#0F1218] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#1B2030] bg-[#0A0C10] text-[#8892A6] font-semibold uppercase tracking-wider select-none">
                <th className="px-4 py-3.5 cursor-pointer hover:text-[#E8ECF4]" onClick={() => handleSort('delistDate')}>
                  <div className="flex items-center gap-1.5">
                    <span>Delist Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5 cursor-pointer hover:text-[#E8ECF4]" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center gap-1.5">
                    <span>Issuer / Clickable Ticker</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5 cursor-pointer hover:text-[#E8ECF4]" onClick={() => handleSort('legalCounsel')}>
                  <div className="flex items-center gap-1.5">
                    <span>Legal Counsel (OTCMarkets)</span>
                    <ArrowUpDown className="h-3 w-3 text-rose-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <span>Corporate Officer</span>
                </th>
                <th className="px-4 py-3.5">
                  <span>Corporate Contact</span>
                </th>
                <th className="px-4 py-3.5 cursor-pointer hover:text-[#E8ECF4]" onClick={() => handleSort('form')}>
                  <div className="flex items-center gap-1.5">
                    <span>SEC Form</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <span>Status</span>
                </th>
                <th className="px-4 py-3.5 text-right">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1B2030]/60">
              {paginatedIssuers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-[#8892A6]">
                    No delisted issuers match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedIssuers.map((issuer) => {
                  const lcName = typeof issuer.legalCounsel === 'string' ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || 'Not Available');
                  const otcUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;

                  return (
                    <tr 
                      key={issuer.id}
                      className="hover:bg-[#1B2030]/30 transition-colors group"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-amber-400 whitespace-nowrap">
                        {issuer.delistDate}
                      </td>

                      {/* Issuer & Clickable Ticker to OTCMarkets */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectIssuer(issuer)}
                              className="font-bold text-[#E8ECF4] hover:text-cyan-400 hover:underline transition-colors text-left"
                            >
                              {issuer.companyName}
                            </button>
                            
                            {/* Clickable Ticker to otcmarkets.com/stock/{ticker}/profile */}
                            <a
                              href={otcUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all cursor-pointer"
                              title={`Open ${issuer.ticker} profile on otcmarkets.com`}
                            >
                              <span>{issuer.ticker}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                          <span className="text-[11px] text-[#8892A6]">CIK: {issuer.cik} • {issuer.location}</span>
                        </div>
                      </td>

                      {/* Legal Counsel */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Scale className={`h-3.5 w-3.5 ${lcName !== 'Not Available' ? 'text-rose-400' : 'text-[#8892A6]'}`} />
                          <span className={`font-bold text-xs ${lcName !== 'Not Available' ? 'text-[#E8ECF4]' : 'text-[#8892A6]'}`}>
                            {lcName}
                          </span>
                        </div>
                      </td>

                      {/* CEO */}
                      <td className="px-4 py-3.5">
                        <span className={`text-xs ${issuer.ceo !== 'Not Available' ? 'text-[#E8ECF4] font-medium' : 'text-[#8892A6]'}`}>
                          {issuer.ceo}
                        </span>
                      </td>

                      {/* Contact Channels */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {issuer.email && issuer.email !== 'Not Available' ? (
                            <a href={`mailto:${issuer.email}`} className="text-cyan-400 hover:underline font-mono text-[11px]">
                              {issuer.email}
                            </a>
                          ) : (
                            <span className="text-[#8892A6] font-mono text-[11px]">Not Available</span>
                          )}

                          {issuer.phone && issuer.phone !== 'Not Available' ? (
                            <a href={`tel:${issuer.phone}`} className="text-[#8892A6] font-mono text-[11px]">
                              {issuer.phone}
                            </a>
                          ) : (
                            <span className="text-[#8892A6] font-mono text-[11px]">Not Available</span>
                          )}
                        </div>
                      </td>

                      {/* SEC Form */}
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/20">
                          {issuer.form}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(issuer.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectIssuer(issuer)}
                          className="rounded-lg border border-[#1B2030] bg-[#07080B] px-3 py-1.5 text-xs font-semibold text-[#8892A6] hover:text-[#E8ECF4]"
                        >
                          Details
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#1B2030] bg-[#0A0C10] px-4 sm:px-6 py-4 gap-3 rounded-2xl">
        <div className="text-xs text-[#8892A6]">
          Page <strong className="text-[#E8ECF4] font-mono">{currentPage}</strong> of{' '}
          <strong className="text-[#E8ECF4] font-mono">{totalPages}</strong> ({sortedIssuers.length} total issuers)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-xl border border-[#1B2030] bg-[#0F1218] px-3 py-1.5 text-xs font-semibold text-[#8892A6] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-xl border border-[#1B2030] bg-[#0F1218] px-3 py-1.5 text-xs font-semibold text-[#8892A6] disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
