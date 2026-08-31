import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  MapPin, 
  FileText, 
  ExternalLink, 
  Globe, 
  Scale, 
  Plus, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function IssuerDrawer({ 
  issuer, 
  onClose, 
  onOpenEmailModal,
  onUpdateStatus,
  onAddNote 
}) {
  const [noteText, setNoteText] = useState('');

  if (!issuer) return null;

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(issuer.id, noteText.trim());
    setNoteText('');
  };

  const otcProfileUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;
  
  const lcName = typeof issuer.legalCounsel === 'string' ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || 'Not Available');
  const lcPartner = typeof issuer.legalCounsel === 'object' ? issuer.legalCounsel?.leadAttorney : 'Not Available';
  const lcEmail = typeof issuer.legalCounsel === 'object' ? issuer.legalCounsel?.attorneyEmail : 'Not Available';
  const lcPhone = typeof issuer.legalCounsel === 'object' ? issuer.legalCounsel?.firmPhone : 'Not Available';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#07080B]/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body */}
      <div className="w-full max-w-2xl border-l border-[#1B2030] bg-[#0A0C10] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
        
        <div className="flex flex-col gap-6">
          
          {/* Drawer Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#1B2030]">
            <div>
              <div className="flex items-center gap-2">
                {/* Clickable Ticker Badge */}
                <a
                  href={otcProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all"
                  title={`Open ${issuer.ticker} profile on otcmarkets.com`}
                >
                  <span>{issuer.ticker}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
                  {issuer.form}
                </span>
                <span className="text-xs text-[#8892A6]">CIK: {issuer.cik}</span>
              </div>

              <h2 className="mt-2 text-xl font-black text-[#E8ECF4] tracking-tight">
                {issuer.companyName}
              </h2>

              <p className="mt-1 text-xs text-[#8892A6] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {issuer.location} • Delisted: <strong className="text-amber-400 font-mono">{issuer.delistDate}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-[#1B2030] bg-[#0F1218] p-2 text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Legal Counsel Section (Strict Real Data Policy) */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-rose-400" />
                <span>OTCMarkets Legal Counsel Disclosures</span>
              </h3>
              
              <a
                href={otcProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-all"
                title="Verify directly on otcmarkets.com"
              >
                <span>otcmarkets.com Profile</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8892A6]">Law Firm Name</span>
                <p className={`font-extrabold ${lcName !== 'Not Available' ? 'text-[#E8ECF4]' : 'text-[#8892A6]'}`}>
                  {lcName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8892A6]">Attorney Contact</span>
                <p className={`font-extrabold ${lcPartner !== 'Not Available' ? 'text-[#E8ECF4]' : 'text-[#8892A6]'}`}>
                  {lcPartner}
                </p>
                {lcEmail && lcEmail !== 'Not Available' && (
                  <a href={`mailto:${lcEmail}`} className="text-cyan-400 hover:underline font-mono text-[11px] block">
                    {lcEmail}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Corporate Officers Section */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <User className="h-4 w-4 text-amber-400" />
              <span>Company Officers &amp; Contacts</span>
              <a
                href={issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-400/20 border border-amber-400/20 transition-all"
              >
                <span>OTCMarkets Profile</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[#1B2030] bg-[#07080B] p-3 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8892A6]">Chief Executive Officer</span>
                <p className={`font-extrabold text-sm ${issuer.ceo && issuer.ceo !== 'Not Available' ? 'text-[#E8ECF4]' : 'text-[#8892A6]'}`}>
                  {issuer.ceo && issuer.ceo !== 'Not Available' ? issuer.ceo : 'Not Available'}
                </p>
              </div>

              <div className="rounded-xl border border-[#1B2030] bg-[#07080B] p-3 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8892A6]">Chief Financial Officer</span>
                <p className={`font-extrabold text-sm ${issuer.cfo && issuer.cfo !== 'Not Available' ? 'text-[#E8ECF4]' : 'text-[#8892A6]'}`}>
                  {issuer.cfo && issuer.cfo !== 'Not Available' ? issuer.cfo : 'Not Available'}
                </p>
              </div>
            </div>
          </div>

          {/* Verified Contacts Section */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span>Corporate Contact Channels</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-[#1B2030] bg-[#07080B] p-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="font-bold text-[#E8ECF4] font-mono">
                      {issuer.email && issuer.email !== 'Not Available' ? issuer.email : 'Not Available'}
                    </p>
                    <span className="text-[10px] text-[#8892A6]">Direct Executive Email</span>
                  </div>
                </div>

                {issuer.email && issuer.email !== 'Not Available' ? (
                  <a href={`mailto:${issuer.email}`} className="rounded-lg bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400">
                    Mail
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8892A6]">N/A</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#1B2030] bg-[#07080B] p-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="font-bold text-[#E8ECF4] font-mono">
                      {issuer.phone && issuer.phone !== 'Not Available' ? issuer.phone : 'Not Available'}
                    </p>
                    <span className="text-[10px] text-[#8892A6]">HQ Phone Number</span>
                  </div>
                </div>

                {issuer.phone && issuer.phone !== 'Not Available' ? (
                  <a href={`tel:${issuer.phone}`} className="rounded-lg bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    Call
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8892A6]">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Delisting Intelligence */}
          {issuer.details && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-cyan-400" />
                <span>Delisting Intelligence &amp; Reason</span>
              </h3>
              <p className="text-xs text-[#E8ECF4] leading-relaxed">
                {issuer.details}
              </p>
            </div>
          )}

          {/* SEC & OTC Regulatory Links */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Public SEC Filings &amp; OTCMarkets Profile</span>
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              <a
                href={issuer.secLandingPage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-[#1B2030] bg-[#07080B] p-3 text-[#E8ECF4] hover:text-cyan-400"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-400" />
                  <div>
                    <p className="font-bold">SEC EDGAR Official Filing Index ({issuer.form})</p>
                    <p className="text-[10px] text-[#8892A6]">Accession: {issuer.id}</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </a>

              <a
                href={otcProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-[#1B2030] bg-[#07080B] p-3 text-[#E8ECF4] hover:text-cyan-400"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="font-bold">otcmarkets.com Profile ({issuer.ticker})</p>
                    <p className="text-[10px] text-[#8892A6]">https://www.otcmarkets.com/stock/{issuer.ticker}/profile</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* CRM Notes */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span>CRM Interaction Notes</span>
            </h3>

            <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Log note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-2 text-xs text-[#E8ECF4] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-[#07080B]"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {!issuer.notes || issuer.notes.length === 0 ? (
                <p className="text-xs text-[#8892A6] italic text-center py-4">No notes logged yet.</p>
              ) : (
                issuer.notes.map((n, idx) => (
                  <div key={idx} className="rounded-xl border border-[#1B2030] bg-[#07080B] p-3 text-xs text-[#E8ECF4]">
                    <p>{n.text}</p>
                    <span className="mt-1 block text-[10px] font-mono text-[#8892A6]">{n.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-[#1B2030] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#1B2030] bg-[#0F1218] px-5 py-2 text-xs font-bold text-[#8892A6] hover:text-[#E8ECF4]"
          >
            Close Profile
          </button>
        </div>

      </div>

    </div>
  );
}
