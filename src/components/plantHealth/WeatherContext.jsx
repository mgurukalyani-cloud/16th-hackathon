import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  Thermometer,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { evaluateWeatherDiseaseContext } from '../../services/plantDiseaseService';
import { formatRain, formatTemp } from '../../services/weatherUtils';

export default function WeatherContext({
  diseaseInfo,
  currentWeather,
  dailyWeather,
  location,
  tempUnit
}) {
  const { t } = useTranslation();
  if (!diseaseInfo || !currentWeather) return null;

  const weatherRisk = evaluateWeatherDiseaseContext(
    diseaseInfo,
    currentWeather,
    dailyWeather
  );

  const currentTemp = currentWeather.temperature_2m || 24;
  const currentHumidity = currentWeather.relative_humidity_2m || 60;
  const upcomingRain3d = dailyWeather?.precipitation_sum?.slice(0, 3).reduce((a, b) => a + (b || 0), 0) || 0;
  const recentRainSum = dailyWeather?.precipitation_sum?.[0] || 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            {t('plantHealth.environmentalCorrelation', 'Environmental Correlation')}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>{t('plantHealth.microclimateRisk', 'Farm Microclimate & Pathogen Risk Context')}</span>
          </h3>
        </div>

        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
          Farm: {location.name}
        </span>
      </div>

      {/* 3 Real Atmospheric Environmental Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Ambient Temperature */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold">Ambient Temperature</span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {formatTemp(currentTemp, tempUnit)}
          </p>
          <span className="text-[11px] text-slate-500">
            Pathogen window: {diseaseInfo.weatherRiskConditions?.optimalTempMin || 18}°C–{diseaseInfo.weatherRiskConditions?.optimalTempMax || 28}°C
          </span>
        </div>

        {/* Ambient Relative Humidity */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">Relative Humidity</span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {currentHumidity}%
          </p>
          <span className="text-[11px] text-slate-500">
            Fungal threshold: &gt;{diseaseInfo.weatherRiskConditions?.minHumidity || 75}%
          </span>
        </div>

        {/* Rainfall Outlook */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <CloudRain className="w-3.5 h-3.5 text-teal-500" />
            <span className="font-semibold">Next 72h Rain Forecast</span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {formatRain(upcomingRain3d)}
          </p>
          <span className="text-[11px] text-slate-500">
            {upcomingRain3d > 5 ? 'High foliar splash dispersion' : 'Dry canopy outlook'}
          </span>
        </div>
      </div>

      {/* Validated Agro-Meteorological Risk Assessment */}
      {weatherRisk && (
        <div className={`p-4 rounded-2xl border ${
          weatherRisk.riskLevel === 'EXTREME_SURGE'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : weatherRisk.riskLevel === 'ELEVATED'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        } space-y-2`}>
          <div className="flex items-center space-x-2">
            <ShieldAlert className={`w-4 h-4 ${
              weatherRisk.riskLevel === 'EXTREME_SURGE'
                ? 'text-rose-600'
                : weatherRisk.riskLevel === 'ELEVATED'
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`} />
            <strong className="text-xs sm:text-sm font-bold">
              {weatherRisk.headline}
            </strong>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {weatherRisk.explanation}
          </p>
        </div>
      )}

      {/* Mandatory Separation Notice distinguishing model prediction vs weather correlation */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1 leading-relaxed">
        <p className="font-semibold text-slate-700 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t('plantHealth.threeTierTitle', 'Three-Tier Diagnostic Separation Principle:')}</span>
        </p>
        <p>
          {t('plantHealth.threeTier1', '1. Image Model Prediction: Identifies visual foliar symptoms from the submitted photograph.')}
        </p>
        <p>
          {t('plantHealth.threeTier2', '2. Weather-Related Risk Assessment: Evaluates whether atmospheric moisture and temperatures accelerate disease development.')}
        </p>
        <p>
          {t('plantHealth.threeTier3', '3. General Recommendations: Agronomic best practices. Weather conditions alone never constitute proof of plant infection.')}
        </p>
      </div>
    </div>
  );
}
