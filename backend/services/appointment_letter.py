import os
from io import BytesIO
from datetime import datetime
from pathlib import Path
from flask import current_app

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
)
from reportlab.pdfgen import canvas

VENUE_MAP = {
    "100ft": "2nd Floor, SS Complex, 64/1, 7th Street, Tatabad, Coimbatore, Tamil Nadu 641012",
    "hopes": "GR Complex, 1st Floor, 1567 Avinashi Rd, Peelamedu, Coimbatore - 641004",
    "kuniyamuthur": "1st Floor, AAKIFAH 2017 Complex, Palakkad Main Rd, near Muthoot Finance, Kuniyamuthur - 641008",
}


def get_venue(branch):
    """Map branch name to full physical address"""
    b = str(branch or "").strip().lower().replace(" ", "").replace("-", "")
    if "hope" in b:
        return VENUE_MAP["hopes"]
    elif "kuniya" in b:
        return VENUE_MAP["kuniyamuthur"]
    return VENUE_MAP["100ft"]


def format_date(d):
    """Format date to DD/MM/YYYY"""
    if not d:
        return datetime.now().strftime("%d/%m/%Y")
    if hasattr(d, "strftime"):
        return d.strftime("%d/%m/%Y")
    s = str(d).strip()
    if "/" in s:
        return s
    try:
        parts = s.split("-")
        if len(parts) == 3 and len(parts[0]) == 4:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
    except Exception:
        pass
    return s


def format_time(t):
    """Format time into clean 12-hour AM/PM format"""
    if not t:
        return "11:00 AM"
    s = str(t).strip()
    if "AM" in s.upper() or "PM" in s.upper():
        return s.upper()
    try:
        parts = s.split(":")
        if len(parts) >= 2:
            h = int(parts[0])
            m = int(parts[1])
            suffix = "AM" if h < 12 else "PM"
            h12 = h % 12
            if h12 == 0:
                h12 = 12
            return f"{h12:02d}:{m:02d} {suffix}"
    except Exception:
        pass
    return s


def format_program_selection_title(duration_raw, mode="Offline"):
    """Format opening sentence title: e.g. '15-Day Offline Internship Program' or '1-Month Offline Internship Program'"""
    raw = str(duration_raw or "15 Days").strip()
    raw_lower = raw.lower()
    if "15" in raw_lower:
        period = "15-Day"
    elif "1 month" in raw_lower or raw_lower.startswith("1"):
        period = "1-Month"
    elif "2 month" in raw_lower or raw_lower.startswith("2"):
        period = "2-Month"
    elif "3 month" in raw_lower or raw_lower.startswith("3"):
        period = "3-Month"
    elif "6 month" in raw_lower or raw_lower.startswith("6"):
        period = "6-Month"
    else:
        period = raw.replace("Internship Program", "").strip()
        if "day" in period.lower() and not period.endswith("-Day"):
            period = period.replace("Days", "-Day").replace("days", "-Day")
        elif "month" in period.lower() and not period.endswith("-Month"):
            period = period.replace("Months", "-Month").replace("months", "-Month").replace("Month", "-Month")

    mode_str = mode.capitalize() if mode else "Offline"
    return f"{period} {mode_str} Internship Program"


def format_duration_display(duration_raw):
    """Format display in table: e.g. '15 Days Internship Program'"""
    raw = str(duration_raw or "15 Days Internship Program").strip()
    if not raw:
        return "15 Days Internship Program"
    if "program" not in raw.lower():
        return f"{raw} Internship Program"
    return raw


class AppointmentCanvas(canvas.Canvas):
    """Canvas that computes total pages and prints header/footer accents"""
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

    def draw_page_decorations(self, total_pages):
        self.saveState()
        # Bottom divider
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(36, 26, A4[0] - 36, 26)

        # Footer text
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 15, "Wingroo Technologies · Official Internship Appointment Letter · Strictly Confidential")
        self.drawRightString(A4[0] - 36, 15, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()


def render_appointment_letter_pdf(data):
    """
    Renders high-quality corporate Appointment Letter in PDF format with Wingroo logo.
    All body text is cleanly justified, credentials aligned, and sign-off is left-aligned.
    Returns bytes of the generated PDF document.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=24,
        bottomMargin=34,
    )

    styles = getSampleStyleSheet()

    # Justified body style for paragraphs
    body_justify = ParagraphStyle(
        "ApptBodyJustify",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=13.2,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor("#1E293B"),
    )

    body_left = ParagraphStyle(
        "ApptBodyLeft",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=13.2,
        alignment=TA_LEFT,
        textColor=colors.HexColor("#1E293B"),
    )

    bold_body = ParagraphStyle(
        "ApptBoldBody",
        parent=body_left,
        fontName="Helvetica-Bold",
    )

    title_style = ParagraphStyle(
        "ApptTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0F172A"),
    )

    header_company = ParagraphStyle(
        "HeaderCompany",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12.5,
        leading=15,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#0F172A"),
    )

    header_meta = ParagraphStyle(
        "HeaderMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.8,
        leading=11,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#475569"),
    )

    tbl_label = ParagraphStyle(
        "TblLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#334155"),
    )

    tbl_val = ParagraphStyle(
        "TblVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A"),
    )

    cred_title_style = ParagraphStyle(
        "CredTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
    )

    cred_text_style = ParagraphStyle(
        "CredText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#334155"),
    )

    signoff_style = ParagraphStyle(
        "Signoff",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=13,
        alignment=TA_LEFT,
        textColor=colors.HexColor("#1E293B"),
    )

    story = []

    # 1. Header with Clean Cropped Logo (Left) and Company Meta (Right)
    logo_path = None
    try:
        if current_app and current_app.config.get("ASSETS_FOLDER"):
            for fname in ["wingroo_letterhead_logo.png", "WINGROO.jpeg"]:
                p = Path(current_app.config["ASSETS_FOLDER"]) / fname
                if p.exists():
                    logo_path = str(p)
                    break
    except Exception:
        pass

    if not logo_path:
        candidate_paths = [
            Path("assets/wingroo_letterhead_logo.png"),
            Path("backend/assets/wingroo_letterhead_logo.png"),
            Path(__file__).parent.parent / "assets" / "wingroo_letterhead_logo.png",
            Path("assets/WINGROO.jpeg"),
            Path("backend/assets/WINGROO.jpeg"),
            Path(__file__).parent.parent / "assets" / "WINGROO.jpeg",
        ]
        for cp in candidate_paths:
            if cp.exists():
                logo_path = str(cp)
                break

    logo_img = None
    if logo_path and os.path.exists(logo_path):
        if "wingroo_letterhead_logo.png" in logo_path:
            # 715x520 => aspect ratio 1.375
            logo_img = Image(logo_path, width=77, height=56)
        else:
            logo_img = Image(logo_path, width=95, height=63)

    header_text = [
        Paragraph("WINGROO TECHNOLOGIES", header_company),
        Spacer(1, 2),
        Paragraph(
            "Corporate Office: 2nd Floor, SS Complex, 64/1, 7th St, Tatabad, Coimbatore - 641012<br/>"
            "Email: hr@wingrootechnologies.com &nbsp;|&nbsp; Phone: +91 96267 79609<br/>"
            "Website: https://wingrootechnologies.com",
            header_meta
        )
    ]

    header_table = Table([[logo_img or "", header_text]], colWidths=[90, A4[0] - 72 - 90])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, 0), "LEFT"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))

    # Divider Line
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=7, spaceBefore=2))

    # Ref & Date Row
    year = datetime.now().year
    reg_no = data.get("register_number") or "WIN-APPT"
    ref_no = f"WT/INT/{year}/{reg_no}"
    today_str = format_date(data.get("issue_date") or datetime.now().date())

    meta_row = Table([
        [
            Paragraph(f"<b>Ref:</b> {ref_no}", body_left),
            Paragraph(f"<b>Date:</b> {today_str}", ParagraphStyle("RightDate", parent=body_left, alignment=TA_RIGHT)),
        ]
    ], colWidths=[(A4[0] - 72)/2, (A4[0] - 72)/2])
    meta_row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(meta_row)
    story.append(Spacer(1, 6))

    # Title
    story.append(Paragraph("INTERNSHIP APPOINTMENT LETTER", title_style))
    story.append(Spacer(1, 6))

    # Salutation & Opening
    name = data.get("name") or data.get("full_name") or "Candidate"
    domain = data.get("project_name") or "Artificial Intelligence and Machine Learning"
    mode = data.get("internship_mode") or "Offline"
    duration = data.get("duration") or "15 Days Internship Program"
    program_title = format_program_selection_title(duration, mode)
    duration_display = format_duration_display(duration)
    joining_date = format_date(data.get("start_date"))
    reporting_time = format_time(data.get("reporting_time"))
    venue = get_venue(data.get("branch"))
    email = data.get("email") or ""

    story.append(Paragraph(f"Dear <b>{name}</b>,", body_left))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Greetings from Wingroo Technologies.", body_left))
    story.append(Spacer(1, 3))
    story.append(Paragraph("<b>Congratulations!</b>", bold_body))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        f"We are pleased to confirm your selection for the <b>{program_title}</b> "
        f"at Wingroo Technologies in the domain of <b>{domain}</b>.",
        body_justify
    ))
    story.append(Spacer(1, 5))

    story.append(Paragraph("<b>Internship Details:</b>", bold_body))
    story.append(Spacer(1, 3))

    # Details Table
    details_data = [
        [Paragraph("Candidate Name", tbl_label), Paragraph(f"<b>{name}</b>", tbl_val)],
        [Paragraph("Domain / Project", tbl_label), Paragraph(domain, tbl_val)],
        [Paragraph("Program Duration", tbl_label), Paragraph(duration_display, tbl_val)],
        [Paragraph("Internship Mode", tbl_label), Paragraph(mode, tbl_val)],
        [Paragraph("Joining Date", tbl_label), Paragraph(joining_date, tbl_val)],
        [Paragraph("Reporting Time", tbl_label), Paragraph(reporting_time, tbl_val)],
        [Paragraph("Reporting Venue", tbl_label), Paragraph(venue, tbl_val)],
    ]
    details_tbl = Table(details_data, colWidths=[130, A4[0] - 72 - 130])
    details_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(details_tbl)
    story.append(Spacer(1, 5))

    # Clauses (ALL JUSTIFIED)
    story.append(Paragraph(
        "During the internship period, you will be assigned tasks and projects related to your area of learning "
        "and the company's requirements. Your performance, attendance, punctuality, discipline, and quality of work "
        "will be evaluated throughout the internship.",
        body_justify
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph(
        "Candidates who demonstrate excellent performance and professional conduct during the internship may be "
        "considered for future employment opportunities with Wingroo Technologies, based on organizational requirements.",
        body_justify
    ))
    story.append(Spacer(1, 3))

    reporting_note = (
        "You are requested to report to our office on the joining date at the specified time."
        if mode.lower() != "online"
        else "You are requested to attend your virtual orientation session on the joining date at the specified time."
    )
    story.append(Paragraph(reporting_note, body_justify))
    story.append(Spacer(1, 3))

    story.append(Paragraph("Kindly bring your college ID card and any necessary documents for verification.", body_justify))
    story.append(Spacer(1, 3))

    story.append(Paragraph("We look forward to welcoming you to our organization. Wishing you a successful internship!", body_justify))
    story.append(Spacer(1, 6))

    # Candidate Portal Login Credentials Box (Properly structured, aligned and fully visible)
    portal_url = "https://wingrootechnologies.com/internship"

    cred_grid = Table([
        [
            Paragraph(f"<b>Portal URL:</b> <font color='#0284c7'>{portal_url}</font>", cred_text_style),
            Paragraph(f"<b>Login Email:</b> {email}", cred_text_style),
            Paragraph(f"<b>Register No:</b> {reg_no}", cred_text_style),
        ]
    ], colWidths=[205, 195, 103])
    cred_grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))

    cred_box_data = [
        [Paragraph("<b>Candidate Portal Login Credentials:</b>", cred_title_style)],
        [Spacer(1, 3)],
        [cred_grid]
    ]
    cred_tbl = Table(cred_box_data, colWidths=[A4[0] - 72])
    cred_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
        ("LINEBEFORE", (0, 0), (0, -1), 3.5, colors.HexColor("#0284C7")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(cred_tbl)
    story.append(Spacer(1, 8))

    # Sign-off (HR Department) - STRICTLY LEFT ALIGNED
    story.append(Paragraph("Best Regards,", bold_body))
    story.append(Spacer(1, 2))
    story.append(Paragraph(
        "<b>HR Department</b><br/>"
        "Wingroo Technologies<br/>"
        "<font color='#0284c7'>hr@wingrootechnologies.com</font> &nbsp;|&nbsp; +91 96267 79609",
        signoff_style
    ))

    # Build document
    doc.build(story, canvasmaker=AppointmentCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
