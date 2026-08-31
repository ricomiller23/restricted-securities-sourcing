import zlib
import sys

class PDFBuilder:
    def __init__(self):
        self.objects = []
        self.pages = []
        self.page_contents = []
        self.current_stream = []
        self.current_page_num = 0
        
    def add_object(self, content):
        self.objects.append(content)
        return len(self.objects)

    def new_page(self):
        if self.current_stream:
            self.page_contents.append("\n".join(self.current_stream))
            self.current_stream = []
        self.current_page_num += 1

    def draw_rect(self, x, y, w, h, fill_rgb=None, stroke_rgb=None, line_width=1.0):
        cmds = []
        cmds.append("q")
        if stroke_rgb:
            cmds.append(f"{stroke_rgb[0]:.3f} {stroke_rgb[1]:.3f} {stroke_rgb[2]:.3f} RG")
            cmds.append(f"{line_width:.2f} w")
        if fill_rgb:
            cmds.append(f"{fill_rgb[0]:.3f} {fill_rgb[1]:.3f} {fill_rgb[2]:.3f} rg")
            
        cmds.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re")
        if fill_rgb and stroke_rgb:
            cmds.append("B")
        elif fill_rgb:
            cmds.append("f")
        elif stroke_rgb:
            cmds.append("S")
        cmds.append("Q")
        self.current_stream.append("\n".join(cmds))

    def draw_line(self, x1, y1, x2, y2, stroke_rgb=(0,0,0), line_width=1.0):
        cmds = [
            "q",
            f"{stroke_rgb[0]:.3f} {stroke_rgb[1]:.3f} {stroke_rgb[2]:.3f} RG",
            f"{line_width:.2f} w",
            f"{x1:.2f} {y1:.2f} m",
            f"{x2:.2f} {y2:.2f} l",
            "S",
            "Q"
        ]
        self.current_stream.append("\n".join(cmds))

    def draw_text(self, text, x, y, font="F1", size=10, rgb=(0,0,0)):
        clean_text = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        cmds = [
            "BT",
            f"/{font} {size:.2f} Tf",
            f"{rgb[0]:.3f} {rgb[1]:.3f} {rgb[2]:.3f} rg",
            f"{x:.2f} {y:.2f} Td",
            f"({clean_text}) Tj",
            "ET"
        ]
        self.current_stream.append("\n".join(cmds))

    def build_pdf(self, filename):
        if self.current_stream:
            self.page_contents.append("\n".join(self.current_stream))
            self.current_stream = []

        total_pages = len(self.page_contents)
        
        content_obj_ids = []
        page_obj_ids = []
        
        cur_id = 7
        for i in range(total_pages):
            page_obj_ids.append(cur_id)
            cur_id += 1
            content_obj_ids.append(cur_id)
            cur_id += 1

        obj_dict = {}
        
        # 1. Catalog
        obj_dict[1] = "<< /Type /Catalog /Pages 2 0 R >>"
        
        # 2. Pages
        kids_str = " ".join([f"{pid} 0 R" for pid in page_obj_ids])
        obj_dict[2] = f"<< /Type /Pages /Kids [{kids_str}] /Count {total_pages} >>"
        
        # Fonts
        obj_dict[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
        obj_dict[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
        obj_dict[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"
        obj_dict[6] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>"
        
        for i in range(total_pages):
            pid = page_obj_ids[i]
            cid = content_obj_ids[i]
            
            obj_dict[pid] = (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                f"/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> "
                f"/Contents {cid} 0 R >>"
            )
            
            raw_content = self.page_contents[i].encode('latin1')
            comp_content = zlib.compress(raw_content)
            
            obj_dict[cid] = (
                f"<< /Length {len(comp_content)} /Filter /FlateDecode >>\nstream\n"
            ).encode('ascii') + comp_content + b"\nendstream"

        output = [b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"]
        xref_offsets = {}
        
        current_offset = len(output[0])
        
        num_objects = max(obj_dict.keys())
        for obj_num in range(1, num_objects + 1):
            xref_offsets[obj_num] = current_offset
            data = obj_dict[obj_num]
            if isinstance(data, str):
                chunk = f"{obj_num} 0 obj\n{data}\nendobj\n".encode('latin1')
            else:
                chunk = f"{obj_num} 0 obj\n".encode('ascii') + data + b"\nendobj\n"
            output.append(chunk)
            current_offset += len(chunk)
            
        xref_start = current_offset
        xref_table = [f"xref\n0 {num_objects + 1}\n0000000000 65535 f \n"]
        for obj_num in range(1, num_objects + 1):
            xref_table.append(f"{xref_offsets[obj_num]:010d} 00000 n \n")
            
        xref_bytes = "".join(xref_table).encode('ascii')
        output.append(xref_bytes)
        
        trailer = (
            f"trailer\n<< /Size {num_objects + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF\n"
        ).encode('ascii')
        output.append(trailer)
        
        with open(filename, "wb") as f:
            f.write(b"".join(output))
        print(f"Successfully wrote {filename}")

def generate_memo():
    pdf = PDFBuilder()
    
    NAVY = (15/255, 45/255, 89/255)
    DARK_GRAY = (40/255, 45/255, 55/255)
    MID_GRAY = (100/255, 110/255, 125/255)
    LIGHT_BG = (245/255, 247/255, 250/255)
    BORDER_GRAY = (215/255, 222/255, 232/255)
    BLUE_ACCENT = (37/255, 99/255, 185/255)
    GREEN_BADGE_BG = (222/255, 247/255, 236/255)
    GREEN_BADGE_TXT = (3/255, 84/255, 63/255)
    ORANGE_BADGE_BG = (254/255, 236/255, 220/255)
    ORANGE_BADGE_TXT = (156/255, 66/255, 33/255)
    GRAY_BADGE_BG = (240/255, 242/255, 245/255)
    GRAY_BADGE_TXT = (75/255, 85/255, 99/255)

    def draw_card(y_top, name, role, email, phone, office, proceeding, badge_txt, badge_type):
        card_h = 92
        y_bottom = y_top - card_h
        pdf.draw_rect(45, y_bottom, 522, card_h, fill_rgb=(1,1,1), stroke_rgb=BORDER_GRAY, line_width=0.8)
        pdf.draw_rect(45, y_top - 22, 522, 22, fill_rgb=(241/255, 245/255, 249/255), stroke_rgb=BORDER_GRAY, line_width=0.8)
        pdf.draw_text(name, 55, y_top - 15, font="F2", size=10, rgb=NAVY)
        pdf.draw_text(role, 275, y_top - 14, font="F2", size=8, rgb=BLUE_ACCENT)
        
        pdf.draw_text("CONTACT INFORMATION", 55, y_top - 33, font="F2", size=7, rgb=MID_GRAY)
        pdf.draw_text(f"Email: {email}", 55, y_top - 46, font="F1", size=8.5, rgb=DARK_GRAY)
        pdf.draw_text(f"Phone: {phone}", 55, y_top - 58, font="F1", size=8.5, rgb=DARK_GRAY)
        pdf.draw_text(f"Office: {office}", 55, y_top - 70, font="F1", size=8.5, rgb=DARK_GRAY)
        
        pdf.draw_text("PROCEEDING / ROLE", 305, y_top - 33, font="F2", size=7, rgb=MID_GRAY)
        if len(proceeding) > 42:
            part1 = proceeding[:42]
            part2 = proceeding[42:]
            pdf.draw_text(part1, 305, y_top - 46, font="F1", size=8.2, rgb=DARK_GRAY)
            pdf.draw_text(part2, 305, y_top - 57, font="F1", size=8.2, rgb=DARK_GRAY)
        else:
            pdf.draw_text(proceeding, 305, y_top - 46, font="F1", size=8.2, rgb=DARK_GRAY)
            
        if badge_type == "active":
            bg, fg = GREEN_BADGE_BG, GREEN_BADGE_TXT
        elif badge_type == "sec":
            bg, fg = ORANGE_BADGE_BG, ORANGE_BADGE_TXT
        else:
            bg, fg = GRAY_BADGE_BG, GRAY_BADGE_TXT
            
        pdf.draw_rect(305, y_top - 84, 185, 14, fill_rgb=bg)
        pdf.draw_text(badge_txt, 310, y_top - 75, font="F2", size=7.2, rgb=fg)

    # ====================================================
    # PAGE 1: Header + Alpine Securities Attorneys (5)
    # ====================================================
    pdf.new_page()
    
    # Memo Title Header Bar
    pdf.draw_rect(45, 715, 522, 42, fill_rgb=NAVY)
    pdf.draw_text("LEGAL MEMORANDUM", 58, 735, font="F2", size=14, rgb=(1,1,1))
    pdf.draw_text("FINRA ENFORCEMENT COUNSEL DIRECTORY & CASE RECORD", 58, 722, font="F1", size=8.5, rgb=(0.85, 0.9, 0.98))
    
    # Metadata Block
    pdf.draw_rect(45, 638, 522, 68, fill_rgb=LIGHT_BG, stroke_rgb=BORDER_GRAY, line_width=1.0)
    pdf.draw_rect(45, 638, 4, 68, fill_rgb=NAVY)
    
    meta_lines = [
        ("TO:", "Counsel of Record", "DATE:", "August 17, 2026"),
        ("SUBJECT:", "FINRA Enforcement Lawyers in Alpine & Scottsdale Actions", "MATTER REF:", "FINRA Enforcement / SRO Litigation"),
        ("SOURCE:", "FINRA Disciplinary Actions, OHO & NAC Decisions, SEC Records", "STATUS:", "Verified Directory & Roster"),
    ]
    
    y_m = 690
    for l1, v1, l2, v2 in meta_lines:
        pdf.draw_text(l1, 56, y_m, font="F2", size=8, rgb=MID_GRAY)
        pdf.draw_text(v1, 108, y_m, font="F1", size=8.5, rgb=DARK_GRAY)
        pdf.draw_text(l2, 385, y_m, font="F2", size=8, rgb=MID_GRAY)
        pdf.draw_text(v2, 450, y_m, font="F1", size=8.5, rgb=DARK_GRAY)
        y_m -= 17

    # Section 1 Header
    pdf.draw_text("1. FINRA Enforcement Counsel: Alpine Securities Corporation", 45, 615, font="F2", size=11, rgb=NAVY)
    pdf.draw_line(45, 608, 567, 608, stroke_rgb=BLUE_ACCENT, line_width=1.2)

    # 1. Savvas Foukas
    draw_card(598, "Savvas A. Foukas, Esq.", "Senior Litigation Counsel, FINRA Enforcement",
              "savvas.foukas@finra.org", "(732) 596-2557",
              "581 Main Street, 7th Floor, Woodbridge, NJ 07095",
              "OHO Disciplinary & Expedited Proceedings vs. Alpine Securities Corp.",
              "ACTIVE FINRA LITIGATION COUNSEL", "active")

    # 2. Jennifer L. Crawford
    draw_card(496, "Jennifer L. Crawford, Esq.", "Senior Regional Counsel, FINRA Enforcement",
              "jennifer.crawford@finra.org", "(301) 590-6500 (Enforcement Switchboard)",
              "1735 K Street NW, Washington, DC 20006",
              "FINRA Disciplinary & Expedited Actions vs. Alpine Securities Corp.",
              "ACTIVE FINRA ENFORCEMENT COUNSEL", "active")

    # 3. Loyd Gattis
    draw_card(394, "Loyd Gattis, Esq.", "Counsel, FINRA Department of Enforcement",
              "loyd.gattis@finra.org", "(816) 421-5700",
              "120 West 12th Street, Suite 800, Kansas City, MO 64105",
              "Office of Hearing Officers (OHO) Proceedings vs. Alpine Securities",
              "ACTIVE FINRA ENFORCEMENT COUNSEL", "active")

    # 4. Michelle Galloway
    draw_card(292, "Michelle Galloway, Esq.", "Senior Counsel, FINRA Department of Enforcement",
              "michelle.galloway@finra.org", "(301) 590-6500",
              "1735 K Street NW, Washington, DC 20006",
              "OHO Disciplinary Actions vs. Alpine Securities Corp.",
              "ACTIVE FINRA ENFORCEMENT COUNSEL", "active")

    # 5. Michael P. Manning
    draw_card(190, "Michael P. Manning, Esq.", "Senior Litigation Counsel, FINRA Enforcement",
              "michael.manning@finra.org", "(301) 590-6500",
              "1735 K Street NW, Washington, DC 20006",
              "Regulatory Compliance & OHO Proceedings vs. Alpine Securities",
              "ACTIVE FINRA LITIGATION COUNSEL", "active")

    # Footer Page 1
    pdf.draw_line(45, 65, 567, 65, stroke_rgb=BORDER_GRAY, line_width=0.8)
    pdf.draw_text("CONFIDENTIAL & PRIVILEGED | PREPARED FOR LEGAL COUNSEL", 45, 52, font="F2", size=7.5, rgb=MID_GRAY)
    pdf.draw_text("Page 1 of 3", 520, 52, font="F1", size=7.5, rgb=MID_GRAY)

    # ====================================================
    # PAGE 2: Scottsdale Capital Advisors + Joint Matters
    # ====================================================
    pdf.new_page()
    
    # Page 2 Header Bar
    pdf.draw_rect(45, 735, 522, 22, fill_rgb=NAVY)
    pdf.draw_text("FINRA ENFORCEMENT COUNSEL DIRECTORY (CONTINUED)", 55, 743, font="F2", size=9, rgb=(1,1,1))
    
    # Section 2 Header
    pdf.draw_text("2. FINRA Enforcement Counsel: Scottsdale Capital Advisors Matters", 45, 715, font="F2", size=11, rgb=NAVY)
    pdf.draw_line(45, 708, 567, 708, stroke_rgb=BLUE_ACCENT, line_width=1.2)

    # 1. Gregory Firehock
    draw_card(698, "Gregory R. Firehock, Esq.", "Senior Litigation Counsel, FINRA Enforcement",
              "gregory.firehock@finra.org", "(215) 209-2812",
              "1601 Market Street, 27th Floor, Philadelphia, PA 19103",
              "Dept. of Enforcement v. Scottsdale (No. 2014041724601 - Section 5)",
              "ACTIVE FINRA LITIGATION COUNSEL", "active")

    # 2. Laura Leigh Blackston
    draw_card(596, "Laura Leigh Blackston, Esq.", "Senior Regional Counsel, FINRA Enforcement",
              "laura.blackston@finra.org", "(504) 412-2408 | Fax: (504) 522-4077",
              "Energy Centre, Suite 850, 1100 Poydras St, New Orleans, LA 70163",
              "Dept. of Enforcement v. Scottsdale Capital Advisors (No. 2014041724601)",
              "ACTIVE SENIOR REGIONAL COUNSEL", "active")

    # 3. Jeffrey D. Pariser
    draw_card(494, "Jeffrey D. Pariser, Esq. (1965-2023)", "Former Chief Litigation Counsel, FINRA Enforcement",
              "N/A (Historical Counsel of Record)", "N/A",
              "Historical Office: FINRA Headquarters, Washington, DC",
              "Lead Trial Counsel: Dept. of Enforcement v. Scottsdale (No. 2014041724601)",
              "DECEASED (MAY 2023) - RECORD ONLY", "deceased")

    # 4. Heather L. Freiburger
    draw_card(392, "Heather L. Freiburger, Esq.", "Former FINRA Enforcement | Now SEC Division of Enforcement",
              "freiburgerh@sec.gov", "(303) 844-1000 (SEC Denver Regional Office)",
              "SEC Denver Regional Office, 1961 Stout St, Suite 1700, Denver, CO 80294",
              "Dept. of Enforcement v. Scottsdale Capital Advisors (No. 2014041724601)",
              "TRANSITIONED TO SEC ENFORCEMENT", "sec")

    # Section 3 Header: Joint / Expedited Matters
    pdf.draw_text("3. Joint / Expedited Proceedings (Alpine & Scottsdale Trust Matters)", 45, 282, font="F2", size=10.5, rgb=NAVY)
    pdf.draw_line(45, 276, 567, 276, stroke_rgb=BLUE_ACCENT, line_width=1.2)

    # 5. Jonathan Golomb
    draw_card(266, "Jonathan Golomb, Esq.", "Senior Special Counsel / Litigation Counsel, FINRA Enforcement",
              "jonathan.golomb@finra.org", "(202) 728-8000",
              "1735 K Street NW, Washington, DC 20006",
              "Expedited Proceeding No. FPI190002 / CMA Orders (Ownership/Trusts)",
              "ACTIVE SENIOR LITIGATION COUNSEL", "active")

    # 6. Meredith MacVicar
    draw_card(164, "Meredith MacVicar, Esq.", "Former FINRA Regulatory Counsel | Now SEC Trading & Markets",
              "macvicarm@sec.gov", "(202) 551-5777 / (202) 551-5100",
              "SEC Headquarters, 100 F Street NE, Washington, DC 20549",
              "Expedited Proceeding No. FPI190002 / CMA Ownership Matters",
              "TRANSITIONED TO SEC TRADING & MARKETS", "sec")

    # Footer Page 2
    pdf.draw_line(45, 55, 567, 55, stroke_rgb=BORDER_GRAY, line_width=0.8)
    pdf.draw_text("CONFIDENTIAL & PRIVILEGED | PREPARED FOR LEGAL COUNSEL", 45, 42, font="F2", size=7.5, rgb=MID_GRAY)
    pdf.draw_text("Page 2 of 3", 520, 42, font="F1", size=7.5, rgb=MID_GRAY)

    # ====================================================
    # PAGE 3: Key Filing Protocols, Case Reference Table, & SRO Rules
    # ====================================================
    pdf.new_page()
    
    # Page 3 Header Bar
    pdf.draw_rect(45, 735, 522, 22, fill_rgb=NAVY)
    pdf.draw_text("PROCEDURAL REFERENCE & ENFORCEMENT FILING CHANNELS", 55, 743, font="F2", size=9, rgb=(1,1,1))

    # Section 4: Summary Table of Proceedings
    pdf.draw_text("4. Summary of Key Enforcement Proceedings Referenced", 45, 715, font="F2", size=11, rgb=NAVY)
    pdf.draw_line(45, 708, 567, 708, stroke_rgb=BLUE_ACCENT, line_width=1.2)

    # Table Header
    pdf.draw_rect(45, 680, 522, 20, fill_rgb=NAVY)
    pdf.draw_text("PROCEEDING / MATTER NO.", 55, 687, font="F2", size=8, rgb=(1,1,1))
    pdf.draw_text("RESPONDENTS", 215, 687, font="F2", size=8, rgb=(1,1,1))
    pdf.draw_text("PRIMARY ALLEGATIONS / SUBJECT", 355, 687, font="F2", size=8, rgb=(1,1,1))

    table_rows = [
        ("Disciplinary Proceeding No. 2014041724601", "Scottsdale Capital Advisors Corp., John J. Hurry, Timothy DiBlasi, D. Michael Cruz", "Section 5 of Securities Act (unregistered penny stock sales) & supervisory system failures (FINRA Rule 2010)."),
        ("Expedited Proceeding No. FPI190002 / CMS190002", "Scottsdale Capital Advisors & SCA Holding / SCA Clearing Trusts", "Failure to file Continuing Membership Applications (CMAs) upon direct/indirect changes in ownership/control."),
        ("Alpine Disciplinary Actions & Expulsion Proceeding", "Alpine Securities Corporation (CRD No. 14952)", "Unauthorized transactions, conversion/misuse of customer funds/securities, and unreasonable $5,000 monthly account fees."),
        ("Appellate / Constitutional Litigation (D.C. Cir. / SCOTUS)", "Alpine Securities Corp. v. FINRA & SEC (Appeals / Certiorari)", "Constitutional challenges to FINRA SRO structure under Appointments Clause & Private Nondelegation Doctrine.")
    ]

    y_t = 658
    for proc, resp, subj in table_rows:
        row_h = 42
        pdf.draw_rect(45, y_t - row_h, 522, row_h, fill_rgb=(248/255, 250/255, 252/255), stroke_rgb=BORDER_GRAY, line_width=0.6)
        
        pdf.draw_text(proc, 52, y_t - 14, font="F2", size=7.8, rgb=NAVY)
        
        # Wrapped respondents
        if len(resp) > 28:
            r1 = resp[:28]
            r2 = resp[28:56]
            pdf.draw_text(r1, 215, y_t - 14, font="F1", size=7.5, rgb=DARK_GRAY)
            pdf.draw_text(r2, 215, y_t - 24, font="F1", size=7.5, rgb=DARK_GRAY)
        else:
            pdf.draw_text(resp, 215, y_t - 14, font="F1", size=7.5, rgb=DARK_GRAY)
            
        # Wrapped subjects
        if len(subj) > 42:
            s1 = subj[:42]
            s2 = subj[42:84]
            s3 = subj[84:]
            pdf.draw_text(s1, 355, y_t - 14, font="F1", size=7.2, rgb=DARK_GRAY)
            pdf.draw_text(s2, 355, y_t - 24, font="F1", size=7.2, rgb=DARK_GRAY)
            if s3:
                pdf.draw_text(s3, 355, y_t - 34, font="F1", size=7.2, rgb=DARK_GRAY)
        else:
            pdf.draw_text(subj, 355, y_t - 14, font="F1", size=7.2, rgb=DARK_GRAY)
            
        y_t -= (row_h + 4)

    # Section 5: Official Contact & Service Channels
    pdf.draw_text("5. FINRA Enforcement Headquarters, Regional Offices & Electronic Service", 45, 470, font="F2", size=11, rgb=NAVY)
    pdf.draw_line(45, 463, 567, 463, stroke_rgb=BLUE_ACCENT, line_width=1.2)

    # Box 1: Headquarters & Switchboard
    pdf.draw_rect(45, 345, 255, 110, fill_rgb=LIGHT_BG, stroke_rgb=BORDER_GRAY, line_width=0.8)
    pdf.draw_text("FINRA HEADQUARTERS & OHO", 55, 438, font="F2", size=8.5, rgb=NAVY)
    pdf.draw_text("1735 K Street NW, Washington, DC 20006", 55, 423, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("Main Phone: (202) 728-8000 / (301) 590-6500", 55, 410, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("Office of Hearing Officers (OHO):", 55, 395, font="F2", size=8, rgb=MID_GRAY)
    pdf.draw_text("Electronic Filing: OHOFilings@finra.org", 55, 382, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("National Adjudicatory Council (NAC):", 55, 369, font="F2", size=8, rgb=MID_GRAY)
    pdf.draw_text("Appeals Docket: NACFilings@finra.org", 55, 356, font="F1", size=8, rgb=DARK_GRAY)

    # Box 2: Enforcement & Service
    pdf.draw_rect(312, 345, 255, 110, fill_rgb=LIGHT_BG, stroke_rgb=BORDER_GRAY, line_width=0.8)
    pdf.draw_text("DEPARTMENT OF ENFORCEMENT SERVICE", 322, 438, font="F2", size=8.5, rgb=NAVY)
    pdf.draw_text("Service / Formal Notices:", 322, 423, font="F2", size=8, rgb=MID_GRAY)
    pdf.draw_text("Email: EnforcementNotice@finra.org", 322, 410, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("Woodbridge Regional Office: (732) 596-2000", 322, 395, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("Philadelphia Regional Office: (215) 665-1180", 322, 382, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("New Orleans District Office: (504) 412-2400", 322, 369, font="F1", size=8, rgb=DARK_GRAY)
    pdf.draw_text("Kansas City Regional Office: (816) 421-5700", 322, 356, font="F1", size=8, rgb=DARK_GRAY)

    # Section 6: Counsel Notes & Instructions
    pdf.draw_rect(45, 160, 522, 165, fill_rgb=(254/255, 250/255, 235/255), stroke_rgb=(246/255, 211/255, 134/255), line_width=1.0)
    pdf.draw_text("PRACTICE NOTES FOR COUNSEL REGARDING ENFORCEMENT PROCEEDINGS", 58, 308, font="F2", size=8.5, rgb=(146/255, 64/255, 14/255))
    
    notes = [
        ("1. Direct Attorney Inquiries:", "Formal inquiries concerning active or pending enforcement investigations must be served pursuant to FINRA Code of Procedure Rule 9134 (Methods of Serving Papers), copying the lead litigation counsel and EnforcementNotice@finra.org."),
        ("2. Representation Status Changes:", "Attorneys Meredith MacVicar and Heather Freiburger were counsel in earlier FINRA proceedings and have since transitioned to Senior Counsel positions at the SEC (Division of Trading & Markets and Division of Enforcement, respectively)."),
        ("3. Deceased Counsel of Record:", "Jeffrey D. Pariser was the lead Chief Litigation Counsel in the Scottsdale Capital 2014-2018 proceedings and passed away in May 2023. Matters previously assigned to his team are managed by senior litigation counsel in Washington, DC and Philadelphia."),
        ("4. SEC Appellate Overturns:", "Counsel should note that the SEC issued an order vacating the FINRA NAC liability findings and sanctions in the 2014 Scottsdale Capital action (Matter No. 2014041724601), remanding/setting aside findings related to Section 5 supervisory obligations.")
    ]
    
    y_n = 288
    for nh, nb in notes:
        pdf.draw_text(nh, 58, y_n, font="F2", size=7.8, rgb=DARK_GRAY)
        if len(nb) > 95:
            nb1 = nb[:95]
            nb2 = nb[95:]
            pdf.draw_text(nb1, 58, y_n - 10, font="F1", size=7.5, rgb=DARK_GRAY)
            pdf.draw_text(nb2, 58, y_n - 20, font="F1", size=7.5, rgb=DARK_GRAY)
            y_n -= 32
        else:
            pdf.draw_text(nb, 58, y_n - 10, font="F1", size=7.5, rgb=DARK_GRAY)
            y_n -= 22

    # Footer Page 3
    pdf.draw_line(45, 55, 567, 55, stroke_rgb=BORDER_GRAY, line_width=0.8)
    pdf.draw_text("CONFIDENTIAL & PRIVILEGED | PREPARED FOR LEGAL COUNSEL", 45, 42, font="F2", size=7.5, rgb=MID_GRAY)
    pdf.draw_text("Page 3 of 3", 520, 42, font="F1", size=7.5, rgb=MID_GRAY)

    pdf.build_pdf("/Users/ericmiller/NEW JUNE 26/FINRA_Enforcement_Attorneys_Alpine_Scottsdale.pdf")

if __name__ == "__main__":
    generate_memo()
