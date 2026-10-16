import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { INDIAN_LANGUAGES, getLanguageByCode } from './languages';

// Import all 23 locale dictionaries
import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import bn from './locales/bn.json';
import pa from './locales/pa.json';
import gu from './locales/gu.json';
import ml from './locales/ml.json';
import or from './locales/or.json';
import as from './locales/as.json';
import ur from './locales/ur.json';
import sa from './locales/sa.json';
import mai from './locales/mai.json';
import kok from './locales/kok.json';
import ne from './locales/ne.json';
import brx from './locales/brx.json';
import doi from './locales/doi.json';
import ks from './locales/ks.json';
import sd from './locales/sd.json';
import mni from './locales/mni.json';
import sat from './locales/sat.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  mr: { translation: mr },
  ta: { translation: ta },
  kn: { translation: kn },
  bn: { translation: bn },
  pa: { translation: pa },
  gu: { translation: gu },
  ml: { translation: ml },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
  sa: { translation: sa },
  mai: { translation: mai },
  kok: { translation: kok },
  ne: { translation: ne },
  brx: { translation: brx },
  doi: { translation: doi },
  ks: { translation: ks },
  sd: { translation: sd },
  mni: { translation: mni },
  sat: { translation: sat }
};

const STORAGE_KEY = 'agrisense_language';
const initialLang = localStorage.getItem(STORAGE_KEY) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document attributes (dir and lang) on initialization
export function syncDocumentDirection(langCode) {
  const langMeta = getLanguageByCode(langCode);
  const dir = langMeta.dir || 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = langCode;
  
  // RTL helper class for tailwind styling adjustments if needed
  if (dir === 'rtl') {
    document.documentElement.classList.add('rtl-mode');
  } else {
    document.documentElement.classList.remove('rtl-mode');
  }
}

syncDocumentDirection(initialLang);

// Listener for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  syncDocumentDirection(lng);
});

export default i18n;
