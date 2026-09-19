import React from 'react';
import { History, Download, Eye, Trash2, ArrowRight, FileCheck } from 'lucide-react';
import { HistoryItem, ConvertedResult } from '../types';
import { formatFileSize } from '../utils/formatters';

interface HistoryListProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onPreviewItem: (item: HistoryItem) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onClearHistory,
  onPreviewItem,
}) => {
  if (history.length === 0) return null;

  const handleDownload = (item: HistoryItem) => {
    const a = document.createElement('a');
    a.href = item.downloadUrl;
    a.download = item.convertedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Session History
          </h4>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 font-medium"
          title="Clear session history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-xs">
                  {item.convertedFileName}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-2xs uppercase font-medium">
                  {item.sourceFormat} → {item.targetFormat}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-slate-400 dark:text-slate-500 text-2xs">
                <span>{formatFileSize(item.convertedSize)}</span>
                <span>•</span>
                <span>{item.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onPreviewItem(item)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
                title="Preview"
                aria-label="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(item)}
                className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/50 transition-colors"
                title="Download"
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
