import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { getLanguageByCode } from '../i18n/languages';

export default function LanguageSelectorButton({ onOpen, className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const meta = getLanguageByCode(currentLang);

  return (
    <button
      onClick={onOpen}
      title={`Select Language (Current: ${meta.name} - ${meta.nativeName})`}
      className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-200/90 shadow-2xs transition-all group cursor-pointer ${className}`}
    >
      <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-[10px]">
        <Globe className="w-3 h-3 text-white" />
      </div>
      <div className="flex items-center space-x-1 truncate">
        <span className="font-bold text-emerald-900 group-hover:text-emerald-950 truncate">
          {meta.nativeName}
        </span>
        {meta.code !== 'en' && (
          <span className="text-[10px] text-emerald-700/80 hidden lg:inline">
            ({meta.name})
          </span>
        )}
      </div>
      <ChevronDown className="w-3 h-3 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
    </button>
  );
}
