import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Briefcase
} from 'lucide-react';

export default function LegalCounselView({ 
  issuers, 
  onSelectIssuer, 
  onOpenEmailModal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFirm, setExpandedFirm] = useState(null);

  // Group issuers by Legal Counsel Firm Name
  const firmMap = useMemo(() => {
    const map = {};
    issuers.forEach((issuer) => {
      const lcName = typeof issuer.legalCounsel === 'string' 
        ? issuer.legalCounsel 
        : (issuer.legalCounsel?.firmName || 'Not Available');

      const firmKey = lcName.trim() || 'Not Available';
      
      if (!map[firmKey]) {
        map[firmKey] = {
          firmName: firmKey,
          representedIssuers: []
        };
      }
      map[firmKey].representedIssuers.push(issuer);
    });
    return map;
  }, [issuers]);

  // Filtered firms
  const filteredFirms = useMemo(() => {
    return Object.values(firmMap).filter((firm) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      const matchFirm = firm.firmName.toLowerCase().includes(q);
      const matchIssuers = firm.representedIssuers.some(
        (i) => i.companyName.toLowerCase().includes(q) || i.ticker.toLowerCase().includes(q) || i.cik.includes(q)
      );
      return matchFirm || matchIssuers;
    });
  }, [firmMap, searchTerm]);

  const toggleExpand = (firmName) => {
    setExpandedFirm(expandedFirm === firmName ? null : firmName);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-16 md:pb-0">
      
      {/* Top Banner & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#E8ECF4]">
              Legal Counsel & SEC Law Firm Directory
            </h2>
            <p className="text-xs text-[#8892A6]">
              {Object.keys(firmMap).length} Securities Law Firms representing {issuers.length} Delisted Public Issuers
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8892A6]" />
          <input
            type="text"
            placeholder="Filter by law firm or ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#1B2030] bg-[#07080B] pl-10 pr-4 py-2 text-xs text-[#E8ECF4] placeholder-[#8892A6]/50 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Law Firms Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFirms.length === 0 ? (
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-12 text-center text-[#8892A6]">
            No legal counsel firms match your search term.
          </div>
        ) : (
          filteredFirms.map((firm) => {
            const isExpanded = expandedFirm === firm.firmName;
            const isNotAvailable = firm.firmName === 'Not Available';

            return (
              <div 
                key={firm.firmName}
                className="rounded-2xl border border-[#1B2030] bg-[#0F1218] overflow-hidden transition-all shadow-xl hover:border-cyan-400/30"
              >
                {/* Firm Summary Row */}
                <div className="flex flex-wrap items-center justify-between p-5 gap-4">
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${isNotAvailable ? 'bg-[#07080B] border-[#1B2030] text-[#8892A6]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} font-bold`}>
                      <Briefcase className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-extrabold text-sm ${isNotAvailable ? 'text-[#8892A6]' : 'text-[#E8ECF4]'}`}>
                          {firm.firmName}
                        </h3>
                        <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/20">
                          {firm.representedIssuers.length} Issuers Represented
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#8892A6]">
                        Sourced from OTCMarkets Company Profile & SEC EDGAR Filings
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(firm.firmName)}
                    className="flex items-center gap-1 rounded-xl border border-[#1B2030] bg-[#07080B] px-3.5 py-2 text-xs font-semibold text-[#8892A6] hover:text-[#E8ECF4] cursor-pointer min-h-[38px]"
                  >
                    <span>{isExpanded ? 'Hide Issuers' : 'View Represented Issuers'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                </div>

                {/* Expanded Represented Issuers List */}
                {isExpanded && (
                  <div className="border-t border-[#1B2030] bg-[#07080B] p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] mb-3">
                      Issuers under {firm.firmName} ({firm.representedIssuers.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {firm.representedIssuers.map((issuer) => {
                        const otcUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;

                        return (
                          <div 
                            key={issuer.id}
                            className="flex flex-col justify-between rounded-xl border border-[#1B2030] bg-[#0F1218] p-3.5 hover:border-cyan-400/40 transition-all gap-2"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                {/* Clickable Ticker Badge to OTCMarkets */}
                                <a
                                  href={otcUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all"
                                  title={`Open ${issuer.ticker} profile on otcmarkets.com`}
                                >
                                  <span>{issuer.ticker}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>

                                <span className="text-[10px] font-mono text-amber-400">
                                  {issuer.delistDate}
                                </span>
                              </div>

                              <button
                                onClick={() => onSelectIssuer(issuer)}
                                className="mt-1.5 font-bold text-xs text-[#E8ECF4] hover:text-cyan-400 text-left line-clamp-1 cursor-pointer"
                              >
                                {issuer.companyName}
                              </button>

                              <p className="text-[11px] text-[#8892A6] mt-0.5">
                                Form: <span className="text-rose-400 font-mono">{issuer.form}</span> • CIK: <span className="font-mono">{issuer.cik}</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#1B2030] pt-2 mt-1">
                              <span className="text-[10px] text-[#8892A6]">{issuer.location}</span>
                              
                              <button
                                onClick={() => onSelectIssuer(issuer)}
                                className="rounded bg-[#07080B] border border-[#1B2030] px-2 py-1 text-[10px] font-semibold text-[#8892A6] hover:text-[#E8ECF4]"
                              >
                                View Details
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
