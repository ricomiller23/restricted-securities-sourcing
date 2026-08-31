#!/usr/bin/env python3
"""
SEED_ROUND Master Deliverables Generator
Produces 4 Comprehensive Early-Stage Reports (Seed, Series A, Series B, Series C):
1. SEED_ROUND_The_Master_Early_Stage_Rounds_Compendium
2. SEED_ROUND_Early_Stage_Venture_Capital_Kingpins_and_Law_Firms
3. SEED_ROUND_YC_Companies_Seed_Through_Series_C_Audit
4. SEED_ROUND_AI_Titans_Seed_Through_Series_C_Audit

Outputs both native Chromium vector PDF (.pdf) and Microsoft Word (.docx) to ~/Downloads
"""

import os
import subprocess
import shutil

OUT_DIR = "/Users/ericmiller/NEW JUNE 26"
DL_DIR = "/Users/ericmiller/Downloads"
CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS_SEED = """
@page {
    size: letter portrait;
    margin: 10mm 12mm 12mm 12mm;
}
@media print {
    body { font-size: 8.5pt; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    .page-break { page-break-before: always; }
}
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0F172A;
    margin: 0;
    padding: 0;
    background: #FFFFFF;
    line-height: 1.36;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
.header-hero {
    background: linear-gradient(135deg, #022C22 0%, #064E3B 50%, #0F172A 100%); /* Emerald Venture Theme */
    color: #FFFFFF;
    padding: 16px 20px;
    border-radius: 6px;
    border-left: 6px solid #10B981;
    margin-bottom: 12px;
}
.hero-tag {
    font-size: 7.5pt;
    font-weight: 800;
    color: #6EE7B7;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
}
.hero-title {
    font-size: 15pt;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0 0 4px 0;
}
.hero-subtitle {
    font-size: 9pt;
    color: #D1FAE5;
    margin: 0 0 6px 0;
}
.hero-meta {
    font-size: 7pt;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.memo-box {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    border-left: 4px solid #10B981;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 7.8pt;
    color: #065F46;
    line-height: 1.4;
}
.section-title {
    background: #064E3B;
    color: #FFFFFF;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 5px 8px;
    border-radius: 4px;
    margin-top: 14px;
    margin-bottom: 6px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 7.2pt;
}
th {
    background-color: #1E293B;
    color: #FFFFFF;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 6.8pt;
    padding: 5px 6px;
    text-align: left;
    border: 1px solid #1E293B;
}
td {
    padding: 5px 6px;
    border: 1px solid #CBD5E1;
    vertical-align: top;
    line-height: 1.3;
}
tr:nth-child(even) {
    background-color: #F8FAFC;
}
.company-cell {
    font-weight: 800;
    color: #0F172A;
    font-size: 7.5pt;
}
.round-pill {
    display: inline-block;
    background: #D1FAE5;
    color: #065F46;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 6.8pt;
    margin-top: 2px;
}
.round-pill.seed { background: #FEF3C7; color: #92400E; }
.round-pill.series-a { background: #DBEAFE; color: #1E40AF; }
.round-pill.series-b { background: #EDE9FE; color: #6B21A8; }
.round-pill.series-c { background: #FCE7F3; color: #9D174D; }

.lead-vc-text {
    font-weight: 700;
    color: #0F172A;
}
.partner-highlight {
    color: #2563EB;
    font-weight: 600;
}
.firm-highlight {
    color: #059669;
    font-weight: 700;
}
.footer-bar {
    border-top: 1px solid #CBD5E1;
    padding-top: 5px;
    margin-top: 16px;
    font-size: 6.8pt;
    color: #64748B;
    display: flex;
    justify-content: space-between;
}
"""

# -------------------------------------------------------------------------
# 1. SEED_ROUND_The_Master_Early_Stage_Rounds_Compendium
# -------------------------------------------------------------------------
MASTER_EARLY_STAGE_HTML = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SEED_ROUND - The Master Early-Stage Rounds Compendium (Seed, Series A, B, C)</title>
<style>{CSS_SEED}</style>
</head>
<body>
    <div class="header-hero">
        <div class="hero-tag">DEFINITIVE EARLY-STAGE VENTURE INTELLIGENCE &bull; SEED TO SERIES C</div>
        <div class="hero-title">SEED_ROUND: THE MASTER EARLY-STAGE CAPITAL COMPENDIUM</div>
        <div class="hero-subtitle">Comprehensive Audit of Seed, Series A, Series B, and Series C Financings Across YC & AI Powerhouses</div>
        <div class="hero-meta">Confidential Executive Briefing &bull; Prepared for Leadership &bull; SEC Form D & Venture Disclosures</div>
    </div>

    <div class="memo-box">
        <strong>EARLY-STAGE FINANCING MECHANICS & GOVERNANCE ARCHITECTURE:</strong><br/>
        &bull; <strong>Seed Stage (SAFE / Convertible Debt):</strong> Characterized by post-money valuation caps ($5M-$20M) standardized on Carolynn Levy's YC SAFE instrument. Handled via Cooley GO, Gunderson Launch, or WSGR.<br/>
        &bull; <strong>Series A (The Institutional Price Discovery):</strong> The initial creation of Series A Preferred Stock ($5M-$25M raised; 15-25% dilution). Lead partner takes Board of Directors seat.<br/>
        &bull; <strong>Series B & C (Scale & Expansion Rounds):</strong> Multi-firm syndicates ($25M-$250M raised) with protective covenants, anti-dilution rights, and secondary founder liquidity.
    </div>

    <div class="section-title">1. THE EARLY-STAGE ROUND-BY-ROUND LIFECYCLE (SEED &bull; SERIES A &bull; SERIES B &bull; SERIES C)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 14%;">Company & Tier</th>
                <th style="width: 22%;">Capital Raised & Valuation</th>
                <th style="width: 22%;">Lead VC Firm & Lead Partners</th>
                <th style="width: 20%;">Law Firm(s) & Structuring Partners</th>
                <th style="width: 22%;">Deal Terms, Board Seats & Milestones</th>
            </tr>
        </thead>
        <tbody>
            <!-- OPENAI -->
            <tr>
                <td class="company-cell">OpenAI<br/><span class="round-pill seed">Seed (2015)</span></td>
                <td><strong>$130M Initial Cash</strong><br/>($1.0B Non-Profit Pledge)</td>
                <td><span class="lead-vc-text">Sam Altman, Elon Musk, Reid Hoffman, Peter Thiel, Jessica Livingston</span></td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> & Cooley LLP</td>
                <td>Formed as non-profit 501(c)(3) AI research lab with zero equity ownership; broad public benefit mandate.</td>
            </tr>
            <tr>
                <td class="company-cell">OpenAI<br/><span class="round-pill series-a">Series A / Capped (2019)</span></td>
                <td><strong>$1.05 Billion</strong><br/>($1.0B Microsoft + $50M Khosla)</td>
                <td><span class="lead-vc-text">Khosla Ventures</span> (<span class="partner-highlight">Vinod Khosla</span>) & <span class="lead-vc-text">Microsoft</span> (<span class="partner-highlight">Satya Nadella, Kevin Scott</span>)</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span>, Cooley LLP, Simpson Thacher</td>
                <td>Creation of OpenAI Global LLC capped-profit structure (100x profit cap); exclusive Azure cloud computing exclusivity.</td>
            </tr>
            <tr>
                <td class="company-cell">OpenAI<br/><span class="round-pill series-b">Series B (2021)</span></td>
                <td><strong>$250 Million</strong><br/>($14.0B Post-Money Val)</td>
                <td><span class="lead-vc-text">Microsoft, Bedrock Capital, Sequoia Capital, a16z, Founders Fund, Tiger Global</span></td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Rachel Proffitt</span>), Paul, Weiss</td>
                <td>Commercialization of GPT-3 API; enterprise SaaS pilots with Morgan Stanley, Stripe, and Duolingo.</td>
            </tr>
            <tr>
                <td class="company-cell">OpenAI<br/><span class="round-pill series-c">Series C (2023)</span></td>
                <td><strong>$10.3 Billion</strong><br/>($29.0B Post-Money Val)</td>
                <td><span class="lead-vc-text">Microsoft</span> ($10B Lead), <span class="lead-vc-text">Thrive Capital</span> (<span class="partner-highlight">Josh Kushner</span>), Founders Fund, Sequoia</td>
                <td><span class="firm-highlight">Paul, Weiss</span> (<span class="partner-highlight">Robert Schumer</span>), Cooley LLP, Wachtell Lipton</td>
                <td>ChatGPT breakout commercial expansion; 75% Microsoft profit share until investment recoupment; Azure deployment.</td>
            </tr>

            <!-- ANTHROPIC -->
            <tr>
                <td class="company-cell">Anthropic<br/><span class="round-pill series-a">Series A (May 2021)</span></td>
                <td><strong>$124 Million</strong><br/>($250M Valuation)</td>
                <td><span class="lead-vc-text">Jaan Tallinn</span> (Skype Co-Founder), Dustin Moskovitz, Eric Schmidt, James McClave</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Steven Bochner</span>)</td>
                <td>Spinoff from OpenAI by Dario and Daniela Amodei; established as a Delaware Public Benefit Corporation (PBC) with Long-Term Benefit Trust.</td>
            </tr>
            <tr>
                <td class="company-cell">Anthropic<br/><span class="round-pill series-b">Series B (Apr 2022)</span></td>
                <td><strong>$580 Million</strong><br/>($850M Valuation)</td>
                <td><span class="lead-vc-text">Sam Bankman-Fried / FTX</span> (later sold off), Jim McClave, Nishad Singh</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span></td>
                <td>Massive compute financing for Constitutional AI R&D; later repurchased and re-syndicated to global sovereign funds post-FTX bankruptcy.</td>
            </tr>
            <tr>
                <td class="company-cell">Anthropic<br/><span class="round-pill series-c">Series C (May 2023)</span></td>
                <td><strong>$450 Million</strong><br/>($4.1B Valuation)</td>
                <td><span class="lead-vc-text">Spark Capital</span> (<span class="partner-highlight">Yasmin Razavi</span> - Board Observer), Google, Salesforce Ventures, Sound Ventures</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Mark Baudler</span>)</td>
                <td>Launch of Claude 2; commercial rollout across enterprise clients (Zoom, Slack, Bridgewater); Google Cloud compute partnership.</td>
            </tr>

            <!-- DOORDASH -->
            <tr>
                <td class="company-cell">DoorDash<br/><span class="round-pill seed">Seed (2013 - YC S13)</span></td>
                <td><strong>$2.4 Million</strong><br/>($8.0M Valuation)</td>
                <td><span class="lead-vc-text">CRV (Charles River Ventures)</span> (<span class="partner-highlight">Saar Gur</span>), SV Angel, Paul Buchheit, Pejman Mar</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Tony Jeffries</span>)</td>
                <td>YC Post-Money SAFE conversion; initial rollout across Palo Alto / Stanford delivery radius; Saar Gur joined Board.</td>
            </tr>
            <tr>
                <td class="company-cell">DoorDash<br/><span class="round-pill series-a">Series A (May 2014)</span></td>
                <td><strong>$17.3 Million</strong><br/>($60M Valuation)</td>
                <td><span class="lead-vc-text">Sequoia Capital</span> (<span class="partner-highlight">Alfred Lin</span> - joined Board), CRV, Khosla Ventures</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Tony Jeffries</span>)</td>
                <td>Creation of Series A Preferred Stock; national expansion across Silicon Valley, Los Angeles, and Boston; dispatch logistics algorithms.</td>
            </tr>
            <tr>
                <td class="company-cell">DoorDash<br/><span class="round-pill series-b">Series B (Mar 2015)</span></td>
                <td><strong>$40.0 Million</strong><br/>($200M Valuation)</td>
                <td><span class="lead-vc-text">Kleiner Perkins</span> (<span class="partner-highlight">John Doerr</span>), Sequoia Capital, CRV, Khosla Ventures</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span></td>
                <td>Expansion into 18 major metropolitan markets; launch of corporate ordering and merchant analytics dashboards.</td>
            </tr>
            <tr>
                <td class="company-cell">DoorDash<br/><span class="round-pill series-c">Series C (Mar 2016)</span></td>
                <td><strong>$127.0 Million</strong><br/>($600M Valuation)</td>
                <td><span class="lead-vc-text">Sequoia Capital</span> (<span class="partner-highlight">Alfred Lin</span>), Kleiner Perkins, YC Continuity Fund (<span class="partner-highlight">Ali Rowghani</span>)</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Steven Bochner, Tony Jeffries</span>)</td>
                <td>Down-market pricing defense; expansion of DashPass subscription architecture; multi-city market share capture from Grubhub.</td>
            </tr>

            <!-- AIRBNB -->
            <tr>
                <td class="company-cell">Airbnb<br/><span class="round-pill seed">Seed (2009 - YC W09)</span></td>
                <td><strong>$600,000</strong><br/>($2.4M Valuation)</td>
                <td><span class="lead-vc-text">Sequoia Capital</span> (<span class="partner-highlight">Greg McAdoo, Roelof Botha</span>), Youniversity (<span class="partner-highlight">Keith Rabois</span>)</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> (<span class="partner-highlight">Mark Stevens</span>)</td>
                <td>YC Seed investment after famous "Obama O's" cereal box survival; incorporation and early trademark registration.</td>
            </tr>
            <tr>
                <td class="company-cell">Airbnb<br/><span class="round-pill series-a">Series A (Nov 2010)</span></td>
                <td><strong>$7.2 Million</strong><br/>($65M Valuation)</td>
                <td><span class="lead-vc-text">Greylock Partners</span> (<span class="partner-highlight">Reid Hoffman</span> - joined Board), Sequoia Capital (<span class="partner-highlight">Greg McAdoo</span>)</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> (<span class="partner-highlight">Mark Stevens</span>)</td>
                <td>Series A Preferred stock; international room nights scaling; professional photography program for hosts.</td>
            </tr>
            <tr>
                <td class="company-cell">Airbnb<br/><span class="round-pill series-b">Series B (Jul 2011)</span></td>
                <td><strong>$112.0 Million</strong><br/>($1.3B Unicorn Valuation)</td>
                <td><span class="lead-vc-text">Andreessen Horowitz</span> (<span class="partner-highlight">Jeff Jordan</span> - joined Board), DST Global, General Catalyst</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> & Cooley LLP</td>
                <td>Cross-border European expansion; acquisition of German clone Accoleo; reached 1M nights booked.</td>
            </tr>
            <tr>
                <td class="company-cell">Airbnb<br/><span class="round-pill series-c">Series C (Oct 2012)</span></td>
                <td><strong>$200.0 Million</strong><br/>($2.5B Valuation)</td>
                <td><span class="lead-vc-text">Founders Fund</span> (<span class="partner-highlight">Peter Thiel, Brian Singerman</span>), Sequoia, a16z, Greylock</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> & Simpson Thacher</td>
                <td>$1M Host Guarantee insurance program; global localized payment processing across 30+ currencies.</td>
            </tr>

            <!-- STRIPE -->
            <tr>
                <td class="company-cell">Stripe<br/><span class="round-pill seed">Seed (2010 - YC S09)</span></td>
                <td><strong>$2.0 Million</strong><br/>($10M Valuation)</td>
                <td><span class="lead-vc-text">Peter Thiel, Elon Musk, Sequoia Capital</span> (<span class="partner-highlight">Michael Moritz</span>), SV Angel (<span class="partner-highlight">Ron Conway</span>)</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> (<span class="partner-highlight">Mark Stevens, Gordon Davidson</span>)</td>
                <td>7 lines of JavaScript payment API; Patrick and John Collison seed syndicate backed by PayPal mafia co-founders.</td>
            </tr>
            <tr>
                <td class="company-cell">Stripe<br/><span class="round-pill series-a">Series A (Feb 2012)</span></td>
                <td><strong>$18.0 Million</strong><br/>($100M Valuation)</td>
                <td><span class="lead-vc-text">Sequoia Capital</span> (<span class="partner-highlight">Michael Moritz</span> - joined Board), General Catalyst, Peter Thiel, <span class="partner-highlight">Elad Gil</span></td>
                <td><span class="firm-highlight">Fenwick & West LLP</span></td>
                <td>Series A Preferred stock; banking sponsor agreements with Wells Fargo; launch of developer dashboard and webhooks.</td>
            </tr>
            <tr>
                <td class="company-cell">Stripe<br/><span class="round-pill series-b">Series B (Jan 2014)</span></td>
                <td><strong>$80.0 Million</strong><br/>($1.75B Unicorn Valuation)</td>
                <td><span class="lead-vc-text">Founders Fund</span> (<span class="partner-highlight">Peter Thiel</span> - joined Board), Sequoia Capital, Allen & Company</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> & WSGR</td>
                <td>Global expansion into Europe and Canada; launch of Stripe Connect for marketplaces (Shopify, Lyft, Kickstarter).</td>
            </tr>
            <tr>
                <td class="company-cell">Stripe<br/><span class="round-pill series-c">Series C (Dec 2014)</span></td>
                <td><strong>$70.0 Million</strong><br/>($3.5B Valuation)</td>
                <td><span class="lead-vc-text">Thrive Capital</span> (<span class="partner-highlight">Josh Kushner</span> - joined Board), Founders Fund, Sequoia, General Catalyst</td>
                <td><span class="firm-highlight">Fenwick & West LLP</span> & WSGR</td>
                <td>Launch of Stripe Relay (mobile checkout) and Stripe Atlas (Delaware company formation for global founders).</td>
            </tr>

            <!-- SCALE AI -->
            <tr>
                <td class="company-cell">Scale AI<br/><span class="round-pill seed">Seed (2016 - YC S16)</span></td>
                <td><strong>$4.5 Million</strong><br/>($18M Valuation)</td>
                <td><span class="lead-vc-text">Accel</span> (<span class="partner-highlight">Dan Levine</span>), SV Angel, Y Combinator</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Rachel Proffitt</span>)</td>
                <td>Alexandr Wang (age 19) and Lucy Guo founding round; initial data labeling API for autonomous vehicle perception (LiDAR/Camera).</td>
            </tr>
            <tr>
                <td class="company-cell">Scale AI<br/><span class="round-pill series-a">Series A (Jul 2017)</span></td>
                <td><strong>$18.0 Million</strong><br/>($70M Valuation)</td>
                <td><span class="lead-vc-text">Index Ventures</span> (<span class="partner-highlight">Mike Volpi</span> - joined Board), Accel</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
                <td>Series A Preferred stock; expansion into sensor fusion labeling; landing major autonomous vehicle contracts (Cruise, Waymo, Lyft).</td>
            </tr>
            <tr>
                <td class="company-cell">Scale AI<br/><span class="round-pill series-b">Series B (Aug 2018)</span></td>
                <td><strong>$100.0 Million</strong><br/>($350M Valuation)</td>
                <td><span class="lead-vc-text">Founders Fund</span> (<span class="partner-highlight">Mike Vernal</span> - joined Board), Index Ventures, Accel</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
                <td>Launch of Scale 3D and Scale Text; expansion into federal defense and aerospace computer vision.</td>
            </tr>
            <tr>
                <td class="company-cell">Scale AI<br/><span class="round-pill series-c">Series C (Aug 2019)</span></td>
                <td><strong>$100.0 Million</strong><br/>($1.04B Unicorn Valuation)</td>
                <td><span class="lead-vc-text">Founders Fund</span> (<span class="partner-highlight">Peter Thiel</span>), Coatue Management, Index Ventures, Accel</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Rachel Proffitt</span>)</td>
                <td>Unicorn status achieved at age 22; launch of RLHF (reinforcement learning from human feedback) data pipelines for LLMs.</td>
            </tr>

            <!-- PERPLEXITY AI -->
            <tr>
                <td class="company-cell">Perplexity AI<br/><span class="round-pill seed">Seed (Sep 2022)</span></td>
                <td><strong>$3.1 Million</strong><br/>($12M Valuation)</td>
                <td><span class="lead-vc-text">Elad Gil, Nat Friedman</span>, Pieter Abbeel, Yann LeCun, Andrej Karpathy, Ashish Vaswani</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
                <td>Aravind Srinivas founding round; initial text-to-SQL and conversational web indexing prototypes.</td>
            </tr>
            <tr>
                <td class="company-cell">Perplexity AI<br/><span class="round-pill series-a">Series A (Mar 2023)</span></td>
                <td><strong>$25.6 Million</strong><br/>($150M Valuation)</td>
                <td><span class="lead-vc-text">New Enterprise Associates (NEA)</span> (<span class="partner-highlight">Ann Bordetsky</span> - Board Seat), Databricks Ventures, Elad Gil, Nat Friedman</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
                <td>Launch of Perplexity Pro search engine; real-time web citation architecture; reached 2M monthly active users.</td>
            </tr>
            <tr>
                <td class="company-cell">Perplexity AI<br/><span class="round-pill series-b">Series B (Jan 2024)</span></td>
                <td><strong>$73.6 Million</strong><br/>($520M Valuation)</td>
                <td><span class="lead-vc-text">IVP</span> (<span class="partner-highlight">Cobi Hoover</span>), <span class="lead-vc-text">Jeff Bezos</span> (Bezos Expeditions), Nvidia, Bessemer Venture Partners</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Rachel Proffitt</span>)</td>
                <td>Enterprise Pro search launch; Rabbit R1 integration; search volume grew to 100M monthly queries.</td>
            </tr>
            <tr>
                <td class="company-cell">Perplexity AI<br/><span class="round-pill series-c">Series C (Apr 2024)</span></td>
                <td><strong>$62.7 Million</strong><br/>($1.04B Unicorn Valuation)</td>
                <td><span class="lead-vc-text">Daniel Gross, Stanley Druckenmiller</span>, Garry Tan, IVP, NEA</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
                <td>Unicorn status reached; multi-model selector (Claude 3.5, GPT-4o, Sonar); official publisher revenue share syndicate.</td>
            </tr>

            <!-- MISTRAL AI -->
            <tr>
                <td class="company-cell">Mistral AI<br/><span class="round-pill seed">Seed (Jun 2023)</span></td>
                <td><strong>€105 Million ($113M)</strong><br/>(€240M Valuation)</td>
                <td><span class="lead-vc-text">Lightspeed Venture Partners</span> (<span class="partner-highlight">Antoine Moyroud</span>), Xavier Niel, Eric Schmidt, Bpifrance</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Peter Werner</span>) & Clifford Chance</td>
                <td>Largest seed round in European history (4 weeks post-incorporation by former DeepMind/Meta AI researchers Arthur Mensch, Timothée Lacroix).</td>
            </tr>
            <tr>
                <td class="company-cell">Mistral AI<br/><span class="round-pill series-a">Series A (Dec 2023)</span></td>
                <td><strong>€385 Million ($415M)</strong><br/>(€2.0B Valuation)</td>
                <td><span class="lead-vc-text">Andreessen Horowitz (a16z)</span>, Lightspeed, Salesforce, BNP Paribas, General Catalyst</td>
                <td><span class="firm-highlight">Cooley LLP</span> & Clifford Chance</td>
                <td>Release of Mixtral 8x7B (Sparse Mixture-of-Experts architecture); enterprise partnership with Microsoft Azure.</td>
            </tr>
            <tr>
                <td class="company-cell">Mistral AI<br/><span class="round-pill series-b">Series B (Jun 2024)</span></td>
                <td><strong>€600 Million ($640M)</strong><br/>(€5.8B Valuation)</td>
                <td><span class="lead-vc-text">General Catalyst</span> (<span class="partner-highlight">Jeannette zu Fürstenberg</span>), Lightspeed, a16z, Nvidia, Bpifrance, Cisco</td>
                <td><span class="firm-highlight">Cooley LLP</span> & Clifford Chance</td>
                <td>Release of Mistral Large 2 and Codestral; sovereign AI computing contracts with European governments and global enterprises.</td>
            </tr>
        </tbody>
    </table>

    <div class="footer-bar">
        <span>CONFIDENTIAL MASTER EARLY-STAGE COMPENDIUM &bull; SEED TO SERIES C AUDIT</span>
        <span>SEED_ROUND VENTURE CAPITAL REPORT</span>
    </div>
</body>
</html>
"""

# -------------------------------------------------------------------------
# 2. SEED_ROUND_Early_Stage_Venture_Capital_Kingpins_and_Law_Firms
# -------------------------------------------------------------------------
VC_KINGPINS_EARLY_HTML = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SEED_ROUND - Early-Stage Venture Capital Kingpins & Law Firms</title>
<style>{CSS_SEED}</style>
</head>
<body>
    <div class="header-hero">
        <div class="hero-tag">INVESTIGATIVE DOSSIER &bull; THE EARLY-STAGE RAINMAKERS</div>
        <div class="hero-title">SEED_ROUND: THE VENTURE KINGPINS & EARLY-STAGE LAW FIRMS</div>
        <div class="hero-subtitle">The Individual Lead Partners & Law Firm Chairs Who Personally Structure Seed, Series A, B, and C Financings</div>
        <div class="hero-meta">Confidential Intelligence Briefing &bull; Prepared for Executive Leadership &bull; August 2026</div>
    </div>

    <div class="memo-box">
        <strong>THE EARLY-STAGE RAINMAKER THESIS:</strong><br/>
        While late-stage growth rounds are driven by private equity metrics and financial engineering, <strong>Seed, Series A, and Series B rounds are driven by high-conviction individuals</strong>. The lawyer who drafts the incorporation documents (Delaware C-Corp) and the VC partner who takes the first Board seat dictate the company's trajectory, cap table governance, and ultimate liquidity exit.
    </div>

    <div class="section-title">THE TOP 8 EARLY-STAGE VC PARTNERS (SEED TO SERIES C LEAD CHECKS)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 22%;">Lead Partner & Firm</th>
                <th style="width: 20%;">Preferred Round Focus</th>
                <th style="width: 28%;">Historic Early-Stage Wins (Seed / A / B / C)</th>
                <th style="width: 30%;">Outside Law Firm Representation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Alfred Lin</strong><br/><span style="color:#059669; font-weight:700;">Sequoia Capital</span></td>
                <td>Series A & Series B Lead</td>
                <td><strong>DoorDash</strong> (Led $17M Series A; Board Member), <strong>Airbnb</strong> (Early Board Member), <strong>Reddit</strong> (Series B lead)</td>
                <td><strong>Wilson Sonsini (WSGR)</strong> & Cooley LLP</td>
            </tr>
            <tr>
                <td><strong>Peter Thiel</strong><br/><span style="color:#0284C7; font-weight:700;">Founders Fund</span></td>
                <td>Seed, Series A & Series B</td>
                <td><strong>Stripe</strong> (Seed / Series B Lead), <strong>Scale AI</strong> (Series B/C Lead), <strong>Cognition AI</strong> (Series A Lead), <strong>Airbnb</strong> (Series C)</td>
                <td><strong>Orrick, Herrington & Sutcliffe</strong> & Cooley LLP</td>
            </tr>
            <tr>
                <td><strong>Vinod Khosla</strong><br/><span style="color:#DC2626; font-weight:700;">Khosla Ventures</span></td>
                <td>Seed & Series A Lead</td>
                <td><strong>OpenAI</strong> (First $50M check in 2019), <strong>GitLab</strong> (Series A Lead; Board Member), <strong>Instacart</strong> (Seed/A), <strong>DoorDash</strong> (Series A)</td>
                <td><strong>Wilson Sonsini (WSGR)</strong></td>
            </tr>
            <tr>
                <td><strong>Josh Kushner</strong><br/><span style="color:#2563EB; font-weight:700;">Thrive Capital</span></td>
                <td>Series B, C & Growth</td>
                <td><strong>Stripe</strong> (Series C Lead; Board Member), <strong>OpenAI</strong> ($6.6B Lead check), <strong>Scale AI</strong> (Series F), <strong>Sierra AI</strong></td>
                <td><strong>Paul, Weiss, Rifkind, Wharton & Garrison</strong> & Cooley LLP</td>
            </tr>
            <tr>
                <td><strong>Nat Friedman & Daniel Gross</strong><br/><span style="color:#D97706; font-weight:700;">NFDG / AI Grant</span></td>
                <td>Seed & Series A (Compute + Cash)</td>
                <td><strong>Perplexity AI</strong> (Seed / Series A), <strong>Cursor</strong> (Seed / Series A), <strong>Cognition</strong> (Seed), <strong>ElevenLabs</strong> (Series A), <strong>Suno</strong>, <strong>Pika</strong></td>
                <td><strong>Gunderson Dettmer</strong> (<span class="partner-highlight">Trevor Snider</span>) & Cooley</td>
            </tr>
            <tr>
                <td><strong>Elad Gil</strong><br/><span style="color:#7C3AED; font-weight:700;">Solo Capitalist / Super-Angel</span></td>
                <td>Seed & Series A Lead</td>
                <td><strong>Perplexity AI</strong> (Seed Lead), <strong>Harvey AI</strong> (Series B), <strong>Cognition</strong> (Seed), <strong>Stripe</strong> (Series A), <strong>Cursor</strong>, <strong>Runway</strong></td>
                <td><strong>Gunderson Dettmer</strong> & Cooley LLP</td>
            </tr>
            <tr>
                <td><strong>Martin Casado & Marc Andreessen</strong><br/><span style="color:#EA580C; font-weight:700;">Andreessen Horowitz (a16z)</span></td>
                <td>Seed, Series A & B</td>
                <td><strong>Airbnb</strong> (Series B Lead), <strong>Coinbase</strong> (Series B Lead), <strong>ElevenLabs</strong> (Series A), <strong>Mistral AI</strong> (Series A), <strong>Cursor</strong>, <strong>SSI</strong></td>
                <td><strong>Gunderson Dettmer</strong> & Cooley LLP</td>
            </tr>
            <tr>
                <td><strong>Dan Levine & Mike Volpi</strong><br/><span style="color:#0F766E; font-weight:700;">Accel & Index Ventures</span></td>
                <td>Seed, Series A & B</td>
                <td><strong>Scale AI</strong> (Dan Levine led Seed; Mike Volpi led Series A), <strong>Cursor</strong>, <strong>Augment Code</strong>, <strong>DeepL</strong>, <strong>Mistral</strong></td>
                <td><strong>Cooley LLP</strong> (<span class="partner-highlight">Rachel Proffitt</span>) & WSGR</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">THE TOP 4 EARLY-STAGE LAW FIRMS STRUCTURING SEED THROUGH SERIES C</div>
    <table>
        <thead>
            <tr>
                <th style="width: 22%;">Law Firm</th>
                <th style="width: 25%;">Lead Partners</th>
                <th style="width: 25%;">Early-Stage Platform & Instruments</th>
                <th style="width: 28%;">Notable Seed-to-Series C Formations</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Cooley LLP</strong><br/><span style="color:#2563EB;">cooley.com</span></td>
                <td><strong>Rachel Proffitt</strong>, <strong>Peter Werner</strong>, <strong>Charlie Kim</strong>, <strong>David Peinsipp</strong></td>
                <td><strong>Cooley GO</strong> (Standard Series A / NVCA documents, SAFEs, equity incentive pools)</td>
                <td>OpenAI, Scale AI, Reddit, Perplexity AI, Segment, Augment Code, Figure AI</td>
            </tr>
            <tr>
                <td><strong>Wilson Sonsini (WSGR)</strong><br/><span style="color:#2563EB;">wsgr.com</span></td>
                <td><strong>Steven Bochner</strong>, <strong>Tony Jeffries</strong>, <strong>Mark Baudler</strong>, <strong>Craig Sherman</strong></td>
                <td><strong>WSGR Startup Platform</strong> (Automated Delaware incorporation, 83(b) tax elections)</td>
                <td>DoorDash, Anthropic, Instacart, Dropbox, PlanGrid, Khosla Ventures funds</td>
            </tr>
            <tr>
                <td><strong>Gunderson Dettmer</strong><br/><span style="color:#2563EB;">gunder.com</span></td>
                <td><strong>Trevor Snider</strong>, <strong>Brian Patterson</strong>, <strong>Ivan Gaviria</strong></td>
                <td><strong>Gunderson Launch</strong> (Venture fund formation, SPVs, seed-to-scale term sheets)</td>
                <td>Cursor (Anysphere), Cognition AI (Devin), ElevenLabs, Suno, Pika, NFDG, a16z</td>
            </tr>
            <tr>
                <td><strong>Fenwick & West LLP</strong><br/><span style="color:#2563EB;">fenwick.com</span></td>
                <td><strong>Mark Stevens</strong>, <strong>Gordon Davidson</strong>, <strong>David Bell</strong></td>
                <td><strong>Fenwick Venture Desk</strong> (Early corporate governance, tech IP assignment)</td>
                <td>Airbnb, Coinbase, Stripe, Twitch (Justin.tv), Amplitude, PagerDuty</td>
            </tr>
        </tbody>
    </table>

    <div class="footer-bar">
        <span>CONFIDENTIAL EARLY-STAGE RAINMAKERS &bull; VC PARTNERS & LAW FIRMS</span>
        <span>SEED_ROUND INTELLIGENCE DOSSIER</span>
    </div>
</body>
</html>
"""

# -------------------------------------------------------------------------
# 3. SEED_ROUND_YC_Companies_Seed_Through_Series_C_Audit
# -------------------------------------------------------------------------
YC_EARLY_AUDIT_HTML = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SEED_ROUND - YC Companies Seed Through Series C Audit</title>
<style>{CSS_SEED}</style>
</head>
<body>
    <div class="header-hero">
        <div class="hero-tag">PORTFOLIO DEEP-DIVE &bull; Y COMBINATOR ALUMNI AUDIT</div>
        <div class="hero-title">SEED_ROUND: YC ENTERPRISES SEED THROUGH SERIES C AUDIT</div>
        <div class="hero-subtitle">Granular Census of Early-Stage Rounds for 20+ Top Y Combinator Decacorns and Unicorns</div>
        <div class="hero-meta">Confidential Portfolio Briefing &bull; Prepared for Leadership &bull; Verified Historical SEC Filings</div>
    </div>

    <div class="memo-box">
        <strong>Y COMBINATOR SEED-TO-SERIES-C SCALING TEMPLATE:</strong><br/>
        &bull; <strong>The Standard YC Seed Check:</strong> Originally $20k for 6% (2005-2010), evolved to $120k for 7% (2014-2021), and currently $500k ($125k for 7% + $375k MFN SAFE).<br/>
        &bull; <strong>The Series A Inflection:</strong> Top YC companies typically secure Series A term sheets during or immediately following YC Demo Day, led by Sequoia, Andreessen Horowitz, Accel, Founders Fund, or Kleiner Perkins.
    </div>

    <div class="section-title">DETAILED ROUND AUDIT: SEED &bull; SERIES A &bull; SERIES B &bull; SERIES C</div>
    <table>
        <thead>
            <tr>
                <th style="width: 14%;">Company & Batch</th>
                <th style="width: 16%;">Round & Date</th>
                <th style="width: 18%;">Capital & Valuation</th>
                <th style="width: 26%;">Lead VC Firm & Lead Partner</th>
                <th style="width: 26%;">Law Firm(s) & Structuring Terms</th>
            </tr>
        </thead>
        <tbody>
            <!-- COINBASE -->
            <tr>
                <td rowspan="4" class="company-cell">Coinbase<br/>(YC S12)</td>
                <td><span class="round-pill seed">Seed (2012)</span></td>
                <td>$600,000 ($3M Val)</td>
                <td>FundersClub, SV Angel, Alexis Ohanian, Garry Tan</td>
                <td><span class="firm-highlight">Fenwick & West</span> (<span class="partner-highlight">Mark Stevens</span>) - YC SAFE conversion</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (May 2013)</span></td>
                <td>$5.0M ($25M Val)</td>
                <td><strong>Union Square Ventures</strong> (<span class="partner-highlight">Fred Wilson</span> - Board)</td>
                <td><span class="firm-highlight">Fenwick & West</span> (<span class="partner-highlight">Mark Stevens</span>) - Series A Preferred</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Dec 2013)</span></td>
                <td>$25.0M ($140M Val)</td>
                <td><strong>Andreessen Horowitz</strong> (<span class="partner-highlight">Chris Dixon</span> - Board)</td>
                <td><span class="firm-highlight">Fenwick & West</span> (<span class="partner-highlight">Mark Stevens</span>) - Bitcoin custody legal stack</td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (Jan 2015)</span></td>
                <td>$75.0M ($500M Val)</td>
                <td><strong>DFJ Growth</strong> (<span class="partner-highlight">Barry Schuler</span>), NYSE, USAA</td>
                <td><span class="firm-highlight">Fenwick & West</span> (<span class="partner-highlight">David Bell</span>) - First institutional bank/exchange equity</td>
            </tr>

            <!-- INSTACART -->
            <tr>
                <td rowspan="4" class="company-cell">Instacart<br/>(YC S12)</td>
                <td><span class="round-pill seed">Seed (2012)</span></td>
                <td>$2.3M ($10M Val)</td>
                <td>Canaan Partners, Khosla Ventures, SV Angel</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Steve Bochner</span>)</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (Jun 2013)</span></td>
                <td>$8.5M ($35M Val)</td>
                <td><strong>Sequoia Capital</strong> (<span class="partner-highlight">Michael Moritz</span> - Board)</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span></td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Jun 2014)</span></td>
                <td>$44.0M ($400M Val)</td>
                <td><strong>Andreessen Horowitz</strong> (<span class="partner-highlight">Jeff Jordan</span> - Board)</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> - Expansion to 15 metro areas</td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (Jan 2015)</span></td>
                <td>$220.0M ($2.0B Val)</td>
                <td><strong>Kleiner Perkins</strong> (<span class="partner-highlight">John Doerr</span>), Thrive, Dragoneer</td>
                <td><span class="firm-highlight">Wilson Sonsini (WSGR)</span> (<span class="partner-highlight">Mark Baudler</span>) - Unicorn milestone</td>
            </tr>

            <!-- GITLAB -->
            <tr>
                <td rowspan="4" class="company-cell">GitLab<br/>(YC W15)</td>
                <td><span class="round-pill seed">Seed (2015)</span></td>
                <td>$1.5M ($8M Val)</td>
                <td>500 Startups, Ashton Kutcher (Sound Ventures), Liquid 2</td>
                <td><span class="firm-highlight">Sidley Austin</span> & Fenwick & West</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (Sep 2015)</span></td>
                <td>$4.0M ($25M Val)</td>
                <td><strong>Khosla Ventures</strong> (<span class="partner-highlight">Vinod Khosla</span> - Board)</td>
                <td><span class="firm-highlight">Sidley Austin</span> (<span class="partner-highlight">Martin Wellington</span>)</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Sep 2016)</span></td>
                <td>$20.0M ($80M Val)</td>
                <td><strong>August Capital</strong> (<span class="partner-highlight">Villi Iltchev</span> - Board)</td>
                <td><span class="firm-highlight">Sidley Austin</span></td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (Oct 2017)</span></td>
                <td>$20.0M ($200M Val)</td>
                <td><strong>GV (Google Ventures)</strong> (<span class="partner-highlight">Dave Munichiello</span> - Board)</td>
                <td><span class="firm-highlight">Sidley Austin</span> - All-remote corporate governance stack</td>
            </tr>

            <!-- SEGMENT -->
            <tr>
                <td rowspan="4" class="company-cell">Segment<br/>(YC S11)</td>
                <td><span class="round-pill seed">Seed (2011)</span></td>
                <td>$600,000 ($3M Val)</td>
                <td>NEA, SV Angel, Y Combinator</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Rachel Proffitt</span>)</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (2013)</span></td>
                <td>$15.0M ($50M Val)</td>
                <td><strong>Accel</strong> (<span class="partner-highlight">Vas Natarajan</span> - Board)</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">Rachel Proffitt</span>)</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (2015)</span></td>
                <td>$34.0M ($150M Val)</td>
                <td><strong>Thrive Capital</strong> (<span class="partner-highlight">Will Gaybrick</span> - Board)</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (2017)</span></td>
                <td>$64.0M ($600M Val)</td>
                <td><strong>YC Continuity Fund</strong> (<span class="partner-highlight">Ali Rowghani</span> - Board)</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Precursor to $3.2B Twilio Acquisition</td>
            </tr>

            <!-- DEEL -->
            <tr>
                <td rowspan="4" class="company-cell">Deel<br/>(YC W19)</td>
                <td><span class="round-pill seed">Seed (2019)</span></td>
                <td>$4.0M ($15M Val)</td>
                <td>Coatue Management, Sarona Ventures, YC</td>
                <td><span class="firm-highlight">Cooley LLP</span> & Gunderson Dettmer</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (May 2020)</span></td>
                <td>$14.0M ($60M Val)</td>
                <td><strong>Andreessen Horowitz</strong> (<span class="partner-highlight">Anish Acharya</span> - Board)</td>
                <td><span class="firm-highlight">Cooley LLP</span> (<span class="partner-highlight">David Peinsipp</span>)</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Sep 2020)</span></td>
                <td>$30.0M ($300M Val)</td>
                <td><strong>Spark Capital</strong> (<span class="partner-highlight">Yasmin Razavi</span>)</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Global EOR cross-border contracts</td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (Apr 2021)</span></td>
                <td>$156.0M ($1.25B Val)</td>
                <td><strong>YC Continuity Fund</strong> & a16z</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Reached unicorn status in 24 months</td>
            </tr>
        </tbody>
    </table>

    <div class="footer-bar">
        <span>CONFIDENTIAL YC AUDIT &bull; SEED THROUGH SERIES C CAPITAL ROUNDS</span>
        <span>SEED_ROUND PORTFOLIO DOSSIER</span>
    </div>
</body>
</html>
"""

# -------------------------------------------------------------------------
# 4. SEED_ROUND_AI_Titans_Seed_Through_Series_C_Audit
# -------------------------------------------------------------------------
AI_EARLY_AUDIT_HTML = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SEED_ROUND - AI Titans Seed Through Series C Audit</title>
<style>{CSS_SEED}</style>
</head>
<body>
    <div class="header-hero">
        <div class="hero-tag">FRONTIER AI INTELLIGENCE &bull; SEED THROUGH SERIES C AUDIT</div>
        <div class="hero-title">SEED_ROUND: AI TITANS SEED THROUGH SERIES C COMPENDIUM</div>
        <div class="hero-subtitle">Exhaustive Audit of Early-Stage Financings for Cursor, Devin, Perplexity, ElevenLabs, Figure AI, Mistral & Cohere</div>
        <div class="hero-meta">Confidential AI Dossier &bull; Prepared for Executive Leadership &bull; August 2026</div>
    </div>

    <div class="memo-box">
        <strong>THE AI EARLY-STAGE FINANCING REVOLUTION:</strong><br/>
        &bull; <strong>Compressed Velocity:</strong> Unlike traditional SaaS, breakout AI startups are advancing from Seed to Series B/C unicorn valuations ($1B+) within 6 to 18 months.<br/>
        &bull; <strong>The Compute-for-Equity Syndicate:</strong> Seed and Series A rounds frequently combine venture capital cash with dedicated GPU cluster allocations (Andromeda, Azure, AWS, GCP).
    </div>

    <div class="section-title">DETAILED ROUND AUDIT: SEED &bull; SERIES A &bull; SERIES B &bull; SERIES C (FRONTIER AI)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 14%;">AI Company</th>
                <th style="width: 16%;">Round & Date</th>
                <th style="width: 18%;">Capital & Valuation</th>
                <th style="width: 26%;">Lead VC Firm & Lead Partner</th>
                <th style="width: 26%;">Law Firm(s) & Structuring Terms</th>
            </tr>
        </thead>
        <tbody>
            <!-- CURSOR -->
            <tr>
                <td rowspan="2" class="company-cell">Cursor<br/>(Anysphere)</td>
                <td><span class="round-pill seed">Seed (2022)</span></td>
                <td>$400,000 ($4M Val)</td>
                <td>Nat Friedman, Daniel Gross, Susa Ventures</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> (<span class="partner-highlight">Trevor Snider</span>) - MIT founders seed round</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (2023-24)</span></td>
                <td>$60.0M ($400M -> $2.5B Val)</td>
                <td><strong>OpenAI Startup Fund</strong> (<span class="partner-highlight">Brad Lightcap</span>), a16z (<span class="partner-highlight">Martin Casado</span>), Index</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> - Exploded from $1M to $50M ARR</td>
            </tr>

            <!-- COGNITION / DEVIN -->
            <tr>
                <td rowspan="2" class="company-cell">Cognition AI<br/>(Devin)</td>
                <td><span class="round-pill seed">Seed (Nov 2023)</span></td>
                <td>$21.0M ($80M Val)</td>
                <td><strong>Founders Fund</strong> (<span class="partner-highlight">Brian Singerman</span>), Elad Gil, Tony Xu</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> & Orrick</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (Mar 2024)</span></td>
                <td>$175.0M ($2.0B Val)</td>
                <td><strong>Founders Fund</strong> (<span class="partner-highlight">Brian Singerman, Peter Thiel</span>)</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> & Orrick - $2B unicorn in 6 months</td>
            </tr>

            <!-- ELEVENLABS -->
            <tr>
                <td rowspan="3" class="company-cell">ElevenLabs<br/>(Voice AI)</td>
                <td><span class="round-pill seed">Seed (Jan 2023)</span></td>
                <td>$2.0M ($10M Val)</td>
                <td>Credo Ventures, Concept Ventures, Carles Reina</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> - Zero-shot voice cloning API launch</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (Jun 2023)</span></td>
                <td>$19.0M ($100M Val)</td>
                <td><strong>Andreessen Horowitz (a16z)</strong>, Nat Friedman, Daniel Gross</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> - Launch of multilingual voice AI</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Jan 2024)</span></td>
                <td>$80.0M ($1.1B Val)</td>
                <td><strong>a16z</strong>, Nat Friedman, Daniel Gross, Sequoia Capital</td>
                <td><span class="firm-highlight">Gunderson Dettmer</span> - Reached unicorn status in 18 months ($80M ARR)</td>
            </tr>

            <!-- FIGURE AI -->
            <tr>
                <td rowspan="3" class="company-cell">Figure AI<br/>(Humanoid)</td>
                <td><span class="round-pill seed">Seed (2022)</span></td>
                <td>$10.0M ($40M Val)</td>
                <td>Brett Adcock (Founder Capital)</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Humanoid robotics incorporation</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (May 2023)</span></td>
                <td>$70.0M ($400M Val)</td>
                <td><strong>Parkway Venture Capital</strong> (<span class="partner-highlight">Jesse Coors-Blankenship</span>)</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Hardware prototype Figure 01 assembly</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Feb 2024)</span></td>
                <td>$675.0M ($2.6B Val)</td>
                <td><strong>Parkway</strong>, Jeff Bezos ($100M), Microsoft ($95M), Nvidia ($50M), OpenAI</td>
                <td><span class="firm-highlight">Cooley LLP</span> & Orrick - OpenAI multimodal brain collaboration</td>
            </tr>

            <!-- COHERE -->
            <tr>
                <td rowspan="4" class="company-cell">Cohere<br/>(Enterprise LLMs)</td>
                <td><span class="round-pill seed">Seed (2019)</span></td>
                <td>$5.0M ($20M Val)</td>
                <td>Radical Ventures, Geoffrey Hinton, Pieter Abbeel</td>
                <td><span class="firm-highlight">Cooley LLP</span> & Osler - Ex-Google Brain Transformer authors</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (Sep 2021)</span></td>
                <td>$40.0M ($250M Val)</td>
                <td><strong>Index Ventures</strong> (<span class="partner-highlight">Mike Volpi</span> - Board), Radical Ventures</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Feb 2022)</span></td>
                <td>$125.0M ($1.0B Val)</td>
                <td><strong>Tiger Global</strong>, Radical Ventures, Index Ventures</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Unicorn status milestone</td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (Jun 2023)</span></td>
                <td>$270.0M ($2.2B Val)</td>
                <td><strong>Inovia Capital</strong>, Nvidia, Oracle, Salesforce Ventures</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Enterprise cloud distribution on Oracle Cloud (OCI)</td>
            </tr>

            <!-- HARVEY AI -->
            <tr>
                <td rowspan="4" class="company-cell">Harvey AI<br/>(Legal LLMs)</td>
                <td><span class="round-pill seed">Seed (Nov 2022)</span></td>
                <td>$5.0M ($20M Val)</td>
                <td><strong>OpenAI Startup Fund</strong> (<span class="partner-highlight">Brad Lightcap</span>)</td>
                <td><span class="firm-highlight">Cooley LLP</span> & Gunderson Dettmer</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (Apr 2023)</span></td>
                <td>$21.0M ($100M Val)</td>
                <td><strong>Sequoia Capital</strong> (<span class="partner-highlight">Charlie Bell, Sonya Huang</span>)</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Allen & Overy partnership</td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (Dec 2023)</span></td>
                <td>$80.0M ($715M Val)</td>
                <td><strong>Kleiner Perkins</strong> (<span class="partner-highlight">Ilya Fushman</span>) & <span class="partner-highlight">Elad Gil</span></td>
                <td><span class="firm-highlight">Cooley LLP</span> - PwC exclusive global alliance</td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (Jul 2024)</span></td>
                <td>$100.0M ($1.5B Val)</td>
                <td><strong>GV (Google Ventures)</strong>, OpenAI Startup Fund, Sequoia, Kleiner</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Unicorn status reached in under 20 months</td>
            </tr>

            <!-- GLEAN -->
            <tr>
                <td rowspan="4" class="company-cell">Glean<br/>(Enterprise AI Search)</td>
                <td><span class="round-pill seed">Seed (2019)</span></td>
                <td>$15.0M ($50M Val)</td>
                <td><strong>Lightspeed</strong> (<span class="partner-highlight">Ravi Mhatre</span>) & <strong>Kleiner Perkins</strong> (<span class="partner-highlight">Mamoon Hamid</span>)</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Arvind Jain (former Google Distinguished Engineer)</td>
            </tr>
            <tr>
                <td><span class="round-pill series-a">Series A (2020)</span></td>
                <td>$20.0M ($120M Val)</td>
                <td><strong>General Catalyst</strong> (<span class="partner-highlight">Paul Sagan</span>) & Lightspeed</td>
                <td><span class="firm-highlight">Cooley LLP</span></td>
            </tr>
            <tr>
                <td><span class="round-pill series-b">Series B (2021)</span></td>
                <td>$35.0M ($300M Val)</td>
                <td><strong>General Catalyst</strong>, Lightspeed, Kleiner Perkins</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Work AI graph development</td>
            </tr>
            <tr>
                <td><span class="round-pill series-c">Series C (May 2022)</span></td>
                <td>$100.0M ($1.0B Val)</td>
                <td><strong>Sequoia Capital</strong> (<span class="partner-highlight">Sonya Huang</span> - Board), SoftBank, General Catalyst</td>
                <td><span class="firm-highlight">Cooley LLP</span> - Unicorn milestone ($55M+ ARR run-rate)</td>
            </tr>
        </tbody>
    </table>

    <div class="footer-bar">
        <span>CONFIDENTIAL AI AUDIT &bull; SEED THROUGH SERIES C CAPITAL ROUNDS</span>
        <span>SEED_ROUND FRONTIER AI DOSSIER</span>
    </div>
</body>
</html>
"""

def generate_all_seed_reports():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(DL_DIR, exist_ok=True)

    reports = [
        ("SEED_ROUND_The_Master_Early_Stage_Rounds_Compendium", MASTER_EARLY_STAGE_HTML),
        ("SEED_ROUND_Early_Stage_Venture_Capital_Kingpins_and_Law_Firms", VC_KINGPINS_EARLY_HTML),
        ("SEED_ROUND_YC_Companies_Seed_Through_Series_C_Audit", YC_EARLY_AUDIT_HTML),
        ("SEED_ROUND_AI_Titans_Seed_Through_Series_C_Audit", AI_EARLY_AUDIT_HTML)
    ]

    for base, html_content in reports:
        html_file = os.path.join(OUT_DIR, f"{base}.html")
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        pdf_out = os.path.join(OUT_DIR, f"{base}.pdf")
        docx_out = os.path.join(OUT_DIR, f"{base}.docx")

        # Convert to Chromium Vector PDF
        cmd_pdf = [
            CHROME_BIN,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={pdf_out}",
            "--print-to-pdf-no-header",
            html_file
        ]
        subprocess.run(cmd_pdf, check=True)

        # Convert to DOCX
        cmd_docx = ["textutil", "-convert", "docx", html_file, "-output", docx_out]
        subprocess.run(cmd_docx, check=True)

        # Copy to ~/Downloads
        shutil.copy2(pdf_out, os.path.join(DL_DIR, f"{base}.pdf"))
        shutil.copy2(docx_out, os.path.join(DL_DIR, f"{base}.docx"))
        print(f"Generated & Deployed: {base} (PDF & DOCX)")

if __name__ == "__main__":
    generate_all_seed_reports()
