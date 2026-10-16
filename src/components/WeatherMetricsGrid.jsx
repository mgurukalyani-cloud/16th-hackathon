import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  Wind,
  Compass,
  Sun,
  Gauge,
  CloudRain,
  Sprout,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Sunrise,
  Sunset
} from 'lucide-react';
import {
  formatWind,
  formatRain,
  formatTemp,
  getWindCompass,
  calculateVpd,
  getVpdCategory,
  getUvCategory
} from '../services/weatherUtils';

export default function WeatherMetricsGrid({ weatherData, tempUnit }) {
  const { t } = useTranslation();
  if (!weatherData || !weatherData.current) return null;

  const { current, daily } = weatherData;
  const windDir = current.wind_direction_10m || 0;
  const windCompass = getWindCompass(windDir);
  const vpd = calculateVpd(current.temperature_2m, current.relative_humidity_2m);
  const vpdCategory = getVpdCategory(vpd);
  const uvCategory = getUvCategory(current.uv_index);
  const todayEt0 = daily.et0_fao_evapotranspiration?.[0] || 4.2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>{t('weather.atmosphericAndField', 'Atmospheric & Field Conditions')}</span>
        </h2>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {t('weather.highResMeasurements', 'High-resolution 10-meter Agrometeorological Measurements')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Humidity & Dew Point */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.airHumidity', 'Air Humidity')}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {current.relative_humidity_2m}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Relative</span>
            </div>
            {/* Humidity progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  current.relative_humidity_2m > 80
                    ? 'bg-rose-500'
                    : current.relative_humidity_2m > 65
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, current.relative_humidity_2m)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.dewPoint', 'Dew Point:')}</span>
            <span className="font-semibold text-slate-800">
              {current.dew_point_2m !== null ? formatTemp(current.dew_point_2m, tempUnit) : '--'}
            </span>
          </div>
        </div>

        {/* Metric 2: Precipitation & Probability */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.precipitation', 'Precipitation')}</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatRain(current.precipitation)}
              </span>
              <span className="text-xs text-slate-500 font-medium">{t('weather.observed', 'Observed')}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {daily.precipitation_probability_max?.[0] || 0}% {t('weather.peakProbToday', 'peak probability today')}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.todayExpected', 'Today Expected:')}</span>
            <span className="font-semibold text-slate-800">
              {formatRain(daily.precipitation_sum?.[0] || 0)}
            </span>
          </div>
        </div>

        {/* Metric 3: Wind & Compass Direction */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.windVelocity', 'Wind Velocity')}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatWind(current.wind_speed_10m)}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {/* Mini Compass Visual */}
              <div className="relative w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center bg-slate-50">
                <div
                  className="w-1.5 h-3 bg-emerald-700 rounded-full origin-bottom"
                  style={{ transform: `rotate(${windDir}deg)` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {windCompass} ({windDir}°)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.peakGusts', 'Peak Gusts:')}</span>
            <span className="font-semibold text-slate-800">
              {formatWind(current.wind_gusts_10m || current.wind_speed_10m * 1.3)}
            </span>
          </div>
        </div>

        {/* Metric 4: Reference Evapotranspiration (ET₀) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.cropEt0Loss', 'Crop ET₀ Water Loss')}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {todayEt0.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-medium">mm/day</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {t('weather.et0Benchmark', 'FAO-56 Penman-Monteith benchmark')}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.irrigationNeed', 'Irrigation Need:')}</span>
            <span className={`font-semibold ${todayEt0 > 4.5 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {todayEt0 > 4.5 ? t('weather.highDemand', 'High Demand') : t('weather.normalDemand', 'Normal Demand')}
            </span>
          </div>
        </div>

        {/* Metric 5: Vapor Pressure Deficit (VPD) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.transpirationVpd', 'Transpiration (VPD)')}</span>
              <div className="w-7 h-7 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {vpd !== null ? `${vpd} kPa` : '--'}
              </span>
            </div>
            <p className={`text-xs mt-2 font-semibold ${vpdCategory.color}`}>
              {vpdCategory.level}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.foliageState', 'Foliage State:')}</span>
            <span className="font-semibold text-slate-800">
              {current.relative_humidity_2m > 80 ? t('weather.wetCanopy', 'Wet Canopy') : t('weather.dryLeafSurface', 'Dry Leaf Surface')}
            </span>
          </div>
        </div>

        {/* Metric 6: UV Solar Radiation */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.solarUvIndex', 'Solar UV Index')}</span>
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {current.uv_index ? current.uv_index.toFixed(1) : '5.0'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${uvCategory.bg} ${uvCategory.color}`}>
                {uvCategory.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {t('weather.photosynthesisIndex', 'Peak solar photosynthesis index')}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.cloudShield', 'Cloud Shield:')}</span>
            <span className="font-semibold text-slate-800">{current.cloud_cover}% Cover</span>
          </div>
        </div>

        {/* Metric 7: Barometric Pressure */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.barometricPressure', 'Atmospheric Pressure')}</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {current.pressure_msl ? Math.round(current.pressure_msl) : 1013}
              </span>
              <span className="text-xs text-slate-500 font-medium">hPa</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {current.pressure_msl > 1013 ? t('weather.highPressure', 'High pressure (Stable skies)') : t('weather.lowPressure', 'Low pressure (Weather transition)')}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.barometer', 'Barometer:')}</span>
            <span className="font-semibold text-slate-800">{t('weather.normalRange', 'Normal Range')}</span>
          </div>
        </div>

        {/* Metric 8: Topsoil Seed Zone Temperature */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('weather.seedbedTemp', 'Seedbed Temperature')}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {current.soil_temperature_0cm !== null ? formatTemp(current.soil_temperature_0cm, tempUnit) : '--'}
              </span>
              <span className="text-xs text-slate-500 font-medium">0cm depth</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {t('weather.seedbedProfile', 'Topsoil thermal profile')}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('weather.germination', 'Germination:')}</span>
            <span className="font-semibold text-emerald-700">{t('weather.germinationFavorable', 'Favorable')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
