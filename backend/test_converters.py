"""Quick verification test for all FileFlow converters."""

import os
from backend.converters.image_converter import convert_image
from backend.converters.text_converter import convert_text_to_pdf
from backend.converters.docx_converter import convert_text_to_docx
from backend.converters.pdf_converter import convert_pdf_to_image
from PIL import Image
import io

print("--- Running Converter Verification ---")

# 1. Text to PDF
txt_bytes = b"Hello FileFlow!\nThis is a test document.\nTesting TXT to PDF."
pdf_bytes, pdf_name, mime_pdf = convert_text_to_pdf(txt_bytes, "sample.txt")
print(f"1. TXT -> PDF OK: {pdf_name}, {len(pdf_bytes)} bytes, {mime_pdf}")

# 2. Text to DOCX
docx_bytes, docx_name, mime_docx = convert_text_to_docx(txt_bytes, "sample.txt")
print(f"2. TXT -> DOCX OK: {docx_name}, {len(docx_bytes)} bytes, {mime_docx}")

# 3. Create test PNG image
test_img = Image.new("RGBA", (100, 100), color=(60, 120, 240, 255))
buf = io.BytesIO()
test_img.save(buf, format="PNG")
png_bytes = buf.getvalue()

# PNG -> JPG
jpg_bytes, jpg_name, mime_jpg = convert_image(png_bytes, "jpg", "sample.png")
print(f"3. PNG -> JPG OK: {jpg_name}, {len(jpg_bytes)} bytes, {mime_jpg}")

# JPG -> PNG
png2_bytes, png2_name, mime_png2 = convert_image(jpg_bytes, "png", "sample.jpg")
print(f"4. JPG -> PNG OK: {png2_name}, {len(png2_bytes)} bytes, {mime_png2}")

# JPG -> PDF
img_pdf_bytes, img_pdf_name, mime_img_pdf = convert_image(jpg_bytes, "pdf", "sample.jpg")
print(f"5. JPG -> PDF OK: {img_pdf_name}, {len(img_pdf_bytes)} bytes, {mime_img_pdf}")

# PNG -> PDF
png_pdf_bytes, png_pdf_name, mime_png_pdf = convert_image(png_bytes, "pdf", "sample.png")
print(f"6. PNG -> PDF OK: {png_pdf_name}, {len(png_pdf_bytes)} bytes, {mime_png_pdf}")

# 4. PDF -> JPG & PDF -> PNG (using the pdf generated from text)
p_jpg_bytes, p_jpg_name, p_mime_jpg = convert_pdf_to_image(pdf_bytes, "jpg", "sample.pdf")
print(f"7. PDF -> JPG OK: {p_jpg_name}, {len(p_jpg_bytes)} bytes, {p_mime_jpg}")

p_png_bytes, p_png_name, p_mime_png = convert_pdf_to_image(pdf_bytes, "png", "sample.pdf")
print(f"8. PDF -> PNG OK: {p_png_name}, {len(p_png_bytes)} bytes, {p_mime_png}")

print("--- ALL 8 CONVERSIONS TESTED & FUNCTIONAL ---")
