"""FileFlow - Smart File Converter Backend.
FastAPI modular backend service.
"""

import os
import shutil
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.converters.pdf_converter import convert_pdf_to_image
from backend.converters.image_converter import convert_image
from backend.converters.text_converter import convert_text_to_pdf
from backend.converters.docx_converter import convert_text_to_docx

app = FastAPI(
    title="FileFlow – Smart File Converter API",
    description="Fast, temporary, privacy-respecting file converter backend for hackathons and production.",
    version="1.0.0",
)

# Enable CORS so the React/Vite frontend can interact freely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Filename", "X-Converted-Format", "X-File-Size"],
)

# Uploads directory ensure
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Maximum allowed file size in bytes (25 MB)
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

# Mapping of supported input types and their available target conversions
SUPPORTED_MATRIX = {
    "pdf": ["jpg", "jpeg", "png"],
    "jpg": ["png", "pdf"],
    "jpeg": ["png", "pdf"],
    "png": ["jpg", "jpeg", "pdf"],
    "txt": ["pdf", "docx"],
}


def detect_file_extension(filename: str) -> str:
    """Extract and normalize lowercase file extension without the dot."""
    if not filename or "." not in filename:
        return ""
    return filename.rsplit(".", 1)[-1].lower().strip()


@app.get("/health")
def health_check():
    """Health check endpoint to verify backend service availability."""
    return {
        "status": "ok",
        "service": "FileFlow – Smart File Converter",
        "version": "1.0.0",
        "privacy": "Your files are processed temporarily and are not permanently stored.",
        "supported_conversions": {
            "PDF": ["JPG", "PNG"],
            "JPG": ["PNG", "PDF"],
            "PNG": ["JPG", "PDF"],
            "TXT": ["PDF", "DOCX"],
        },
    }


@app.post("/convert")
async def convert_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    """Convert an uploaded file to the requested target format.
    
    Supported conversions:
    - PDF -> JPG, PNG
    - JPG -> PNG, PDF
    - PNG -> JPG, PDF
    - TXT -> PDF, DOCX
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty upload: Please provide a valid file to convert.",
        )

    original_filename = file.filename
    source_ext = detect_file_extension(original_filename)

    if not source_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot detect file format. Please upload a file with an extension like .pdf, .jpg, .png, or .txt.",
        )

    # Normalize target format
    norm_target = target_format.lower().strip().replace(".", "")
    if norm_target == "jpeg":
        norm_target = "jpg"

    norm_source = "jpg" if source_ext in ("jpg", "jpeg") else source_ext

    # Check if input format is supported
    if norm_source not in SUPPORTED_MATRIX:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This file format isn't supported yet ({source_ext.upper()}). FileFlow supports PDF, JPG, PNG, and TXT files.",
        )

    # Check if conversion pair is supported
    available_targets = SUPPORTED_MATRIX[norm_source]
    if norm_target not in available_targets:
        targets_str = ", ".join([t.upper() for t in available_targets])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported conversion: Cannot convert {norm_source.upper()} to {norm_target.upper()}. Available formats: {targets_str}.",
        )

    # Read uploaded file content with size limit enforcement
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes). Please upload a valid document or image.",
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum supported file size is 25 MB.",
        )

    # Dispatch to appropriate converter
    try:
        if norm_source == "pdf":
            out_bytes, out_name, mime_type = convert_pdf_to_image(
                input_bytes=content,
                target_format=norm_target,
                original_filename=original_filename,
            )

        elif norm_source in ("jpg", "png"):
            out_bytes, out_name, mime_type = convert_image(
                input_bytes=content,
                target_format=norm_target,
                original_filename=original_filename,
            )

        elif norm_source == "txt":
            if norm_target == "pdf":
                out_bytes, out_name, mime_type = convert_text_to_pdf(
                    input_bytes=content,
                    original_filename=original_filename,
                )
            elif norm_target == "docx":
                out_bytes, out_name, mime_type = convert_text_to_docx(
                    input_bytes=content,
                    original_filename=original_filename,
                )
            else:
                raise ValueError(f"Unknown target format {norm_target} for TXT")
        else:
            raise ValueError(f"Unsupported source format: {norm_source}")

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversion failure: An unexpected error occurred while processing your file ({str(e)}).",
        )
    finally:
        # Privacy guarantee: Release memory and ensure zero leftover data
        del content
        await file.close()

    return Response(
        content=out_bytes,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{out_name}"',
            "X-Filename": out_name,
            "X-Converted-Format": norm_target.upper(),
            "X-File-Size": str(len(out_bytes)),
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
