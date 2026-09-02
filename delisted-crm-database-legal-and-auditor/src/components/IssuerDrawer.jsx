import React, { useState } from "react";
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  MapPin, 
  FileText, 
  ExternalLink, 
  Scale, 
  Plus, 
  MessageSquare,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  FileCheck,
  Send,
  PhoneCall,
  Users,
  Briefcase,
  ClipboardCheck
} from "lucide-react";

export default function IssuerDrawer({ 
  issuer, 
  onClose, 
  onOpenEmailModal,
  onOpenDossierModal,
  onUpdateStatus,
  onAddNote,
  onAddActivity,
  onSetReminder
}) {
  const [noteText, setNoteText] = useState("");
  const [activityType, setActivityType] = useState("call");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityText, setActivityText] = useState("");
  const [showActivityForm, setShowActivityForm] = useState(false);

  if (!issuer) return null;

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(issuer.id, noteText.trim());
    setNoteText("");
  };

  const handleAddActivitySubmit = (e) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;
    if (onAddActivity) {
      onAddActivity(issuer.id, {
        type: activityType,
        title: activityTitle.trim(),
        text: activityText.trim(),
        date: new Date().toLocaleString()
      });
    }
    setActivityTitle("");
    setActivityText("");
    setShowActivityForm(false);
  };

  const handleSetQuickReminder = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toISOString().slice(0, 10);
    if (onSetReminder) {
      onSetReminder(issuer.id, dateStr);
    }
  };

  const otcProfileUrl = issuer.otcProfileUrl || `https://www.otcmarkets.com/stock/${issuer.ticker}/profile`;
  const lcName = typeof issuer.legalCounsel === "string" ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || "Not Available");
  const score = issuer.cleanShellScore || 75;

  const getScoreColor = (sc) => {
    if (sc >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (sc >= 70) return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />;
      case "email": return <Mail className="h-3.5 w-3.5 text-emerald-400" />;
      case "meeting": return <Users className="h-3.5 w-3.5 text-violet-400" />;
      case "proposal": return <FileText className="h-3.5 w-3.5 text-amber-400" />;
      case "diligence": return <FileCheck className="h-3.5 w-3.5 text-rose-400" />;
      default: return <Clock className="h-3.5 w-3.5 text-cyan-400" />;
    }
  };

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
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={otcProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-all"
                  title="Open market profile"
                >
                  <span>{issuer.ticker}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
                  {issuer.form}
                </span>

                <span className="rounded bg-white/5 px-2 py-0.5 text-xs font-mono font-bold text-[#E8ECF4] border border-white/10">
                  {issuer.region || "US"}
                </span>

                <span className="text-xs text-[#8892A6]">
                  {issuer.cik ? `CIK: ${issuer.cik}` : `ID: ${issuer.id}`}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black text-[#E8ECF4] tracking-tight">
                {issuer.companyName}
              </h2>

              <p className="mt-1 text-xs text-[#8892A6] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {issuer.location || "United States"} • Delisted: <strong className="text-amber-400 font-mono">{issuer.delistDate}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDossierModal && onOpenDossierModal(issuer)}
                className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
                title="View Bloomberg-grade deal sheet dossier"
              >
                Deal Sheet
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#1B2030] bg-[#0F1218] p-2 text-[#8892A6] hover:text-[#E8ECF4] transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Clean Shell Score & Rating Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-[#1B2030] bg-[#0F1218]">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border font-mono font-black text-lg ${getScoreColor(score)}`}>
                {score}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8892A6]">Clean Shell Opportunity Index</span>
                <p className="text-xs font-bold text-[#E8ECF4]">{issuer.shellRating || "Prime Clean Shell Candidate"}</p>
                <span className="text-[10px] text-cyan-400">Algorithmic Restructuring Viability</span>
              </div>
            </div>

            {issuer.marketCap && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#8892A6]">Market Cap</span>
                <p className="text-xs font-mono font-bold text-emerald-400">{issuer.marketCap}</p>
              </div>
            )}
          </div>

          {/* Follow-up Reminder Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-[#E8ECF4]">
                {issuer.reminders ? `Scheduled Follow-Up: ${issuer.reminders}` : "Schedule Next CRM Follow-Up:"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSetQuickReminder(7)}
                className="px-2 py-1 rounded-lg bg-[#0F1218] border border-amber-500/20 text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              >
                +7 Days
              </button>
              <button
                onClick={() => handleSetQuickReminder(14)}
                className="px-2 py-1 rounded-lg bg-[#0F1218] border border-amber-500/20 text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              >
                +14 Days
              </button>
              <button
                onClick={() => handleSetQuickReminder(30)}
                className="px-2 py-1 rounded-lg bg-[#0F1218] border border-amber-500/20 text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              >
                +30 Days
              </button>
            </div>
          </div>

          {/* Legal Counsel Section */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-rose-400" />
                <span>Securities Legal Counsel & Advisors</span>
              </h3>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                Disclosed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8892A6] block text-[11px]">Law Firm Name</span>
                <strong className="text-rose-300 font-bold text-sm block mt-0.5">{lcName}</strong>
              </div>

              {issuer.nomad && (
                <div>
                  <span className="text-[#8892A6] block text-[11px]">Nomad / Sponsor</span>
                  <strong className="text-cyan-300 font-bold text-sm block mt-0.5">{issuer.nomad}</strong>
                </div>
              )}

              {issuer.designatedSponsor && (
                <div>
                  <span className="text-[#8892A6] block text-[11px]">Designated Sponsor</span>
                  <strong className="text-cyan-300 font-bold text-sm block mt-0.5">{issuer.designatedSponsor}</strong>
                </div>
              )}

              {issuer.shareRegistry && (
                <div>
                  <span className="text-[#8892A6] block text-[11px]">Share Registry</span>
                  <strong className="text-[#E8ECF4] font-semibold block mt-0.5">{issuer.shareRegistry}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Independent Auditor & Accounting Firm */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ClipboardCheck className="h-4 w-4 text-amber-400" />
                <span>Independent Auditor & Accounting Firm</span>
              </h3>
              <a
                href={otcProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 hover:bg-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                title="View on OTC Markets Company Profile"
              >
                <span>OTC Profile</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8892A6] block text-[11px]">Audit / CPA Firm</span>
                <strong className="text-amber-300 font-bold text-sm block mt-0.5">
                  {typeof issuer.auditor === "string" ? issuer.auditor : (issuer.auditor?.firmName || "Not Available")}
                </strong>
              </div>
              <div>
                <span className="text-[#8892A6] block text-[11px]">Audit Registration</span>
                <span className="text-emerald-400 font-semibold block mt-0.5 font-mono">PCAOB Registered / Disclosed</span>
              </div>
            </div>
          </div>

          {/* Executive Leadership & Direct Contacts */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <User className="h-4 w-4 text-cyan-400" />
              <span>Executive Officers & Direct Contacts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#8892A6] text-[11px]">Chief Executive Officer (CEO)</span>
                <p className="font-bold text-[#E8ECF4]">{issuer.ceo || "Not Available"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#8892A6] text-[11px]">Chief Financial Officer (CFO)</span>
                <p className="font-bold text-[#E8ECF4]">{issuer.cfo || "Not Available"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#8892A6] text-[11px]">Primary Email</span>
                {issuer.email && issuer.email !== "Not Available" ? (
                  <a href={`mailto:${issuer.email}`} className="font-mono text-cyan-400 hover:underline block truncate">
                    {issuer.email}
                  </a>
                ) : (
                  <span className="text-[#8892A6]">Not Available</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[#8892A6] text-[11px]">Direct Phone</span>
                {issuer.phone && issuer.phone !== "Not Available" ? (
                  <a href={`tel:${issuer.phone}`} className="font-mono text-cyan-400 hover:underline block">
                    {issuer.phone}
                  </a>
                ) : (
                  <span className="text-[#8892A6]">Not Available</span>
                )}
              </div>
            </div>
          </div>

          {/* Filing & Delisting Details */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Filing Details & Delisting Summary</span>
            </h3>
            <p className="text-xs text-[#C0C8D8] leading-relaxed">
              {issuer.details || "Delisted public issuer filing."}
            </p>
            {issuer.secLandingPage && (
              <a
                href={issuer.secLandingPage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline font-semibold"
              >
                <span>View Full SEC EDGAR / Official Filing Archive</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* CRM Activity Timeline */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>CRM Activity & Outreach Timeline</span>
              </h3>
              <button
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Log Activity</span>
              </button>
            </div>

            {/* Log Activity Form */}
            {showActivityForm && (
              <form onSubmit={handleAddActivitySubmit} className="space-y-3 p-3.5 rounded-xl border border-cyan-500/30 bg-[#07080B]">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="rounded-lg border border-[#1B2030] bg-[#0F1218] px-2.5 py-1.5 text-xs text-[#E8ECF4] focus:outline-none"
                  >
                    <option value="call">📞 Phone Call</option>
                    <option value="email">✉️ Email Outreach</option>
                    <option value="meeting">🤝 Executive Meeting</option>
                    <option value="proposal">📑 Proposal Sent</option>
                    <option value="diligence">⚖️ Legal Diligence</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Activity Title..."
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    className="rounded-lg border border-[#1B2030] bg-[#0F1218] px-2.5 py-1.5 text-xs text-[#E8ECF4] placeholder-[#8892A6]/50 focus:outline-none"
                    required
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Activity notes / outcomes..."
                  value={activityText}
                  onChange={(e) => setActivityText(e.target.value)}
                  className="w-full rounded-lg border border-[#1B2030] bg-[#0F1218] p-2 text-xs text-[#E8ECF4] placeholder-[#8892A6]/50 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowActivityForm(false)}
                    className="px-3 py-1 rounded-lg text-xs text-[#8892A6] hover:text-[#E8ECF4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-cyan-500 text-xs font-bold text-[#07080B] hover:bg-cyan-400"
                  >
                    Save Activity
                  </button>
                </div>
              </form>
            )}

            {/* Activities List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(!issuer.activities || issuer.activities.length === 0) ? (
                <p className="text-xs text-[#8892A6] italic py-2">No activity logged yet. Click "Log Activity" to record calls, emails, or meetings.</p>
              ) : (
                issuer.activities.map((act, idx) => (
                  <div key={act.id || idx} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#1B2030] bg-[#07080B] text-xs">
                    <div className="p-1 rounded-lg bg-[#1B2030] shrink-0 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#E8ECF4] font-semibold">{act.title}</strong>
                        <span className="text-[10px] text-[#8892A6] font-mono">{act.date}</span>
                      </div>
                      {act.text && <p className="text-[#8892A6] text-[11px] mt-0.5">{act.text}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Log */}
          <div className="rounded-2xl border border-[#1B2030] bg-[#0F1218] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8892A6] flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span>Executive CRM Notes</span>
            </h3>

            <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Add confidential notes, discussions, next steps..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 rounded-xl border border-[#1B2030] bg-[#07080B] px-3 py-2 text-xs text-[#E8ECF4] placeholder-[#8892A6]/50 focus:border-cyan-400/50 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {(!issuer.notes || issuer.notes.length === 0) ? (
                <p className="text-xs text-[#8892A6] italic py-2">No notes added yet.</p>
              ) : (
                issuer.notes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-[#1B2030] bg-[#07080B] text-xs">
                    <p className="text-[#E8ECF4]">{note.text}</p>
                    <span className="text-[10px] text-[#8892A6] font-mono mt-1 block">{note.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Quick Action */}
        <div className="pt-6 mt-6 border-t border-[#1B2030] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8892A6]">Status:</span>
            <select
              value={issuer.status || "new"}
              onChange={(e) => onUpdateStatus(issuer.id, e.target.value)}
              className="rounded-xl border border-[#1B2030] bg-[#0F1218] px-3 py-2 text-xs font-semibold text-[#E8ECF4] focus:border-cyan-400/50 focus:outline-none cursor-pointer"
            >
              <option value="new">New Issuer</option>
              <option value="queued">Queued for Outreach</option>
              <option value="contacted">Contacted / Email Sent</option>
              <option value="discussion">In Discussion</option>
            </select>
          </div>

          <button
            onClick={() => onOpenEmailModal(issuer)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2.5 text-xs font-black text-[#07080B] hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Generate Strategic Pitch</span>
          </button>
        </div>

      </div>
    </div>
  );
}
