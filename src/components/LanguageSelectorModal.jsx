import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Search, 
  Check, 
  X, 
  Volume2, 
  Sparkles, 
  MapPin, 
  Layers
} from 'lucide-react';
import { INDIAN_LANGUAGES, getLanguageByCode } from '../i18n/languages';
import speechService from '../services/speechService';

export default function LanguageSelectorModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');

  const currentLang = i18n.language || 'en';
  const currentLangMeta = getLanguageByCode(currentLang);

  const regionCategories = [
    { id: 'all', label: 'All Languages (23)' },
    { id: 'popular', label: 'Most Spoken' },
    { id: 'south', label: 'South' },
    { id: 'north', label: 'North' },
    { id: 'east', label: 'East & Northeast' },
    { id: 'west', label: 'West' }
  ];

  const popularCodes = ['en', 'hi', 'te', 'mr', 'ta', 'kn', 'bn', 'gu', 'pa', 'ur', 'ml', 'or'];

  const filteredLanguages = useMemo(() => {
    return INDIAN_LANGUAGES.filter((lang) => {
      // Region filter
      if (selectedRegionFilter === 'popular' && !popularCodes.includes(lang.code)) {
        return false;
      }
      if (selectedRegionFilter === 'south' && !['te', 'ta', 'kn', 'ml'].includes(lang.code)) {
        return false;
      }
      if (selectedRegionFilter === 'north' && !['hi', 'pa', 'doi', 'ks', 'ur', 'mai', 'sa'].includes(lang.code)) {
        return false;
      }
      if (selectedRegionFilter === 'east' && !['bn', 'or', 'as', 'mni', 'brx', 'sat'].includes(lang.code)) {
        return false;
      }
      if (selectedRegionFilter === 'west' && !['mr', 'gu', 'kok', 'sd'].includes(lang.code)) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.script.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedRegionFilter]);

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    
    // Optional welcoming greeting audio
    const meta = getLanguageByCode(code);
    if (speechService.isSupported()) {
      const welcomePhrase = code === 'te' ? 'అగ్రಿಸెన్స్ కు స్వాగతం' :
        code === 'hi' ? 'एग्रीसेंस में आपका स्वागत है' :
        code === 'mr' ? 'अॅग्रीसेन्स मध्ये आपले स्वागत आहे' :
        code === 'ta' ? 'அக்ரிசென்ஸ்க்கு வரவேற்கிறோம்' :
        code === 'kn' ? 'ಅಗ್ರಿಸೆನ್ಸ್‌ಗೆ ಸುಸ್ವಾಗತ' :
        code === 'bn' ? 'এগ্রিসেন্সে স্বাগতম' :
        code === 'gu' ? 'એગ્રીસેન્સમાં આપનું સ્વાગત છે' :
        code === 'pa' ? 'ਐਗਰੀਸੈਂਸ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ' :
        code === 'ur' ? 'ایگری سینس میں خوش آمدید' :
        'Welcome to AgriSense';
      speechService.speak(welcomePhrase, meta);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-emerald-950/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Globe className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 id="lang-modal-title" className="text-xl font-bold tracking-tight">
                {t('app.selectLanguage', 'Select Language')}
              </h2>
              <p className="text-xs text-emerald-200/90 font-medium">
                {t('app.all22Languages', 'All 22 Scheduled Indian Languages + English')}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('app.searchLanguage', 'Search by name, script, or region (e.g. Telugu, हिन्दी, বাংলা)...')}
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder-emerald-200/60 text-sm rounded-xl pl-10 pr-9 py-2.5 border border-white/20 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            {regionCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedRegionFilter(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium cursor-pointer ${
                  selectedRegionFilter === cat.id
                    ? 'bg-white text-emerald-950 font-bold shadow-xs'
                    : 'bg-emerald-950/40 text-emerald-200 hover:bg-emerald-950/60 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Active Language Strip */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-emerald-800">Current Language:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1">
              <span>{currentLangMeta.nativeName}</span>
              <span className="opacity-80 font-normal">({currentLangMeta.name})</span>
            </span>
          </div>
          <span className="text-[11px] text-emerald-700/80">
            {currentLangMeta.dir === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
          </span>
        </div>

        {/* Language Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No languages found</p>
              <p className="text-xs text-slate-400 mt-1">Try another search term or switch regional filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredLanguages.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`text-left p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-emerald-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        {/* Native Script Heading */}
                        <span className={`text-base font-bold tracking-tight truncate ${
                          isSelected ? 'text-emerald-950 font-black' : 'text-slate-900 group-hover:text-emerald-900'
                        }`}>
                          {lang.nativeName}
                        </span>

                        {/* English Name */}
                        <span className="text-xs font-medium text-slate-500 truncate">
                          {lang.name}
                        </span>

                        {/* RTL Badge if applicable */}
                        {lang.dir === 'rtl' && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            RTL
                          </span>
                        )}
                      </div>

                      {/* Region and Script details */}
                      <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500 truncate">
                        <span className="truncate">{lang.region}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono text-[10px] shrink-0">{lang.script}</span>
                      </div>
                    </div>

                    {/* Selection State / Checkmark */}
                    <div className="shrink-0 flex items-center space-x-1">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-slate-200 group-hover:border-emerald-400 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 uppercase">
                            {lang.code}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">
            🇮🇳 Eighth Schedule of Constitution of India • 22 Official Languages
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            {t('settings.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
