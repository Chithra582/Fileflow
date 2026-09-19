import React from 'react';
import { ShieldCheck, Trash2, Lock } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-4.5 transition-colors shadow-xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            “Your files are processed temporarily and are not permanently stored.”
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">
            Files are transformed in transient memory and deleted automatically after conversion. We do not store, catalog, or inspect your data.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> End-to-End Private
          </span>
          <span className="flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Auto-Purged
          </span>
        </div>
      </div>
    </div>
  );
};
