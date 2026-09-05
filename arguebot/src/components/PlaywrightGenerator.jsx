import React, { useState } from 'react';
import { Code2, Copy, Check, Download, ExternalLink, Terminal, Sparkles, Layers } from 'lucide-react';

export default function PlaywrightGenerator({ missionConfig }) {
  const [copiedLang, setCopiedLang] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('browser_use'); // 'browser_use', 'stagehand', 'vanilla_playwright'

  const targetUrl = missionConfig.targetUrl || 'https://target-platform.com/live-support';
  const username = missionConfig.username || 'user@domain.com';
  const objective = missionConfig.objective || 'Achieve full settlement and waiver of disputed charges.';
  const strategy = missionConfig.tacticName || 'Statutory Regulatory Lever';
  const batna = missionConfig.batna || 'Escalate to formal regulatory complaint.';

  // 1. Python browser-use script
  const pythonBrowserUseScript = `"""
ARGUEBOT • Autonomous Browser-Use Agent Script
Powered by browser-use and Playwright
"""

import asyncio
from langchain_openai import ChatOpenAI
from browser_use import Agent, Controller
from browser_use.browser.browser import Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig

async def run_arguebot():
    # 1. Initialize Browser with Anti-Detection Stealth
    browser = Browser(
        config=BrowserConfig(
            headless=False,
            disable_security=False,
            extra_chromium_args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox"
            ]
        )
    )

    # 2. Define Controller and Custom Reasoning Actions
    controller = Controller()

    # 3. Initialize Autonomous LLM Brain (GPT-4o or Claude 3.5 Sonnet)
    llm = ChatOpenAI(model="gpt-4o", temperature=0.2)

    # 4. Define Autonomous Mission Task
    task_instructions = f"""
    1. Navigate to: {targetUrl}
    2. Check if a login gate or authentication modal is present.
       If login is required, input username: '{username}' and the user's password from the local vault.
       Complete any standard 2FA prompts if required.
    3. Locate the live chat / support interface on the website (e.g. Intercom, Zendesk, or inline chatroom).
    4. Initiate the chat and advance the user's defined objective:
       OBJECTIVE: "{objective}"
       TACTIC: "{strategy}"
       BATNA: "{batna}"
    5. Argue persistently in real-time. Do not accept 'company policy' deflections.
       Counter with relevant statutory and contract terms until the counterparty explicitly verifies
       satisfaction of the objective and issues a confirmation code.
    6. Return the final settlement transcript and confirmation code.
    """

    agent = Agent(
        task=task_instructions,
        llm=llm,
        controller=controller,
        browser=browser,
        use_vision=True,
        max_actions_per_step=4
    )

    # 5. Execute Autonomous Loop
    history = await agent.run(max_steps=25)
    print("\\n[ARGUEBOT FINISHED] Settlement Result:")
    print(history.final_result())

if __name__ == "__main__":
    asyncio.run(run_arguebot())
`;

  // 2. TypeScript Stagehand script
  const tsStagehandScript = `/**
 * ARGUEBOT • Autonomous Stagehand (Browserbase) Agent
 * Uses AI-driven Accessibility Tree primitives: act(), extract(), observe()
 */

import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL", // or "BROWSERBASE" for cloud sandbox
    modelName: "gpt-4o",
    verbose: 1
  });

  await stagehand.init();
  const page = stagehand.page;

  console.log("🚀 [ArgueBot] Navigating to target...");
  await page.goto("${targetUrl}");

  // 1. Autonomous Authentication
  console.log("🔑 [ArgueBot] Checking for login gate...");
  const hasLogin = await page.observe({
    instruction: "Check if there is a login or sign-in button/form on this page"
  });

  if (hasLogin.length > 0) {
    await page.act({
      action: "Log in with username '${username}' and prompt password"
    });
  }

  // 2. Locate Chat Interface
  console.log("💬 [ArgueBot] Intercepting chat widget...");
  await page.act({
    action: "Click on the live chat support button or open the customer chatroom widget"
  });

  // 3. Negotiation Loop
  let settled = false;
  let rounds = 0;
  const maxRounds = 6;

  while (!settled && rounds < maxRounds) {
    rounds++;
    console.log(\`⚡ [ArgueBot] Negotiation Turn \${rounds}...\`);

    // Act: deliver argument
    await page.act({
      action: "In the chat box, state our objective: '${objective}'. Apply tactic: '${strategy}'. Refuse fee and demand supervisor override."
    });

    // Wait for counterparty reply
    await page.waitForTimeout(4000);

    // Extract: check if counterparty satisfied objective
    const outcome = await page.extract({
      instruction: "Extract whether the representative agreed to waive/satisfy our request, and any confirmation number.",
      schema: z.object({
        agreed: z.boolean(),
        confirmationCode: z.string().optional(),
        agentNotes: z.string()
      })
    });

    console.log("📊 Counterparty Status:", outcome);

    if (outcome.agreed) {
      console.log("🎉 OBJECTIVE ACHIEVED! Confirmation Code:", outcome.confirmationCode);
      settled = true;
      break;
    }
  }

  await stagehand.close();
}

main().catch(console.error);
`;

  // 3. Vanilla Playwright Stealth Script
  const vanillaPlaywrightScript = `/**
 * ARGUEBOT • Playwright Stealth Runner with DOM Interception
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  console.log("1. Navigating to ${targetUrl}...");
  await page.goto("${targetUrl}", { waitUntil: 'domcontentloaded' });

  // Look for chat widget triggers
  const chatSelectors = [
    '#live-chat-frame', 
    'button[aria-label*="chat" i]', 
    'button[aria-label*="message" i]', 
    '.intercom-launcher', 
    '#launcher'
  ];

  for (const sel of chatSelectors) {
    if (await page.isVisible(sel).catch(() => false)) {
      console.log(\`Found chat trigger: \${sel}\`);
      await page.click(sel);
      break;
    }
  }

  console.log("Ready for interactive argument loop.");
})();
`;

  const getActiveCode = () => {
    if (selectedFramework === 'browser_use') return pythonBrowserUseScript;
    if (selectedFramework === 'stagehand') return tsStagehandScript;
    return vanillaPlaywrightScript;
  };

  const handleCopy = (lang) => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Framework Selector Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '17px', color: '#ffffff' }}>Standalone Playwright & Browser-Use Exporter</h2>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Export 100% production-ready, standalone browser automation scripts pre-configured with your target URL, credentials, and objective logic.
            </p>
          </div>

          {/* Framework Segmented Buttons */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '3px', gap: '3px' }}>
            <button
              className={`btn ${selectedFramework === 'browser_use' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
              onClick={() => setSelectedFramework('browser_use')}
            >
              Python (browser-use)
            </button>
            <button
              className={`btn ${selectedFramework === 'stagehand' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
              onClick={() => setSelectedFramework('stagehand')}
            >
              TypeScript (Stagehand)
            </button>
            <button
              className={`btn ${selectedFramework === 'vanilla_playwright' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
              onClick={() => setSelectedFramework('vanilla_playwright')}
            >
              Vanilla Playwright
            </button>
          </div>
        </div>

        {/* Quick Instructions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          <span>Install dependencies:</span>
          {selectedFramework === 'browser_use' && (
            <code className="font-mono" style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              pip install browser-use playwright langchain-openai && playwright install
            </code>
          )}
          {selectedFramework === 'stagehand' && (
            <code className="font-mono" style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              npm install @browserbasehq/stagehand zod playwright
            </code>
          )}
          {selectedFramework === 'vanilla_playwright' && (
            <code className="font-mono" style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              npm install playwright playwright-extra puppeteer-extra-plugin-stealth
            </code>
          )}
        </div>
      </div>

      {/* Code Display Terminal */}
      <div className="cyber-terminal">
        <div className="terminal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} color="#06b6d4" />
            <span style={{ fontWeight: 700, color: '#ffffff' }}>
              {selectedFramework === 'browser_use' ? 'arguebot_runner.py' : (selectedFramework === 'stagehand' ? 'arguebot_stagehand.ts' : 'playwright_stealth.js')}
            </span>
          </div>

          <button 
            className="btn btn-secondary"
            style={{ minHeight: '28px', padding: '4px 10px', fontSize: '11px' }}
            onClick={() => handleCopy(selectedFramework)}
          >
            {copiedLang === selectedFramework ? (
              <>
                <Check size={12} color="#10b981" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy size={12} /> Copy Code
              </>
            )}
          </button>
        </div>

        <pre className="terminal-body" style={{ maxHeight: '520px' }}>
          <code>{getActiveCode()}</code>
        </pre>
      </div>

    </div>
  );
}
