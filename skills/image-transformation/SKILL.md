---
name: image-transformation
description: Convert and optimize raster images between JPG, PNG, and PDF formats.
---

# Image Transformation Skill

## Overview
Performs color-space conversion, dimension scaling, and cross-format translation between JPEG, PNG, and PDF formats using Pillow.

## Operations
1. Loads source image and determines color mode (RGB, RGBA, L).
2. Converts RGBA to RGB with matte background if converting to JPEG.
3. Scales and packages single or multi-page images into clean PDF documents.
