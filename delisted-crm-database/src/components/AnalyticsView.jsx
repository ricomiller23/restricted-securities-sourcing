import React from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingDown, 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  MapPin,
  FileText,
  Award,
  Globe2,
  Scale
} from "lucide-react";

export default function AnalyticsView({ issuers }) {
  const total = issuers.length || 1;
  const contacted = issuers.filter((i) => i.status === "contacted").length;
  const queued = issuers.filter((i) => i.status === "queued").length;
  const discussion = issuers.filter((i) => i.status === "discussion").length;
  const newLeads = issuers.filter((i) => !i.status || i.status === "new").length;

  // Regional breakdown
  const usCount = issuers.filter((i) => !i.region || i.region === "US").length;
  const ukCount = issuers.filter((i) => i.region === "UK").length;
  const deCount = issuers.filter((i) => i.region === "DE").length;
  const auCount = issuers.filter((i) => i.region === "AU").length;

  // Shell Score Tier breakdown
  const primeTier = issuers.filter((i) => (i.cleanShellScore || 75) >= 85).length;
  const midTier = issuers.filter((i) => {
    const sc = i.cleanShellScore || 75;
    return sc >= 70 && sc < 85;
  }).length;
  const standardTier = total - (primeTier + midTier);

  // Form type breakdowns
  const form15 = issuers.filter((i) => (i.form || "").includes("15")).length;
  const form25 = issuers.filter((i) => (i.form || "").includes("25")).length;
  const form8k = issuers.filter((i) => (i.form || "").includes("8-K") || (i.form || "").includes("AIM") || (i.form || "").includes("StaRUG") || (i.form || "").includes("ASX")).length;
  const otherForms = Math.max(0, total - (form15 + form25 + form8k));

  // Legal Counsel presence
  const withCounsel = issuers.filter(i => {
    const lc = typeof i.legalCounsel === "string" ? i.legalCounsel : i.legalCounsel?.firmName;
    return lc && lc !== "Not Available" && lc !== "None";
  }).length;

  // CEO presence
  const withCeo = issuers.filter(i => i.ceo && i.ceo !== "Not Available" && i.ceo.length > 3).length;

  // Direct Email presence
  const withEmail = issuers.filter(i => i.email && i.email !== "Not Available" && i.email.includes("@")).length;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20 md:pb-6">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Total Global Issuers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <Globe2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#E8ECF4] font-mono">{total.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">Consolidated Multi-Exchange Database</span>
        </div>

        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Prime Clean Shells (85+)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">{primeTier.toLocaleString()}</p>
          <span className="text-[11px] text-[#8892A6]">
            {((primeTier / total) * 100).toFixed(1)}% Highest Restructuring Viability
          </span>
        </div>

        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Legal Counsel Disclosed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono">{withCounsel.toLocaleString()}</p>
          <span className="text-[11px] text-[#8892A6]">Verified Securities Law Firms</span>
        </div>

        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Outreach Active</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-cyan-400 font-mono">{(contacted + discussion).toLocaleString()}</p>
          <span className="text-[11px] text-cyan-400 font-semibold">{queued} queued in campaign</span>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regional Market Breakdown */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1B2030] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#E8ECF4]">Global Exchange Distribution</h3>
              <p className="text-xs text-[#8892A6]">Issuers tracked across international jurisdictions</p>
            </div>
            <Globe2 className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-[#E8ECF4]">
                  <span>🇺🇸</span> United States (SEC EDGAR / OTC)
                </span>
                <span className="font-mono text-cyan-400 font-bold">{usCount} ({((usCount / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(usCount / total) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-[#E8ECF4]">
                  <span>🇬🇧</span> United Kingdom (London LSE / AIM)
                </span>
                <span className="font-mono text-violet-400 font-bold">{ukCount} Shells</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${Math.max(2, (ukCount / total) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-[#E8ECF4]">
                  <span>🇩🇪</span> Germany (Frankfurt FSE / XETRA)
                </span>
                <span className="font-mono text-amber-400 font-bold">{deCount} Shells</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.max(2, (deCount / total) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-[#E8ECF4]">
                  <span>🇦🇺</span> Australia (ASX Shells)
                </span>
                <span className="font-mono text-emerald-400 font-bold">{auCount} Shells</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.max(2, (auCount / total) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Clean Shell Opportunity Distribution */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1B2030] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#E8ECF4]">Opportunity Scoring Index</h3>
              <p className="text-xs text-[#8892A6]">Algorithmic clean shell and recapitalization viability</p>
            </div>
            <Award className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-400">Prime Clean Shells (Score 85 - 100)</span>
                <span className="font-mono text-emerald-400 font-bold">{primeTier} ({((primeTier / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(primeTier / total) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-cyan-400">High Quality Shells (Score 70 - 84)</span>
                <span className="font-mono text-cyan-400 font-bold">{midTier} ({((midTier / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(midTier / total) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-400">Standard / Complex Assets (&lt; 70)</span>
                <span className="font-mono text-amber-400 font-bold">{standardTier} ({((standardTier / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1B2030] overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(standardTier / total) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CRM Pipeline Funnel */}
      <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1B2030] pb-3">
          <div>
            <h3 className="text-sm font-black text-[#E8ECF4]">Outreach Pipeline Conversion Funnel</h3>
            <p className="text-xs text-[#8892A6]">Progression from raw delisted leads to active advisory discussions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400">1. New Leads</span>
            <p className="text-2xl font-black font-mono text-[#E8ECF4]">{newLeads}</p>
            <span className="text-[10px] text-[#8892A6]">Uncontacted database pool</span>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">2. Queued for Campaign</span>
            <p className="text-2xl font-black font-mono text-[#E8ECF4]">{queued}</p>
            <span className="text-[10px] text-[#8892A6]">Prepared in Email Runner</span>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">3. Pitch Delivered</span>
            <p className="text-2xl font-black font-mono text-[#E8ECF4]">{contacted}</p>
            <span className="text-[10px] text-[#8892A6]">Sent to verified officers</span>
          </div>

          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">4. In Discussion</span>
            <p className="text-2xl font-black font-mono text-[#E8ECF4]">{discussion}</p>
            <span className="text-[10px] text-[#8892A6]">Active deal negotiations</span>
          </div>
        </div>
      </div>

    </div>
  );
}
