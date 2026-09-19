import { SourceFormat, TargetFormat } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i]}`;
}

export function detectFormat(filename: string): SourceFormat | null {
  if (!filename || !filename.includes('.')) return null;
  const ext = filename.split('.').pop()?.toLowerCase().trim();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'txt') return 'txt';
  return null;
}

export const CONVERSION_MATRIX: Record<SourceFormat, TargetFormat[]> = {
  pdf: ['jpg', 'png'],
  jpg: ['png', 'pdf'],
  jpeg: ['png', 'pdf'],
  png: ['jpg', 'pdf'],
  txt: ['pdf', 'docx'],
};

export const FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  jpg: 'JPG Image',
  jpeg: 'JPG Image',
  png: 'PNG Image',
  txt: 'Plain Text',
  docx: 'Word Document',
};
