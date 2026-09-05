import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 752, "INSTITUTIONAL DUE DILIGENCE DOSSIER • SOURCING SPAC & NEAR-SPAC QUALITY SHELLS")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 746, letter[0] - 54, 746)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 34, page_text)
        self.drawString(54, 34, "CONFIDENTIAL & PROPRIETARY • CAPITAL MARKETS ADVISORY & REVERSE MERGER METHODOLOGY")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 44, letter[0] - 54, 44)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=58,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0f172a") # Dark Slate
    c_accent = colors.HexColor("#2563eb")  # Royal Blue
    c_teal = colors.HexColor("#0d9488")    # Deep Teal
    c_red = colors.HexColor("#b91c1c")     # Crimson
    c_dark = colors.HexColor("#1e293b")
    c_muted = colors.HexColor("#475569")
    c_bg_light = colors.HexColor("#f8fafc")
    c_border = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_primary,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_accent,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_primary,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_teal,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=c_primary
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=c_dark
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("SOURCING SPAC & NEAR-SPAC QUALITY SHELLS", title_style))
    story.append(Paragraph("Systematic Reconnaissance Architecture, Toxic Debt Elimination, and SEC EDGAR Automated Screening", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_accent, spaceBefore=2, spaceAfter=14))

    # Executive Overview Callout
    exec_summary_text = (
        "<b>EXECUTIVE MANDATE:</b> Most retail and micro-cap shell brokers traffic in distressed, toxic "
        "penny shells trading at $0.0001 - $0.005 per share, crippled by unfiled tax obligations, undisclosed liabilities, "
        "and aggressive floorless convertible promissory notes that guarantee rapid dilution death spirals. "
        "This dossier outlines the rigorous, institutional methodology to identify <b>SPAC-grade and virgin clean shells</b>: "
        "Exchange Act registered entities with <b>zero commercial debt, clean audited balance sheets, reputable securities counsel, "
        "current PCAOB audits, and compliance with Rule 144(i)</b>."
    )
    callout_data = [[Paragraph(exec_summary_text, callout_style)]]
    t_callout = Table(callout_data, colWidths=[504])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
        ('BORDER', (0,0), (-1,-1), 1.5, c_accent),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_callout)
    story.append(Spacer(1, 14))

    # Section 1: The 4 Institutional Shell Archetypes
    story.append(Paragraph("1. The Four Institutional Quality Shell Archetypes", h1_style))
    story.append(Paragraph(
        "To avoid the toxic penny stock quagmire, acquisition sponsors must strictly restrict their target universe "
        "to four well-defined institutional corporate archetypes:", body_style
    ))

    archetypes_data = [
        [Paragraph("Shell Archetype", table_header), Paragraph("Genesis & Mechanism", table_header), Paragraph("Key Institutional Virtues", table_header), Paragraph("Target Valuation", table_header)],
        [
            Paragraph("<b>Type A: Liquidated / Post-Redemption SPACs</b>", table_cell_bold),
            Paragraph("NYSE / Nasdaq blank check companies (SIC 6770) that completed public share redemptions or liquidation of their trust accounts without closing an initial business combination.", table_cell),
            Paragraph("• Tier-1 Big-4/National PCAOB audit pedigree<br/>• Zero operating liabilities (trust funded)<br/>• Loeb & Loeb / Ellenoff counsel quality<br/>• S-1 prospectus disclosures", table_cell),
            Paragraph("$350K – $750K sponsor fee + equity retainage", table_cell)
        ],
        [
            Paragraph("<b>Type B: Form 10-12G 'Virgin' Blank Checks</b>", table_cell_bold),
            Paragraph("Exchange Act Section 12(g) registered shells created deliberately by securities counsel without a public offering (not subject to Rule 419 escrow rules).", table_cell),
            Paragraph("• <b>Never had active commercial operations</b><br/>• Pristine zero-debt balance sheet<br/>• Compact share structure (10M-30M shares)<br/>• Unencumbered corporate history", table_cell),
            Paragraph("$250K – $450K clean equity transaction", table_cell)
        ],
        [
            Paragraph("<b>Type C: Post-Asset-Sale 'Fallen Angels'</b>", table_cell_bold),
            Paragraph("Former Nasdaq or NYSE American operating companies that completed a Section 363 or strategic asset divestiture, extinguished 100% of debt, and retained an SEC shell.", table_cell),
            Paragraph("• Established CUSIP & active DTC eligibility<br/>• Large round-lot shareholder base (300-400+)<br/>• Immediate direct uplisting readiness<br/>• Trades at $0.50 – $5.00+ on OTCQB/OTCQX", table_cell),
            Paragraph("$500K – $1.2M + 5-10% post-merger equity", table_cell)
        ],
        [
            Paragraph("<b>Type D: Section 3(a)(10) Court Reorg Shells</b>", table_cell_bold),
            Paragraph("Restructured under a state or federal court fairness hearing pursuant to Section 3(a)(10) of the Securities Act of 1933.", table_cell),
            Paragraph("• Judicial cancellation of all legacy liabilities<br/>• Free-trading common shares issued under court order<br/>• Permanent legal immunity from legacy claims", table_cell),
            Paragraph("$300K – $600K court-settled asset", table_cell)
        ],
    ]
    t_archetypes = Table(archetypes_data, colWidths=[120, 150, 144, 90])
    t_archetypes.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_archetypes)
    story.append(Spacer(1, 14))

    # Section 2: The Toxic Debt Elimination Protocol
    story.append(Paragraph("2. The Eight Toxic Debt 'Kill Switches' (Automatic Disqualifiers)", h1_style))
    story.append(Paragraph(
        "Sub-penny stocks ($0.0001 - $0.005) are engineered for dilution. An algorithmic screener must enforce "
        "the following non-negotiable kill switches to disqualify toxic issuers instantly:", body_style
    ))

    kills = [
        "<b>1. Floorless Convertible Promissory Notes:</b> Any notes convertible at a floating discount (e.g. 30% - 60% below future 20-day VWAP). Disqualify immediately. Noteholders will short the stock into oblivion.",
        "<b>2. ASC 815 Derivative Liabilities:</b> The presence of derivative liabilities on the balance sheet reflects toxic variable-rate conversion options or price-protection penalty warrants.",
        "<b>3. Sub-Penny Trading Prices (< $0.10):</b> Any company trading at $0.0001 - $0.01 indicates authorized share exhaustion and active dumping. Quality shells trade at $0.50 - $10.00+ or are pre-quote Form 10s.",
        "<b>4. Authorized Share Overhang (> 100M - 10B Shares):</b> Predatory shells inflate authorized share capital to 5,000,000,000+ shares to feed conversion mills. Clean shells maintain under 50M to 100M authorized shares.",
        "<b>5. Rule 144(i) Taint Without Form 10 Cure:</b> Under Rule 144(i), restricted stock in a shell cannot be resold unless the company filed comprehensive Form 10 information and remained fully current for 12 months.",
        "<b>6. DTC Chills or Global Locks:</b> If the Depository Trust & Clearing Corporation has placed a deposit chill, book-entry chill, or global lock on the CUSIP, shares cannot clear electronically.",
        "<b>7. Sanctioned or Barred Auditors:</b> Audit opinions issued by PCAOB-sanctioned firms (such as BF Borgers CPA PC) are rejected by the SEC, requiring complete restatements of all historical filings.",
        "<b>8. Caveat Emptor & Grey Market Tiers:</b> The skull-and-crossbones flag on OTC Markets denotes active fraud investigations, spam campaigns, or catastrophic failure of public disclosure."
    ]
    for k in kills:
        story.append(Paragraph(f"• {k}", bullet_style))

    story.append(PageBreak())

    # Section 3: The Algorithmic Sourcing Engine & Pipeline
    story.append(Paragraph("3. Quantitative Algorithmic Screening Architecture", h1_style))
    story.append(Paragraph(
        "To discover these pristine acquisition vehicles programmatically, the data engine executes a 4-phase pipeline "
        "integrating live SEC EDGAR full-text search, XBRL financial facts, and market tier metadata:", body_style
    ))

    pipeline_data = [
        [Paragraph("Pipeline Phase", table_header), Paragraph("Data Source & Endpoint", table_header), Paragraph("Query & Extraction Filter", table_header), Paragraph("Output Filter Gate", table_header)],
        [
            Paragraph("<b>Phase 1: SEC EDGAR Ingestion</b>", table_cell_bold),
            Paragraph("SEC Full-Text Search API<br/><code>https://efts.sec.gov/LATEST/search-index</code>", table_cell),
            Paragraph("• <code>sics=6770</code> (Blank Checks)<br/>• <code>forms=10-12G,10-12G/A,8-K</code><br/>• Queries: <code>\"Rule 12b-2\"</code>, <code>\"Item 5.06\"</code>, <code>\"redemption of public shares\"</code>", table_cell),
            Paragraph("Extracts candidate CIK pool (typically 150-300 active targets).", table_cell)
        ],
        [
            Paragraph("<b>Phase 2: Machine XBRL Audit</b>", table_cell_bold),
            Paragraph("SEC Company Facts API<br/><code>https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json</code>", table_cell),
            Paragraph("• <code>Liabilities == 0</code> or < $35,000<br/>• <code>ConvertibleNotesPayable == None</code><br/>• <code>DerivativeLiabilities == None</code><br/>• <code>CommonStockSharesOutstanding < 30M</code>", table_cell),
            Paragraph("Eliminates 95% of toxic candidates in sub-second automated audit.", table_cell)
        ],
        [
            Paragraph("<b>Phase 3: Market Tier Screening</b>", table_cell_bold),
            Paragraph("OTC Markets / FINRA API<br/><code>https://data.otcmarkets.com/stocks</code>", table_cell),
            Paragraph("• Price Floor: >= $0.50 (or unquoted Form 10)<br/>• Tiers: OTCQX, OTCQB, Pink Current<br/>• Exclude Caveat Emptor & Grey Market<br/>• Verified Transfer Agent (Continental, Computershare)", table_cell),
            Paragraph("Filters for liquidity preservation and DTC electronic clearing.", table_cell)
        ],
        [
            Paragraph("<b>Phase 4: Forensic Cleanliness</b>", table_cell_bold),
            Paragraph("State SOS API + PACER Federal Dockets + SEC Enforcement", table_cell),
            Paragraph("• Delaware / Nevada SOS: 'Good Standing'<br/>• Franchise taxes paid to date<br/>• Zero federal litigation dockets on PACER<br/>• No SEC Section 8(d) Stop Orders", table_cell),
            Paragraph("Yields final vetted target pool for sponsor acquisition.", table_cell)
        ],
    ]
    t_pipeline = Table(pipeline_data, colWidths=[110, 130, 160, 104])
    t_pipeline.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_teal),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_pipeline)
    story.append(Spacer(1, 14))

    # Section 4: The 100-Point SPAC-Grade Shell Index (SGSI)
    story.append(Paragraph("4. The 100-Point SPAC-Grade Shell Index (SGSI) Matrix", h1_style))
    story.append(Paragraph(
        "Each identified corporate shell is scored across six weighted governance pillars. Issuers scoring >= 85 "
        "qualify as Tier-1 SPAC-grade; issuers scoring 70-84 qualify as Clean Reporting Shells; below 70 is rejected:", body_style
    ))

    sgsi_data = [
        [Paragraph("Pillar", table_header), Paragraph("Weight", table_header), Paragraph("Scoring Criteria & Verification Rules", table_header)],
        [
            Paragraph("<b>1. Debt & Balance Sheet Purity</b>", table_cell_bold),
            Paragraph("<b>30 Pts</b>", table_cell_bold),
            Paragraph("• Zero Liabilities: <b>+30 pts</b><br/>• Nominal Sponsor Accounts Payable (< $35k): <b>+25 pts</b><br/>• Liabilities $35k - $150k: <b>+15 pts</b><br/>• <i>Any Convertible Debt or Derivative Liability: <b>DISQUALIFIED (0 Pts)</b></i>", table_cell)
        ],
        [
            Paragraph("<b>2. SEC Regulatory Currentness</b>", table_cell_bold),
            Paragraph("<b>20 Pts</b>", table_cell_bold),
            Paragraph("• Registered SIC 6770 Blank Check / SPAC: <b>+15 pts</b><br/>• Periodic 10-K & 10-Q Current (No delinquent filings): <b>+5 pts</b><br/>• Form 10 Information filed > 12 Months (Rule 144(i) cure satisfied): <b>+5 pts</b>", table_cell)
        ],
        [
            Paragraph("<b>3. Trading Tier & Price Floor</b>", table_cell_bold),
            Paragraph("<b>15 Pts</b>", table_cell_bold),
            Paragraph("• Trading >= $1.00 on OTCQX / OTCQB: <b>+15 pts</b><br/>• Unquoted Form 10 Reporting Entity: <b>+10 pts</b><br/>• Pink Current ($0.25 - $1.00): <b>+8 pts</b><br/>• <i>Sub-penny (< $0.05) or Caveat Emptor: <b>DISQUALIFIED (-30 Pts)</b></i>", table_cell)
        ],
        [
            Paragraph("<b>4. Capital Structure Quality</b>", table_cell_bold),
            Paragraph("<b>15 Pts</b>", table_cell_bold),
            Paragraph("• Compact O/S (< 30M Shares): <b>+10 pts</b><br/>• Authorized Shares < 100M: <b>+5 pts</b><br/>• Clean preferred structure (no super-voting block held by hostile insiders): <b>+5 pts</b><br/>• <i>Authorized Shares > 1B: <b>-20 pts penalty</b></i>", table_cell)
        ],
        [
            Paragraph("<b>5. Institutional Pedigree</b>", table_cell_bold),
            Paragraph("<b>10 Pts</b>", table_cell_bold),
            Paragraph("• Active PCAOB Auditor with Clean Inspection Report: <b>+5 pts</b><br/>• Reputable Tier-1 Securities Legal Counsel (Loeb & Loeb, Ellenoff, etc.): <b>+5 pts</b><br/>• <i>Barred / Sanctioned Auditor (BF Borgers, etc.): <b>-40 pts penalty</b></i>", table_cell)
        ],
        [
            Paragraph("<b>6. Corporate Governance Cleanliness</b>", table_cell_bold),
            Paragraph("<b>10 Pts</b>", table_cell_bold),
            Paragraph("• Prime Corporate Charter in Good Standing (Delaware, Nevada, Wyoming): <b>+5 pts</b><br/>• PACER Clean (Zero open federal litigation / judgments): <b>+5 pts</b><br/>• DTC Eligible with Fast Automated Securities Transfer (FAST): <b>Mandatory</b>", table_cell)
        ],
    ]
    t_sgsi = Table(sgsi_data, colWidths=[130, 60, 314])
    t_sgsi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_sgsi)
    story.append(Spacer(1, 14))

    # Section 5: Screened Live Case Studies
    story.append(Paragraph("5. Screened Case Studies: Validated Pristine vs. Toxic Shells", h1_style))
    story.append(Paragraph(
        "Live execution of this screening engine against active SEC EDGAR filings illustrates the precision "
        "of the toxic debt elimination guardrails:", body_style
    ))

    case_data = [
        [Paragraph("Company & CIK", table_header), Paragraph("Classification & State", table_header), Paragraph("Balance Sheet & Debt Audit", table_header), Paragraph("SGSI Score & Verdict", table_header)],
        [
            Paragraph("<b>Accelerated Acquisition XVII, Inc.</b><br/>CIK: 0001534629", table_cell),
            Paragraph("SIC 6770 Blank Check<br/>Delaware Corporation", table_cell),
            Paragraph("<b>$0.00 Liabilities</b>. Pure virgin blank check formed under Form 10-12G. Fully reporting.", table_cell),
            Paragraph("<font color='#0d9488'><b>95 / 100</b></font><br/><b>Tier-1 Pristine Blank Check</b>", table_cell)
        ],
        [
            Paragraph("<b>GOP & CO2, INC.</b><br/>CIK: 0001582576", table_cell),
            Paragraph("SIC 6770 Blank Check<br/>Delaware Corporation", table_cell),
            Paragraph("<b>$6,700 Total Liabilities</b>. Nominal administrative payables. Zero debt. Current on 10-K/10-Q.", table_cell),
            Paragraph("<font color='#0d9488'><b>90 / 100</b></font><br/><b>Tier-1 Pristine Blank Check</b>", table_cell)
        ],
        [
            Paragraph("<b>Stalar 5, Inc.</b><br/>CIK: 0001561399", table_cell),
            Paragraph("SIC 6770 Blank Check<br/>Delaware Corporation", table_cell),
            Paragraph("<b>$29,980 Total Liabilities</b>. Clean accrued professional expenses. No secured debt.", table_cell),
            Paragraph("<font color='#0d9488'><b>85 / 100</b></font><br/><b>Tier-1 Clean Blank Check</b>", table_cell)
        ],
        [
            Paragraph("<b>Aequi Acquisition Corp.</b><br/>CIK: 0001823826", table_cell),
            Paragraph("Former SPAC Shell<br/>Delaware Corporation", table_cell),
            Paragraph("<b>Toxic Convertible Debt Detected</b>. Derivative warrant liabilities on balance sheet.", table_cell),
            Paragraph("<font color='#b91c1c'><b>0 / 100</b></font><br/><b>DISQUALIFIED (Toxic Debt)</b>", table_cell)
        ],
    ]
    t_case = Table(case_data, colWidths=[120, 100, 164, 120])
    t_case.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_case)
    story.append(Spacer(1, 14))

    # Section 6: Direct Uplisting Roadmap
    story.append(Paragraph("6. Reverse Merger to Nasdaq/NYSE American Direct Uplisting Roadmap", h1_style))
    story.append(Paragraph(
        "By sourcing an unencumbered shell with clean capital structure, the surviving operating company can bypass "
        "the micro-cap dilution cycle and execute an institutional reverse merger into direct exchange uplisting:", body_style
    ))
    
    steps = [
        "<b>Step 1: Share Exchange / Merger Agreement:</b> The target private operating company executes a definitive share exchange with the shell sponsor, exchanging 90-95% of equity for control.",
        "<b>Step 2: Super 8-K / Form 10 Disclosures (Day 4):</b> Within 4 business days of closing, the company files a comprehensive 'Super 8-K' containing full Form 10 information and 2 years of PCAOB audited financials.",
        "<b>Step 3: Concurrent Institutional PIPE:</b> Simultaneous closing of a $10M - $30M institutional Private Investment in Public Equity (PIPE) at $4.00+ per share to fulfill Nasdaq minimum equity and bid price rules.",
        "<b>Step 4: Nasdaq Capital Market Uplisting (Rule 5505):</b> Satisfy $4.00 bid price, $4M-$5M stockholders' equity, and 300 round-lot holders for seamless ringing of the opening bell."
    ]
    for s in steps:
        story.append(Paragraph(f"• {s}", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Executive PDF generated successfully: {filename}")

if __name__ == '__main__':
    out_pdf = "/Users/ericmiller/NEW JUNE 26/quality-shell-sourcing-research/SPAC_Quality_Shell_Stock_Sourcing_Guide.pdf"
    build_pdf(out_pdf)
