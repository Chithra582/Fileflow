---
name: pdf-conversion
description: Convert PDF documents to high-resolution JPG and PNG images with page extraction.
---

# PDF Conversion Skill

## Overview
Extracts and renders vector PDF pages into image formats (JPG, PNG) using PyMuPDF (fitz) at 144 DPI scaling.

## Operations
1. Ingests PDF document bytes.
2. Iterates through pages and computes transformation matrix.
3. Renders high-quality pixmaps.
4. Compresses into target image format and packages multiple pages into ZIP archives when necessary.
