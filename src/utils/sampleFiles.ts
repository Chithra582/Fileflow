import { jsPDF } from 'jspdf';

/**
 * Generate sample files dynamically for instant 1-click testing.
 */
export async function createSampleFile(type: 'txt' | 'jpg' | 'png' | 'pdf'): Promise<File> {
  if (type === 'txt') {
    const textContent = `FileFlow Sample Document
=========================
Project: Smart File Converter
Date: September 2026

This is a demonstration text document created for FileFlow.
You can convert this plain text file directly into:
1. High-resolution PDF document with typography styling
2. Real Microsoft Word (.docx) document

FileFlow Features:
- PDF <-> Images (JPG, PNG)
- Images (JPG <-> PNG, Images -> PDF)
- Text (TXT -> PDF, TXT -> DOCX)
- Clean temporary processing with zero permanent storage
- Instant in-browser preview and download

End of document.`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    return new File([blob], 'fileflow_sample.txt', { type: 'text/plain' });
  }

  if (type === 'png' || type === 'jpg') {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = type === 'png' ? '#4F46E5' : '#0EA5E9';
      ctx.fillRect(0, 0, 400, 300);

      // Draw decorative shapes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(200, 110, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.arc(200, 110, 25, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(type === 'png' ? 'FileFlow Sample PNG' : 'FileFlow Sample JPG', 200, 200);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('Ready for conversion testing', 200, 230);
    }

    const mime = type === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mime, 0.92);
    });
    return new File([blob], `fileflow_sample.${type}`, { type: mime });
  }

  if (type === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('FileFlow Sample PDF', 60, 80);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('A sample PDF ready to convert into JPG or PNG images.', 60, 110);

    // Add visual box
    doc.setDrawColor(99, 102, 241);
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(60, 140, 492, 120, 8, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202);
    doc.text('PDF to Image Conversion Test', 80, 175);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(75, 85, 99);
    doc.text('PyMuPDF / PDF.js extracts this entire vector page and renders it as', 80, 200);
    doc.text('a crisp, high-resolution JPG or PNG raster image at 2x resolution.', 80, 220);

    const pdfBlob = doc.output('blob');
    return new File([pdfBlob], 'fileflow_sample.pdf', { type: 'application/pdf' });
  }

  throw new Error(`Unsupported sample type: ${type}`);
}
