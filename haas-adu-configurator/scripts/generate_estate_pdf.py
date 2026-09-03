import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

pdf_path = "/Users/ericmiller/NEW JUNE 26/haas-adu-configurator/public/downloads/Estate_Homes_2Car_Garage_Portfolio.pdf"
downloads_copy = "/Users/ericmiller/Downloads/Estate_Homes_2Car_Garage_Portfolio.pdf"
os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=landscape(letter),
    rightMargin=36,
    leftMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()
title_style = ParagraphStyle("CoverTitle", parent=styles["Normal"], fontSize=26, leading=32, textColor=colors.HexColor("#0f172a"), fontName="Helvetica-Bold", alignment=1)
subtitle_style = ParagraphStyle("CoverSub", parent=styles["Normal"], fontSize=13, leading=17, textColor=colors.HexColor("#2563eb"), fontName="Helvetica-Bold", alignment=1)
desc_style = ParagraphStyle("CoverDesc", parent=styles["Normal"], fontSize=11, leading=16, textColor=colors.HexColor("#475569"), fontName="Helvetica", alignment=1)

model_title_style = ParagraphStyle("ModelTitle", parent=styles["Normal"], fontSize=18, leading=22, textColor=colors.HexColor("#0f172a"), fontName="Helvetica-Bold")
specs_style = ParagraphStyle("ModelSpecs", parent=styles["Normal"], fontSize=11.5, leading=15, textColor=colors.HexColor("#2563eb"), fontName="Helvetica-Bold")
body_style = ParagraphStyle("ModelBody", parent=styles["Normal"], fontSize=9, leading=13, textColor=colors.HexColor("#334155"), fontName="Helvetica")
bullet_style = ParagraphStyle("ModelBullet", parent=styles["Normal"], fontSize=8.5, leading=12, textColor=colors.HexColor("#1e293b"), fontName="Helvetica")

img_dir = "/Users/ericmiller/NEW JUNE 26/haas-adu-configurator/public/images"

story = []

# COVER PAGE
story.append(Spacer(1, 20))
story.append(Paragraph("HOUSING-AS-A-SERVICE (HaaS)", subtitle_style))
story.append(Spacer(1, 8))
story.append(Paragraph("ESTATE MODULAR HOMES & 2-CAR GARAGE SUITE", title_style))
story.append(Spacer(1, 10))
story.append(Paragraph("Single-Story Modular Architecture &bull; 1,000 to 1,013 Sq. Ft. &bull; Attached 2-Car Garage &bull; Zero-CapEx Turnkey Infrastructure", desc_style))
story.append(Spacer(1, 20))

# Cover Grid of 4 Model Sheets
cover_table_data = [
    [
        RLImage(os.path.join(img_dir, "magnolia_sheet.jpg"), width=340, height=170),
        RLImage(os.path.join(img_dir, "zinnia_sheet.jpg"), width=340, height=170)
    ],
    [
        RLImage(os.path.join(img_dir, "iris_sheet.jpg"), width=340, height=170),
        RLImage(os.path.join(img_dir, "dahlia_sheet.jpg"), width=340, height=170)
    ]
]
t = Table(cover_table_data, colWidths=[350, 350])
t.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
]))
story.append(t)
story.append(PageBreak())

models = [
    {
        "name": "THE MAGNOLIA",
        "specs": "2 BED | 2 BATH | 2-CAR GARAGE | 1,013 SQ. FT.",
        "desc": "Warm, welcoming, and designed for everyday comfort, the Magnolia pairs classic charm with a smart, efficient layout. An open living space, two bedrooms, two bathrooms, ample storage, and an attached two-car garage make this a comfortable and versatile place to call home.",
        "rent": "$3,850 / mo",
        "split": "$1,250 / mo ($15,000/yr)",
        "sheet": "magnolia_sheet.jpg",
        "features": [
            "Attached 2-car garage with direct interior secure access",
            "Inviting covered front porch with artisan railings",
            "Open-concept living room & dining area with panoramic natural light",
            "Primary suite with private bath & walk-in closet",
            "Dedicated laundry room and generous linen storage"
        ]
    },
    {
        "name": "THE ZINNIA",
        "specs": "2 BED | 2 BATH | 2-CAR GARAGE | 1,000 SQ. FT.",
        "desc": "A thoughtfully designed home that blends comfort, function, and modern style. The Zinnia features an open-concept living space, two bedrooms, two bathrooms, generous storage, and an attached two-car garage—all within an efficient, easy-living floorplan.",
        "rent": "$3,800 / mo",
        "split": "$1,200 / mo ($14,400/yr)",
        "sheet": "zinnia_sheet.jpg",
        "features": [
            "High-ceiling modern clerestory roofline with transom windows",
            "Attached 2-car garage with oversized paver driveway apron",
            "Great Room with dedicated dining & chef peninsula kitchen",
            "Primary retreat with en-suite bath & walk-in wardrobe",
            "Rear patio sliding glass door for indoor-outdoor living"
        ]
    },
    {
        "name": "THE IRIS",
        "specs": "2 BED | 2 BATH | 2-CAR GARAGE | 1,013 SQ. FT.",
        "desc": "Designed with everyday living in mind, the Iris combines an inviting covered porch with a spacious, open-concept interior. Two bedrooms, two bathrooms, a generous kitchen island, dedicated laundry, and an attached two-car garage create a practical home with plenty of room to live comfortably.",
        "rent": "$3,850 / mo",
        "split": "$1,250 / mo ($15,000/yr)",
        "sheet": "iris_sheet.jpg",
        "features": [
            "Full-width craftsman covered front porch with stone masonry piers",
            "Gourmet chef kitchen with expansive 8-foot island and bar seating",
            "Attached 2-car garage with side passage utility door",
            "Primary bedroom suite with backyard patio walkout",
            "Dedicated laundry room & abundant integrated storage"
        ]
    },
    {
        "name": "THE DAHLIA",
        "specs": "2 BED | 2 BATH | 2-CAR GARAGE | 1,006 SQ. FT.",
        "desc": "Clean lines and contemporary style define the Dahlia, with a thoughtfully arranged interior designed for both comfort and privacy. Two bedrooms, two bathrooms, open living and dining spaces, dedicated laundry, and an attached two-car garage make modern living feel effortless.",
        "rent": "$3,820 / mo",
        "split": "$1,220 / mo ($14,640/yr)",
        "sheet": "dahlia_sheet.jpg",
        "features": [
            "Sleek contemporary mono-pitch slant roofline with natural stone pillars",
            "Attached 2-car garage with modern dark flush-panel doors",
            "Split bedroom layout maximizing acoustic privacy between suites",
            "Dedicated laundry room and hallway linen closets",
            "Dual sliding patio doors connecting to garden terrace"
        ]
    }
]

for m in models:
    story.append(Paragraph(m["name"], model_title_style))
    story.append(Paragraph(m["specs"], specs_style))
    story.append(Spacer(1, 8))

    left_img = RLImage(os.path.join(img_dir, m["sheet"]), width=450, height=350)
    
    right_content = [
        Paragraph("<b>Architectural Concept:</b>", ParagraphStyle("H4", parent=styles["Normal"], fontSize=9.5, fontName="Helvetica-Bold", textColor=colors.HexColor("#0f172a"))),
        Paragraph(m["desc"], body_style),
        Spacer(1, 6),
        Paragraph("<b>Key Specifications & Features:</b>", ParagraphStyle("H4", parent=styles["Normal"], fontSize=9.5, fontName="Helvetica-Bold", textColor=colors.HexColor("#0f172a"))),
    ]
    for feat in m["features"]:
        right_content.append(Paragraph(f"&bull; {feat}", bullet_style))
    
    rent_val = m["rent"]
    split_val = m["split"]
    right_content.extend([
        Spacer(1, 8),
        Paragraph("<b>HaaS Revenue & Yield Model:</b>", ParagraphStyle("H4", parent=styles["Normal"], fontSize=9.5, fontName="Helvetica-Bold", textColor=colors.HexColor("#0f172a"))),
        Paragraph(f"&bull; <b>Projected Gross Rent:</b> {rent_val}", bullet_style),
        Paragraph(f"&bull; <b>Homeowner Passive Split:</b> <font color=\"#10b981\"><b>{split_val}</b></font>", bullet_style),
        Paragraph("&bull; <b>10-Year Cumulative Cash:</b> <font color=\"#2563eb\"><b>$144,000 - $150,000</b></font>", bullet_style),
        Paragraph("&bull; <b>Est. Property Equity Boost:</b> <font color=\"#f59e0b\"><b>+$450,000 - $500,000+</b></font>", bullet_style),
        Paragraph("&bull; <b>Homeowner Upfront CapEx:</b> <b>$0.00 (Turnkey Zero Out-of-Pocket)</b>", bullet_style)
    ])

    page_table = Table([[left_img, right_content]], colWidths=[460, 260])
    page_table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (1,0), (1,0), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(page_table)
    story.append(PageBreak())

doc.build(story)
print("PDF Generated successfully at", pdf_path)

# Copy to Downloads
import shutil
shutil.copy2(pdf_path, downloads_copy)
print("Copied to", downloads_copy)
