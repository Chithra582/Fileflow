import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { UploadArea } from './components/UploadArea';
import { ConversionCard } from './components/ConversionCard';
import { ResultCard } from './components/ResultCard';
import { PreviewModal } from './components/PreviewModal';
import { HistoryList } from './components/HistoryList';
import { ToolsGrid, ToolItem } from './components/ToolsGrid';
import { createSampleFile } from './utils/sampleFiles';
import { ActiveTool, FileDetails, TargetFormat, SourceFormat, ConvertedResult, HistoryItem, BackendHealth } from './types';
import { detectFormat } from './utils/formatters';
import { checkBackendHealth, convertFileUnified } from './utils/api';
import { AlertCircle, XCircle } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('fileflow_theme') === 'dark' ||
        (!('fileflow_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // Apply dark mode class to root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fileflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fileflow_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Backend Health state
  const [backendHealth, setBackendHealth] = useState<BackendHealth>({ isOnline: false });
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [useBackend, setUseBackend] = useState<boolean>(true);

  const fetchHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await checkBackendHealth();
      setBackendHealth(health);
    } catch {
      setBackendHealth({ isOnline: false });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Poll health status periodically
    return () => clearInterval(interval);
  }, []);

  // Upload & Conversion state
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<TargetFormat | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [progressStep, setProgressStep] = useState<string>('Preparing...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [convertedResult, setConvertedResult] = useState<ConvertedResult | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<ConvertedResult | null>(null);
  const [lastEngineUsed, setLastEngineUsed] = useState<'fastapi' | 'client'>('fastapi');
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Session conversion history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Active Tool state (e.g. PDF to JPG)
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);

  // File selection handler
  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setConvertedResult(null);

    const format = detectFormat(file.name);
    if (!format) {
      setErrorMessage("This file format isn't supported yet. Supported formats are PDF, JPG, PNG, and TXT.");
      return;
    }

    setFileDetails({
      file,
      name: file.name,
      size: file.size,
      format,
    });

    // If a specific tool was selected, set its target format
    if (activeTool) {
      setSelectedTarget(activeTool.target);
    } else {
      // Auto-select first available target format
      if (format === 'pdf') setSelectedTarget('jpg');
      else if (format === 'jpg' || format === 'jpeg') setSelectedTarget('png');
      else if (format === 'png') setSelectedTarget('jpg');
      else if (format === 'txt') setSelectedTarget('pdf');
    }
  };

  // Quick tool card selector (iLovePDF style)
  const handleSelectTool = (tool: ToolItem) => {
    setErrorMessage(null);
    setFileDetails(null);
    setConvertedResult(null);
    setActiveTool(tool);
    setSelectedTarget(tool.target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearTool = () => {
    setActiveTool(null);
    setFileDetails(null);
    setConvertedResult(null);
    setErrorMessage(null);
    setIsConverting(false);
    setConversionProgress(0);
  };

  // Convert execution
  const handleConvert = async () => {
    if (!fileDetails || !selectedTarget) return;

    setIsConverting(true);
    setConversionProgress(15);
    setProgressStep('Uploading file data...');
    setErrorMessage(null);

    // Simulate progressive status steps for visual clarity
    const timer1 = setTimeout(() => {
      setConversionProgress(45);
      setProgressStep('Processing conversion...');
    }, 300);

    const timer2 = setTimeout(() => {
      setConversionProgress(75);
      setProgressStep('Rendering output format...');
    }, 600);

    try {
      const { result, engineUsed } = await convertFileUnified(
        fileDetails.file,
        fileDetails.format,
        selectedTarget,
        useBackend && backendHealth.isOnline
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      setConversionProgress(100);
      setProgressStep('Conversion complete!');

      setTimeout(() => {
        setIsConverting(false);
        setConvertedResult(result);
        setLastEngineUsed(engineUsed);

        // Add to session history
        const historyEntry: HistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          originalName: fileDetails.name,
          originalSize: fileDetails.size,
          sourceFormat: fileDetails.format.toUpperCase(),
          targetFormat: selectedTarget.toUpperCase(),
          convertedFileName: result.fileName,
          convertedSize: result.fileSize,
          downloadUrl: result.downloadUrl,
          blob: result.blob,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          previewType: result.previewType,
        };
        setHistory((prev) => [historyEntry, ...prev]);
      }, 300);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsConverting(false);
      setConversionProgress(0);
      setErrorMessage((err as Error).message || 'Conversion failed. Please try again or check your file.');
    }
  };

  const handleReset = () => {
    setFileDetails(null);
    setSelectedTarget(null);
    setConvertedResult(null);
    setErrorMessage(null);
    setIsConverting(false);
    setConversionProgress(0);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handlePreviewHistoryItem = (item: HistoryItem) => {
    setPreviewModalItem({
      blob: item.blob,
      downloadUrl: item.downloadUrl,
      fileName: item.convertedFileName,
      sourceFormat: item.sourceFormat.toLowerCase() as any,
      targetFormat: item.targetFormat.toLowerCase() as any,
      fileSize: item.convertedSize,
      originalName: item.originalName,
      originalSize: item.originalSize,
      convertedAt: new Date(),
      previewType: item.previewType,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* App Header */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        backendHealth={backendHealth}
        isCheckingHealth={isCheckingHealth}
        onRefreshHealth={fetchHealth}
        useBackend={useBackend}
        onToggleUseBackend={() => setUseBackend((prev) => !prev)}
        onGoHome={handleClearTool}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Title Header Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            FileFlow
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal">
            Convert your files quickly and easily.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="w-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl p-4 flex items-start gap-3 text-red-800 dark:text-red-300 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-200 rounded-md transition-colors"
              aria-label="Dismiss error"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Functional Card (Flow Step: Upload -> Select/Convert -> Result) */}
        {!fileDetails && !convertedResult && (
          <>
            <UploadArea
              onFileSelect={handleFileSelect}
              isLoadingSample={isLoadingSample}
              setIsLoadingSample={setIsLoadingSample}
              onError={(msg) => setErrorMessage(msg)}
              activeTool={activeTool}
              onClearTool={handleClearTool}
            />
            <ToolsGrid onSelectTool={handleSelectTool} />
          </>
        )}

        {fileDetails && !convertedResult && (
          <ConversionCard
            fileDetails={fileDetails}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onConvert={handleConvert}
            onReset={handleReset}
            isConverting={isConverting}
            conversionProgress={conversionProgress}
            progressStep={progressStep}
          />
        )}

        {convertedResult && (
          <ResultCard
            result={convertedResult}
            onPreview={() => setPreviewModalItem(convertedResult)}
            onConvertAnother={handleReset}
            engineUsed={lastEngineUsed}
          />
        )}

        {/* Privacy Feature Banner */}
        <PrivacyBanner />

        {/* Session Conversion History */}
        <HistoryList
          history={history}
          onClearHistory={handleClearHistory}
          onPreviewItem={handlePreviewHistoryItem}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FileFlow – Smart File Converter • Hackathon & Production Ready</span>
          <span>PDF, JPG, PNG, TXT, DOCX</span>
        </div>
      </footer>

      {/* Preview Modal */}
      {previewModalItem && (
        <PreviewModal
          result={previewModalItem}
          onClose={() => setPreviewModalItem(null)}
        />
      )}
    </div>
  );
}
