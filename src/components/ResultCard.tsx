import React from 'react';
import { CheckCircle2, Download, Eye, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { ConvertedResult } from '../types';
import { formatFileSize } from '../utils/formatters';

interface ResultCardProps {
  result: ConvertedResult;
  onPreview: () => void;
  onConvertAnother: () => void;
  engineUsed: 'fastapi' | 'client';
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onPreview,
  onConvertAnother,
  engineUsed,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors text-center space-y-6">
      {/* Success Badge */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          ✓ Conversion Complete
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Processed via {engineUsed === 'fastapi' ? 'Python FastAPI Service' : 'In-Browser Engine'}
        </p>
      </div>

      {/* Transformation summary block */}
      <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center gap-3">
        <div className="min-w-0 text-right">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
            {result.originalName}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatFileSize(result.originalSize)}
          </span>
        </div>

        <div className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
          <ArrowRight className="w-4 h-4" />
        </div>

        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[140px] sm:max-w-[180px]">
            {result.fileName}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatFileSize(result.fileSize)}
          </span>
        </div>
      </div>

      {/* Actions: [ Preview ] and [ Download File ] */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onPreview}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </button>
      </div>

      {/* Convert Another File */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
        <button
          type="button"
          onClick={onConvertAnother}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Convert another file</span>
        </button>
      </div>
    </div>
  );
};
