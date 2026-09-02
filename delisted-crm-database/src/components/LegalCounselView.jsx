import React, { useState, useMemo } from "react";
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
  Briefcase,
  Award,
  FileText,
  Send,
  Download
} from "lucide-react";

export default function LegalCounselView({ 
  issuers, 
  onSelectIssuer, 
  onOpenEmailModal,
  onOpenDossierModal
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFirm, setExpandedFirm] = useState(null);

  // Group issuers by Legal Counsel Firm Name
  const firmMap = useMemo(() => {
    const map = {};
    issuers.forEach((issuer) => {
      const lcName = typeof issuer.legalCounsel === "string" 
        ? issuer.legalCounsel 
        : (issuer.legalCounsel?.firmName || "Not Available");

      const firmKey = lcName.trim() || "Not Available";
      
      if (!map[firmKey]) {
        map[firmKey] = {
          firmName: firmKey,
          representedIssuers: [],
          regions: new Set(),
          avgScore: 0
        };
      }
      map[firmKey].representedIssuers.push(issuer);
      map[firmKey].regions.add(issuer.region || "US");
    });

    // Compute average shell score
    Object.values(map).forEach(f => {
      const totalScore = f.representedIssuers.reduce((acc, i) => acc + (i.cleanShellScore || 75), 0);
      f.avgScore = Math.round(totalScore / f.representedIssuers.length);
    });

    return map;
  }, [issuers]);

  // Filtered and sorted firms
  const filteredFirms = useMemo(() => {
    const list = Object.values(firmMap).filter((firm) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      const matchFirm = firm.firmName.toLowerCase().includes(q);
      const matchIssuers = firm.representedIssuers.some(
        (i) => i.companyName.toLowerCase().includes(q) || i.ticker.toLowerCase().includes(q) || (i.cik && i.cik.includes(q))
      );
      return matchFirm || matchIssuers;
    });

    // Sort by client count desc (excluding Not Available to top, or keep verified on top)
    return list.sort((a, b) => {
      if (a.firmName === "Not Available") return 1;
      if (b.firmName === "Not Available") return -1;
      return b.representedIssuers.length - a.representedIssuers.length;
    });
  }, [firmMap, searchTerm]);

  const verifiedFirmsCount = Object.keys(firmMap).filter(k => k !== "Not Available" && k !== "None").length;

  const toggleExpand = (firmName) => {
    setExpandedFirm(expandedFirm === firmName ? null : firmName);
  };

  const getCountryFlag = (region) => {
    switch (region) {
      case "UK": return "🇬🇧";
      case "DE": return "🇩🇪";
      case "AU": return "🇦🇺";
      default: return "🇺🇸";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20 md:pb-6">
      
      {/* Top Banner & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#E8ECF4]">
              Securities Legal Counsel Directory
            </h2>
            <p className="text-xs text-[#8892A6]">
              {verifiedFirmsCount} Verified Securities Law Firms representing {issuers.length} Delisted Public Issuers
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8892A6]" />
          <input
            type="text"
            placeholder="Search by law firm name, ticker, or issuer..."
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
            const isUnknown = firm.firmName === "Not Available";

            return (
              <div
                key={firm.firmName}
                className={`rounded-2xl border transition-all ${
                  isUnknown 
                    ? "border-[#1B2030] bg-[#0A0C10]/60 opacity-80"
                    : "border-[#1B2030] bg-[#0A0C10] hover:border-rose-500/30 shadow-lg"
                }`}
              >
                {/* Firm Summary Card Header */}
                <div 
                  onClick={() => toggleExpand(firm.firmName)}
                  className="flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isUnknown ? "bg-[#1B2030] text-[#8892A6]" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}>
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-black ${isUnknown ? "text-[#8892A6]" : "text-[#E8ECF4]"}`}>
                          {firm.firmName}
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#8892A6]">
                        {firm.representedIssuers.length} Delisted {firm.representedIssuers.length === 1 ? "Issuer" : "Issuers"} Represented • Avg Opportunity Score: <strong className="text-emerald-400 font-mono">{firm.avgScore}/100</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
                      {firm.representedIssuers.length} Clients
                    </span>

                    <button className="text-[#8892A6] hover:text-[#E8ECF4]">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Client List Table */}
                {isExpanded && (
                  <div className="border-t border-[#1B2030] bg-[#0F1218]/60 p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {firm.representedIssuers.map((issuer) => {
                        const otcUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;

                        return (
                          <div 
                            key={issuer.id}
                            className="flex flex-col justify-between p-3 rounded-xl border border-[#1B2030] bg-[#07080B] hover:border-cyan-400/40 transition-all text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <a 
                                    href={otcUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded text-[11px] hover:bg-cyan-400/20"
                                  >
                                    {issuer.ticker}
                                  </a>
                                </div>
                                <span className="font-mono text-[10px] text-amber-400/80">{issuer.delistDate}</span>
                              </div>

                              <p 
                                onClick={() => onSelectIssuer(issuer)}
                                className="font-bold text-[#E8ECF4] hover:text-cyan-400 cursor-pointer line-clamp-1 mt-1"
                              >
                                {issuer.companyName}
                              </p>
                              <span className="text-[10px] text-[#8892A6] block">{issuer.location}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#1B2030]/50">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                Score: {issuer.cleanShellScore || 75}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onOpenDossierModal && onOpenDossierModal(issuer)}
                                  className="px-2 py-0.5 rounded bg-[#1B2030] text-[10px] text-[#8892A6] hover:text-cyan-400 cursor-pointer"
                                >
                                  Dossier
                                </button>
                                <button
                                  onClick={() => onOpenEmailModal(issuer)}
                                  className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 hover:bg-cyan-500/20 cursor-pointer"
                                >
                                  Pitch
                                </button>
                              </div>
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
