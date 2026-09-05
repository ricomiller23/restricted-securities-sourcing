import React, { useState } from 'react';
import { 
  Globe, Lock, ShieldCheck, Target, ArrowRight, Sparkles, 
  Key, Eye, EyeOff, Layers, Sliders, CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import { PRESETS } from '../data/presets.js';

export default function MissionControl({ 
  missionConfig, 
  setMissionConfig, 
  onStartMission, 
  selectedPresetId, 
  onSelectPreset 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [vaultLocked, setVaultLocked] = useState(true);

  const strategies = [
    { id: 'statutory', name: 'Statutory Regulatory Lever', desc: 'Cites federal statutes, FTC/FCC regulations, DOT rules, and consumer protection codes.' },
    { id: 'harvard', name: 'Harvard Principled Negotiation', desc: 'Fisher & Ury method: separate people from problem, focus on interests, invent mutual options.' },
    { id: 'escalation', name: 'Empathetic Multi-Tier Escalation', desc: 'Patience -> Firmness -> Demand for Tier-2 Supervisor override.' },
    { id: 'adversarial', name: 'Adversarial Logic Trap', desc: 'Pinpoint counterparty contradictions, expose company policy vs law, apply maximum pressure.' },
    { id: 'boulware', name: 'Boulware Firm Take-It-Or-Leave-It', desc: 'Anchors unbudgingly on fair price with credible walk-away alternative (BATNA).' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner / Preset Chips */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '17px', color: '#ffffff' }}>Target Objective & Scenario Presets</h2>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Select a battle-tested dispute scenario or configure any custom target URL, login credentials, and negotiation goal.
            </p>
          </div>
          <span className="badge badge-cyan">AUTONOMOUS DISPUTE ENGINE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {PRESETS.map(preset => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <span className="badge badge-blue" style={{ fontSize: '9.5px', alignSelf: 'flex-start' }}>
                  {preset.category}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#ffffff' }}>
                  {preset.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {preset.objective}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="mission-grid">
        
        {/* Left Column: Target & Credentials Vault */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Website Box */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="#3b82f6" /> Target Website & Chat Interface
            </h3>

            <div className="form-group">
              <label className="form-label">
                <span>Target URL / Domain</span>
                <span style={{ fontSize: '10px', color: '#34d399', textTransform: 'none' }}>Live Playwright Target</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  className="form-input font-mono"
                  placeholder="https://platform.com/live-support"
                  value={missionConfig.targetUrl}
                  onChange={e => setMissionConfig({ ...missionConfig, targetUrl: e.target.value })}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ArgueBot will navigate to this URL, observe DOM & accessibility tree, and locate the chatroom.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Chat Widget Detection Pattern</span>
              </label>
              <select 
                className="form-select font-mono"
                value={missionConfig.chatWidgetType || 'auto'}
                onChange={e => setMissionConfig({ ...missionConfig, chatWidgetType: e.target.value })}
              >
                <option value="auto">Auto-Detect (Intercom, Zendesk, Salesforce, Drift, Custom)</option>
                <option value="intercom">Intercom Messenger Frame</option>
                <option value="zendesk">Zendesk Web Widget (#launcher)</option>
                <option value="salesforce">Salesforce Embedded Service Chat</option>
                <option value="custom">Custom Inline Chat Container / Form</option>
              </select>
            </div>
          </div>

          {/* Secure Credentials Vault */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} color="#10b981" /> Authentication Vault
              </h3>
              <span className="badge badge-green" style={{ fontSize: '9.5px' }}>
                <ShieldCheck size={11} /> AES-GCM Encrypted
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Username / Email</span>
              </label>
              <input 
                type="text"
                className="form-input font-mono"
                placeholder="account.username@domain.com"
                value={missionConfig.username}
                onChange={e => setMissionConfig({ ...missionConfig, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Account Password</span>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}
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
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Credentials remain strictly in client-side memory or local browser session cookies. Never stored in plaintext.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '11px', color: '#34d399' }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
              <span>Auto-Login Injector ready: Form fills and submits credentials autonomously upon arriving at login gate.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Mission Objective & Argumentation Strategy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={17} color="#f59e0b" /> User Objective & Argumentation Mandate
            </h3>

            {/* Objective Definition */}
            <div className="form-group">
              <label className="form-label">
                <span>Primary Goal & Settlement Condition (What You Want to Win)</span>
                <span className="badge badge-amber" style={{ fontSize: '9.5px' }}>REQUIRED</span>
              </label>
              <textarea 
                className="form-textarea"
                rows={3}
                placeholder="e.g. Waive the $145 unreturned equipment charge, reinstate previous $70 monthly rate, and obtain confirmation code..."
                value={missionConfig.objective}
                onChange={e => setMissionConfig({ ...missionConfig, objective: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ArgueBot will interact in real-time until the counterparty explicitly verifies and satisfies this objective.
              </span>
            </div>

            {/* Rhetorical Strategy Selector */}
            <div className="form-group">
              <label className="form-label">
                <span>Rhetorical Strategy & Argumentation Protocol</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {strategies.map(s => {
                  const isSelected = missionConfig.strategy === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setMissionConfig({ ...missionConfig, strategy: s.id, tacticName: s.name })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#ffffff' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                        {s.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BATNA & Walk-Away Terms */}
            <div className="form-group">
              <label className="form-label">
                <span>BATNA (Best Alternative to a Negotiated Agreement / Escalation Threat)</span>
              </label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. File informal FCC/FTC complaint, dispute via credit card chargeback, or file in Small Claims court"
                value={missionConfig.batna}
                onChange={e => setMissionConfig({ ...missionConfig, batna: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Used strategically by ArgueBot when meeting obstinate resistance or "company policy" dead ends.
              </span>
            </div>

            {/* Launch CTA */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Status: <strong style={{ color: '#10b981' }}>Autonomous Loop Ready</strong> • Real-Time Interception Enabled
              </div>

              <button 
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px', minHeight: '46px', boxShadow: '0 0 25px rgba(6, 182, 212, 0.45)' }}
                onClick={onStartMission}
              >
                Launch Autonomous ArgueBot <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
