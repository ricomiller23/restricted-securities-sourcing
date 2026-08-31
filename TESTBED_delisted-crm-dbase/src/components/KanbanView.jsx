import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink, 
  User, 
  Clock, 
  CheckCircle2, 
  Send,
  Scale
} from 'lucide-react';

const STAGES = [
  { id: 'new', title: 'New Leads', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'queued', title: 'Queued for Outreach', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'contacted', title: 'Contacted / Email Sent', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'discussion', title: 'In Discussion', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
];

export default function KanbanView({ 
  issuers, 
  onSelectIssuer, 
  onOpenEmailModal, 
  onUpdateStatus 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start pb-16 md:pb-0">
      {STAGES.map((stage) => {
        const stageIssuers = issuers.filter((item) => (item.status || 'new') === stage.id);

        return (
          <div 
            key={stage.id}
            className="flex flex-col gap-4 rounded-2xl border border-[#1B2030] bg-[#0A0C10] p-4 min-h-[600px]"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1B2030]">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stage.color.split(' ')[2]}`} />
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
                  const lcName = typeof issuer.legalCounsel === 'string' ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || 'Not Available');

                  return (
                    <div
                      key={issuer.id}
                      className="flex flex-col gap-3 rounded-xl border border-[#1B2030] bg-[#0F1218] p-4 hover:border-cyan-400/40 transition-all shadow-lg hover:shadow-cyan-500/5 group"
                    >
                      {/* Header: Clickable Ticker & Date */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {/* Clickable Ticker Badge to OTCMarkets */}
                          <a
                            href={otcUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all cursor-pointer"
                            title={`Open ${issuer.ticker} profile on otcmarkets.com`}
                          >
                            <span>{issuer.ticker}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>

                          <h4 
                            onClick={() => onSelectIssuer(issuer)}
                            className="mt-1 font-bold text-xs text-[#E8ECF4] group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
                          >
                            {issuer.companyName}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {issuer.delistDate}
                        </span>
                      </div>

                      {/* Legal Counsel & Officers */}
                      <div className="space-y-1.5 text-[11px] border-t border-[#1B2030]/50 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8892A6]">Legal Counsel:</span>
                          <span className={`font-mono font-bold text-[10px] ${lcName !== 'Not Available' ? 'text-rose-400' : 'text-[#8892A6]'}`}>
                            {lcName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#8892A6]">
                          <span>Form: <strong className="text-rose-400 font-mono">{issuer.form}</strong></span>
                          <span className="font-mono">CIK: {issuer.cik}</span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-col gap-1 text-[11px]">
                        {issuer.email && issuer.email !== 'Not Available' ? (
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
                          value={issuer.status}
                          onChange={(e) => onUpdateStatus(issuer.id, e.target.value)}
                          className="rounded-lg border border-[#1B2030] bg-[#07080B] px-2 py-1 text-[10px] text-[#8892A6] hover:text-[#E8ECF4] focus:border-cyan-400/40 focus:outline-none cursor-pointer"
                        >
                          <option value="new">Move: New</option>
                          <option value="queued">Move: Queued</option>
                          <option value="contacted">Move: Contacted</option>
                          <option value="discussion">Move: Discussion</option>
                        </select>

                        <button
                          onClick={() => onSelectIssuer(issuer)}
                          className="rounded-lg border border-[#1B2030] bg-[#07080B] px-2.5 py-1 text-[10px] font-semibold text-[#8892A6] hover:text-[#E8ECF4]"
                        >
                          Details
                        </button>
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
