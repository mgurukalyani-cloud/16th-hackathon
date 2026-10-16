import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Sparkles } from 'lucide-react';
import { getLanguageByCode } from '../../i18n/languages';

export default function FloatingVoiceButton({ onClick, isOpen }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const langMeta = getLanguageByCode(currentLang);

  if (isOpen) return null;

  // Localized button text for quick thumb tap
  const getButtonText = () => {
    switch (currentLang) {
      case 'te': return 'వాయిస్ అసిస్టెంట్';
      case 'hi': return 'बोलकर पूछें';
      case 'mr': return 'व्हॉइस असिस्टंट';
      case 'ta': return 'குரல் உதவியாளர்';
      case 'bn': return 'ভয়েস সহকারী';
      case 'kn': return 'ಧ್ವನಿ ಸಹಾಯಕ';
      case 'gu': return 'બોલીને પૂછો';
      case 'ml': return 'വോയ്സ് അസിസ്റ്റന്റ്';
      case 'pa': return 'ਬੋਲ ਕੇ ਪੁੱਛੋ';
      case 'or': return 'ଭଏସ୍ ସହାୟକ';
      case 'ur': return 'صوتی معاون';
      default: return t('voice.floatingButton', 'Ask Voice AI');
    }
  };

  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 flex items-center space-x-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-950/40 border border-emerald-400/40 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
      title={`Voice Assistant (${langMeta.name}) — Speak naturally in your language`}
      aria-label="Open Multilingual Voice Farming Assistant"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute w-7 h-7 rounded-full bg-emerald-400/40 animate-ping" />
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Mic className="w-4 h-4 text-emerald-100" />
        </div>
      </div>

      <div className="flex flex-col text-left">
        <span className="leading-tight tracking-wide font-extrabold text-white text-xs sm:text-sm">
          {getButtonText()}
        </span>
        <span className="text-[10px] text-emerald-200 font-medium hidden sm:inline leading-none mt-0.5">
          22 Languages • Real Farm Data
        </span>
      </div>

      <Sparkles className="w-3.5 h-3.5 text-emerald-300 ml-1 hidden sm:inline" />
    </button>
  );
}
