import React, { useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { ConvertedResult } from '../types';
import { formatFileSize } from '../utils/formatters';

interface PreviewModalProps {
  result: ConvertedResult | null;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ result, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isImage = result.previewType === 'image';
  const isPdf = result.previewType === 'pdf';
  const isDocx = result.previewType === 'docx';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="min-w-0 pr-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {result.fileName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatFileSize(result.fileSize)} • Ready to download
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-100/60 dark:bg-slate-950/60 min-h-[320px]">
          {isImage && (
            <div className="flex flex-col items-center">
              <img
                src={result.downloadUrl}
                alt={result.fileName}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          {isPdf && (
            <div className="w-full h-[60vh] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
              <iframe
                src={result.downloadUrl}
                title={result.fileName}
                className="w-full h-full"
              />
            </div>
          )}

          {isDocx && (
            <div className="max-w-md w-full p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Microsoft Word Document (.docx)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ready to open in Microsoft Word, Google Docs, or LibreOffice.
                </p>
              </div>

              {result.textPreviewContent && (
                <div className="text-left bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Document Text Excerpt
                  </p>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                    {result.textPreviewContent}
                  </pre>
                </div>
              )}

              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Word Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Converted from {result.sourceFormat.toUpperCase()} to {result.targetFormat.toUpperCase()}</span>
          <button
            onClick={onClose}
            className="hover:text-slate-800 dark:hover:text-slate-200 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
