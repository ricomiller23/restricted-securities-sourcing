import React from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink, 
  User, 
  Clock, 
  CheckCircle2, 
  Send,
  Scale,
  Award,
  FileText
} from "lucide-react";

const STAGES = [
  { id: "new", title: "New Leads", color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
  { id: "queued", title: "Queued for Outreach", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
  { id: "contacted", title: "Contacted / Pitch Sent", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
  { id: "discussion", title: "In Discussion", color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
];

export default function KanbanView({ 
  issuers, 
  onSelectIssuer, 
  onOpenEmailModal,
  onOpenDossierModal,
  onUpdateStatus 
}) {
  const getCountryFlag = (region) => {
    switch (region) {
      case "UK": return "🇬🇧";
      case "DE": return "🇩🇪";
      case "AU": return "🇦🇺";
      default: return "🇺🇸";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start pb-20 md:pb-6 animate-fadeIn">
      {STAGES.map((stage) => {
        const stageIssuers = issuers.filter((item) => (item.status || "new") === stage.id);

        return (
          <div 
            key={stage.id}
            className="flex flex-col gap-4 rounded-2xl border border-[#1B2030] bg-[#0A0C10] p-4 min-h-[650px]"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1B2030]">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stage.color.split(" ")[2]}`} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#E8ECF4]">
                  {stage.title}
                </h3>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold border ${stage.color}`}>
                {stageIssuers.length}
              </span>
            </div>

            {/* Stage Cards Column */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[750px] pr-1">
              {stageIssuers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[#8892A6] border border-dashed border-[#1B2030] rounded-xl p-4">
                  <span>No issuers in this stage</span>
                </div>
              ) : (
                stageIssuers.map((issuer) => {
                  const otcUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;
                  const lcName = typeof issuer.legalCounsel === "string" ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || "Not Available");
                  const score = issuer.cleanShellScore || 75;

                  return (
                    <div
                      key={issuer.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#1B2030] bg-[#0F1218] p-4 hover:border-cyan-400/40 transition-all shadow-lg hover:shadow-cyan-500/5 group"
                    >
                      {/* Header: Clickable Ticker & Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{getCountryFlag(issuer.region)}</span>
                            <a
                              href={otcUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all cursor-pointer"
                              title="Open Market Profile"
                            >
                              <span>{issuer.ticker}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>

                          <h4 
                            onClick={() => onSelectIssuer(issuer)}
                            className="mt-1 font-bold text-xs text-[#E8ECF4] group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
                          >
                            {issuer.companyName}
                          </h4>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Score: {score}
                          </span>
                          <span className="text-[9px] text-[#8892A6] mt-0.5 font-mono">{issuer.delistDate}</span>
                        </div>
                      </div>

                      {/* Legal Counsel & Form */}
                      <div className="space-y-1 text-[11px] border-t border-[#1B2030]/50 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8892A6]">Legal Counsel:</span>
                          <span className={`font-mono font-bold text-[10px] truncate max-w-[140px] ${lcName !== "Not Available" ? "text-rose-300" : "text-[#8892A6]"}`}>
                            {lcName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#8892A6]">
                          <span>Form: <strong className="text-rose-400 font-mono">{issuer.form}</strong></span>
                          <span className="font-mono">{issuer.cik ? `CIK: ${issuer.cik}` : (issuer.region || "US")}</span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        {issuer.email && issuer.email !== "Not Available" ? (
                          <a href={`mailto:${issuer.email}`} className="flex items-center gap-1 text-cyan-400 hover:underline font-mono text-[10px] truncate">
                            <Mail className="h-3 w-3" /> {issuer.email}
                          </a>
                        ) : (
                          <span className="text-[#8892A6] font-mono text-[10px]">Email: Not Available</span>
                        )}
                      </div>

                      {/* Move Stage Footer */}
                      <div className="flex items-center justify-between border-t border-[#1B2030]/50 pt-2.5 mt-1">
                        <select
                          value={issuer.status || "new"}
                          onChange={(e) => onUpdateStatus(issuer.id, e.target.value)}
                          className="rounded-lg border border-[#1B2030] bg-[#07080B] px-2 py-1 text-[10px] text-[#8892A6] hover:text-[#E8ECF4] focus:border-cyan-400/40 focus:outline-none cursor-pointer"
                        >
                          <option value="new">Move: New</option>
                          <option value="queued">Move: Queued</option>
                          <option value="contacted">Move: Contacted</option>
                          <option value="discussion">Move: Discussion</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenDossierModal && onOpenDossierModal(issuer)}
                            className="rounded-lg border border-[#1B2030] bg-[#07080B] p-1.5 text-[10px] font-semibold text-[#8892A6] hover:text-cyan-400 cursor-pointer"
                            title="Deal Sheet Dossier"
                          >
                            <FileText className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onOpenEmailModal(issuer)}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-1.5 text-[10px] font-semibold text-cyan-400 hover:bg-cyan-500/20 cursor-pointer"
                            title="AI Strategic Pitch"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
