import React from 'react';
import { Sun, Moon, ShieldCheck, CheckCircle, RefreshCw, Server } from 'lucide-react';
import { BackendHealth } from '../types';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  backendHealth: BackendHealth;
  isCheckingHealth: boolean;
  onRefreshHealth: () => void;
  useBackend: boolean;
  onToggleUseBackend: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  backendHealth,
  isCheckingHealth,
  onRefreshHealth,
  useBackend,
  onToggleUseBackend,
  onGoHome,
}) => {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <button
          onClick={onGoHome}
          type="button"
          className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            FF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                FileFlow
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Convert your files quickly and easily.
            </p>
          </div>
        </button>

        {/* Status badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status indicator */}
          <button
            onClick={onToggleUseBackend}
            title={
              backendHealth.isOnline
                ? 'Python FastAPI Backend is active (Click to switch engine)'
                : 'Client-side In-Browser Engine is active (Click to switch engine)'
            }
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              useBackend && backendHealth.isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Engine:</span>
            <span className="font-semibold">
              {useBackend && backendHealth.isOnline ? 'FastAPI' : 'Browser Engine'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                useBackend && backendHealth.isOnline
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-indigo-500'
              }`}
            />
          </button>

          {/* Refresh backend ping button */}
          <button
            onClick={onRefreshHealth}
            disabled={isCheckingHealth}
            title="Refresh backend status"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          </button>

          {/* Dark / Light toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
