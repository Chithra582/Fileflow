import React, { useRef, useState } from 'react';
import { UploadCloud, ArrowLeft, Sparkles, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';
import { createSampleFile } from '../utils/sampleFiles';
import { ActiveTool, SourceFormat } from '../types';
import { detectFormat } from '../utils/formatters';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  isLoadingSample: boolean;
  setIsLoadingSample: (loading: boolean) => void;
  onError: (msg: string) => void;
  activeTool: ActiveTool | null;
  onClearTool: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelect,
  isLoadingSample,
  setIsLoadingSample,
  onError,
  activeTool,
  onClearTool,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSelectFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSelectFile(selectedFile);
    }
    // Reset file input value so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndSelectFile = (file: File) => {
    if (file.size === 0) {
      onError('Empty upload: The selected file contains 0 bytes.');
      return;
    }
    // Check 25 MB size limit
    if (file.size > 25 * 1024 * 1024) {
      onError('File too large: Maximum supported file size is 25 MB.');
      return;
    }

    const detected = detectFormat(file.name);
    if (!detected) {
      onError("This file format isn't supported yet. Supported formats are PDF, JPG, PNG, and TXT.");
      return;
    }

    // If an active tool is selected, verify file matches expected source format
    if (activeTool) {
      const isMatch =
        detected === activeTool.source ||
        (detected === 'jpeg' && activeTool.source === 'jpg') ||
        (detected === 'jpg' && activeTool.source === 'jpeg');

      if (!isMatch) {
        onError(
          `Please upload a ${activeTool.source.toUpperCase()} file for "${activeTool.title}". (Detected: ${detected.toUpperCase()})`
        );
        return;
      }
    }

    onFileSelect(file);
  };

  const handleLoadSample = async (type: 'pdf' | 'txt' | 'jpg' | 'png') => {
    try {
      setIsLoadingSample(true);
      const sampleFile = await createSampleFile(type);
      validateAndSelectFile(sampleFile);
    } catch (err) {
      onError(`Failed to create sample file: ${(err as Error).message}`);
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Determine accept attribute
  const getAcceptedExtensions = () => {
    if (!activeTool) return '.pdf,.jpg,.jpeg,.png,.txt';
    if (activeTool.source === 'pdf') return '.pdf';
    if (activeTool.source === 'jpg' || activeTool.source === 'jpeg') return '.jpg,.jpeg';
    if (activeTool.source === 'png') return '.png';
    if (activeTool.source === 'txt') return '.txt';
    return '.pdf,.jpg,.jpeg,.png,.txt';
  };

  const sourceName = activeTool ? activeTool.source.toUpperCase() : 'file';

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* If Active Tool is set, display tool header & back button */}
      {activeTool && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
          <div>
            <button
              type="button"
              onClick={onClearTool}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors mb-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all converters</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider bg-indigo-600 text-white dark:bg-indigo-500">
                {activeTool.source.toUpperCase()} → {activeTool.target.toUpperCase()}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeTool.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {activeTool.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClearTool}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Switch tool
          </button>
        </div>
      )}

      {/* Main Drag-and-Drop Card */}
      <div
        id="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative w-full border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 dark:border-indigo-400 scale-[1.008]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800'
        } shadow-xs`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedExtensions()}
          onChange={handleFileInput}
          className="hidden"
          id="file-browse-input"
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          {/* Upload Icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 ${
              isDragging
                ? 'bg-indigo-600 text-white scale-110'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Drop your {sourceName} here
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 my-2">or</p>

          <button
            type="button"
            className="pointer-events-auto px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Select {sourceName} file
          </button>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-5 font-medium tracking-wide">
            {activeTool
              ? `Accepts .${activeTool.source.toLowerCase()} files up to 25 MB`
              : 'Supported: PDF, JPG, PNG, TXT (up to 25 MB)'}
          </p>
        </div>
      </div>

      {/* Quick Demo Sample Files Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Demo Test:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {activeTool ? (
            <button
              onClick={() =>
                handleLoadSample(
                  activeTool.source === 'jpeg' ? 'jpg' : (activeTool.source as any)
                )
              }
              disabled={isLoadingSample}
              className="px-3 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
            >
              <span>Load sample {activeTool.source.toUpperCase()}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => handleLoadSample('pdf')}
                disabled={isLoadingSample}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Sample PDF
              </button>
              <button
                onClick={() => handleLoadSample('jpg')}
                disabled={isLoadingSample}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Sample JPG
              </button>
              <button
                onClick={() => handleLoadSample('png')}
                disabled={isLoadingSample}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Sample PNG
              </button>
              <button
                onClick={() => handleLoadSample('txt')}
                disabled={isLoadingSample}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Sample TXT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
