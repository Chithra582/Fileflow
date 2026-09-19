export type SourceFormat = 'pdf' | 'jpg' | 'jpeg' | 'png' | 'txt';
export type TargetFormat = 'pdf' | 'jpg' | 'png' | 'docx';

export interface FileDetails {
  file: File;
  name: string;
  size: number;
  format: SourceFormat;
  previewUrl?: string;
}

export interface ConvertedResult {
  blob: Blob;
  downloadUrl: string;
  fileName: string;
  sourceFormat: SourceFormat;
  targetFormat: TargetFormat;
  fileSize: number;
  originalName: string;
  originalSize: number;
  convertedAt: Date;
  previewType: 'image' | 'pdf' | 'text' | 'docx';
  textPreviewContent?: string;
}

export interface HistoryItem {
  id: string;
  originalName: string;
  originalSize: number;
  sourceFormat: string;
  targetFormat: string;
  convertedFileName: string;
  convertedSize: number;
  downloadUrl: string;
  blob: Blob;
  timestamp: string;
  previewType: 'image' | 'pdf' | 'text' | 'docx';
}

export interface BackendHealth {
  isOnline: boolean;
  service?: string;
  version?: string;
  privacy?: string;
  supported?: Record<string, string[]>;
}

export interface ActiveTool {
  id: string;
  source: SourceFormat;
  target: TargetFormat;
  title: string;
  description: string;
  badge: string;
}

