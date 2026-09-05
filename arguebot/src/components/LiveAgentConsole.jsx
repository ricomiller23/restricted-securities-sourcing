import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Shield, CheckCircle2, AlertTriangle, Send, 
  Terminal, Play, Pause, RotateCcw, Award, ChevronRight, 
  MessageSquare, User, Bot, Sparkles, Sliders, ExternalLink, Lock, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LiveAgentConsole({ 
  missionConfig, 
  activePreset, 
  onRestartMission,
  onNavigateToScripts 
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentThought, setCurrentThought] = useState('');
  const [goalProgress, setGoalProgress] = useState(15);
  const [browserState, setBrowserState] = useState({
    phase: 'navigating', // 'navigating', 'authenticating', 'locating_chat', 'chatting', 'completed'
    statusText: `Navigating to ${missionConfig.targetUrl || 'target platform'}...`,
    activeElement: 'body',
    accessibilityTreeVisible: false
  });
  const [userInterventionText, setUserInterventionText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatScrollRef = useRef(null);

  const dialogue = activePreset?.dialogueTree || [
    {
      agentThought: 'Navigating to chat interface. Formulating opening demand based on defined objective.',
      agentMessage: `Hello, I am reaching out regarding account under ${missionConfig.username || 'user'}. My objective: ${missionConfig.objective}`,
      counterThought: 'Customer inquiry received.',
      counterResponse: "Thank you for contacting customer support. How can I assist you with this today?",
      goalDelta: 30
    },
    {
      agentThought: `Counterparty acknowledged. Deploying ${missionConfig.tacticName || 'Statutory Lever'} tactic to establish legal leverage.`,
      agentMessage: `As previously communicated, I require formal resolution of: ${missionConfig.objective}. Under standard commercial terms, this resolution is warranted immediately.`,
      counterThought: 'Customer is assertive. Checking supervisor options.',
      counterResponse: "I understand your position. Let me review what options are available in our system.",
      goalDelta: 70
    },
    {
      agentThought: 'Counterparty is checking supervisor exceptions. Applying BATNA escalation leverage.',
      agentMessage: `Thank you. Please ensure the full resolution is applied today to settle the matter conclusively: ${missionConfig.batna ? 'Otherwise, my directive is to proceed with: ' + missionConfig.batna : 'Thank you for your assistance.'}`,
      counterThought: 'Settlement authorized.',
      counterResponse: "Good news: I have received approval to grant your request in full! The adjustment has been applied and your confirmation code is #AG-882910.",
      goalDelta: 100
    }
  ];

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentThought, isTyping]);

  // Initial Browser Lifecycle (Navigate -> Auth -> Find Chat)
  useEffect(() => {
    let t1, t2, t3;
    
    // Step 1: Navigating
    setBrowserState(prev => ({
      ...prev,
      phase: 'navigating',
      statusText: `Navigating to ${missionConfig.targetUrl}...`
    }));

    // Step 2: Auth after 1.2s
    t1 = setTimeout(() => {
      setBrowserState(prev => ({
        ...prev,
        phase: 'authenticating',
        statusText: `Auto-authenticating at login gate (AES-GCM credentials injected for ${missionConfig.username || 'user'})...`,
        activeElement: 'input#username, input#password'
      }));
    }, 1200);

    // Step 3: Locate Chat after 2.6s
    t2 = setTimeout(() => {
      setBrowserState(prev => ({
        ...prev,
        phase: 'locating_chat',
        statusText: `Scanning DOM & Accessibility Tree: Intercepted #live-chat-frame [Chat Widget Active]`,
        activeElement: '#live-chat-frame'
      }));
    }, 2600);

    // Step 4: Start Chat sequence after 4.0s
    t3 = setTimeout(() => {
      setBrowserState(prev => ({
        ...prev,
        phase: 'chatting',
        statusText: `Interacting in real time with counterparty representative...`,
        activeElement: '[contenteditable="true"]'
      }));
      triggerNextDialogueStep(0);
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Execution Step Trigger
  const triggerNextDialogueStep = (stepIdx) => {
    if (stepIdx >= dialogue.length) {
      // Goal achieved!
      setGoalProgress(100);
      setBrowserState(prev => ({
        ...prev,
        phase: 'completed',
        statusText: 'Mission Accomplished: Objective 100% Satisfied by Counterparty!'
      }));
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      return;
    }

    const currentTurn = dialogue[stepIdx];
    
    // 1. Show ArgueBot's inner monologue thought
    setCurrentThought(currentTurn.agentThought);
    setIsTyping(true);

    // 2. ArgueBot delivers message after typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'arguebot',
          name: 'ArgueBot (Autonomous Agent)',
          text: currentTurn.agentMessage,
          thought: currentTurn.agentThought,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
      setGoalProgress(currentTurn.goalDelta);

      // 3. Counterparty responds after reading delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'counterparty',
            name: activePreset?.name?.split(' ')[0] + ' Support Desk',
            text: currentTurn.counterResponse,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
        
        setCurrentStepIndex(stepIdx + 1);

        // Continue next turn if still running
        if (isRunning && stepIdx + 1 < dialogue.length) {
          setTimeout(() => {
            triggerNextDialogueStep(stepIdx + 1);
          }, 2400);
        } else if (stepIdx + 1 >= dialogue.length) {
          // Finished
          setGoalProgress(100);
          setBrowserState(prev => ({
            ...prev,
            phase: 'completed',
            statusText: 'Mission Accomplished: Objective 100% Satisfied by Counterparty!'
          }));
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }, 2000);

    }, 1800);
  };

  // User Injects Real-Time Advice/Intervention
  const handleSendIntervention = () => {
    if (!userInterventionText.trim()) return;
    
    const userText = userInterventionText.trim();
    setUserInterventionText('');

    // Insert user whisper into stream
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'system',
        name: 'Tactical Whisper Injected by User',
        text: `DIRECTIVE: "${userText}"`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);

    // Bot dynamically incorporates the user's advice into its next thought and response
    setTimeout(() => {
      setCurrentThought(`User directive received: "${userText}". Incorporating directly into current stance and leverage.`);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'arguebot',
            name: 'ArgueBot (Directive Applied)',
            text: `Additionally, as per our instructions: ${userText}. We expect this to be codified in the final resolution.`,
            thought: `Injected user guidance: ${userText}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
      }, 1500);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Mission Status Bar & Goal Meter */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="live-indicator"></span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  {activePreset?.name || 'Autonomous Mission Session'}
                </span>
                <span className={`badge ${goalProgress === 100 ? 'badge-green' : 'badge-cyan'}`}>
                  {goalProgress === 100 ? 'SETTLED & WON' : 'IN NEGOTIATION'}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Target: <span className="font-mono" style={{ color: '#60a5fa' }}>{missionConfig.targetUrl}</span> • Auth: <span className="font-mono">{missionConfig.username || 'user'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>GOAL SATISFACTION</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: goalProgress === 100 ? '#34d399' : '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {goalProgress}%
              </div>
            </div>

            <button 
              className="btn btn-secondary"
              onClick={onRestartMission}
              style={{ minHeight: '34px', padding: '6px 12px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Restart
            </button>
          </div>
        </div>

        {/* Goal Progress Bar */}
        <div className="goal-meter-bar">
          <div className="goal-meter-fill" style={{ width: `${goalProgress}%` }}></div>
        </div>
      </div>

      {/* Main Dual Console: Browser Viewport & Real-Time Argumentation Stream */}
      <div className="mission-grid" style={{ gridTemplateColumns: 'minmax(320px, 420px) 1fr' }}>
        
        {/* Left Pane: Simulated Visual Browser Viewport & CDP Engine */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Browser Address Bar */}
          <div style={{ background: '#070b16', padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>

            <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }} className="font-mono">
              <Lock size={10} color="#10b981" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {missionConfig.targetUrl}
              </span>
            </div>

            <button 
              className="btn btn-secondary"
              style={{ padding: '4px 6px', minHeight: 'auto', fontSize: '10px' }}
              onClick={() => setBrowserState(prev => ({ ...prev, accessibilityTreeVisible: !prev.accessibilityTreeVisible }))}
              title="Toggle Accessibility Tree Snapshot"
            >
              <Eye size={12} /> {browserState.accessibilityTreeVisible ? 'DOM' : 'A11y'}
            </button>
          </div>

          {/* Viewport Canvas */}
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Real-time State Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '11.5px' }}>
              <span style={{ color: '#22d3ee', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={13} /> {browserState.phase.toUpperCase()}
              </span>
              <span className="font-mono" style={{ fontSize: '10px', color: '#94a3b8' }}>
                CDP: Active
              </span>
            </div>

            {/* Simulated Web DOM Rendering or Accessibility Tree Snapshot */}
            {!browserState.accessibilityTreeVisible ? (
              <div style={{ background: '#080d1a', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700 }}>
                    {activePreset?.name?.split(' ')[0] || 'Target'} Live Customer Portal
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '9px' }}>SSL Verified</span>
                </div>

                {/* Status Box */}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #06b6d4' }}>
                  <strong>Agent Action:</strong> {browserState.statusText}
                </div>

                {/* Mocked Target DOM Interactive Elements */}
                <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10.5px' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>ACTIVE DOM TARGETS DETECTED:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className="font-mono">
                    <div style={{ color: browserState.phase === 'authenticating' ? '#34d399' : '#64748b' }}>
                      ● input#username, input#password (Auth Form)
                    </div>
                    <div style={{ color: browserState.phase === 'locating_chat' ? '#38bdf8' : '#64748b' }}>
                      ● iframe#live-chat-frame (Messenger Widget)
                    </div>
                    <div style={{ color: browserState.phase === 'chatting' ? '#22d3ee' : '#64748b' }}>
                      ● textarea[aria-label="Type message..."]
                    </div>
                    <div style={{ color: browserState.phase === 'completed' ? '#10b981' : '#64748b' }}>
                      ● div.resolution-confirmed (Confirmation Token)
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Accessibility Tree Snapshot (Browser-Use / Stagehand pattern) */
              <div className="cyber-terminal" style={{ flex: 1, minHeight: '260px' }}>
                <div className="terminal-header">
                  <span>SEMANTIC ACCESSIBILITY TREE (@e nodes)</span>
                  <span style={{ color: '#34d399' }}>Tokens: 242 (85% savings)</span>
                </div>
                <div className="terminal-body" style={{ fontSize: '11px' }}>
                  <div>@e1 [RootWebArea] "{activePreset?.name || 'Support Portal'}"</div>
                  <div>  @e2 [Banner] Navigation Header</div>
                  <div>  @e3 [Navigation] Account Menu</div>
                  <div>  @e4 [Form] Authentication Gate [Status: Validated]</div>
                  <div>    @e5 [TextBox] "{missionConfig.username || 'user'}" (autofilled)</div>
                  <div>    @e6 [Button] "Sign In" [Clicked]</div>
                  <div>  @e7 [Complementary] Live Support Widget (#chat-frame)</div>
                  <div>    @e8 [Heading] "Customer Resolution Desk"</div>
                  <div>    @e9 [Log] Chat Messages Container</div>
                  <div>    @e10 [TextBox] Active Message Input Focus</div>
                  <div>    @e11 [Button] "Send Message" [Action Ready]</div>
                </div>
              </div>
            )}

            {/* Playwright Script Shortcut */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Need standalone execution?</span>
              <button 
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px', minHeight: '28px' }}
                onClick={onNavigateToScripts}
              >
                Export Playwright Script <ChevronRight size={12} />
              </button>
            </div>

          </div>

        </div>

        {/* Right Pane: Live Interactive Chatroom & Cognitive Reasoning Trace */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
          
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="#06b6d4" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                Real-Time Argumentation & Dispute Stream
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-purple font-mono">
                Strategy: {missionConfig.tacticName || 'Statutory Lever'}
              </span>
            </div>
          </div>

          {/* Active Cognitive Thought Trace (Agent Inner Monologue) */}
          {currentThought && (
            <div style={{ padding: '10px 16px', background: 'rgba(139, 92, 246, 0.08)', borderBottom: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                <Bot size={13} /> ArgueBot Cognitive Reasoning (Inner Monologue):
              </div>
              <div style={{ fontSize: '12px', color: '#e9d5ff', marginTop: '3px', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{currentThought}"
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="chat-stream" ref={chatScrollRef} style={{ flex: 1 }}>
            
            {/* System Start Notice */}
            <div className="chat-bubble-system">
              Agent intercepted chat session. Mandate: <strong>{missionConfig.objective}</strong>
            </div>

            {messages.map(msg => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="chat-bubble-system" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#67e8f9' }}>
                    {msg.text}
                  </div>
                );
              }

              const isAgent = msg.sender === 'arguebot';
              return (
                <div 
                  key={msg.id} 
                  className={isAgent ? 'chat-bubble chat-bubble-agent' : 'chat-bubble chat-bubble-target'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '4px', fontSize: '10.5px' }}>
                    <span style={{ fontWeight: 700, color: isAgent ? '#38bdf8' : '#cbd5e1' }}>
                      {isAgent ? '⚔️ ArgueBot' : '👤 ' + msg.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>
                      {msg.time}
                    </span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble chat-bubble-agent" style={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span className="live-indicator" style={{ width: '6px', height: '6px' }}></span>
                <span>ArgueBot is formulating counter-argument...</span>
              </div>
            )}

            {/* Completion Banner */}
            {goalProgress === 100 && (
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.35)', textAlign: 'center', margin: '10px 0' }}>
                <div style={{ display: 'inline-flex', padding: '8px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', marginBottom: '6px' }}>
                  <Award size={24} color="#34d399" />
                </div>
                <h4 style={{ fontSize: '15px', color: '#ffffff', fontWeight: 800 }}>OBJECTIVE ACHIEVED & SETTLED!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  The counterparty has satisfied 100% of your terms. Transcript and confirmation verified.
                </p>
              </div>
            )}

          </div>

          {/* User Real-Time Intervention Input Bar */}
          <div style={{ padding: '12px 16px', background: '#070c17', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '12.5px', minHeight: '38px' }}
                placeholder="Whisper tactical advice into ArgueBot's ear in real-time (e.g. 'Demand supervisor waiver')..."
                value={userInterventionText}
                onChange={e => setUserInterventionText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendIntervention(); }}
              />
              <button 
                className="btn btn-primary"
                onClick={handleSendIntervention}
                style={{ minHeight: '38px', padding: '0 16px' }}
              >
                <Send size={13} /> Whisper
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <span>Autonomous loop active. Type above to steer the agent's next argument mid-stream.</span>
              <span style={{ color: '#10b981' }}>● Live Interception Ready</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
