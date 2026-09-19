import React from 'react';
import { FileText, Image as ImageIcon, ArrowRight, X, Loader2 } from 'lucide-react';
import { FileDetails, TargetFormat } from '../types';
import { formatFileSize, CONVERSION_MATRIX, FORMAT_LABELS } from '../utils/formatters';

interface ConversionCardProps {
  fileDetails: FileDetails;
  selectedTarget: TargetFormat | null;
  onSelectTarget: (format: TargetFormat) => void;
  onConvert: () => void;
  onReset: () => void;
  isConverting: boolean;
  conversionProgress: number;
  progressStep: string;
}

export const ConversionCard: React.FC<ConversionCardProps> = ({
  fileDetails,
  selectedTarget,
  onSelectTarget,
  onConvert,
  onReset,
  isConverting,
  conversionProgress,
  progressStep,
}) => {
  const availableTargets = CONVERSION_MATRIX[fileDetails.format] || [];
  const isImage = fileDetails.format === 'jpg' || fileDetails.format === 'jpeg' || fileDetails.format === 'png';

  return (
    <div className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
      {/* File summary bar with reset button */}
      <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
            {isImage ? <ImageIcon className="w-6 h-6 text-indigo-500" /> : <FileText className="w-6 h-6 text-indigo-500" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {fileDetails.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                {fileDetails.format}
              </span>
              <span>•</span>
              <span>{formatFileSize(fileDetails.size)}</span>
              <span>•</span>
              <span>{FORMAT_LABELS[fileDetails.format] || fileDetails.format.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {!isConverting && (
          <button
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Remove file"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Target format selection */}
      <div className="py-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Convert to:
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Select desired output format
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {availableTargets.map((target) => {
            const isSelected = selectedTarget === target;
            return (
              <button
                key={target}
                type="button"
                disabled={isConverting}
                onClick={() => onSelectTarget(target)}
                className={`flex-1 sm:flex-initial min-w-28 px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <span>{target.toUpperCase()}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress indicator or Action Button */}
      {isConverting ? (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>{progressStep}</span>
            </div>
            <span>{conversionProgress}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-200 rounded-full"
              style={{ width: `${conversionProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-center"
          >
            Reset
          </button>

          <button
            type="button"
            disabled={!selectedTarget}
            onClick={onConvert}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Convert File</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
