import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import MissionControl from './components/MissionControl.jsx';
import LiveAgentConsole from './components/LiveAgentConsole.jsx';
import PlaywrightGenerator from './components/PlaywrightGenerator.jsx';
import ResearchDossier from './components/ResearchDossier.jsx';
import { PRESETS } from './data/presets.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('control'); // 'control', 'arena', 'scripts', 'research'
  const [selectedPresetId, setSelectedPresetId] = useState(PRESETS[0].id);
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  
  const [missionConfig, setMissionConfig] = useState({
    targetUrl: PRESETS[0].targetUrl,
    username: PRESETS[0].defaultUsername,
    password: 'ClientVaultPassword#2026',
    objective: PRESETS[0].objective,
    strategy: 'statutory',
    tacticName: PRESETS[0].tactic,
    batna: PRESETS[0].batna,
    chatWidgetType: 'auto'
  });

  const [sessionStats, setSessionStats] = useState({
    isActive: false,
    sessionsCompleted: 1,
    totalSettled: 145
  });

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setActivePreset(preset);
    setMissionConfig({
      targetUrl: preset.targetUrl,
      username: preset.defaultUsername,
      password: 'ClientVaultPassword#2026',
      objective: preset.objective,
      strategy: preset.id === 'saas_renewal_negotiation' ? 'harvard' : (preset.id === 'airline_dot_refund' ? 'statutory' : 'escalation'),
      tacticName: preset.tactic,
      batna: preset.batna,
      chatWidgetType: 'auto'
    });
  };

  const handleStartMission = () => {
    setSessionStats(prev => ({ ...prev, isActive: true }));
    setActiveTab('arena');
  };

  const handleRestartMission = () => {
    setActiveTab('arena');
  };

  const handleExportDossier = () => {
    const reportContent = `# ARGUEBOT • Autonomous Web Agent & Negotiation Engine Dossier
Generated: ${new Date().toISOString()}

## Target Configuration
- Target URL: ${missionConfig.targetUrl}
- Account Username: ${missionConfig.username}
- Negotiation Objective: ${missionConfig.objective}
- Strategic Tactic: ${missionConfig.tacticName}
- BATNA (Walk-away terms): ${missionConfig.batna}

## Architectural Research Summary
1. Browser-Use (Python / Agent-First): Autonomous goal-driven multi-step loop.
2. Stagehand (TypeScript / Hybrid): AI primitives (act, extract, observe) over Playwright.
3. Accessibility Tree (A11y): 85% token reduction via CDP semantic @e nodes.
4. Harvard Principled Negotiation: Objective standards and BATNA leverage.
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ARGUEBOT_RESEARCH_DOSSIER.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Bar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionStats={sessionStats}
        onExportDossier={handleExportDossier}
      />

      {/* Main Mission Workspace */}
      <main style={{ maxWidth: '1480px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        
        {activeTab === 'control' && (
          <MissionControl 
            missionConfig={missionConfig}
            setMissionConfig={setMissionConfig}
            onStartMission={handleStartMission}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {activeTab === 'arena' && (
          <LiveAgentConsole 
            missionConfig={missionConfig}
            activePreset={activePreset}
            onRestartMission={handleRestartMission}
            onNavigateToScripts={() => setActiveTab('scripts')}
          />
        )}

        {activeTab === 'scripts' && (
          <PlaywrightGenerator 
            missionConfig={missionConfig}
          />
        )}

        {activeTab === 'research' && (
          <ResearchDossier 
            onExportDossier={handleExportDossier}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 20px', background: '#03050c', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
        ARGUEBOT • Autonomous Web Agent & AI Negotiation Engine • Powered by Playwright, Browser-Use, and Stagehand Principles • Isolated Clean Build
      </footer>

    </div>
  );
}
