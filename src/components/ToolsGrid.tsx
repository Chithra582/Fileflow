import React from 'react';
import { FileText, Image as ImageIcon, FileCheck, ArrowRight, Sparkles } from 'lucide-react';
import { SourceFormat, TargetFormat } from '../types';

export interface ToolItem {
  id: string;
  source: SourceFormat;
  target: TargetFormat;
  title: string;
  description: string;
  badge: string;
  iconType: 'pdf' | 'image' | 'text';
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    darkBg: string;
    darkText: string;
  };
}

export const TOOLS: ToolItem[] = [
  {
    id: 'pdf-to-jpg',
    source: 'pdf',
    target: 'jpg',
    title: 'PDF to JPG',
    description: 'Convert PDF pages into high quality JPG images.',
    badge: 'Popular',
    iconType: 'pdf',
    colorClasses: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      darkBg: 'dark:bg-rose-950/40',
      darkText: 'dark:text-rose-400',
    },
  },
  {
    id: 'pdf-to-png',
    source: 'pdf',
    target: 'png',
    title: 'PDF to PNG',
    description: 'Extract crisp PNG images with lossless clarity.',
    badge: 'HD Quality',
    iconType: 'pdf',
    colorClasses: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'hover:border-orange-300 dark:hover:border-orange-700',
      darkBg: 'dark:bg-orange-950/40',
      darkText: 'dark:text-orange-400',
    },
  },
  {
    id: 'jpg-to-pdf',
    source: 'jpg',
    target: 'pdf',
    title: 'JPG to PDF',
    description: 'Convert your JPEG photos into formatted PDF documents.',
    badge: 'Document',
    iconType: 'image',
    colorClasses: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      darkBg: 'dark:bg-emerald-950/40',
      darkText: 'dark:text-emerald-400',
    },
  },
  {
    id: 'png-to-pdf',
    source: 'png',
    target: 'pdf',
    title: 'PNG to PDF',
    description: 'Turn PNG graphics into high-resolution PDF pages.',
    badge: 'Document',
    iconType: 'image',
    colorClasses: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'hover:border-teal-300 dark:hover:border-teal-700',
      darkBg: 'dark:bg-teal-950/40',
      darkText: 'dark:text-teal-400',
    },
  },
  {
    id: 'jpg-to-png',
    source: 'jpg',
    target: 'png',
    title: 'JPG to PNG',
    description: 'Convert JPG to PNG image format with zero quality loss.',
    badge: 'Image',
    iconType: 'image',
    colorClasses: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
      darkBg: 'dark:bg-blue-950/40',
      darkText: 'dark:text-blue-400',
    },
  },
  {
    id: 'png-to-jpg',
    source: 'png',
    target: 'jpg',
    title: 'PNG to JPG',
    description: 'Transform PNG with clean white background into JPG.',
    badge: 'Image',
    iconType: 'image',
    colorClasses: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      darkBg: 'dark:bg-indigo-950/40',
      darkText: 'dark:text-indigo-400',
    },
  },
  {
    id: 'txt-to-pdf',
    source: 'txt',
    target: 'pdf',
    title: 'TXT to PDF',
    description: 'Convert plain text notes into styled, paginated PDF.',
    badge: 'Fast',
    iconType: 'text',
    colorClasses: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-300 dark:hover:border-purple-700',
      darkBg: 'dark:bg-purple-950/40',
      darkText: 'dark:text-purple-400',
    },
  },
  {
    id: 'txt-to-docx',
    source: 'txt',
    target: 'docx',
    title: 'TXT to DOCX',
    description: 'Generate real Microsoft Word (.docx) documents from text.',
    badge: 'Office',
    iconType: 'text',
    colorClasses: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
      darkBg: 'dark:bg-cyan-950/40',
      darkText: 'dark:text-cyan-400',
    },
  },
];

interface ToolsGridProps {
  onSelectTool: (tool: ToolItem) => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onSelectTool }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Popular Conversion Tools</span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              8 Formats
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any converter below or drop your files directly into the upload area above.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelectTool(tool)}
            className={`group text-left p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 ${tool.colorClasses.border} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-lg ${tool.colorClasses.bg} ${tool.colorClasses.darkBg} ${tool.colorClasses.text} ${tool.colorClasses.darkText} flex items-center justify-center`}
                >
                  {tool.iconType === 'pdf' ? (
                    <FileText className="w-5 h-5" />
                  ) : tool.iconType === 'image' ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : (
                    <FileCheck className="w-5 h-5" />
                  )}
                </div>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                  {tool.badge}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tool.title}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center gap-1 mt-3 pt-2 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 border-t border-slate-100 dark:border-slate-700/40 transition-colors">
              <span>Convert now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
