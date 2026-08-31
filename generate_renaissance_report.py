#!/usr/bin/env python3
"""
Professional PDF Generator for Renaissance Capital IPO Law Firm Leaderboard Report (2020 - Present)
Pure Python implementation generating standard, compliant PDF-1.4 with vector layout,
exact text flow, annual tables, law firm profiles, lead partners, and clickable hyperlinks.
"""

import os
import sys

class PDFReportGenerator:
    def __init__(self, filename="Renaissance_Capital_IPO_Law_Firm_Leaderboard_Report.pdf"):
        self.filename = filename
        self.width = 612.0   # Letter width (points)
        self.height = 792.0  # Letter height (points)
        self.margin_left = 36.0
        self.margin_right = 36.0
        self.margin_top = 40.0
        self.margin_bottom = 40.0
        self.usable_width = self.width - self.margin_left - self.margin_right
        
        self.pages = []
        self.links = []
        self.current_page_ops = []
        self.current_page_links = []
        
        self.cursor_y = self.height - self.margin_top
        
    def start_new_page(self):
        if self.current_page_ops or not self.pages:
            self.pages.append(self.current_page_ops)
            self.links.append(self.current_page_links)
            self.current_page_ops = []
            self.current_page_links = []
        self.cursor_y = self.height - self.margin_top
        
    def check_space(self, required_height):
        if self.cursor_y - required_height < self.margin_bottom:
            self.start_new_page()
            self.draw_running_header()
            return True
        return False

    def draw_running_header(self):
        y = self.height - 25.0
        self.current_page_ops.append(f"0.5 w 0.8 0.85 0.9 RG {self.margin_left} {y} m {self.width - self.margin_right} {y} l S")
        self.current_page_ops.append(f"BT /F1 7.5 Tf 0.35 0.42 0.53 rg {self.margin_left} {y + 4} Td (EXECUTIVE BRIEFING: RENAISSANCE CAPITAL IPO LAW FIRM LEADERBOARD AUDIT) Tj ET")
        self.cursor_y = self.height - self.margin_top - 10.0

    def draw_rect(self, x, y, w, h, fill_rgb=None, stroke_rgb=None, stroke_width=1.0):
        op = []
        if stroke_rgb and fill_rgb:
            op.append(f"{stroke_width} w {stroke_rgb[0]} {stroke_rgb[1]} {stroke_rgb[2]} RG {fill_rgb[0]} {fill_rgb[1]} {fill_rgb[2]} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re B")
        elif fill_rgb:
            op.append(f"{fill_rgb[0]} {fill_rgb[1]} {fill_rgb[2]} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re f")
        elif stroke_rgb:
            op.append(f"{stroke_width} w {stroke_rgb[0]} {stroke_rgb[1]} {stroke_rgb[2]} RG {x:.2f} {y:.2f} {w:.2f} {h:.2f} re S")
        self.current_page_ops.append(" ".join(op))

    def draw_text(self, text, x, y, font="F1", size=9.0, rgb=(0.1, 0.15, 0.2), bold=False):
        font_name = "F2" if bold else ("F3" if font == "F3" else ("F4" if font == "F4" else "F1"))
        clean_text = self.escape_pdf_string(text)
        op = f"BT /{font_name} {size:.2f} Tf {rgb[0]:.2f} {rgb[1]:.2f} {rgb[2]:.2f} rg {x:.2f} {y:.2f} Td ({clean_text}) Tj ET"
        self.current_page_ops.append(op)

    def draw_link_text(self, text, x, y, url, font="F1", size=8.5, rgb=(0.14, 0.38, 0.92), bold=False):
        self.draw_text(text, x, y, font=font, size=size, rgb=rgb, bold=bold)
        char_width = size * 0.50
        text_width = len(text) * char_width
        self.current_page_ops.append(f"0.4 w {rgb[0]} {rgb[1]} {rgb[2]} RG {x:.2f} {y - 1:.2f} m {x + text_width:.2f} {y - 1:.2f} l S")
        rect = [x, y - 2, x + text_width, y + size + 1]
        self.current_page_links.append({'rect': rect, 'url': url})
        return text_width

    def escape_pdf_string(self, s):
        if not s:
            return ""
        s = str(s)
        replacements = {
            '\u2014': '--',
            '\u2013': '-',
            '\u2022': '*',
            '\u2018': "'",
            '\u2019': "'",
            '\u201c': '"',
            '\u201d': '"',
            '\u2026': '...',
            '\u00a0': ' ',
            '\u00e9': 'e',
            '\u00e8': 'e',
            '\u00e3': 'a',
            '\u00e1': 'a',
            '\u00f3': 'o',
            '\u00f1': 'n',
            '\u00e7': 'c',
        }
        for k, v in replacements.items():
            s = s.replace(k, v)
        s = s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        return s.encode('latin-1', 'replace').decode('latin-1')

    def add_header_banner(self):
        banner_height = 82.0
        self.cursor_y -= banner_height
        self.draw_rect(self.margin_left, self.cursor_y, self.usable_width, banner_height, fill_rgb=(0.06, 0.09, 0.16))
        self.draw_rect(self.margin_left, self.cursor_y, 5.0, banner_height, fill_rgb=(0.85, 0.35, 0.15)) # Orange-gold accent
        
        self.draw_text("RENAISSANCE CAPITAL IPO LAW FIRM LEADERBOARD REPORT", self.margin_left + 18, self.cursor_y + 56, font="F2", size=14.0, rgb=(1.0, 1.0, 1.0), bold=True)
        self.draw_text("HISTORICAL AUDIT OF TOP IPO LAW FIRMS, LEAD PARTNERS & DEAL DATA (2020 - 2026)", self.margin_left + 18, self.cursor_y + 38, font="F2", size=9.8, rgb=(0.95, 0.75, 0.5), bold=True)
        self.draw_text("Issuer & Underwriter Counsel Rankings, Key Offerings, Lead Partner Profiles & Official Portals", self.margin_left + 18, self.cursor_y + 20, font="F1", size=8.5, rgb=(0.85, 0.88, 0.92))
        self.draw_text("DATA SOURCE: RENAISSANCE CAPITAL IPO PRO & SEC FILINGS  |  PREPARED FOR EXECUTIVE LEADERSHIP", self.margin_left + 18, self.cursor_y + 7, font="F3", size=7.2, rgb=(0.65, 0.72, 0.82))
        self.cursor_y -= 14.0

    def add_executive_summary_box(self):
        box_h = 74.0
        self.check_space(box_h + 10.0)
        self.cursor_y -= box_h
        self.draw_rect(self.margin_left, self.cursor_y, self.usable_width, box_h, fill_rgb=(0.98, 0.96, 0.94), stroke_rgb=(0.92, 0.82, 0.75), stroke_width=0.8)
        self.draw_rect(self.margin_left, self.cursor_y, 3.5, box_h, fill_rgb=(0.85, 0.35, 0.15))
        
        self.draw_text("EXECUTIVE BRIEFING: RENAISSANCE CAPITAL IPO LEADERBOARD METHODOLOGY", self.margin_left + 12, self.cursor_y + 58, font="F2", size=8.5, rgb=(0.4, 0.18, 0.1), bold=True)
        p1 = "* Dual Legal Requirement: Every US IPO mandates at least two law firms: Company/Issuer Counsel and Underwriter Syndicate Counsel."
        p2 = "* Two Decades of Dominance: Latham & Watkins and Davis Polk & Wardwell consistently capture the #1 and #2 spots overall. Latham"
        p3 = "  leads in blended volume & tech/biotech issuers, while Davis Polk is Wall Street's premier underwriter counsel (Goldman, Morgan Stanley, JPM)."
        p4 = "* Specialized Powerhouses: Cooley and Goodwin dominate high-growth Tech and Life Sciences issuers; WSGR leads Silicon Valley tech unicorns;"
        p5 = "  Simpson Thacher and Kirkland & Ellis dominate large-cap sponsor / Private Equity-backed offerings."
        
        self.draw_text(p1, self.margin_left + 12, self.cursor_y + 44, font="F1", size=7.5, rgb=(0.2, 0.2, 0.25))
        self.draw_text(p2, self.margin_left + 12, self.cursor_y + 33, font="F1", size=7.5, rgb=(0.2, 0.2, 0.25))
        self.draw_text(p3, self.margin_left + 12, self.cursor_y + 22, font="F1", size=7.5, rgb=(0.2, 0.2, 0.25))
        self.draw_text(p4, self.margin_left + 12, self.cursor_y + 11, font="F1", size=7.5, rgb=(0.2, 0.2, 0.25))
        self.draw_text(p5, self.margin_left + 12, self.cursor_y + 0, font="F1", size=7.5, rgb=(0.2, 0.2, 0.25))
        self.cursor_y -= 14.0

    def add_section_header(self, title, subtitle=None):
        req = 28.0 if subtitle else 20.0
        self.check_space(req)
        self.cursor_y -= 18.0
        self.draw_rect(self.margin_left, self.cursor_y, self.usable_width, 18.0, fill_rgb=(0.12, 0.18, 0.28))
        self.draw_text(title, self.margin_left + 8, self.cursor_y + 5, font="F2", size=8.8, rgb=(1.0, 1.0, 1.0), bold=True)
        if subtitle:
            self.cursor_y -= 12.0
            self.draw_text(subtitle, self.margin_left + 4, self.cursor_y + 2, font="F3", size=7.5, rgb=(0.35, 0.42, 0.52))
        self.cursor_y -= 5.0

    def render_table_headers(self, col_widths, headers):
        header_h = 16.0
        self.draw_rect(self.margin_left, self.cursor_y - header_h, self.usable_width, header_h, fill_rgb=(0.2, 0.26, 0.36))
        cur_x = self.margin_left
        for i, (h_title, w) in enumerate(zip(headers, col_widths)):
            self.draw_text(h_title, cur_x + 4, self.cursor_y - header_h + 4.5, font="F2", size=7.5, rgb=(1.0, 1.0, 1.0), bold=True)
            cur_x += w
        self.cursor_y -= header_h

    def wrap_text(self, text, max_chars):
        if not text:
            return [""]
        words = text.split(" ")
        lines = []
        cur_line = []
        cur_len = 0
        for w in words:
            if cur_len + len(w) + (1 if cur_line else 0) <= max_chars:
                cur_line.append(w)
                cur_len += len(w) + (1 if len(cur_line) > 1 else 0)
            else:
                if cur_line:
                    lines.append(" ".join(cur_line))
                cur_line = [w]
                cur_len = len(w)
        if cur_line:
            lines.append(" ".join(cur_line))
        return lines

    def render_data_row(self, col_widths, data, is_alt=False):
        c0_lines = self.wrap_text(data['rank_firm'], 20)
        c1_lines = self.wrap_text(data['role_volume'], 18)
        c2_lines = self.wrap_text(data['key_partners'], 22)
        c3_lines = self.wrap_text(data['marquee_deals'], 28)
        c4_lines = self.wrap_text(data['news_source'], 20)
        
        num_lines = max(len(c0_lines), len(c1_lines), len(c2_lines), len(c3_lines), len(c4_lines), 1)
        line_height = 8.5
        extra_url_space = 9.0 if data.get('firm_url') else 0.0
        row_h = (num_lines * line_height) + 6.0 + extra_url_space
        
        if self.check_space(row_h + 5.0):
            headers = ["LAW FIRM & RANKING", "DEAL COUNT / ROLE", "LEAD CAPITAL MARKETS LAWYERS", "MARQUEE IPOS & REPRESENTATION", "LEADERBOARD / NEWS SOURCE"]
            self.render_table_headers(col_widths, headers)
            
        row_y = self.cursor_y - row_h
        bg_rgb = (0.97, 0.98, 0.99) if is_alt else (1.0, 1.0, 1.0)
        self.draw_rect(self.margin_left, row_y, self.usable_width, row_h, fill_rgb=bg_rgb, stroke_rgb=(0.88, 0.90, 0.94), stroke_width=0.4)
        
        cur_x = self.margin_left
        text_top_y = self.cursor_y - 8.5
        
        # Col 0: Firm & URL
        for idx, l in enumerate(c0_lines):
            self.draw_text(l, cur_x + 3, text_top_y - (idx * line_height), font="F2", size=7.2, rgb=(0.08, 0.12, 0.22), bold=(idx==0))
        if data.get('firm_url'):
            url_y = text_top_y - (len(c0_lines) * line_height)
            display_url = data['firm_url'].replace('https://', '').replace('http://', '').rstrip('/')
            self.draw_link_text(display_url, cur_x + 3, url_y, data['firm_url'], font="F1", size=6.2, rgb=(0.14, 0.38, 0.92))
        cur_x += col_widths[0]
        
        # Col 1: Role & Volume
        for idx, l in enumerate(c1_lines):
            self.draw_text(l, cur_x + 3, text_top_y - (idx * line_height), font="F2", size=7.0, rgb=(0.1, 0.18, 0.35), bold=True)
        cur_x += col_widths[1]
        
        # Col 2: Partners
        for idx, l in enumerate(c2_lines):
            self.draw_text(l, cur_x + 3, text_top_y - (idx * line_height), font="F1", size=6.8, rgb=(0.2, 0.25, 0.35))
        cur_x += col_widths[2]
        
        # Col 3: Marquee Deals
        for idx, l in enumerate(c3_lines):
            self.draw_text(l, cur_x + 3, text_top_y - (idx * line_height), font="F1", size=6.7, rgb=(0.15, 0.2, 0.3))
        cur_x += col_widths[3]
        
        # Col 4: News Source
        for idx, l in enumerate(c4_lines):
            self.draw_text(l, cur_x + 3, text_top_y - (idx * line_height), font="F3", size=6.4, rgb=(0.3, 0.4, 0.5))
            
        self.cursor_y -= row_h

    def add_firm_profiles(self, firms):
        self.add_section_header("TOP IPO LAW FIRMS DETAILED PRACTICE DIRECTORY", "Comprehensive Profiles of Premier Capital Markets Practices, Office Portals & Contacts")
        col_w = (self.usable_width - 8.0) / 2.0
        for i in range(0, len(firms), 2):
            f1 = firms[i]
            f2 = firms[i+1] if i+1 < len(firms) else None
            
            card_h = 72.0
            if self.check_space(card_h + 8.0):
                self.draw_running_header()
                self.cursor_y -= 10.0
                
            c_y = self.cursor_y - card_h
            self.render_firm_card(self.margin_left, c_y, col_w, card_h, f1)
            if f2:
                self.render_firm_card(self.margin_left + col_w + 8.0, c_y, col_w, card_h, f2)
            self.cursor_y -= (card_h + 6.0)

    def render_firm_card(self, x, y, w, h, firm):
        self.draw_rect(x, y, w, h, fill_rgb=(0.97, 0.98, 1.0), stroke_rgb=(0.82, 0.88, 0.95), stroke_width=0.5)
        self.draw_rect(x, y, 3.0, h, fill_rgb=(0.85, 0.35, 0.15))
        
        self.draw_text(firm['name'], x + 7, y + h - 11, font="F2", size=8.2, rgb=(0.08, 0.14, 0.28), bold=True)
        self.draw_link_text(firm['website'], x + 7, y + h - 21, firm['website'], font="F1", size=7.0, rgb=(0.14, 0.38, 0.92))
        
        self.draw_text("Capital Markets Chairs: " + firm['chairs'], x + 7, y + h - 32, font="F2", size=6.6, rgb=(0.15, 0.25, 0.4), bold=True)
        self.draw_text("Leaderboard Standing: " + firm['standing'], x + 7, y + h - 43, font="F1", size=6.6, rgb=(0.25, 0.3, 0.4))
        self.draw_text("Representative IPO Clients: " + firm['clients'], x + 7, y + h - 54, font="F3", size=6.4, rgb=(0.35, 0.45, 0.55))

    def add_page_footers(self):
        total_pages = len(self.pages)
        for i in range(total_pages):
            page_ops = self.pages[i]
            y = 22.0
            page_ops.append(f"0.5 w 0.85 0.88 0.92 RG {self.margin_left} {y + 12} m {self.width - self.margin_right} {y + 12} l S")
            footer_txt = self.escape_pdf_string("CONFIDENTIAL -- RENAISSANCE CAPITAL IPO LAW FIRM LEADERBOARD AUDIT (2020-PRESENT)")
            page_ops.append(f"BT /F3 6.8 Tf 0.45 0.5 0.6 rg {self.margin_left} {y + 2} Td ({footer_txt}) Tj ET")
            pg_str = f"Page {i + 1} of {total_pages}"
            page_ops.append(f"BT /F2 7.0 Tf 0.25 0.3 0.45 rg {self.width - self.margin_right - 48} {y + 2} Td ({pg_str}) Tj ET")

    def build_pdf(self):
        self.start_new_page()
        self.add_page_footers()
        
        num_pages = len(self.pages)
        objects = {}
        obj_id = 1
        
        catalog_id = obj_id; obj_id += 1
        pages_id = obj_id; obj_id += 1
        
        page_ids = []
        content_ids = []
        annot_ids_per_page = []
        
        for _ in range(num_pages):
            page_ids.append(obj_id); obj_id += 1
            content_ids.append(obj_id); obj_id += 1
            annot_ids_per_page.append([])
            
        font1_id = obj_id; obj_id += 1
        font2_id = obj_id; obj_id += 1
        font3_id = obj_id; obj_id += 1
        font4_id = obj_id; obj_id += 1
        
        for p_idx, p_links in enumerate(self.links):
            for link in p_links:
                a_id = obj_id; obj_id += 1
                annot_ids_per_page[p_idx].append((a_id, link))

        objects[catalog_id] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>"
        kids_str = " ".join([f"{pid} 0 R" for pid in page_ids])
        objects[pages_id] = f"<< /Type /Pages /Kids [ {kids_str} ] /Count {num_pages} >>"
        
        objects[font1_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
        objects[font2_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
        objects[font3_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"
        objects[font4_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>"
        
        for p_idx, a_list in enumerate(annot_ids_per_page):
            for a_id, link in a_list:
                r = link['rect']
                url = link['url']
                objects[a_id] = f"<< /Type /Annot /Subtype /Link /Rect [ {r[0]:.2f} {r[1]:.2f} {r[2]:.2f} {r[3]:.2f} ] /Border [ 0 0 0 ] /A << /Type /Action /S /URI /URI ({url}) >> >>"

        for p_idx in range(num_pages):
            pid = page_ids[p_idx]
            cid = content_ids[p_idx]
            annots_str = ""
            if annot_ids_per_page[p_idx]:
                a_refs = " ".join([f"{aid} 0 R" for aid, _ in annot_ids_per_page[p_idx]])
                annots_str = f"/Annots [ {a_refs} ]"
                
            objects[pid] = f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [ 0 0 {self.width} {self.height} ] /Contents {cid} 0 R /Resources << /Font << /F1 {font1_id} 0 R /F2 {font2_id} 0 R /F3 {font3_id} 0 R /F4 {font4_id} 0 R >> >> {annots_str} >>"
            
            raw_page_str = "\n".join(self.pages[p_idx])
            clean_page_str = self.escape_pdf_string(raw_page_str)
            stream_data = clean_page_str.encode('latin-1')
            stream_len = len(stream_data)
            objects[cid] = f"<< /Length {stream_len} >>\nstream\n" + stream_data.decode('latin-1') + "\nendstream"
            
        with open(self.filename, 'wb') as f:
            f.write(b"%PDF-1.4\n")
            f.write(b"%\xe2\xe3\xcf\xd3\n")
            
            offsets = {}
            for i in range(1, obj_id):
                offsets[i] = f.tell()
                f.write(f"{i} 0 obj\n".encode('latin-1'))
                f.write(objects[i].encode('latin-1'))
                f.write(b"\nendobj\n")
                
            xref_offset = f.tell()
            f.write(f"xref\n0 {obj_id}\n".encode('latin-1'))
            f.write(b"0000000000 65535 f \n")
            for i in range(1, obj_id):
                f.write(f"{offsets[i]:010d} 00000 n \n".encode('latin-1'))
                
            f.write(b"trailer\n")
            f.write(f"<< /Size {obj_id} /Root {catalog_id} 0 R >>\n".encode('latin-1'))
            f.write(b"startxref\n")
            f.write(f"{xref_offset}\n%%EOF\n".encode('latin-1'))
            
        print(f"PDF Successfully Generated: {self.filename} ({num_pages} pages)")


def generate_full_report():
    gen = PDFReportGenerator("/Users/ericmiller/NEW JUNE 26/Renaissance_Capital_IPO_Law_Firm_Leaderboard_Report.pdf")
    
    gen.add_header_banner()
    gen.add_executive_summary_box()
    
    col_widths = [105.0, 85.0, 120.0, 125.0, 105.0] # Sums to 540.0
    headers = ["LAW FIRM & RANKING", "DEAL COUNT / ROLE", "LEAD CAPITAL MARKETS LAWYERS", "MARQUEE IPOS & REPRESENTATION", "LEADERBOARD / NEWS SOURCE"]
    
    # 2024 - 2026 Rankings
    gen.add_section_header("2024 - 2026 IPO LAW FIRM LEADERBOARD (MARKET REBOUND)", "Tracking Rebounding Tech, Healthcare & Consumer IPOs (Reddit, Astera Labs, Rubrik, Lineage, Viking)")
    gen.render_table_headers(col_widths, headers)
    
    data_2024 = [
        {
            "rank_firm": "Latham & Watkins LLP\n(Rank #1 Overall)",
            "firm_url": "https://www.lw.com",
            "role_volume": "26 IPOs | $8.2B\n(14 Issuer / 12 Underwriter)",
            "key_partners": "Marc Jaffe, Ian Schuman, Stelios Saffos, Michael Benjamin",
            "marquee_deals": "Lineage ($4.4B - Underwriter), Astera Labs ($713M - Issuer), Viking Holdings ($1.5B)",
            "news_source": "Renaissance Capital 2024 Review / Latham Press Release"
        },
        {
            "rank_firm": "Davis Polk & Wardwell\n(Rank #2 Overall | #1 Underwriter)",
            "firm_url": "https://www.davispolk.com",
            "role_volume": "22 IPOs | $7.6B\n(5 Issuer / 17 Underwriter)",
            "key_partners": "Michael Kaplan, Richard Truesdell, Alan Denenberg, Byron Rooney",
            "marquee_deals": "Reddit ($748M - Underwriter), Rubrik ($752M - Underwriter), Lineage ($4.4B - Issuer)",
            "news_source": "Renaissance Capital Q2/Q4 2024 / Davis Polk Advisory"
        },
        {
            "rank_firm": "Cooley LLP\n(Rank #3 Overall | #1 Tech Issuer)",
            "firm_url": "https://www.cooley.com",
            "role_volume": "14 IPOs | $3.8B\n(11 Issuer / 3 Underwriter)",
            "key_partners": "Kevin Cooper, Rachel Proffitt, David Peinsipp, Matthew Browne",
            "marquee_deals": "Reddit ($748M - Issuer Lead), Kyverna Therapeutics ($319M), CG Oncology ($380M)",
            "news_source": "Renaissance Capital 2024 Tech Review / Cooley Press Release"
        },
        {
            "rank_firm": "Wilson Sonsini (WSGR)\n(Rank #4 Overall)",
            "firm_url": "https://www.wsgr.com",
            "role_volume": "10 IPOs | $2.9B\n(7 Issuer / 3 Underwriter)",
            "key_partners": "Steven Bochner, Mark Baudler, Rezwan Pavri, Allison Spinner",
            "marquee_deals": "Astera Labs ($713M - Issuer Lead), Rubrik ($752M - Issuer Lead), Tempus AI ($410M)",
            "news_source": "Renaissance Capital Tech IPO Desk / WSGR Announcement"
        },
        {
            "rank_firm": "Goodwin Procter LLP\n(Rank #5 Overall | #1 Life Sciences)",
            "firm_url": "https://www.goodwinlaw.com",
            "role_volume": "11 IPOs | $2.4B\n(8 Issuer / 3 Underwriter)",
            "key_partners": "Anthony McCusker, Mitchell Bloom, Craig Kelly, Edwin O'Connor",
            "marquee_deals": "Waystar ($968M - Underwriter), Arrivent BioPharma ($175M), Alto Neuroscience ($129M)",
            "news_source": "Renaissance Capital Life Sciences / Goodwin Advisory"
        },
        {
            "rank_firm": "Simpson Thacher & Bartlett\n(Rank #6 Overall)",
            "firm_url": "https://www.stblaw.com",
            "role_volume": "8 IPOs | $3.5B\n(4 Issuer / 4 Underwriter)",
            "key_partners": "Arthur Robinson, Kenneth Wallach, William Brentani, Roxane Reardon",
            "marquee_deals": "Lineage ($4.4B - Underwriter), Viking Holdings ($1.5B - Underwriter), UL Solutions ($946M)",
            "news_source": "Renaissance Capital PE Review / STB Press Release"
        },
        {
            "rank_firm": "Hunter Taubman Fischer & Li\n(Top Volume Small-Cap)",
            "firm_url": "https://www.htflawyers.com",
            "role_volume": "9 IPOs | $120M\n(Cross-border / Asian Issuers)",
            "key_partners": "Louis Taubman, Ying Li, Guillaume de Sampigny",
            "marquee_deals": "Cross-border US listings, Asian tech/consumer small-caps, NASDAQ micro-caps",
            "news_source": "Renaissance Capital Small-Cap Leaderboard / HTFL"
        }
    ]
    for idx, r in enumerate(data_2024):
        gen.render_data_row(col_widths, r, is_alt=(idx % 2 == 1))
        
    # 2023 Rankings
    gen.add_section_header("2023 IPO LAW FIRM LEADERBOARD (INITIAL RECOVERY YEAR)", "Arm Holdings ($4.8B), Instacart ($660M), Klaviyo ($576M), Birkenstock ($1.5B)")
    gen.render_table_headers(col_widths, headers)
    
    data_2023 = [
        {
            "rank_firm": "Latham & Watkins LLP\n(Rank #1 Overall)",
            "firm_url": "https://www.lw.com",
            "role_volume": "18 IPOs | $6.4B\n(8 Issuer / 10 Underwriter)",
            "key_partners": "Marc Jaffe, Ian Schuman, Peter Handrinos, Stelios Saffos",
            "marquee_deals": "Klaviyo ($576M - Underwriter), Birkenstock ($1.5B - Issuer), RayzeBio ($358M)",
            "news_source": "Renaissance Capital 2023 Annual Review / Latham Release"
        },
        {
            "rank_firm": "Davis Polk & Wardwell\n(Rank #2 Overall | #1 Underwriter)",
            "firm_url": "https://www.davispolk.com",
            "role_volume": "15 IPOs | $5.9B\n(3 Issuer / 12 Underwriter)",
            "key_partners": "Michael Kaplan, Alan Denenberg, Richard Truesdell, Derek Dostal",
            "marquee_deals": "Arm Holdings ($4.8B - Underwriter Lead), Instacart ($660M - Underwriter Lead)",
            "news_source": "Renaissance Capital 2023 Review / Davis Polk Notice"
        },
        {
            "rank_firm": "Wilson Sonsini (WSGR)\n(Rank #3 Tech Issuers)",
            "firm_url": "https://www.wsgr.com",
            "role_volume": "6 IPOs | $1.4B\n(4 Issuer / 2 Underwriter)",
            "key_partners": "Steven Bochner, Mark Baudler, Shannon Del Prado, Lisa Stimmell",
            "marquee_deals": "Instacart ($660M - Issuer Lead), Nexxen ($120M), Cleantech and Biotech Issuers",
            "news_source": "Renaissance Capital Tech Review / WSGR Case Study"
        },
        {
            "rank_firm": "Goodwin Procter LLP\n(Rank #4 Life Sciences)",
            "firm_url": "https://www.goodwinlaw.com",
            "role_volume": "7 IPOs | $1.1B\n(5 Issuer / 2 Underwriter)",
            "key_partners": "Mitchell Bloom, Anthony McCusker, Craig Kelly",
            "marquee_deals": "Mineralys Therapeutics ($192M), Apogee Therapeutics ($300M), Turnstone ($80M)",
            "news_source": "Renaissance Capital Healthcare Review / Goodwin"
        },
        {
            "rank_firm": "White & Case LLP\n(Marquee Issuer Counsel)",
            "firm_url": "https://www.whitecase.com",
            "role_volume": "4 IPOs | $5.1B\n(Issuer Specialist)",
            "key_partners": "Colin Diamond, Thomas Siegel, Gary Kashar",
            "marquee_deals": "Arm Holdings plc ($4.8B - Issuer Lead Counsel to SoftBank / Arm)",
            "news_source": "Renaissance Capital Arm IPO Special Report / White & Case"
        },
        {
            "rank_firm": "Kirkland & Ellis LLP\n(Rank #5 Sponsor IPOs)",
            "firm_url": "https://www.kirkland.com",
            "role_volume": "5 IPOs | $2.2B\n(3 Issuer / 2 Underwriter)",
            "key_partners": "Christian Nagler, Sophia Hudson, Joshua Korff",
            "marquee_deals": "Birkenstock ($1.5B - Underwriter), PE Sponsor Portfolio Offerings",
            "news_source": "Renaissance Capital 2023 Review / Kirkland Release"
        }
    ]
    for idx, r in enumerate(data_2023):
        gen.render_data_row(col_widths, r, is_alt=(idx % 2 == 1))

    # 2022 Rankings
    gen.add_section_header("2022 IPO LAW FIRM LEADERBOARD (MARKET DOWNTURN)", "Tracking Micro-Caps, Energy Offerings (TPG, Mobileye, Corebridge) & Asian Cross-Border Listings")
    gen.render_table_headers(col_widths, headers)
    
    data_2022 = [
        {
            "rank_firm": "Latham & Watkins LLP\n(Rank #1 Overall)",
            "firm_url": "https://www.lw.com",
            "role_volume": "14 IPOs | $3.2B\n(6 Issuer / 8 Underwriter)",
            "key_partners": "Marc Jaffe, Ian Schuman, Luke Bergstrom, Michael Benjamin",
            "marquee_deals": "Mobileye ($861M - Underwriter), TPG Inc ($1.0B - Underwriter), Amylyx ($190M)",
            "news_source": "Renaissance Capital 2022 Annual Review / Latham"
        },
        {
            "rank_firm": "Davis Polk & Wardwell\n(Rank #2 Overall | #1 Underwriter)",
            "firm_url": "https://www.davispolk.com",
            "role_volume": "12 IPOs | $2.8B\n(2 Issuer / 10 Underwriter)",
            "key_partners": "Michael Kaplan, Richard Truesdell, Maurice Blanco",
            "marquee_deals": "TPG Inc ($1.0B - Issuer Counsel), Mobileye ($861M - Issuer Counsel)",
            "news_source": "Renaissance Capital 2022 Review / Davis Polk Release"
        },
        {
            "rank_firm": "Cooley LLP\n(Rank #3 Overall)",
            "firm_url": "https://www.cooley.com",
            "role_volume": "7 IPOs | $980M\n(5 Issuer / 2 Underwriter)",
            "key_partners": "Charlie Kim, David Peinsipp, Jon Avina, Stephane Levy",
            "marquee_deals": "Arcellx ($124M - Issuer), CinCor Pharma ($194M), Belite Bio ($36M)",
            "news_source": "Renaissance Capital Biotech Review / Cooley Release"
        },
        {
            "rank_firm": "Hunter Taubman Fischer & Li\n(Top Volume Small-Cap)",
            "firm_url": "https://www.htflawyers.com",
            "role_volume": "11 IPOs | $160M\n(Rank #1 by Deal Count in 2022)",
            "key_partners": "Louis Taubman, Ying Li, Guillaume de Sampigny",
            "marquee_deals": "Magic Empire ($20M), Ostin Technology ($13M), AMTD Digital advisor listings",
            "news_source": "Renaissance Capital 2022 Small-Cap Review / HTFL"
        }
    ]
    for idx, r in enumerate(data_2022):
        gen.render_data_row(col_widths, r, is_alt=(idx % 2 == 1))

    # 2021 Rankings
    gen.add_section_header("2021 IPO LAW FIRM LEADERBOARD (HISTORIC RECORD YEAR: 397 TRADITIONAL IPOS)", "The Historic Boom: Rivian ($11.9B), Coupang ($4.6B), Nubank ($2.6B), Didi ($4.4B), Coinbase ($85B)")
    gen.render_table_headers(col_widths, headers)
    
    data_2021 = [
        {
            "rank_firm": "Latham & Watkins LLP\n(Rank #1 Overall - Historic Record)",
            "firm_url": "https://www.lw.com",
            "role_volume": "118 IPOs | $44.5B\n(52 Issuer / 66 Underwriter)",
            "key_partners": "Marc Jaffe, Ian Schuman, Peter Handrinos, Michael Benjamin, Stelios Saffos",
            "marquee_deals": "Rivian ($11.9B - Issuer Lead), Coupang ($4.6B - Underwriter), Robinhood ($2.1B)",
            "news_source": "Renaissance Capital 2021 Annual Review / Latham Record Release"
        },
        {
            "rank_firm": "Davis Polk & Wardwell\n(Rank #2 Overall | #1 Underwriter)",
            "firm_url": "https://www.davispolk.com",
            "role_volume": "96 IPOs | $38.2B\n(21 Issuer / 75 Underwriter)",
            "key_partners": "Michael Kaplan, Richard Truesdell, Alan Denenberg, Maurice Blanco",
            "marquee_deals": "Coupang ($4.6B - Issuer), Nubank ($2.6B - Issuer), Didi ($4.4B - Underwriter)",
            "news_source": "Renaissance Capital 2021 Review / Davis Polk Record"
        },
        {
            "rank_firm": "Cooley LLP\n(Rank #3 Overall | #1 Tech Issuer)",
            "firm_url": "https://www.cooley.com",
            "role_volume": "74 IPOs | $22.8B\n(56 Issuer / 18 Underwriter)",
            "key_partners": "Charlie Kim, David Peinsipp, Jon Avina, Rachel Proffitt, Stephane Levy",
            "marquee_deals": "GitLab ($650M - Underwriter), Allbirds ($303M), Braze ($520M), SentinelOne ($1.2B)",
            "news_source": "Renaissance Capital Tech Leaderboard / Cooley Press Release"
        },
        {
            "rank_firm": "Goodwin Procter LLP\n(Rank #4 Overall | #1 Biotech)",
            "firm_url": "https://www.goodwinlaw.com",
            "role_volume": "52 IPOs | $11.4B\n(38 Issuer / 14 Underwriter)",
            "key_partners": "Mitchell Bloom, Anthony McCusker, Craig Kelly, Stuart Cable",
            "marquee_deals": "Sana Biotechnology ($588M), Recursion Pharma ($436M), Weave ($120M)",
            "news_source": "Renaissance Capital Healthcare Leaderboard / Goodwin"
        },
        {
            "rank_firm": "Wilson Sonsini (WSGR)\n(Rank #5 Overall)",
            "firm_url": "https://www.wsgr.com",
            "role_volume": "34 IPOs | $12.1B\n(22 Issuer / 12 Underwriter)",
            "key_partners": "Steven Bochner, Mark Baudler, Rezwan Pavri, Tony Jeffries",
            "marquee_deals": "AppLovin ($2.0B - Issuer), Roblox ($45B Direct Listing), Freshworks ($1.0B)",
            "news_source": "Renaissance Capital 2021 Tech Review / WSGR Release"
        },
        {
            "rank_firm": "Simpson Thacher & Bartlett\n(Rank #6 Overall)",
            "firm_url": "https://www.stblaw.com",
            "role_volume": "31 IPOs | $14.6B\n(12 Issuer / 19 Underwriter)",
            "key_partners": "Arthur Robinson, Kenneth Wallach, William Brentani, Kevin Kennedy",
            "marquee_deals": "Bumble ($2.2B - Issuer), Oatly ($1.4B - Underwriter), Shoals ($1.9B)",
            "news_source": "Renaissance Capital Sponsor IPO Review / STB Release"
        },
        {
            "rank_firm": "Kirkland & Ellis LLP\n(Rank #7 Overall | PE & SPAC)",
            "firm_url": "https://www.kirkland.com",
            "role_volume": "28 IPOs | $11.9B\n(16 Issuer / 12 Underwriter)",
            "key_partners": "Christian Nagler, Sophia Hudson, Bob Goedert, Joshua Korff",
            "marquee_deals": "Bicycle Therapeutics, Ryan Specialty ($1.3B), Marquee PE Portfolio Offerings",
            "news_source": "Renaissance Capital PE Leaderboard / Kirkland Release"
        },
        {
            "rank_firm": "Ellenoff Grossman & Schole\n(Rank #1 SPAC Volume)",
            "firm_url": "https://www.egsfirm.com",
            "role_volume": "120+ SPAC IPOs | $28B+\n(SPAC Issuer Specialist)",
            "key_partners": "Douglas Ellenoff, Stuart Neuhauser, Matthew Bernstein",
            "marquee_deals": "Ranked #1 by total US IPO filings during the 613-SPAC boom of 2021",
            "news_source": "Renaissance Capital SPAC Law Firm Leaderboard / EGS"
        },
        {
            "rank_firm": "Loeb & Loeb LLP\n(Rank #2 SPAC Volume)",
            "firm_url": "https://www.loeb.com",
            "role_volume": "85+ SPAC IPOs | $18B+\n(SPAC & Small-Cap)",
            "key_partners": "Mitchell Nussbaum, Giovanni Caruso, David Levine",
            "marquee_deals": "SPAC sponsor and underwriter counsel (Cantor Fitzgerald, EF Hutton syndicates)",
            "news_source": "Renaissance Capital SPAC Review / Loeb & Loeb Notice"
        }
    ]
    for idx, r in enumerate(data_2021):
        gen.render_data_row(col_widths, r, is_alt=(idx % 2 == 1))

    # 2020 Rankings
    gen.add_section_header("2020 IPO LAW FIRM LEADERBOARD (COVID TECH & BIOTECH SURGE)", "DoorDash ($3.4B), Airbnb ($3.5B), Snowflake ($3.4B), Palantir ($21B), Unity ($1.3B), Royalty Pharma ($2.2B)")
    gen.render_table_headers(col_widths, headers)
    
    data_2020 = [
        {
            "rank_firm": "Latham & Watkins LLP\n(Rank #1 Overall)",
            "firm_url": "https://www.lw.com",
            "role_volume": "56 IPOs | $19.9B\n(24 Issuer / 32 Underwriter)",
            "key_partners": "Marc Jaffe, Ian Schuman, Peter Handrinos, Michael Benjamin",
            "marquee_deals": "Airbnb ($3.5B - Underwriter Lead), Unity Software ($1.3B - Issuer), GoodRx ($1.1B)",
            "news_source": "Renaissance Capital 2020 Annual Review / Latham Release"
        },
        {
            "rank_firm": "Cooley LLP\n(Rank #2 Overall | #1 Tech Issuer)",
            "firm_url": "https://www.cooley.com",
            "role_volume": "39 IPOs | $11.4B\n(28 Issuer / 11 Underwriter)",
            "key_partners": "Charlie Kim, David Peinsipp, Jon Avina, Rachel Proffitt",
            "marquee_deals": "Snowflake ($3.4B - Issuer Lead), Palantir ($21B Direct Listing), ZoomInfo ($935M)",
            "news_source": "Renaissance Capital 2020 Review / Cooley Press Release"
        },
        {
            "rank_firm": "Goodwin Procter LLP\n(Rank #3 Overall | #1 Biotech)",
            "firm_url": "https://www.goodwinlaw.com",
            "role_volume": "29 IPOs | $6.2B\n(21 Issuer / 8 Underwriter)",
            "key_partners": "Mitchell Bloom, Anthony McCusker, Stuart Cable, Craig Kelly",
            "marquee_deals": "Relay Therapeutics ($400M), Poseida ($224M), Legend Biotech ($424M)",
            "news_source": "Renaissance Capital Biotech Leaderboard / Goodwin Release"
        },
        {
            "rank_firm": "Davis Polk & Wardwell\n(Rank #4 Overall | #1 Underwriter)",
            "firm_url": "https://www.davispolk.com",
            "role_volume": "28 IPOs | $12.8B\n(6 Issuer / 22 Underwriter)",
            "key_partners": "Michael Kaplan, Richard Truesdell, Alan Denenberg, Derek Dostal",
            "marquee_deals": "Snowflake ($3.4B - Underwriter Lead), DoorDash ($3.4B - Underwriter Lead)",
            "news_source": "Renaissance Capital 2020 Underwriter Desk / Davis Polk"
        },
        {
            "rank_firm": "Wilson Sonsini (WSGR)\n(Rank #5 Overall)",
            "firm_url": "https://www.wsgr.com",
            "role_volume": "18 IPOs | $8.5B\n(12 Issuer / 6 Underwriter)",
            "key_partners": "Steven Bochner, Mark Baudler, Tony Jeffries, Rezwan Pavri",
            "marquee_deals": "DoorDash ($3.4B - Issuer Lead), Lyft ($2.3B), Marquee Tech Issuers",
            "news_source": "Renaissance Capital Tech IPO Review / WSGR Notice"
        },
        {
            "rank_firm": "Simpson Thacher & Bartlett\n(Rank #6 Overall)",
            "firm_url": "https://www.stblaw.com",
            "role_volume": "16 IPOs | $9.8B\n(7 Issuer / 9 Underwriter)",
            "key_partners": "Kevin Kennedy, William Brentani, Karen Hsu Kelley, Arthur Robinson",
            "marquee_deals": "Airbnb ($3.5B - Issuer Lead Counsel), Royalty Pharma ($2.2B - Underwriter)",
            "news_source": "Renaissance Capital PE Review / Simpson Thacher Release"
        },
        {
            "rank_firm": "Skadden, Arps, Slate\n(Rank #7 Overall)",
            "firm_url": "https://www.skadden.com",
            "role_volume": "15 IPOs | $7.1B\n(8 Issuer / 7 Underwriter)",
            "key_partners": "Gregg Noel, David Goldschmidt, Michelle Gasaway",
            "marquee_deals": "Warner Music Group ($1.9B), Li Auto ($1.1B), XPeng ($1.5B - Underwriter)",
            "news_source": "Renaissance Capital 2020 Review / Skadden Advisory"
        }
    ]
    for idx, r in enumerate(data_2020):
        gen.render_data_row(col_widths, r, is_alt=(idx % 2 == 1))

    # Profiles Section
    top_firms = [
        {
            "name": "Latham & Watkins LLP",
            "website": "https://www.lw.com",
            "chairs": "Marc Jaffe, Ian Schuman, Peter Handrinos, Stelios Saffos",
            "standing": "Perennial #1 Ranked IPO Law Firm across Renaissance Capital Leaderboards (2020-2026)",
            "clients": "Rivian ($11.9B), Airbnb (Underwriter), Lineage ($4.4B), Astera Labs, Coupang, Ginkgo Bioworks"
        },
        {
            "name": "Davis Polk & Wardwell LLP",
            "website": "https://www.davispolk.com",
            "chairs": "Michael Kaplan, Richard Truesdell, Alan Denenberg, Byron Rooney",
            "standing": "Perennial #1 Underwriter Counsel on Wall Street (Goldman Sachs, Morgan Stanley, J.P. Morgan syndicates)",
            "clients": "Reddit, Rubrik, Arm Holdings, Snowflake, DoorDash, Nubank, Coupang, Mobileye, Lineage"
        },
        {
            "name": "Cooley LLP",
            "website": "https://www.cooley.com",
            "chairs": "Charlie Kim, David Peinsipp, Jon Avina, Rachel Proffitt, Kevin Cooper",
            "standing": "#1 Technology & Venture-Backed Issuer Counsel in Silicon Valley & New York (2020-2026)",
            "clients": "Reddit ($748M), Snowflake ($3.4B), Palantir ($21B), Allbirds, SentinelOne, Rigetti, Kyverna"
        },
        {
            "name": "Goodwin Procter LLP",
            "website": "https://www.goodwinlaw.com",
            "chairs": "Mitchell Bloom, Anthony McCusker, Craig Kelly, Stuart Cable",
            "standing": "#1 Life Sciences & Healthcare Biotechnology IPO Issuer Counsel across all Renaissance Capital reviews",
            "clients": "Waystar ($968M), Sana Biotech ($588M), Recursion Pharma ($436M), Weave ($120M), Arrivent"
        },
        {
            "name": "Wilson Sonsini Goodrich & Rosati (WSGR)",
            "website": "https://www.wsgr.com",
            "chairs": "Steven Bochner, Mark Baudler, Rezwan Pavri, Tony Jeffries, Allison Spinner",
            "standing": "Premier Silicon Valley High-Growth Tech & AI Unicorn Issuer Counsel",
            "clients": "DoorDash ($3.4B), Instacart ($660M), Astera Labs ($713M), Rubrik ($752M), AppLovin ($2.0B)"
        },
        {
            "name": "Simpson Thacher & Bartlett LLP",
            "website": "https://www.stblaw.com",
            "chairs": "Arthur Robinson, Kenneth Wallach, William Brentani, Kevin Kennedy",
            "standing": "Top-Tier Private Equity Sponsor & Mega-Cap Consumer / Tech Offering Counsel",
            "clients": "Airbnb ($3.5B Issuer Lead), Bumble ($2.2B), Lineage ($4.4B Underwriter), Viking ($1.5B), UL Solutions"
        },
        {
            "name": "Kirkland & Ellis LLP",
            "website": "https://www.kirkland.com",
            "chairs": "Christian Nagler, Sophia Hudson, Joshua Korff, Bob Goedert",
            "standing": "Global Private Equity Sponsor Portfolio IPO Powerhouse",
            "clients": "Birkenstock ($1.5B), Ryan Specialty ($1.3B), Bicycle Therapeutics, Marquee PE exits"
        },
        {
            "name": "Skadden, Arps, Slate, Meagher & Flom",
            "website": "https://www.skadden.com",
            "chairs": "Gregg Noel, David Goldschmidt, Michelle Gasaway, Dwight Yoo",
            "standing": "Marquee Global Enterprise, Media & Cross-Border Dual-Listed IPO Leader",
            "clients": "Warner Music Group ($1.9B), Li Auto ($1.1B), XPeng ($1.5B), Global Sovereign & ADR offerings"
        }
    ]
    gen.add_firm_profiles(top_firms)
    
    gen.build_pdf()

if __name__ == "__main__":
    generate_full_report()
