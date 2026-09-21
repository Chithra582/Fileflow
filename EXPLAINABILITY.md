# Explainability & Operational Transparency: FileFlow Agent

This document explains **how FileFlow Agent decides**, **the data it uses**, and **its operational limitations**, satisfying the transparency requirements of the **OpenGAP Specification** and **HiDevs GitAgent Passport Checkpoint 2**.

---

## 1. How the Agent Decides

FileFlow Agent utilizes a deterministic pipeline to inspect, validate, and route file conversion requests:

```
[Uploaded User File]
         │
         ▼
┌───────────────────────────┐
│ 01. Format & Magic Bytes  │ ──► Inspects MIME type, file headers, and extension
└───────────────────────────┘
         │
         ▼
┌───────────────────────────┐
│ 02. Conversion Router     │ ──► Resolves conversion graph (e.g., PDF -> PNG, TXT -> DOCX)
└───────────────────────────┘     Selects optimal engine: PyMuPDF, Pillow, ReportLab, python-docx
         │
         ▼
┌───────────────────────────┐
│ 03. Execution & Tuning    │ ──► Determines DPI, color palette, page dimensions,
└───────────────────────────┘     and compression ratios
         │
         ▼
┌───────────────────────────┐
│ 04. Privacy Purge & Hash  │ ──► Delivers output stream and immediately unlinks
└───────────────────────────┘     temporary disk buffers
```

### Engine Selection Matrix:
- **`PDF -> JPG / PNG`**: Routed to **PyMuPDF (fitz)** with custom matrix scaling (2.0x / 144 DPI) for high-resolution vector text rendering without distortion.
- **`JPG <-> PNG`**: Routed to **Pillow (PIL)** with automatic color mode normalization (converting RGBA to RGB with clean white matte for JPEG export).
- **`JPG / PNG -> PDF`**: Routed to **Pillow** with image resolution scaling and page bounding box centering.
- **`TXT -> PDF`**: Routed to **ReportLab** utilizing structured Paragraph styles, Helvetica typography, and automated page break calculations.
- **`TXT -> DOCX`**: Routed to **python-docx** with UTF-8 line preservation and standard 1-inch margins.

---

## 2. The Data It Uses

FileFlow Agent operates strictly on ephemeral metadata and binary streams:

### 1. Ingested Data
- **File Byte Streams**: Binary input provided via multipart HTTP upload or local buffer.
- **MIME & Header Metadata**: Magic numbers (e.g. `%PDF-` for PDFs, `ÿØÿ` for JPEG, `PNG` for PNG) used to verify authenticity.
- **Geometry & Dimension Attributes**: Width, height, page counts, aspect ratios, and color space flags (RGB, RGBA, CMYK).

### 2. Data Exclusions
- **Zero Content Mining**: File text and image pixels are transformed in memory and never indexed, vectorized, or analyzed for semantic profiling.
- **Zero Telemetry Leakage**: No user document content is ever sent to external cloud LLM providers during standard file conversions.

---

## 3. Operational Limitations

To maintain predictable performance and prevent resource exhaustion:

1. **Maximum File Size**: Default upload payload is capped at **50 MB** to ensure fast in-memory conversion without disk thrashing.
2. **Encrypted & Password-Protected Documents**: The agent cannot convert password-locked or DRM-protected PDFs without prior decryption credentials.
3. **No Optical Character Recognition (OCR) on Flat Scans**: In `PDF -> TXT` or scanned image operations, only existing text streams are parsed; rasterized image scans require a specialized OCR engine.
4. **Active Content Stripping**: Embedded macros, VBScript, or interactive forms in documents are deliberately ignored and stripped during conversion to mitigate malware propagation.
