import { SourceFormat, TargetFormat, ConvertedResult, BackendHealth } from '../types';
import {
  convertImageToImage,
  convertImageToPdf,
  convertPdfToImage,
  convertTextToPdf,
  convertTextToDocx,
} from './clientConverters';

/**
 * Check if the FastAPI backend /health endpoint is alive.
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('/health', {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        isOnline: true,
        service: data.service,
        version: data.version,
        privacy: data.privacy,
        supported: data.supported_conversions,
      };
    }
    return { isOnline: false };
  } catch {
    return { isOnline: false };
  }
}

/**
 * Execute conversion using the Python FastAPI POST /convert endpoint.
 */
export async function convertViaBackend(file: File, targetFormat: TargetFormat): Promise<{ blob: Blob; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetFormat);

  const response = await fetch('/convert', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Conversion failed on server';
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorDetail = errData.detail;
      }
    } catch {
      errorDetail = `Server returned status ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  const blob = await response.blob();
  
  // Extract filename from header or derive from original name
  let fileName = '';
  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }
  if (!fileName) {
    const xFilename = response.headers.get('x-filename');
    if (xFilename) {
      fileName = xFilename;
    } else {
      const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
      fileName = `${stem}.${targetFormat}`;
    }
  }

  return { blob, fileName };
}

/**
 * Unified conversion runner with smart dispatch (FastAPI backend with in-browser engine fallback).
 */
export async function convertFileUnified(
  file: File,
  sourceFormat: SourceFormat,
  targetFormat: TargetFormat,
  useBackend: boolean = true
): Promise<{ result: ConvertedResult; engineUsed: 'fastapi' | 'client' }> {
  let blob: Blob | null = null;
  let fileName = '';
  let engineUsed: 'fastapi' | 'client' = 'client';

  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  const defaultOutputName = `${stem}.${targetFormat}`;

  if (useBackend) {
    try {
      const backendRes = await convertViaBackend(file, targetFormat);
      blob = backendRes.blob;
      fileName = backendRes.fileName;
      engineUsed = 'fastapi';
    } catch (backendError) {
      console.warn('Backend conversion failed, attempting client-side fallback:', backendError);
      // If backend explicitly rejected due to user input error (e.g. file too large or empty), rethrow
      const errMsg = (backendError as Error).message || '';
      if (errMsg.includes('File too large') || errMsg.includes('Empty upload')) {
        throw backendError;
      }
      // Otherwise proceed to client-side engine fallback
    }
  }

  // If backend wasn't used or failed gracefully, execute client-side
  if (!blob) {
    engineUsed = 'client';
    fileName = defaultOutputName;

    if (sourceFormat === 'pdf' && (targetFormat === 'jpg' || targetFormat === 'png')) {
      blob = await convertPdfToImage(file, targetFormat);
    } else if ((sourceFormat === 'jpg' || sourceFormat === 'jpeg') && targetFormat === 'png') {
      blob = await convertImageToImage(file, 'png');
    } else if (sourceFormat === 'png' && targetFormat === 'jpg') {
      blob = await convertImageToImage(file, 'jpg');
    } else if ((sourceFormat === 'jpg' || sourceFormat === 'jpeg' || sourceFormat === 'png') && targetFormat === 'pdf') {
      blob = await convertImageToPdf(file);
    } else if (sourceFormat === 'txt' && targetFormat === 'pdf') {
      blob = await convertTextToPdf(file);
    } else if (sourceFormat === 'txt' && targetFormat === 'docx') {
      blob = await convertTextToDocx(file);
    } else {
      throw new Error(`Unsupported conversion from ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}`);
    }
  }

  const downloadUrl = URL.createObjectURL(blob);

  // Determine preview type
  let previewType: 'image' | 'pdf' | 'text' | 'docx' = 'image';
  if (targetFormat === 'pdf') previewType = 'pdf';
  else if (targetFormat === 'docx') previewType = 'docx';
  else if (targetFormat === 'jpg' || targetFormat === 'png') previewType = 'image';

  let textPreviewContent: string | undefined;
  if (sourceFormat === 'txt') {
    try {
      const txt = await file.text();
      textPreviewContent = txt.slice(0, 2000); // Sample preview
    } catch {
      // Ignore text slice failure
    }
  }

  const result: ConvertedResult = {
    blob,
    downloadUrl,
    fileName,
    sourceFormat,
    targetFormat,
    fileSize: blob.size,
    originalName: file.name,
    originalSize: file.size,
    convertedAt: new Date(),
    previewType,
    textPreviewContent,
  };

  return { result, engineUsed };
}
