"""PDF conversion module for FileFlow.
Handles:
- PDF -> JPG
- PDF -> PNG
"""

import io
import pymupdf as fitz  # PyMuPDF


def convert_pdf_to_image(input_bytes: bytes, target_format: str, original_filename: str = "document", page_number: int = 0) -> tuple[bytes, str, str]:
    """Convert a PDF page to JPG or PNG format using PyMuPDF (fitz).
    
    Args:
        input_bytes: Raw binary content of the PDF file
        target_format: Desired image format ("jpg", "jpeg", "png")
        original_filename: Name of the uploaded file
        page_number: Page index to convert (defaults to 0 for first page)
        
    Returns:
        tuple of (output_bytes, output_filename, mime_type)
    """
    target = target_format.lower().strip().replace(".", "")
    stem = original_filename.rsplit(".", 1)[0] if "." in original_filename else original_filename

    try:
        doc = fitz.open(stream=input_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Could not open PDF file: {str(e)}")

    if len(doc) == 0:
        raise ValueError("The provided PDF document contains no pages.")

    if page_number >= len(doc) or page_number < 0:
        page_number = 0

    page = doc.load_page(page_number)
    # Render at 2x resolution (144 DPI) for sharp, high-quality output
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False if target in ("jpg", "jpeg") else True)

    if target in ("jpg", "jpeg"):
        img_bytes = pix.tobytes(output="jpeg", jpg_quality=92)
        output_filename = f"{stem}.jpg"
        mime_type = "image/jpeg"
    elif target == "png":
        img_bytes = pix.tobytes(output="png")
        output_filename = f"{stem}.png"
        mime_type = "image/png"
    else:
        raise ValueError(f"Unsupported PDF conversion target format: '{target_format}'")

    doc.close()
    return img_bytes, output_filename, mime_type
