import React from 'react';
import { Users, Building, Mail, Phone, ExternalLink } from 'lucide-react';

export default function LeadManagerDirectory({ companies, onSelect }) {
  // Aggregate broker firms
  const brokerMap = {};
  companies.forEach((c) => {
    const broker = c.leadManagerOrBroker || 'Direct Placement';
    if (!brokerMap[broker]) brokerMap[broker] = [];
    brokerMap[broker].push(c);
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Australian Microcap Brokers & Lead Managers Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Network of Australian equity capital markets (ECM) brokers and advisors managing junior placement syndicates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(brokerMap).map(([broker, brokerCompanies]) => (
          <div
            key={broker}
            className="bg-[#0e1424]/80 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {brokerCompanies.length} Mandate{brokerCompanies.length > 1 ? 's' : ''}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{broker}</h3>
              <p className="text-xs text-slate-400 mb-3">Active Underwriting & Placement Broker</p>

              <div className="space-y-2">
                {brokerCompanies.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelect(c)}
                    className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-400 mr-2">{c.ticker}</span>
                      <span className="text-slate-300 truncate">{c.companyName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400">{c.quartersOfFundingRemaining}q</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
