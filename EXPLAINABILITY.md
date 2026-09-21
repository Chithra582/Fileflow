# EXPLAINABILITY — FileFlow

> **Admissibility & Transparency Report for OpenGAP / Agent Passport**  
> *Agent Name:* FileFlow (`fileflow-agent`)  
> *Specification:* OpenGAP v0.1.0  
> *Domain:* Developer Tools / Smart File Converter & Document Processing  

---

## 1. Overview & Operational Purpose

FileFlow is an autonomous, privacy-first file transformation and format translation intelligence. Its purpose is to convert, optimize, and restructure documents and raster images across popular formats (PDF, JPG, PNG, TXT, DOCX) with zero user friction, zero data retention, and mathematical fidelity.

FileFlow ingests binary file streams, inspects MIME types and binary magic bytes, validates file size boundaries, dynamically routes conversions to specialized deterministic processing engines (PyMuPDF, Pillow, ReportLab, and python-docx), and immediately purges all intermediate files from memory and disk post-conversion.

---

## 2. How the Agent Decides (Decision-Making Logic)

FileFlow operates across a deterministic, multi-stage decision pipeline:

```
[Uploaded File Stream] ──> [Format & Header Inspection] ──> [Engine Routing Matrix]
                                                                     │
                                                                     ▼
[Ephemeral Memory Purge] <── [Integrity & MIME Check] <── [Execution & Quality Tuning]
```

### 2.1 File Ingestion & Format Inspection
- **Decision:** Validates whether the incoming payload is authentic and within safe processing thresholds.
- **Rules:**
  - Validates binary magic byte headers (e.g., `%PDF-`, `0xFF 0xD8 0xFF`, `\x89PNG\r\n\x1a\n`) rather than trusting user-provided file extensions to prevent spoofing.
  - Rejects payloads exceeding 50 MB to prevent Denial-of-Service and host memory exhaustion.
  - Strips dangerous path traversal tokens (`../`, `..\`) and null bytes from metadata names.

### 2.2 Conversion Routing & Engine Selection
- **Decision:** Resolves the optimal transformation engine based on source MIME type and desired target format.
- **Routing Rules:**
  - **`PDF -> JPG / PNG`**: Routed to **PyMuPDF (fitz)** with custom matrix scaling (2.0x / 144 DPI) for high-resolution vector text rendering without distortion.
  - **`JPG <-> PNG`**: Routed to **Pillow (PIL)** with automatic color mode normalization (converting RGBA to RGB with clean white matte for JPEG export).
  - **`JPG / PNG -> PDF`**: Routed to **Pillow** with image resolution scaling and page bounding box centering.
  - **`TXT -> PDF`**: Routed to **ReportLab** utilizing structured Paragraph styles, Helvetica typography, and automated page break calculations.
  - **`TXT -> DOCX`**: Routed to **python-docx** with UTF-8 line preservation and standard 1-inch margins.

### 2.3 Quality Tuning & Parameter Optimization
- **Decision:** Automatically calculates image quality compression levels, color palettes, and matrix scaling factors to maximize visual clarity while minimizing output file weight.
- **Feedback:** If multi-page output is produced from a single document (such as PDF pages converted to PNGs), the agent bundles the assets into a structured ZIP archive.

### 2.4 Ephemeral Processing & Memory Disposal
- **Decision:** Enforces zero data retention.
- **Rules:**
  - File transformations are performed using in-memory byte streams (`io.BytesIO`) or temporary scratch references.
  - Explicit file unlinking and garbage collection are triggered immediately upon delivery of the conversion result.

---

## 3. Data Sources & Inputs Used

| Data Input | Source | Purpose | Data Handling & Privacy |
|---|---|---|---|
| **File Byte Streams** | User upload (multipart form / HTTP body) | Raw binary source for document or image transformation | Processed ephemerally in memory; zero persistent disk storage; purged immediately |
| **Magic Byte Headers** | Binary file signature prefix | Format verification and anti-spoofing validation | Extracted in memory (first 16-64 bytes) to classify real MIME type |
| **Geometry & Dimension Flags** | Image headers / PDF page trees | DPI scaling, canvas sizing, and color-space mapping | Evaluated in memory and discarded upon completion |
| **Target Format Parameter** | User selection (e.g. `pdf`, `png`, `docx`) | Selects conversion route and output serializer | Query parameter / request field; not retained |

FileFlow complies with privacy-by-design standards:
- **No PII collection:** No personal identifiers, account data, or user profiles are collected, tracked, or stored.
- **Stateless execution:** Backend conversion services are completely stateless and ephemeral.
- **Zero data mining:** Document content, image pixels, and extracted text are never logged, indexed, vectorized, or used for model training.

---

## 4. Known Limitations & Failure Modes

Reviewers and users should be aware of the following system boundaries:

1. **Maximum Payload & Memory Boundaries:**
   - *Limitation:* Uploaded documents or images exceeding 50 MB will be rejected to protect shared server memory from out-of-memory crashes.
   - *Mitigation:* The agent returns a clear HTTP 413 (Payload Too Large) error advising the user to reduce or compress the source file before retry.

2. **Encrypted & Password-Protected Documents:**
   - *Limitation:* The agent cannot convert password-locked, DRM-protected, or encrypted PDF documents without prior decryption keys.
   - *Mitigation:* The agent intercepts decryption exceptions and notifies the user with an explicit authentication prompt rather than generating corrupted output.

3. **Non-OCR Flattened Raster Scans:**
   - *Limitation:* When converting scanned image PDFs or flat image files to editable text (`DOCX` / `TXT`), the agent only parses native text streams; scanned images without text layers cannot be converted without OCR.
   - *Mitigation:* The agent gracefully notifies the user that the document contains purely rasterized image layers lacking native digital text.

4. **Embedded Macros & Active Script Stripping:**
   - *Limitation:* Advanced macro-enabled document features (`.docm`, `.xlsm`) and embedded executable payloads are deliberately stripped or unsupported.
   - *Mitigation:* Enforces safety by design; blocks malware execution and preserves document security.

---

## 5. Verification, Safety & Human Oversight

- **Pre-Flight Integrity Checks:** Before any conversion process starts, the input stream is validated against recognized MIME signatures to ensure no malicious executables are processed.
- **Post-Conversion Validation:** Output files are verified for non-zero byte size and valid target header markers before being returned to the user.
- **Deterministic Pipeline (Zero Hallucination):** Because FileFlow relies on deterministic compiled engines (PyMuPDF, Pillow, ReportLab, python-docx), conversions are 100% mathematically reproducible with zero generative hallucination.
- **User Verification & Immediate Purge Audit:** Users receive the downloaded output directly in their browser session, while internal logs verify that temporary scratch memory has been fully flushed.
