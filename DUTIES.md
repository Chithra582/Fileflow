# Segregation of Duties (SOD): FileFlow Agent

To guarantee system reliability and user confidentiality, tasks within the conversion pipeline are divided among discrete roles.

## Role Allocations

```
[Ingestion Gate]     --> Role: File Stream Ingestor & Header Verifier (Maker)
        │
[Conversion Engine]  --> Role: Format Translator & Quality Tuner (Executor)
        │
[Format Inspector]   --> Role: Output Integrity & Mime Verifier (Checker)
        │
[Privacy Purger]     --> Role: Memory Eraser & Session Cleaner (Auditor)
```

### 1. File Stream Ingestor (`maker`)
- Ingests multipart files, validates magic numbers, checks size boundaries, and creates temporary working references.

### 2. Conversion Engine (`executor`)
- Executes the transformation utilizing PyMuPDF, Pillow, ReportLab, or python-docx. Applies dimension scaling and color management.

### 3. Format Inspector (`checker`)
- Inspects generated output stream to ensure file headers, byte counts, and MIME compliance match the intended target format.

### 4. Privacy Purger (`auditor`)
- Unlinks intermediate files, clears temporary cache directories, and guarantees zero residual data retention.
