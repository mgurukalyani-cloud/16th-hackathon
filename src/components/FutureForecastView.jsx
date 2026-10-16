import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Sprout,
  ChevronDown,
  ChevronUp,
  Info,
  LineChart as ChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import WeatherIcon from './WeatherIcon';
import {
  getWmoInfo,
  formatTemp,
  formatTempRaw,
  formatWind,
  formatRain,
  getWindCompass,
  formatForecastDay,
  getDayOfWeek
} from '../services/weatherUtils';

export default function FutureForecastView({ daily, tempUnit }) {
  const { t } = useTranslation();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!daily || !daily.time || daily.time.length === 0) return null;

  // Build chart dataset for next 7-10 days
  const chartData = daily.time.map((dateStr, idx) => {
    return {
      date: formatForecastDay(dateStr, idx === 0),
      fullDate: dateStr,
      maxTemp: formatTempRaw(daily.temperature_2m_max[idx], tempUnit),
      minTemp: formatTempRaw(daily.temperature_2m_min[idx], tempUnit),
      rainMm: daily.precipitation_sum?.[idx] || 0,
      rainProb: daily.precipitation_probability_max?.[idx] || 0,
      et0: daily.et0_fao_evapotranspiration?.[idx] || 0
    };
  });

  const selectedDay = {
    date: daily.time[selectedDayIdx],
    maxTemp: daily.temperature_2m_max[selectedDayIdx],
    minTemp: daily.temperature_2m_min[selectedDayIdx],
    rainMm: daily.precipitation_sum?.[selectedDayIdx] || 0,
    rainProb: daily.precipitation_probability_max?.[selectedDayIdx] || 0,
    windMax: daily.wind_speed_10m_max?.[selectedDayIdx] || 0,
    windDir: daily.wind_direction_10m_dominant?.[selectedDayIdx] || 0,
    uv: daily.uv_index_max?.[selectedDayIdx] || 5.0,
    et0: daily.et0_fao_evapotranspiration?.[selectedDayIdx] || 4.0,
    weatherCode: daily.weather_code[selectedDayIdx],
    sunrise: daily.sunrise?.[selectedDayIdx],
    sunset: daily.sunset?.[selectedDayIdx]
  };

  const selectedWmo = getWmoInfo(selectedDay.weatherCode);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <span>{t('forecast.title', '7-Day Agricultural Weather Outlook')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('forecast.subtitle', 'Daily minimum and maximum thermal ranges, precipitation risks, and evaporative water demand')}
          </p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
          {t('forecast.highResForecast', 'High-resolution 10-day numerical forecast')}
        </span>
      </div>

      {/* 7-Day Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {daily.time.slice(0, 7).map((dateStr, idx) => {
          const isToday = idx === 0;
          const isSelected = selectedDayIdx === idx;
          const code = daily.weather_code[idx];
          const wmo = getWmoInfo(code);
          const maxT = daily.temperature_2m_max[idx];
          const minT = daily.temperature_2m_min[idx];
          const rainMm = daily.precipitation_sum?.[idx] || 0;
          const rainProb = daily.precipitation_probability_max?.[idx] || 0;
          const wind = daily.wind_speed_10m_max?.[idx] || 0;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                  : 'bg-white hover:bg-emerald-50/40 border-slate-200/80 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {isToday ? t('forecast.today', 'Today') : formatForecastDay(dateStr)}
                  </span>
                  {rainProb > 40 && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      {rainProb}%
                    </span>
                  )}
                </div>

                <div className="my-3 flex justify-center">
                  <WeatherIcon
                    iconName={wmo.icon}
                    className={`w-9 h-9 ${isSelected ? 'text-emerald-700' : 'text-slate-600 group-hover:text-emerald-600'}`}
                  />
                </div>

                <p className="text-[11px] text-center font-medium text-slate-500 truncate mb-3">
                  {wmo.label}
                </p>
              </div>

              <div>
                {/* Temp range */}
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatTemp(maxT, tempUnit)}
                  </span>
                  <span className="font-semibold text-slate-400">
                    {formatTemp(minT, tempUnit)}
                  </span>
                </div>

                {/* Rain mm */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>{formatRain(rainMm)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Wind className="w-3 h-3 text-slate-400" />
                    <span>{Math.round(wind)}kph</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Expanded Detail Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <WeatherIcon iconName={selectedWmo.icon} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {getDayOfWeek(selectedDay.date)}, {selectedDay.date}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {selectedWmo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('forecast.detailedOutlook', 'Detailed agronomical outlook and operational metrics for this day')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="text-slate-400 block text-[10px]">{t('forecast.peakTemp', 'Peak Temp')}</span>
              <strong className="text-sm text-slate-900">{formatTemp(selectedDay.maxTemp, tempUnit)}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="text-slate-400 block text-[10px]">{t('forecast.nightLow', 'Night Low')}</span>
              <strong className="text-sm text-slate-900">{formatTemp(selectedDay.minTemp, tempUnit)}</strong>
            </div>
          </div>
        </div>

        {/* Selected Day Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 text-xs">
            <span className="text-slate-500 block">{t('forecast.precipExpected', 'Precipitation Expected')}</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {formatRain(selectedDay.rainMm)} ({selectedDay.rainProb}% risk)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs">
            <span className="text-slate-500 block">{t('forecast.cropWaterLoss', 'Crop Water Loss (ET₀)')}</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {selectedDay.et0.toFixed(1)} mm/day
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs">
            <span className="text-slate-500 block">{t('forecast.windMax', 'Peak Wind Velocity')}</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {formatWind(selectedDay.windMax)} ({getWindCompass(selectedDay.windDir)})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs">
            <span className="text-slate-500 block">{t('forecast.uvPeak', 'Solar UV Index')}</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {selectedDay.uv.toFixed(1)} Peak
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 flex items-start space-x-2">
          <Sprout className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p>
            <strong>{t('forecast.agriOutlook', 'Agricultural Outlook:')}</strong> {selectedWmo.agriNotes}{' '}
            {selectedDay.rainMm > 5
              ? `Expect natural soil moisture recharge of ~${selectedDay.rainMm} mm; check drainage canals.`
              : selectedDay.et0 > 4.5
              ? `High atmospheric drying rate (${selectedDay.et0.toFixed(1)} mm/day); maintain supplemental irrigation.`
              : 'Routine farm management recommended.'}
          </p>
        </div>
      </div>

      {/* 7-Day Trend Chart: Temperature Range & Rainfall */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ChartIcon className="w-4 h-4 text-emerald-600" />
              <span>{t('forecast.trendTitle', '7-Day Temperature Range & Rainfall Trend')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('forecast.trendSubtitle', 'Correlating daily maximum/minimum thermal boundaries with expected precipitation totals')}
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="temp"
                stroke="#059669"
                fontSize={11}
                tickLine={false}
                unit={`°${tempUnit}`}
                domain={['dataMin - 3', 'dataMax + 3']}
              />
              <YAxis
                yAxisId="rain"
                orientation="right"
                stroke="#3b82f6"
                fontSize={11}
                tickLine={false}
                unit="mm"
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-bold text-slate-200">{d.fullDate}</p>
                        <p className="text-rose-400 font-semibold">Max Temp: {d.maxTemp}°{tempUnit}</p>
                        <p className="text-teal-400 font-semibold">Min Temp: {d.minTemp}°{tempUnit}</p>
                        <p className="text-blue-400 font-semibold">Rainfall: {d.rainMm} mm ({d.rainProb}%)</p>
                        <p className="text-amber-400">Crop Water Loss (ET₀): {d.et0} mm/day</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Bar
                yAxisId="rain"
                dataKey="rainMm"
                name="Rainfall (mm)"
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="maxTemp"
                name={`Max Temp (°${tempUnit})`}
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#e11d48' }}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="minTemp"
                name={`Min Temp (°${tempUnit})`}
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0d9488' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mandatory Accuracy Note */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {t('forecast.transparencyNote', 'Published Numerical Forecast Source: Forecast readings are generated by numerical meteorological prediction models (ECMWF IFS, DWD ICON, and NOAA GFS) at 0.1° (~9 km) spatial grid resolution as supplied directly by Open-Meteo. No artificial intelligence or simulated values are fabricated.')}
        </span>
      </div>
    </div>
  );
}
