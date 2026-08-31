import React from 'react';
import { Scale, Users, Shield, Building, Mail, Phone, ExternalLink } from 'lucide-react';

export default function NomadsView({ issuers, onOpenEmail }) {
  const nomadMap = {};

  issuers.forEach((i) => {
    const nomad = i.nomad;
    if (!nomadMap[nomad]) {
      nomadMap[nomad] = {
        name: nomad,
        issuers: [],
        broker: i.broker
      };
    }
    nomadMap[nomad].issuers.push(i);
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AIM Nominated Advisers (NOMADs) & Corporate Brokers Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Corporate finance houses and joint brokers managing AIM Rule 15 cash shells, RTO structuring, and Rule 40 suspension proceedings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(nomadMap).map((n, idx) => (
          <div
            key={idx}
            className="bg-[#0e1424]/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <h3 className="text-sm font-bold text-slate-200">{n.name}</h3>
              </div>

              <div className="text-xs text-slate-400 mb-3">
                Corporate Broker: <span className="text-slate-300 font-medium">{n.broker}</span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Associated Shells ({n.issuers.length}):
                </div>
                {n.issuers.map((iss) => (
                  <div
                    key={iss.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-400">{iss.ticker}</span>
                      <span className="text-slate-300 truncate max-w-[140px]">{iss.companyName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Score: {iss.cleanShellScore}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onOpenEmail(n.issuers[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact NOMAD Desk
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
