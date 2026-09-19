"""Text conversion module for FileFlow.
Handles:
- TXT -> PDF (using ReportLab)
"""

import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def convert_text_to_pdf(input_bytes: bytes, original_filename: str = "document") -> tuple[bytes, str, str]:
    """Convert raw text content to a formatted PDF document using ReportLab.
    
    Args:
        input_bytes: Raw binary content of the TXT file
        original_filename: Name of the uploaded file
        
    Returns:
        tuple of (output_bytes, output_filename, mime_type)
    """
    stem = original_filename.rsplit(".", 1)[0] if "." in original_filename else original_filename

    try:
        # Try UTF-8 with fallback
        try:
            text_str = input_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text_str = input_bytes.decode("latin-1")
    except Exception as e:
        raise ValueError(f"Unable to decode text content: {str(e)}")

    output_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        output_buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()
    
    # Custom readable monospace/body style preserving line formatting
    code_style = ParagraphStyle(
        name="SourceText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        wordWrap="CJK",
    )

    story = []
    
    # Add document title based on original filename
    title_style = ParagraphStyle(
        name="DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=12,
    )
    story.append(Paragraph(original_filename, title_style))
    story.append(Spacer(1, 10))

    # Split lines into clean chunks to allow ReportLab to paginate naturally
    paragraphs = text_str.split("\n\n")
    for para in paragraphs:
        cleaned = para.strip()
        if cleaned:
            # Replace single newlines with break tag
            formatted_para = cleaned.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
            story.append(Paragraph(formatted_para, code_style))
            story.append(Spacer(1, 8))
        else:
            story.append(Spacer(1, 6))

    if not story:
        story.append(Paragraph("(Empty document)", code_style))

    try:
        doc.build(story)
    except Exception as e:
        raise ValueError(f"Failed to generate PDF from text: {str(e)}")

    output_filename = f"{stem}.pdf"
    return output_buffer.getvalue(), output_filename, "application/pdf"
