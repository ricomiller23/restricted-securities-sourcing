import React from 'react';
import { BookOpen, Download, Shield, Cpu, Zap, Award, Layers, Terminal, ExternalLink } from 'lucide-react';

export default function ResearchDossier({ onExportDossier }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#06b6d4" />
              <h2 style={{ fontSize: '18px', color: '#ffffff' }}>
                State-of-the-Art Research: Autonomous Web Agents & AI Argumentation
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Comprehensive synthesis of modern browser automation architectures, semantic accessibility trees, and strategic negotiation theory.
            </p>
          </div>

          <button 
            className="btn btn-emerald"
            onClick={onExportDossier}
            style={{ padding: '8px 16px', minHeight: '38px' }}
          >
            <Download size={14} /> Download Dossier to ~/Downloads
          </button>
        </div>
      </div>

      {/* Grid of Research Findings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Browser-Use vs Stagehand */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '15px', color: '#ffffff' }}>1. Agent Architecture: Browser-Use vs. Stagehand</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Modern AI browser agents have split into two dominant paradigms:
          </p>
          <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.5 }}>
            <li>
              <strong style={{ color: '#ffffff' }}>Browser-Use (Python / Agent-First):</strong> Evaluates a global goal, observes the DOM, plans multi-step actions autonomously, and self-corrects until the objective is achieved.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Stagehand (TypeScript / Hybrid Primitives):</strong> Uses AI primitives (<code className="font-mono" style={{ color: '#38bdf8' }}>act()</code>, <code className="font-mono" style={{ color: '#38bdf8' }}>extract()</code>, <code className="font-mono" style={{ color: '#38bdf8' }}>observe()</code>) wrapped around Playwright, ensuring deterministic control over authentication while allowing AI to navigate dynamic chat widgets.
            </li>
          </ul>
        </div>

        {/* Card 2: Accessibility Tree Snapshots */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '15px', color: '#ffffff' }}>2. Accessibility Tree (A11y) Token Compression</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Feeding raw HTML DOM to an LLM wastes up to 100,000+ tokens and clutters the model with non-semantic scripts and CSS.
          </p>
          <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.5 }}>
            <li>
              <strong style={{ color: '#ffffff' }}>CDP Semantic Tree Extraction:</strong> By querying the Chrome DevTools Protocol Accessibility Tree, pages are translated into interactive semantic nodes (<code className="font-mono" style={{ color: '#60a5fa' }}>@e1 [TextBox]</code>, <code className="font-mono" style={{ color: '#60a5fa' }}>@e2 [Button "Send"]</code>).
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>85% Token Reduction:</strong> Enables sub-second reasoning loops, zero selector brittleness, and precise targeting of dynamically injected chat frames.
            </li>
          </ul>
        </div>

        {/* Card 3: Multi-Agent Debate (MAD) */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '15px', color: '#ffffff' }}>3. Multi-Agent Debate (MAD) & Consensus</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Single LLMs often suffer from "concession degeneration"—subconsciously acquiescing to customer support deflections or "company policy."
          </p>
          <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.5 }}>
            <li>
              <strong style={{ color: '#ffffff' }}>Adversarial Self-Critique:</strong> ArgueBot uses an internal critic agent to evaluate every proposed reply against the user's objective before transmission.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Tit-for-Tat Stance:</strong> Matches cooperative concessions when genuine, but immediately escalates when met with automated policy stonewalling.
            </li>
          </ul>
        </div>

        {/* Card 4: Harvard Principled Negotiation */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#10b981" />
            <h3 style={{ fontSize: '15px', color: '#ffffff' }}>4. Harvard Principled Negotiation & BATNA</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Derived from Fisher & Ury's seminal Harvard Negotiation Project (<em>Getting to Yes</em>):
          </p>
          <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.5 }}>
            <li>
              <strong style={{ color: '#ffffff' }}>Separate the Person from the Problem:</strong> Maintain respectful courtesy with human customer reps while attacking the invalid billing/contract premise.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Objective Standards:</strong> Anchor demands on external statutory benchmarks (DOT 14 CFR 260, FTC Section 5, UCC 2-509) rather than subjective desire.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>BATNA Enforcement:</strong> Establish a credible walk-away threat (e.g. regulatory complaint or card dispute) that makes settlement cheaper than refusal for the counterparty.
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
