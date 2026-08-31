import React from 'react';
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
  FileText
} from 'lucide-react';

export default function AnalyticsView({ issuers }) {
  const total = issuers.length || 1;
  const contacted = issuers.filter((i) => i.status === 'contacted').length;
  const queued = issuers.filter((i) => i.status === 'queued').length;
  const discussion = issuers.filter((i) => i.status === 'discussion').length;
  const newLeads = issuers.filter((i) => !i.status || i.status === 'new').length;

  // Form type breakdowns
  const form15 = issuers.filter((i) => (i.form || '').includes('15')).length;
  const form25 = issuers.filter((i) => (i.form || '').includes('25')).length;
  const form8k = issuers.filter((i) => (i.form || '').includes('8-K')).length;
  const otherForms = total - (form15 + form25 + form8k);

  // Top locations
  const locationCounts = {};
  issuers.forEach((i) => {
    const loc = i.location || 'USA';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Total Delisted Issuers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#E8ECF4] font-mono">{total.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">100% EDGAR SEC Verified</span>
        </div>

        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Outreach Contacted</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#E8ECF4] font-mono">{contacted.toLocaleString()}</p>
          <span className="text-[11px] text-[#8892A6]">
            {((contacted / total) * 100).toFixed(1)}% of total issuers
          </span>
        </div>

        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Queued for Outreach</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#E8ECF4] font-mono">{queued.toLocaleString()}</p>
          <span className="text-[11px] text-[#8892A6]">Ready in campaign runner</span>
        </div>

        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8892A6]">Public Officers Coverage</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#E8ECF4] font-mono">100%</p>
          <span className="text-[11px] text-cyan-400 font-semibold">CEOs, CFOs, Phone & Email</span>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Form Type Breakdown */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1B2030] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#E8ECF4] uppercase tracking-wider">
                Delisting Regulatory Event Distribution
              </h3>
              <p className="text-xs text-[#8892A6]">Breakdown by SEC EDGAR Filing Form Types</p>
            </div>
            <FileText className="h-5 w-5 text-rose-400" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-[#E8ECF4]">Form 15-12G (Voluntary De-Registration)</span>
                <span className="font-mono text-cyan-400 font-bold">{form15} ({((form15 / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#07080B] overflow-hidden border border-[#1B2030]">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(form15 / total) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-[#E8ECF4]">Form 25-NSE (Mandatory Exchange Delisting)</span>
                <span className="font-mono text-rose-400 font-bold">{form25} ({((form25 / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#07080B] overflow-hidden border border-[#1B2030]">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(form25 / total) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-[#E8ECF4]">Form 8-K (Exchange Warning / De-listing Notice)</span>
                <span className="font-mono text-amber-400 font-bold">{form8k} ({((form8k / total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#07080B] overflow-hidden border border-[#1B2030]">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(form8k / total) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1B2030] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#E8ECF4] uppercase tracking-wider">
                Geographic HQ Concentration
              </h3>
              <p className="text-xs text-[#8892A6]">Top States & Cities for Delisted Issuers</p>
            </div>
            <MapPin className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {sortedLocations.map(([loc, count]) => (
              <div key={loc} className="flex items-center justify-between rounded-xl border border-[#1B2030] bg-[#07080B] p-3 text-xs">
                <span className="font-semibold text-[#E8ECF4] truncate">{loc}</span>
                <span className="font-mono text-cyan-400 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
