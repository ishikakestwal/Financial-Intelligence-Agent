import logging
import os
from io import BytesIO
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib import colors

logger = logging.getLogger("finguard.reports.pdf")

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "reports")


def _ensure_dir() -> None:
    os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_pdf(investigation_id: str, data: Dict[str, Any]) -> str:
    """
    Render a professional investigation report as a PDF.

    Returns the absolute path to the saved file.
    """
    _ensure_dir()
    filename = f"investigation_{investigation_id}.pdf"
    filepath = os.path.abspath(os.path.join(REPORTS_DIR, filename))

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title", parent=styles["Title"], fontSize=18, spaceAfter=12
    )
    heading_style = ParagraphStyle(
        "Heading", parent=styles["Heading2"], fontSize=13, spaceAfter=6
    )
    body_style = styles["BodyText"]
    body_style.spaceAfter = 8

    story = []

    story.append(Paragraph("FinGuard — AML Investigation Report", title_style))
    story.append(
        Paragraph(
            f"Investigation ID: {investigation_id} &nbsp;|&nbsp; "
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            body_style,
        )
    )
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Spacer(1, 0.4 * cm))

    sections = [
        ("Risk Assessment", f"Risk Score: {data.get('risk_score', 'N/A')}  |  Level: {data.get('risk_level', 'N/A')}"),
        ("Summary", data.get("summary", "No summary available.")),
        ("AI Explanation", data.get("ai_explanation", "No explanation available.")),
        ("Compliance Notes", data.get("compliance_notes", "No compliance notes available.")),
        ("Recommendations", data.get("recommendations", "No recommendations available.")),
        ("Full Report", data.get("report_text", "No report text available.")),
    ]

    for heading, content in sections:
        story.append(Paragraph(heading, heading_style))
        for line in str(content).split("\n"):
            if line.strip():
                story.append(Paragraph(line.strip(), body_style))
        story.append(Spacer(1, 0.3 * cm))

    doc.build(story)
    logger.info("PDF report saved to %s", filepath)
    return filepath
