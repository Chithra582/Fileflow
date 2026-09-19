import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch {
    // Fallback if worker CDN fails
  }
}

/**
 * Convert Image (PNG/JPG) to target image format (JPG/PNG) via HTML5 Canvas.
 */
export async function convertImageToImage(file: File, target: 'jpg' | 'png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        if (target === 'jpg') {
          // White background for JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = target === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = target === 'jpg' ? 0.92 : undefined;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob from canvas'));
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Image (JPG/PNG) to PDF using jsPDF.
 */
export async function convertImageToPdf(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;

        // Determine orientation based on aspect ratio
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [imgWidth, imgHeight],
        });

        const imageFormat = file.type.includes('png') ? 'PNG' : 'JPEG';
        pdf.addImage(img.src, imageFormat, 0, 0, imgWidth, imgHeight);

        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      };
      img.onerror = () => reject(new Error('Failed to decode image for PDF conversion'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert PDF Page 1 to JPG or PNG using pdfjs-dist and Canvas.
 */
export async function convertPdfToImage(file: File, target: 'jpg' | 'png'): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  if (pdfDoc.numPages === 0) {
    throw new Error('The PDF document has no pages.');
  }

  const page = await pdfDoc.getPage(1);
  const scale = 2.0; // 2x scale for sharp output
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas rendering context not available');
  }

  if (target === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const renderContext = {
    canvasContext: ctx,
    viewport,
    canvas: canvas as any,
  };

  await page.render(renderContext).promise;

  return new Promise((resolve, reject) => {
    const mimeType = target === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = target === 'jpg' ? 0.92 : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image from PDF page'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Convert Text (TXT) to PDF using jsPDF.
 */
export async function convertTextToPdf(file: File): Promise<Blob> {
  const text = await file.text();
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const margin = 50;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Title header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.text(file.name, margin, margin);

  // Line divider
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(1);
  pdf.line(margin, margin + 8, pageWidth - margin, margin + 8);

  // Body content
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10.5);
  pdf.setTextColor(51, 65, 85);

  const lineHeight = 15;
  let currentY = margin + 30;

  const lines = pdf.splitTextToSize(text, usableWidth);

  for (let i = 0; i < lines.length; i++) {
    if (currentY + lineHeight > margin + usableHeight) {
      pdf.addPage();
      currentY = margin;
    }
    pdf.text(lines[i], margin, currentY);
    currentY += lineHeight;
  }

  return pdf.output('blob');
}

/**
 * Convert Text (TXT) to DOCX using docx library.
 */
export async function convertTextToDocx(file: File): Promise<Blob> {
  const text = await file.text();
  const rawLines = text.split('\n');

  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: file.name,
          bold: true,
          size: 32, // 16pt
          color: '0F172A',
        }),
      ],
      spacing: { after: 240 },
    }),
  ];

  for (const line of rawLines) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line || ' ',
            size: 22, // 11pt
            color: '334155',
          }),
        ],
        spacing: { after: line ? 120 : 60, line: 276 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
