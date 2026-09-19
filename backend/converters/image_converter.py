"""Image conversion module for FileFlow.
Handles:
- JPG -> PNG
- PNG -> JPG
- JPG -> PDF
- PNG -> PDF
"""

import io
from PIL import Image


def convert_image(input_bytes: bytes, target_format: str, original_filename: str = "image") -> tuple[bytes, str, str]:
    """Convert an image (JPG/PNG) to another image format or PDF.
    
    Args:
        input_bytes: Raw binary content of the input image
        target_format: Desired format ("jpg", "jpeg", "png", "pdf")
        original_filename: Name of the uploaded file
        
    Returns:
        tuple of (output_bytes, output_filename, mime_type)
    """
    target = target_format.lower().strip().replace(".", "")
    stem = original_filename.rsplit(".", 1)[0] if "." in original_filename else original_filename

    try:
        img = Image.open(io.BytesIO(input_bytes))
    except Exception as e:
        raise ValueError(f"Could not decode image file: {str(e)}")

    output_buffer = io.BytesIO()

    if target in ("jpg", "jpeg"):
        # If PNG or has alpha channel, paste over white background
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[3])
            background.save(output_buffer, format="JPEG", quality=92)
        else:
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(output_buffer, format="JPEG", quality=92)
        
        output_filename = f"{stem}.jpg"
        mime_type = "image/jpeg"

    elif target == "png":
        img.save(output_buffer, format="PNG")
        output_filename = f"{stem}.png"
        mime_type = "image/png"

    elif target == "pdf":
        # Convert to RGB for PDF export
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[3])
            background.save(output_buffer, format="PDF", resolution=100.0)
        else:
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(output_buffer, format="PDF", resolution=100.0)
            
        output_filename = f"{stem}.pdf"
        mime_type = "application/pdf"

    else:
        raise ValueError(f"Unsupported image conversion target format: '{target_format}'")

    return output_buffer.getvalue(), output_filename, mime_type
