import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Droplets,
  Wind,
  LineChart as ChartIcon,
  LayoutGrid,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import WeatherIcon from './WeatherIcon';
import {
  getWmoInfo,
  formatTemp,
  formatTempRaw,
  formatWind,
  formatHourTime
} from '../services/weatherUtils';

export default function HourlyForecastStrip({ hourly, tempUnit }) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'chart'

  if (!hourly || !hourly.time || hourly.time.length === 0) return null;

  // Format hourly dataset for Recharts
  const chartData = hourly.time.slice(0, 24).map((tVal, idx) => {
    const rawTemp = formatTempRaw(hourly.temperature_2m[idx], tempUnit);
    const rainProb = hourly.precipitation_probability[idx] || 0;
    const rainMm = hourly.precipitation[idx] || 0;
    const windKmh = hourly.wind_speed_10m[idx] || 0;
    const hourLabel = formatHourTime(tVal);

    return {
      time: hourLabel,
      fullTime: tVal,
      temperature: rawTemp,
      precipitationProb: rainProb,
      precipitationMm: rainMm,
      windSpeed: windKmh,
      weatherCode: hourly.weather_code[idx]
    };
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>{t('hourly.title', 'Next 24-48 Hours Forecast')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('hourly.subtitle', 'Hourly progression of thermal curve, precipitation risk, and canopy microclimate')}
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('hourly.cards', 'Cards')}</span>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChartIcon className="w-3.5 h-3.5" />
            <span>{t('hourly.trendChart', 'Trend Chart')}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Cards Horizontal Scroll Strip */}
      {viewMode === 'cards' && (
        <div className="relative">
          <div className="flex space-x-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x">
            {hourly.time.slice(0, 36).map((timeStr, idx) => {
              const code = hourly.weather_code[idx];
              const wmo = getWmoInfo(code);
              const temp = hourly.temperature_2m[idx];
              const precipProb = hourly.precipitation_probability[idx] || 0;
              const wind = hourly.wind_speed_10m[idx];
              const isNow = idx === 0;

              return (
                <div
                  key={timeStr}
                  className={`snap-start shrink-0 w-24 sm:w-28 p-3 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                    isNow
                      ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/60 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-emerald-200 hover:shadow-xs'
                  }`}
                >
                  {/* Time label */}
                  <div>
                    <span className={`text-xs font-semibold block ${isNow ? 'text-emerald-800' : 'text-slate-700'}`}>
                      {isNow ? t('hourly.now', 'Now') : formatHourTime(timeStr)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(timeStr).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  </div>

                  {/* Weather Icon */}
                  <div className="my-2.5 flex justify-center">
                    <WeatherIcon
                      iconName={wmo.icon}
                      className={`w-7 h-7 ${isNow ? 'text-emerald-700' : 'text-slate-600'}`}
                    />
                  </div>

                  {/* Temperature */}
                  <div className="text-base sm:text-lg font-bold text-slate-900">
                    {formatTemp(temp, tempUnit)}
                  </div>

                  {/* Rain Probability Badge */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-center space-x-1 text-[11px] text-blue-600 font-medium">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>{precipProb}%</span>
                  </div>

                  {/* Wind speed */}
                  <div className="mt-1 flex items-center justify-center space-x-1 text-[10px] text-slate-500">
                    <Wind className="w-2.5 h-2.5" />
                    <span>{Math.round(wind)}kph</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-400 text-right mt-1.5 flex items-center justify-end space-x-1">
            <span>{t('hourly.scrollHint', 'Scroll horizontally for 36-hour outlook')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Mode 2: Hourly Temperature & Precipitation Chart */}
      {viewMode === 'chart' && (
        <div className="space-y-4">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="temp"
                  stroke="#10b981"
                  fontSize={11}
                  tickLine={false}
                  unit={`°${tempUnit}`}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <YAxis
                  yAxisId="rain"
                  orientation="right"
                  stroke="#3b82f6"
                  fontSize={11}
                  tickLine={false}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const wmo = getWmoInfo(data.weatherCode);
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-200">{data.time} ({wmo.label})</p>
                          <p className="text-emerald-400 font-semibold">
                            Temperature: {data.temperature}°{tempUnit}
                          </p>
                          <p className="text-blue-400 font-semibold">
                            Precipitation Probability: {data.precipitationProb}%
                          </p>
                          <p className="text-slate-300">
                            Wind Speed: {data.windSpeed} km/h
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Precipitation Bars */}
                <Bar
                  yAxisId="rain"
                  dataKey="precipitationProb"
                  fill="#93c5fd"
                  radius={[4, 4, 0, 0]}
                  name="Rain Probability (%)"
                  opacity={0.7}
                />
                {/* Temperature Curve */}
                <Area
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                  name={`Temperature (°${tempUnit})`}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>{t('hourly.tempCurve', 'Temperature Curve')} (°{tempUnit})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-blue-300" />
              <span>{t('hourly.rainRisk', 'Precipitation Risk (%)')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
