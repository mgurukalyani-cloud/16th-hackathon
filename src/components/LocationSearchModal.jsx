import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  X,
  Compass,
  Clock,
  Sparkles,
  Loader2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { searchLocations } from '../services/weatherApi';
import { DEMO_PRESET_LOCATIONS } from '../services/demoData';

export default function LocationSearchModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
  onUseMyLocation,
  isGeoLoading
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agrisense_recent_locations');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read recent searches:', e);
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchLocations(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc) => {
    // Save to recents
    try {
      const updated = [loc, ...recentSearches.filter(item => item.name !== loc.name || item.country !== loc.country)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('agrisense_recent_locations', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save recent search:', e);
    }

    onSelectLocation(loc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header & Search Box */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-emerald-50/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                {t('app.search', 'Search')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('app.searchPlaceholder', 'Search village, town, district, or agricultural zone...')}
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-emerald-200 rounded-xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              </div>
            )}
          </div>

          {/* GPS Quick Action */}
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => {
                onUseMyLocation();
                onClose();
              }}
              disabled={isGeoLoading}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/60 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Compass className={`w-3.5 h-3.5 text-emerald-700 ${isGeoLoading ? 'animate-spin' : ''}`} />
              <span>{t('app.useGpsCoords', 'Use Current Device GPS Coordinates')}</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Global Open-Meteo Geocoding
            </span>
          </div>
        </div>

        {/* Modal Body / Results */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Live Search Results */}
          {query.trim().length >= 2 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <span>{t('app.searchResults', 'Search Results')}</span>
                {results.length > 0 && <span className="text-emerald-600">({results.length})</span>}
              </div>

              {isLoading && results.length === 0 ? (
                <div className="py-8 text-center text-slate-400 flex flex-col items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                  <p className="text-xs">{t('app.searchingCoords', 'Searching meteorological coordinates...')}</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1.5">
                  {results.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-start space-x-3 truncate">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 truncate">
                            {loc.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {[loc.admin2, loc.admin1, loc.country].filter(Boolean).join(', ')}
                            {loc.elevation ? ` • ${loc.elevation}m elev.` : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-sm">{t('app.noLocationsFound', 'No locations found')} for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {t('app.trySearchingDistrict', 'Try searching for your district, nearby town, or state.')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Agricultural Belt Presets */}
          {query.trim().length < 2 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('app.featuredBelts', 'Featured Agricultural Belts')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_PRESET_LOCATIONS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className="text-left p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/60 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        {preset.country_code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {preset.admin1}, {preset.country}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium mt-1">
                      {preset.cropFocus}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {query.trim().length < 2 && recentSearches.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('app.recentSearches', 'Recent Searches')}</span>
              </div>
              <div className="space-y-1.5">
                {recentSearches.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${idx}`}
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs text-slate-700 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{loc.name}</span>
                      <span className="text-slate-400 truncate">({[loc.admin1, loc.country].filter(Boolean).join(', ')})</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/70 text-center">
          <p className="text-[11px] text-slate-500">
            {t('app.currentFarm', 'Current Farm:')} <strong className="text-slate-700">{currentLocation.name}</strong> ({currentLocation.latitude.toFixed(3)}°, {currentLocation.longitude.toFixed(3)}°)
          </p>
        </div>
      </div>
    </div>
  );
}
