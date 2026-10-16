import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import NavigationTabs from './components/NavigationTabs';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import WeatherMetricsGrid from './components/WeatherMetricsGrid';
import FarmWeatherAdvisor from './components/FarmWeatherAdvisor';
import HourlyForecastStrip from './components/HourlyForecastStrip';
import FutureForecastView from './components/FutureForecastView';
import HistoricalWeatherView from './components/HistoricalWeatherView';
import PlantHealthPage from './components/plantHealth/PlantHealthPage';
import CropPlanningPage from './components/cropPlanning/CropPlanningPage';
import PlatformModulesDrawer from './components/PlatformModulesDrawer';
import LocationSearchModal from './components/LocationSearchModal';
import SettingsModal from './components/SettingsModal';
import LanguageSelectorModal from './components/LanguageSelectorModal';
import VoiceFarmingAssistant from './components/voiceAssistant/VoiceFarmingAssistant';
import FloatingVoiceButton from './components/voiceAssistant/FloatingVoiceButton';
import WeatherAlertBanner from './components/WeatherAlertBanner';
import Footer from './components/Footer';

import { fetchWeatherData, reverseGeocodeCoords, DEFAULT_REAL_LOCATION } from './services/weatherApi';
import { generateFarmAdvisories } from './services/agroAdvisor';
import { Loader2, AlertCircle, ScanLine, Leaf, ArrowRight, Sprout } from 'lucide-react';

const AUTO_REFRESH_INTERVAL_SECONDS = 900; // 15 minutes

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'live' | 'past' | 'forecast' | 'plant_health' | 'crop_planning' | 'farm_insights' | 'voice_assistant'
  const [location, setLocation] = useState(DEFAULT_REAL_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(AUTO_REFRESH_INTERVAL_SECONDS);
  const [tempUnit, setTempUnit] = useState(() => {
    return localStorage.getItem('agrisense_temp_unit') || 'C';
  });

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModulesDrawerOpen, setIsModulesDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isVoiceAssistantModalOpen, setIsVoiceAssistantModalOpen] = useState(false);
  const [latestPlantHealthResult, setLatestPlantHealthResult] = useState(null);

  const timerRef = useRef(null);

  // Fetch weather data for given location
  const loadWeather = useCallback(async (targetLocation) => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchWeatherData(targetLocation);
      setWeatherData(data);
      setAutoRefreshSeconds(AUTO_REFRESH_INTERVAL_SECONDS);
    } catch (err) {
      setError(`Failed to fetch genuine weather data from provider: ${err.message}. Please check your connection or retry.`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(location);
  }, [location, loadWeather]);

  // Automatic refresh interval timer (every second decrements, fires at 0)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setAutoRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadWeather(location);
          return AUTO_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [location, loadWeather]);

  // Handle GPS location request
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resolvedLoc = await reverseGeocodeCoords(latitude, longitude);
          setLocation(resolvedLoc);
        } catch (e) {
          console.warn('GPS location resolution error:', e);
        } finally {
          setIsGeoLoading(false);
        }
      },
      (err) => {
        setIsGeoLoading(false);
        alert(`Location access denied or unavailable (${err.message}). Showing selected agricultural district.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle location selection from search or presets
  const handleSelectLocation = (newLoc) => {
    setLocation(newLoc);
  };

  // Handle temperature unit toggle
  const handleToggleTempUnit = () => {
    const nextUnit = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(nextUnit);
    localStorage.setItem('agrisense_temp_unit', nextUnit);
  };

  const handleSetTempUnit = (unit) => {
    setTempUnit(unit);
    localStorage.setItem('agrisense_temp_unit', unit);
  };

  const handleApplyCustomCoords = (lat, lon) => {
    const customLoc = {
      id: `custom-${lat}-${lon}`,
      name: `Custom Farm Plot (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
      admin1: 'Agricultural Coordinates',
      country: '',
      country_code: '',
      latitude: lat,
      longitude: lon,
      elevation: null,
      isDemo: false
    };
    setLocation(customLoc);
  };

  // Compute advisor score for tab badge
  const advisories = weatherData?.current && weatherData?.daily
    ? generateFarmAdvisories(weatherData.current, weatherData.daily, weatherData.hourly)
    : null;

  return (
    <div className="min-h-screen bg-[#f7faf7] text-slate-800 flex flex-col selection:bg-emerald-200 selection:text-emerald-950 font-sans antialiased">
      {/* 1. Header with live status, GPS, search, units, auto-refresh and Indian Language Switcher */}
      <Header
        location={location}
        onOpenSearch={() => setIsSearchOpen(true)}
        onUseMyLocation={handleUseMyLocation}
        onRefresh={() => loadWeather(location)}
        isRefreshing={isRefreshing}
        isGeoLoading={isGeoLoading}
        lastUpdated={weatherData?.fetchedAt || weatherData?.current?.time}
        autoRefreshSecondsLeft={autoRefreshSeconds}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        onOpenModulesDrawer={() => setIsModulesDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLanguageSelector={() => setIsLanguageModalOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantModalOpen(true)}
        provider={weatherData?.provider || 'Open-Meteo & WMO'}
        modelSources={weatherData?.modelSources || 'ECMWF IFS (0.1°) / DWD ICON'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Weather Hazards Alert Banner */}
        {weatherData && (
          <WeatherAlertBanner
            weatherData={weatherData}
            tempUnit={tempUnit}
          />
        )}

        {/* Global Loading Spinner */}
        {isLoading && !weatherData && (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-700" />
            <h2 className="text-base font-bold text-slate-800">
              Querying Genuine Meteorological Provider...
            </h2>
            <p className="text-xs text-slate-500">
              Fetching real-time published observations from Open-Meteo & WMO stations for {location.name}
            </p>
          </div>
        )}

        {/* Error Notification with Manual Retry */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Weather Provider Communication Error</p>
                <p className="text-slate-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadWeather(location)}
              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold transition-colors shrink-0 cursor-pointer"
            >
              Retry Provider Call
            </button>
          </div>
        )}

        {weatherData && (
          <>
            {/* 2. Navigation Tabs (Overview / Live / Past / Forecast / Plant Health / Farm Insights) */}
            <NavigationTabs
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              advisorScore={advisories?.agriSuitabilityScore || 85}
            />

            {/* TAB CONTENT: 1. WEATHER OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                {/* Hero Current Weather Card */}
                <CurrentWeatherCard
                  weatherData={weatherData}
                  tempUnit={tempUnit}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />

                {/* Plant Health & Disease Scanner Spotlight Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-emerald-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-200 flex items-center justify-center shrink-0">
                      <ScanLine className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/60 border border-emerald-400/40 text-emerald-100">
                          {t('plantHealth.spotlightTag', 'New Extension')}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold">
                          {t('plantHealth.spotlightTitle', 'AI Plant Health & Leaf Disease Scanner')}
                        </h3>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
                        {t('plantHealth.spotlightDesc', 'Use your camera or upload leaf photographs to detect early fungal blights, rusts, and nutrient deficiencies. Results are automatically cross-referenced with your farm\'s live temperature and humidity.')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('plant_health')}
                    className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    <Leaf className="w-4 h-4 text-emerald-700" />
                    <span>{t('plantHealth.openScanner', 'Open Plant Health Scanner')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Seasonal Crop Planning & Real Mandi Prices Spotlight Banner */}
                <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-green-950 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-emerald-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-200 flex items-center justify-center shrink-0">
                      <Sprout className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/60 border border-emerald-400/40 text-emerald-100">
                          {t('cropPlanning.spotlightTag', 'Market Intelligence')}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold">
                          {t('cropPlanning.spotlightTitle', 'Seasonal Crop Planning & Real Mandi Prices')}
                        </h3>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
                        {t('cropPlanning.spotlightDesc', 'Plan high-yielding crops for your soil and season, check live AGMARKNET mandi prices, and calculate cultivation expenditure, yield scenarios, and net profit.')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('crop_planning')}
                    className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    <Sprout className="w-4 h-4 text-emerald-700" />
                    <span>{t('cropPlanning.openPlanner', 'Explore Crop Planning')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 8-Card Atmospheric & Agronomic Metrics Grid */}
                <WeatherMetricsGrid
                  weatherData={weatherData}
                  tempUnit={tempUnit}
                />

                {/* Next 24-48 Hours Hourly Forecast Strip */}
                <HourlyForecastStrip
                  hourly={weatherData.hourly}
                  tempUnit={tempUnit}
                />

                {/* Farm Weather Advisor Preview */}
                <FarmWeatherAdvisor
                  weatherData={weatherData}
                  onOpenModulesDrawer={() => setIsModulesDrawerOpen(true)}
                />
              </div>
            )}

            {/* TAB CONTENT: 2. LIVE WEATHER */}
            {activeTab === 'live' && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <CurrentWeatherCard
                  weatherData={weatherData}
                  tempUnit={tempUnit}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
                <HourlyForecastStrip
                  hourly={weatherData.hourly}
                  tempUnit={tempUnit}
                />
                <WeatherMetricsGrid
                  weatherData={weatherData}
                  tempUnit={tempUnit}
                />
              </div>
            )}

            {/* TAB CONTENT: 3. PAST WEATHER (HISTORICAL RECORDS) */}
            {activeTab === 'past' && (
              <div className="animate-in fade-in duration-300">
                <HistoricalWeatherView
                  historicalData={weatherData.historical}
                  location={location}
                  tempUnit={tempUnit}
                />
              </div>
            )}

            {/* TAB CONTENT: 4. WEATHER FORECAST (7-10 DAYS) */}
            {activeTab === 'forecast' && (
              <div className="animate-in fade-in duration-300">
                <FutureForecastView
                  daily={weatherData.daily}
                  tempUnit={tempUnit}
                />
              </div>
            )}

            {/* TAB CONTENT: 5. PLANT HEALTH & LEAF DISEASE ANALYSIS (EXTENSION MODULE) */}
            {activeTab === 'plant_health' && (
              <div className="animate-in fade-in duration-300">
                <PlantHealthPage
                  currentWeather={weatherData.current}
                  dailyWeather={weatherData.daily}
                  location={location}
                  tempUnit={tempUnit}
                  onAnalysisResultChange={setLatestPlantHealthResult}
                />
              </div>
            )}

            {/* TAB CONTENT: 6. SEASONAL CROP PLANNING & MARKET INTELLIGENCE */}
            {activeTab === 'crop_planning' && (
              <div className="animate-in fade-in duration-300">
                <CropPlanningPage
                  currentWeather={weatherData.current}
                  dailyWeather={weatherData.daily}
                  location={location}
                  tempUnit={tempUnit}
                />
              </div>
            )}

            {/* TAB CONTENT: 7. FARM INSIGHTS (WEATHER ADVISOR) */}
            {activeTab === 'farm_insights' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FarmWeatherAdvisor
                  weatherData={weatherData}
                  onOpenModulesDrawer={() => setIsModulesDrawerOpen(true)}
                />
              </div>
            )}

            {/* TAB CONTENT: 7. MULTILINGUAL VOICE FARMING ASSISTANT */}
            {activeTab === 'voice_assistant' && (
              <div className="animate-in fade-in duration-300">
                <VoiceFarmingAssistant
                  currentWeather={weatherData.current}
                  dailyWeather={weatherData.daily}
                  historicalWeather={weatherData.historical}
                  plantHealthResult={latestPlantHealthResult}
                  location={location}
                  isModal={false}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Multilingual Voice Assistant Button */}
      <FloatingVoiceButton
        onClick={() => setIsVoiceAssistantModalOpen(true)}
        isOpen={isVoiceAssistantModalOpen || activeTab === 'voice_assistant'}
      />

      {/* Footer */}
      <Footer
        onOpenModulesDrawer={() => setIsModulesDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals and Drawers */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={location}
        onUseMyLocation={handleUseMyLocation}
        isGeoLoading={isGeoLoading}
      />

      <PlatformModulesDrawer
        isOpen={isModulesDrawerOpen}
        onClose={() => setIsModulesDrawerOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tempUnit={tempUnit}
        onSetTempUnit={handleSetTempUnit}
        currentLocation={location}
        onApplyCustomCoords={handleApplyCustomCoords}
        onOpenLanguageSelector={() => setIsLanguageModalOpen(true)}
      />

      {/* Global Indian Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Global Multilingual Voice Assistant Modal Overlay */}
      {isVoiceAssistantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <VoiceFarmingAssistant
              currentWeather={weatherData?.current}
              dailyWeather={weatherData?.daily}
              historicalWeather={weatherData?.historical}
              plantHealthResult={latestPlantHealthResult}
              location={location}
              onClose={() => setIsVoiceAssistantModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
