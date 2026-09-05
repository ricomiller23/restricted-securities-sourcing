import React, { useState } from 'react';
import { 
  Globe, Lock, ShieldCheck, Target, ArrowRight, ArrowLeft, Sparkles, 
  Key, Eye, EyeOff, CheckCircle2, AlertCircle, FileText, Swords, Sliders,
  HelpCircle, RefreshCw
} from 'lucide-react';
import { PRESETS } from '../data/presets.js';

export default function MissionControl({ 
  missionConfig, 
  setMissionConfig, 
  onStartMission, 
  selectedPresetId, 
  onSelectPreset 
}) {
  // Current Q&A Step: 1 = Target URL, 2 = Login Credentials, 3 = Problem & Goal, 4 = Strategy & Deploy
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [noAuthNeeded, setNoAuthNeeded] = useState(false);

  const strategies = [
    { id: 'statutory', name: 'Statutory Regulatory Lever', desc: 'Cites federal statutes, FTC/FCC regulations, DOT rules, and consumer protection codes.' },
    { id: 'harvard', name: 'Harvard Principled Negotiation', desc: 'Fisher & Ury method: separate people from problem, focus on interests, invent mutual options.' },
    { id: 'escalation', name: 'Empathetic Multi-Tier Escalation', desc: 'Patience -> Firmness -> Demand for Tier-2 Supervisor override.' },
    { id: 'adversarial', name: 'Adversarial Logic Trap', desc: 'Pinpoint counterparty contradictions, expose company policy vs law, apply maximum pressure.' },
    { id: 'boulware', name: 'Boulware Firm Take-It-Or-Leave-It', desc: 'Anchors unbudgingly on fair price with credible walk-away alternative (BATNA).' }
  ];

  const handleApplyPreset = (preset) => {
    onSelectPreset(preset);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Step-by-Step Progress Stepper */}
      <div className="qa-stepper">
        <div 
          className={`qa-step-item ${currentStep === 1 ? 'qa-step-active' : ''} ${currentStep > 1 ? 'qa-step-completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <div className="qa-step-circle">
            {currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 1 ? '#38bdf8' : '#ffffff' }}>
              1. Target URL
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Where to argue
            </div>
          </div>
        </div>

        <div 
          className={`qa-step-item ${currentStep === 2 ? 'qa-step-active' : ''} ${currentStep > 2 ? 'qa-step-completed' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <div className="qa-step-circle">
            {currentStep > 2 ? <CheckCircle2 size={16} /> : '2'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 2 ? '#38bdf8' : '#ffffff' }}>
              2. Credentials
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Login & authentication
            </div>
          </div>
        </div>

        <div 
          className={`qa-step-item ${currentStep === 3 ? 'qa-step-active' : ''} ${currentStep > 3 ? 'qa-step-completed' : ''}`}
          onClick={() => setCurrentStep(3)}
        >
          <div className="qa-step-circle">
            {currentStep > 3 ? <CheckCircle2 size={16} /> : '3'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 3 ? '#38bdf8' : '#ffffff' }}>
              3. Problem & Goal
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Grievance & settlement
            </div>
          </div>
        </div>

        <div 
          className={`qa-step-item ${currentStep === 4 ? 'qa-step-active' : ''}`}
          onClick={() => setCurrentStep(4)}
        >
          <div className="qa-step-circle">
            4
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 4 ? '#38bdf8' : '#ffffff' }}>
              4. Strategy & Deploy
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Tactic & launch
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION 1: TARGET URL */}
      {currentStep === 1 && (
        <div className="glass-panel qa-question-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="badge badge-cyan font-mono">QUESTION 1 OF 4 • TARGET PLATFORM</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step 1 / 4</span>
          </div>

          <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '6px' }}>
            Where should ArgueBot log on and argue for you?
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: 1.5 }}>
            Enter the website URL, customer portal, or chatroom link where the dispute or negotiation needs to take place. 
            ArgueBot will navigate to this site and scan for the live chat widget.
          </p>

          <div className="form-group">
            <label className="form-label">
              <span>Target Website URL</span>
              <span style={{ color: '#34d399', fontSize: '11px' }}>● Playwright Target</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                className="form-input font-mono"
                style={{ fontSize: '14.5px', padding: '12px 14px' }}
                placeholder="https://customer-service.example.com/live-chat"
                value={missionConfig.targetUrl}
                onChange={e => setMissionConfig({ ...missionConfig, targetUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Preset Quick Fill Chips */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="#06b6d4" /> Or choose from battle-tested dispute scenario templates:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`btn btn-secondary ${selectedPresetId === p.id ? 'nav-tab-active' : ''}`}
                  style={{ fontSize: '11.5px', padding: '6px 12px', minHeight: '32px' }}
                  onClick={() => handleApplyPreset(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px' }}
              onClick={() => setCurrentStep(2)}
            >
              Continue to Login Credentials <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* QUESTION 2: LOGIN CREDENTIALS */}
      {currentStep === 2 && (
        <div className="glass-panel qa-question-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="badge badge-green font-mono">QUESTION 2 OF 4 • AUTHENTICATION GATE</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step 2 / 4</span>
          </div>

          <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '6px' }}>
            What are your login credentials for this website?
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: 1.5 }}>
            ArgueBot will navigate to the site's authentication gate and inject these credentials. 
            Credentials are encrypted in client-side memory using AES-GCM and never shared or sent to third parties.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox"
                checked={noAuthNeeded}
                onChange={e => setNoAuthNeeded(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
              />
              <span>This site does not require a login (Guest chat / Public support portal)</span>
            </label>
          </div>

          {!noAuthNeeded ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Username / Account Email</span>
                </label>
                <input 
                  type="text"
                  className="form-input font-mono"
                  placeholder="user.account@domain.com"
                  value={missionConfig.username}
                  onChange={e => setMissionConfig({ ...missionConfig, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Password</span>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px' }}
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />} {showPassword ? 'Hide' : 'Show'}
                  </button>
                </label>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="form-input font-mono"
                  placeholder="••••••••••••••••"
                  value={missionConfig.password}
                  onChange={e => setMissionConfig({ ...missionConfig, password: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '12.5px', color: '#67e8f9' }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              <span>Guest Chat Mode Enabled: ArgueBot will skip login gates and proceed directly to scanning for the live chat widget.</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '11.5px', color: '#34d399' }}>
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>Zero-Knowledge Credential Vault: Credentials remain isolated in your browser's execution memory and Playwright context.</span>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft size={14} /> Back to Target URL
            </button>
            <button 
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px' }}
              onClick={() => setCurrentStep(3)}
            >
              Continue to Problem Description <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* QUESTION 3: PROBLEM DESCRIPTION & OBJECTIVE */}
      {currentStep === 3 && (
        <div className="glass-panel qa-question-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="badge badge-amber font-mono">QUESTION 3 OF 4 • GRIEVANCE & OBJECTIVE</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step 3 / 4</span>
          </div>

          <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '6px' }}>
            What is the problem, and what specific outcome do you want ArgueBot to accomplish?
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: 1.5 }}>
            State the exact grievance and settlement terms. ArgueBot will engage the counterparty in real time, 
            parrying boilerplate deflections and continuing until this objective is satisfied.
          </p>

          {/* Problem Description */}
          <div className="form-group">
            <label className="form-label">
              <span>Detailed Description of the Problem / Grievance</span>
            </label>
            <textarea 
              className="form-textarea"
              rows={3}
              placeholder="e.g. My statement includes a $145 unreturned modem fee despite returning it on July 14th with receipt TR-8812, plus an unnotified $30 monthly rate increase..."
              value={missionConfig.problemDescription || missionConfig.objective}
              onChange={e => setMissionConfig({ ...missionConfig, problemDescription: e.target.value })}
            />
          </div>

          {/* Target Settlement Objective */}
          <div className="form-group">
            <label className="form-label">
              <span>Settlement Mandate (What You Want ArgueBot to Win)</span>
              <span className="badge badge-amber" style={{ fontSize: '9px' }}>CORE GOAL</span>
            </label>
            <textarea 
              className="form-textarea"
              rows={2}
              placeholder="e.g. Immediate 100% waiver of the $145.00 fee, reinstatement of previous $70 monthly rate, and formal confirmation code."
              value={missionConfig.objective}
              onChange={e => setMissionConfig({ ...missionConfig, objective: e.target.value })}
            />
          </div>

          {/* BATNA / Escalation Fallback */}
          <div className="form-group">
            <label className="form-label">
              <span>BATNA / Escalation Consequence (If Counterparty Resists)</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. File informal FCC complaint with chat transcript, initiate card chargeback, or file Small Claims complaint"
              value={missionConfig.batna}
              onChange={e => setMissionConfig({ ...missionConfig, batna: e.target.value })}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ArgueBot uses this as leverage when representatives attempt to hide behind "company policy".
            </span>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft size={14} /> Back to Credentials
            </button>
            <button 
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px' }}
              onClick={() => setCurrentStep(4)}
            >
              Continue to Strategy & Review <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* QUESTION 4: STRATEGY & DEPLOY */}
      {currentStep === 4 && (
        <div className="glass-panel qa-question-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="badge badge-purple font-mono">QUESTION 4 OF 4 • STRATEGY & LAUNCH</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step 4 / 4</span>
          </div>

          <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '6px' }}>
            Review your mission plan and select ArgueBot's tactical stance
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            Everything is set. Choose the rhetorical framework for this engagement and deploy ArgueBot into the live arena.
          </p>

          {/* Mission Review Summary Card */}
          <div style={{ background: '#090e1c', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11.5px', color: '#60a5fa', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📋 Mission Summary Brief
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Target: </span>
                <strong className="font-mono" style={{ color: '#ffffff' }}>{missionConfig.targetUrl}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Account: </span>
                <strong className="font-mono" style={{ color: '#ffffff' }}>{noAuthNeeded ? 'Guest (No Auth)' : (missionConfig.username || 'User')}</strong>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Objective: </span>
                <strong style={{ color: '#34d399' }}>{missionConfig.objective}</strong>
              </div>
              {missionConfig.batna && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Escalation Threat (BATNA): </span>
                  <span style={{ color: '#f59e0b' }}>{missionConfig.batna}</span>
                </div>
              )}
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">
              <span>Select Argumentation Stance</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {strategies.map(s => {
                const isSelected = missionConfig.strategy === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setMissionConfig({ ...missionConfig, strategy: s.id, tacticName: s.name })}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#ffffff' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                      {s.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Navigation & Launch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentStep(3)}
            >
              <ArrowLeft size={14} /> Back to Problem & Goal
            </button>

            <button 
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: '14.5px', minHeight: '48px', boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
              onClick={onStartMission}
            >
              <Swords size={16} /> Deploy ArgueBot & Start Argument <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
