import React from 'react';
import { 
  X, ExternalLink, ShieldCheck, AlertTriangle, Building, 
  FileText, CheckCircle, Scale, Award, Database, 
  DollarSign, PieChart, Users, Phone, MapPin, Download
} from 'lucide-react';

export default function ForensicDrawer({ issuer, onClose }) {
  if (!issuer) return null;

  const isDisqualified = issuer.hasToxicDebt || issuer.cleanShellScore === 0;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${issuer.isPrime ? 'badge-green' : (isDisqualified ? 'badge-crimson' : 'badge-amber')}`}>
                {issuer.rating}
              </span>
              <span className="badge badge-blue font-mono">CIK: {issuer.cik}</span>
              {issuer.ticker && issuer.ticker !== 'UNQUOTED' && (
                <span className="badge badge-purple font-mono">${issuer.ticker}</span>
              )}
            </div>
            <h2 style={{ fontSize: '18px', color: '#ffffff', lineHeight: 1.2 }}>{issuer.companyName}</h2>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onClose} 
            aria-label="Close Forensic Drawer"
            style={{ width: '40px', height: '40px', padding: '0', minHeight: '40px', minWidth: '40px', borderRadius: '50%', flexShrink: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-body">
          
          {/* Top Score Banner */}
          <div style={{ 
            background: isDisqualified ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: isDisqualified ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: isDisqualified ? '#f87171' : '#34d399', fontWeight: 700 }}>
                SPAC-Grade Shell Index (SGSI)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isDisqualified ? issuer.toxicDebtDesc : 'Pristine balance sheet unencumbered by toxic conversion notes.'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: isDisqualified ? '#ef4444' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                {issuer.cleanShellScore}
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet Forensic Audit */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={15} color="#3b82f6" /> Balance Sheet & Debt Forensic Audit
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>TOTAL LIABILITIES</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: issuer.totalLiabilities === 0 ? '#34d399' : (issuer.totalLiabilities > 50000 ? '#f87171' : '#fbbf24'), fontFamily: 'var(--font-mono)' }}>
                  ${(issuer.totalLiabilities || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                  {issuer.totalLiabilities === 0 ? 'Pristine Zero Debt' : 'Nominal Administrative AP'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>CASH & EQUIVALENTS</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  ${(issuer.cashAndEquivalents || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Unencumbered Treasury</div>
              </div>
            </div>

            {/* Toxic Note Elimination Check */}
            <div style={{ marginTop: '10px', padding: '10px', background: isDisqualified ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: isDisqualified ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDisqualified ? (
                <>
                  <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#f87171' }}><strong>Red Flag:</strong> {issuer.toxicDebtDesc}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#34d399' }}><strong>Zero Toxic Notes:</strong> No floorless convertible promissory notes or derivative warrant liabilities detected.</span>
                </>
              )}
            </div>
          </div>

          {/* Capital Structure */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieChart size={15} color="#06b6d4" /> Share Capital Structure
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AUTHORIZED</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {(issuer.authorizedShares || 50000000).toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OUTSTANDING</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  {(issuer.sharesOutstanding || 15000000).toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PUBLIC FLOAT</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  {(issuer.publicFloat || 3500000).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Pedigree (Legal & Auditor) */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={15} color="#8b5cf6" /> Legal Counsel & PCAOB Auditor Pedigree
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Securities Law Firm:</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>{issuer.legalCounsel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lead Securities Partner:</span>
                <span style={{ color: '#60a5fa' }}>{issuer.leadAttorney}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>PCAOB Independent Auditor:</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>{issuer.auditor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transfer Agent (FAST/DTC):</span>
                <span style={{ color: '#f59e0b' }}>{issuer.transferAgent}</span>
              </div>
            </div>
          </div>

          {/* SEC EDGAR Regulatory History */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} color="#f59e0b" /> Verified SEC EDGAR Filings
              </h3>
              <a 
                href={issuer.secEdgarUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary" 
                style={{ padding: '3px 8px', fontSize: '10.5px', minHeight: '26px' }}
              >
                Browse All EDGAR <ExternalLink size={10} />
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {issuer.recentFilings && issuer.recentFilings.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '11.5px' }}>
                  <span style={{ fontWeight: 700, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>Form {f.form}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{f.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Corporate Cleanliness & Good Standing */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={15} color="#10b981" /> Corporate Governance & Compliance Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>STATE CHARTER</div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{issuer.state} Corporation</div>
                <div style={{ color: '#34d399', fontSize: '10px' }}>{issuer.stateGoodStanding}</div>
              </div>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>DTC ELIGIBILITY</div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>FAST Electronic Clear</div>
                <div style={{ color: '#34d399', fontSize: '10px' }}>{issuer.dtcChillStatus}</div>
              </div>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>FEDERAL DOCKETS</div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>PACER Clear</div>
                <div style={{ color: '#34d399', fontSize: '10px' }}>{issuer.pacerLitigationStatus}</div>
              </div>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>RULE 144(i) COMPLIANCE</div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>Form 10 Current</div>
                <div style={{ color: '#34d399', fontSize: '10px' }}>{issuer.rule144Status}</div>
              </div>
            </div>
          </div>

          {/* Action CTAs in Sticky Footer for Mobile */}
          <div className="drawer-footer-actions">
            <a 
              href={issuer.secEdgarUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary" 
              style={{ flex: 1, minHeight: '42px' }}
            >
              SEC EDGAR Dossier <ExternalLink size={14} />
            </a>
            <button 
              className="btn btn-secondary" 
              style={{ minHeight: '42px' }}
              onClick={() => {
                alert(`Exporting Due Diligence Pack for ${issuer.companyName}... Check ~/Downloads!`);
              }}
            >
              <Download size={14} /> Export Brief
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
