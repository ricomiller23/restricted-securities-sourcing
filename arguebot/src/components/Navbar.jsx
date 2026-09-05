import React from 'react';
import { Shield, Swords, Terminal, Code2, BookOpen, Download, Zap, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, sessionStats, onExportDossier }) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        
        {/* Brand Block */}
        <div className="brand-block">
          <div className="brand-icon">
            <Swords size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">ARGUEBOT</span>
              <span className="brand-badge">AUTONOMOUS v3.1</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Web Agent • Credentials Auth • Real-Time Chatroom Negotiation Engine
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'control' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('control')}
          >
            <Zap size={14} /> Mission Control
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'arena' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('arena')}
          >
            <Terminal size={14} /> Live Agent Arena
            {sessionStats.isActive && (
              <span className="live-indicator" style={{ marginLeft: '4px' }}></span>
            )}
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'scripts' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('scripts')}
          >
            <Code2 size={14} /> Playwright / Browser-Use
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'research' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('research')}
          >
            <BookOpen size={14} /> Research Dossier
          </button>
        </nav>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn btn-emerald"
            onClick={onExportDossier}
            title="Export Full Dossier to ~/Downloads"
          >
            <Download size={14} /> Export Brief
          </button>
        </div>

      </div>
    </header>
  );
}
