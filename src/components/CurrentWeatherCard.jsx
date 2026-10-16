import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Clock,
  Droplets,
  Wind,
  CloudRain,
  Cloud,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Compass,
  ArrowUp,
  Radio,
  Sprout,
  Volume2,
  VolumeX
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  getWmoInfo,
  formatTemp,
  formatWind,
  formatRain,
  getWindCompass,
  calculateVpd,
  getVpdCategory
} from '../services/weatherUtils';
import speechService from '../services/speechService';
import { getLanguageByCode } from '../i18n/languages';

export default function CurrentWeatherCard({
  weatherData,
  tempUnit,
  onOpenSearch
}) {
  const { t, i18n } = useTranslation();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!weatherData || !weatherData.current) return null;

  const { current, location, dataSource, isDemo } = weatherData;
  const wmoInfo = getWmoInfo(current.weather_code);
  const windDirName = getWindCompass(current.wind_direction_10m);
  const vpd = calculateVpd(current.temperature_2m, current.relative_humidity_2m);
  const vpdCategory = getVpdCategory(vpd);

  const currentLang = i18n.language || 'en';
  const currentLangMeta = getLanguageByCode(currentLang);

  // Format observation time
  const observationTime = current.time
    ? new Date(current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'Live';

  // Format sunrise / sunset
  const formatSunTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString.split('T')[1] || isoString;
    }
  };

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
      return;
    }

    const tempStr = Math.round(current.temperature_2m);
    const humidityStr = current.relative_humidity_2m;
    const windStr = Math.round(current.wind_speed_10m);

    let summaryText = '';
    if (currentLang === 'te') {
      summaryText = `${location.name} లో ప్రస్తుత ఉష్ణోగ్రత ${tempStr} డిగ్రీల సెల్సియస్. గాలిలో తేమ ${humidityStr} శాతం, గాలి వేగం గంటకు ${windStr} కిలోమీటర్లు. వాతావరణం ${wmoInfo.label}.`;
    } else if (currentLang === 'hi') {
      summaryText = `${location.name} में वर्तमान तापमान ${tempStr} डिग्री सेल्सियस है। हवा में नमी ${humidityStr} प्रतिशत और हवा की गति ${windStr} किलोमीटर प्रति घंटा है। मौसम ${wmoInfo.label} है।`;
    } else if (currentLang === 'mr') {
      summaryText = `${location.name} येथे सध्याचे तापमान ${tempStr} अंश सेल्सिअस आहे. हवेतील आर्द्रता ${humidityStr} टक्के आणि वाऱ्याचा वेग ${windStr} किलोमीटर प्रति तास आहे.`;
    } else if (currentLang === 'ta') {
      summaryText = `${location.name} இல் தற்போதைய வெப்பநிலை ${tempStr} டிகிரி செல்சியஸ். ஈரப்பதம் ${humidityStr} சதவீதம், காற்றின் வேகம் மணிக்கு ${windStr} கிலோமீட்டர்.`;
    } else if (currentLang === 'kn') {
      summaryText = `${location.name} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${tempStr} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್. ಗಾಳಿಯ ತೇವಾಂಶ ${humidityStr} ಪ್ರತಿಶತ ಮತ್ತು ಗಾಳಿಯ ವೇಗ ಗಂಟೆಗೆ ${windStr} ಕಿಲೋಮೀಟರ್.`;
    } else if (currentLang === 'bn') {
      summaryText = `${location.name} এ বর্তমান তাপমাত্রা ${tempStr} ডিগ্রি সেলসিয়াস। বাতাসে আর্দ্রতা ${humidityStr} শতাংশ এবং বাতাসের গতিবেগ ঘণ্টায় ${windStr} কিলোমিটার।`;
    } else if (currentLang === 'pa') {
      summaryText = `${location.name} ਵਿੱਚ ਮੌਜੂਦਾ ਤਾਪਮਾਨ ${tempStr} ਡਿਗਰੀ ਸੈਲਸੀਅਸ ਹੈ। ਨਮੀ ${humidityStr} ਪ੍ਰਤੀਸ਼ਤ ਅਤੇ ਹਵਾ ਦੀ ਗਤੀ ${windStr} ਕਿਲੋਮੀਟਰ ਪ੍ਰਤੀ ਘੰਟਾ ਹੈ।`;
    } else if (currentLang === 'gu') {
      summaryText = `${location.name} માં વર્તમાન તાપમાન ${tempStr} ડિગ્રી સેલ્સિયસ છે. હવામાં ભેજ ${humidityStr} ટકા અને પવનની ગતિ ${windStr} કિમી પ્રતિ કલાક છે.`;
    } else if (currentLang === 'ur') {
      summaryText = `${location.name} میں موجودہ درجہ حرارت ${tempStr} ڈگری سینٹی گریڈ ہے۔ ہوا میں نمی ${humidityStr} فیصد اور ہوا کی رفتار ${windStr} کلومیٹر فی گھنٹہ ہے۔`;
    } else {
      summaryText = `Current weather in ${location.name}: Temperature is ${tempStr} degrees ${tempUnit === 'F' ? 'Fahrenheit' : 'Celsius'}, relative humidity is ${humidityStr} percent, and wind speed is ${windStr} kilometers per hour. Conditions: ${wmoInfo.label}.`;
    }

    setIsPlayingAudio(true);
    speechService.speak(summaryText, currentLangMeta, () => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/40 p-5 sm:p-7">
      {/* Decorative organic background aura */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />

      {/* Card Header: Location, Coordinates, Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-emerald-700/50">
        <div>
          <button
            onClick={onOpenSearch}
            className="group flex items-center space-x-2 text-left hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-emerald-200 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-100">
                  {location.name}
                </h1>
                {location.country_code && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/60 font-mono text-emerald-200">
                    {location.country_code}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-300/90 font-medium">
                {[location.admin2, location.admin1, location.country].filter(Boolean).join(', ')}
                {location.elevation ? ` • ${location.elevation}m ASL` : ''}
              </p>
            </div>
          </button>
        </div>

        {/* Observation Time & Audio Speaker Control */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Audio Speaker Button */}
          <button
            onClick={handleToggleVoice}
            title={isPlayingAudio ? t('weather.stopVoice', 'Stop Audio') : t('weather.listenVoice', 'Audio Summary')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all cursor-pointer font-bold ${
              isPlayingAudio
                ? 'bg-amber-400 text-emerald-950 animate-pulse shadow-md'
                : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-200 hover:text-white'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{t('weather.stopVoice', 'Stop Audio')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('weather.listenVoice', 'Audio Summary')}</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('app.published', 'Published')} {observationTime}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-100 border border-emerald-500/40 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{weatherData.provider || 'Open-Meteo & WMO Network'}</span>
          </div>
        </div>
      </div>

      {/* Main Hero Weather Metrics */}
      <div className="relative z-10 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Huge Temperature & Weather Icon */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
            <WeatherIcon
              iconName={wmoInfo.icon}
              className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-200 drop-shadow-md"
              animate={true}
            />
          </div>

          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white drop-shadow-sm">
                {formatTemp(current.temperature_2m, tempUnit)}
              </span>
              <div className="text-emerald-200 text-sm sm:text-base font-medium">
                <div>{t('weather.feelsLike', 'Feels like')} {formatTemp(current.apparent_temperature, tempUnit)}</div>
                <div className="text-xs text-emerald-300/80">
                  {current.is_day ? t('weather.daytimeObs', 'Daytime Observation') : t('weather.nighttimeObs', 'Nighttime Microclimate')}
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/40">
                {wmoInfo.label}
              </span>
              <span className="text-xs text-emerald-300">
                WMO Code {current.weather_code}
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-emerald-200/90 max-w-md italic">
              &ldquo;{wmoInfo.agriNotes}&rdquo;
            </p>
          </div>
        </div>

        {/* Right Column: Quick Agricultural Microclimate Badges */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Topsoil Temperature Estimate */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs">
              <Thermometer className="w-3.5 h-3.5" />
              <span>{t('weather.topsoilTemp', 'Topsoil Temp (0cm)')}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white mt-1">
              {current.soil_temperature_0cm !== null ? formatTemp(current.soil_temperature_0cm, tempUnit) : '--'}
            </p>
            <span className="text-[11px] text-emerald-200/80">{t('weather.seedGerminationZone', 'Seed germination zone')}</span>
          </div>

          {/* Vapor Pressure Deficit (VPD) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs">
              <Sprout className="w-3.5 h-3.5" />
              <span>{t('weather.vpdTranspiration', 'VPD Transpiration')}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white mt-1">
              {vpd !== null ? `${vpd} kPa` : '--'}
            </p>
            <span className="text-[11px] text-emerald-200/80 truncate block">
              {vpdCategory.level}
            </span>
          </div>

          {/* Sunrise */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs">
              <Sunrise className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('weather.sunrise', 'Sunrise')}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white mt-1">
              {formatSunTime(current.sunrise)}
            </p>
            <span className="text-[11px] text-emerald-200/80">{t('weather.solarOnset', 'Solar onset')}</span>
          </div>

          {/* Sunset */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs">
              <Sunset className="w-3.5 h-3.5 text-orange-300" />
              <span>{t('weather.sunset', 'Sunset')}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white mt-1">
              {formatSunTime(current.sunset)}
            </p>
            <span className="text-[11px] text-emerald-200/80">{t('weather.nightInversion', 'Night inversion')}</span>
          </div>
        </div>
      </div>

      {/* Bottom Quick Strip: Vital Conditions for Farm Operations */}
      <div className="relative z-10 pt-4 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-200">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px]">{t('weather.relativeHumidity', 'Relative Humidity')}</span>
            <span className="font-semibold text-white text-sm">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-200">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px]">{t('weather.windAndDirection', 'Wind & Direction')}</span>
            <span className="font-semibold text-white text-sm">
              {formatWind(current.wind_speed_10m)} • {windDirName}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-200">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px]">{t('weather.currentRainfall', 'Current Rainfall')}</span>
            <span className="font-semibold text-white text-sm">{formatRain(current.precipitation)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-200">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-emerald-300/80 block text-[11px]">{t('weather.cloudCover', 'Cloud Cover')}</span>
            <span className="font-semibold text-white text-sm">{current.cloud_cover}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
