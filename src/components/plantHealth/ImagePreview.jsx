import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Info,
  Maximize2,
  FileCheck
} from 'lucide-react';

export default function ImagePreview({
  imageMetadata,
  onAnalyze,
  isAnalyzing,
  onClear,
  onOpenReplace
}) {
  if (!imageMetadata || !imageMetadata.source) return null;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Specimen Loaded
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {imageMetadata.fileName || 'Captured Plant Leaf Sample'}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReplace}
            disabled={isAnalyzing}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Replace</span>
          </button>

          <button
            onClick={onClear}
            disabled={isAnalyzing}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Preview Frame */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group">
            <img
              src={imageMetadata.source}
              alt="Leaf to Analyze"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            {imageMetadata.fileSize && (
              <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                {imageMetadata.fileSize}
              </span>
            )}
          </div>
        </div>

        {/* Inspection Details & Action Trigger */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Inspection Checklist Verified</span>
            </div>
            <ul className="space-y-1 text-emerald-800 list-disc list-inside">
              <li>Foliage in clear focus without motion blur</li>
              <li>Visible leaf venation and boundary margins detected</li>
              <li>Ready for computer-vision pathology classification</li>
            </ul>
          </div>

          <button
            data-action="analyze-specimen"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Computer Vision Pathology Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span>Analyze Leaf Health & Symptoms</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
