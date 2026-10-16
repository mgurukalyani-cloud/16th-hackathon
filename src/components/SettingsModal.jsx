import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SlidersHorizontal,
  X,
  Thermometer,
  Wind,
  Droplets,
  Radio,
  Check,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Globe,
  ChevronRight
} from 'lucide-react';
import { getLanguageByCode } from '../i18n/languages';

export default function SettingsModal({
  isOpen,
  onClose,
  tempUnit,
  onSetTempUnit,
  currentLocation,
  onApplyCustomCoords,
  onOpenLanguageSelector
}) {
  const { t, i18n } = useTranslation();
  const [customLat, setCustomLat] = useState(currentLocation?.latitude?.toFixed(4) || '');
  const [customLon, setCustomLon] = useState(currentLocation?.longitude?.toFixed(4) || '');

  const currentLang = i18n.language || 'en';
  const currentLangMeta = getLanguageByCode(currentLang);

  if (!isOpen) return null;

  const handleApplyCoords = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onApplyCustomCoords(lat, lon);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t('settings.title', 'Application Preferences & Data Sources')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('settings.subtitle', 'AgriSense Configuration')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Indian Language Setting Section */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {t('app.languages', 'Languages')} (22 Scheduled Indian Languages)
            </label>
            <button
              onClick={() => {
                onClose();
                if (onOpenLanguageSelector) onOpenLanguageSelector();
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50/50 border border-emerald-200/90 hover:border-emerald-300 flex items-center justify-between text-left group transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-emerald-950">
                      {currentLangMeta.nativeName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      ({currentLangMeta.name})
                    </span>
                    {currentLangMeta.dir === 'rtl' && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        RTL
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentLangMeta.region} • {currentLangMeta.script}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
                <span>{t('app.selectLanguage', 'Change Language')}</span>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </div>
            </button>
          </div>

          {/* Temperature Units */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {t('settings.tempUnit', 'Temperature Unit')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSetTempUnit('C')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                  <span>{t('settings.celsius', 'Celsius (°C) — Standard Agronomic')}</span>
                </div>
                {tempUnit === 'C' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={() => onSetTempUnit('F')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>{t('settings.fahrenheit', 'Fahrenheit (°F)')}</span>
                </div>
                {tempUnit === 'F' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Meteorological Data Provider & Auto-Refresh */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {t('settings.providerStatus', 'Meteorological Provider Status')}
                </span>
                <span className="text-xs text-emerald-700 font-medium">
                  {t('settings.connectedProvider', 'Connected: Open-Meteo & WMO World Weather Watch')}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {t('settings.liveFeed', 'Live Network Feed')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('settings.autoRefreshDesc', 'Automatic refresh runs every 15 minutes to synchronize latest numerical weather model runs (ECMWF, DWD ICON, and NOAA GFS). All calculations use genuine published meteorological data.')}
            </p>
          </div>

          {/* Custom Field Coordinates Form */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('settings.customCoords', 'Set Custom Farm Latitude & Longitude')}</span>
            </label>
            <form onSubmit={handleApplyCoords} className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">{t('settings.latitude', 'Latitude (-90 to 90)')}</span>
                <input
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="e.g. 30.9010"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">{t('settings.longitude', 'Longitude (-180 to 180)')}</span>
                <input
                  type="number"
                  step="0.0001"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  placeholder="e.g. 75.8573"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('settings.applyCoords', 'Apply Coordinates')}
                </button>
              </div>
            </form>
          </div>

          {/* Attribution Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-xs text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{t('settings.attributionTitle', 'Meteorological Data Attribution')}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('settings.attributionDesc', "AgriSense integrates Open-Meteo's open-source atmospheric API, WMO weather codes, and FAO-56 Penman-Monteith algorithms. Data is refreshed every 15 minutes.")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('settings.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
