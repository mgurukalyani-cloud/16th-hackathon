import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Droplets,
  Thermometer,
  Wind,
  ShieldAlert,
  Tractor,
  AlertTriangle,
  CheckCircle2,
  Info,
  CalendarCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { generateFarmAdvisories } from '../services/agroAdvisor';

export default function FarmWeatherAdvisor({ weatherData, onOpenModulesDrawer }) {
  const { t } = useTranslation();
  if (!weatherData || !weatherData.current || !weatherData.daily) return null;

  const advisories = generateFarmAdvisories(
    weatherData.current,
    weatherData.daily,
    weatherData.hourly
  );

  if (!advisories) return null;

  const {
    irrigation,
    thermalStress,
    spraying,
    diseaseRisk,
    trafficability,
    agriSuitabilityScore
  } = advisories;

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', label: t('advisor.primeConditions', 'Prime Fieldwork Conditions') };
    if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', label: t('advisor.moderateWindow', 'Moderate Operations Window') };
    return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800', label: t('advisor.challengingHazards', 'Challenging Weather Hazards') };
  };

  const scoreMeta = getScoreColor(agriSuitabilityScore);

  return (
    <section className="space-y-5" id="farm-advisor">
      {/* Advisor Header & Overall Score */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/20 border border-emerald-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center text-emerald-200">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {t('advisor.title', 'Farm Weather Advisor')}
              </h2>
            </div>
            <p className="text-sm text-emerald-200/90 leading-relaxed">
              {t('advisor.subtitle', 'Agro-meteorological decision engine analyzing precipitation forecasts, FAO-56 evapotranspiration (ET₀), canopy humidity, and wind dynamics to optimize daily field operations.')}
            </p>
          </div>

          {/* Activity Score Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex items-center space-x-5 min-w-[280px]">
            <div className="relative flex items-center justify-center">
              {/* Circular gauge indicator */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {agriSuitabilityScore}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
                {t('advisor.activityIndex', 'Field Activity Index')}
              </span>
              <p className="text-base font-bold text-white mt-0.5">
                {scoreMeta.label}
              </p>
              <span className="text-xs text-emerald-200/80">
                {t('advisor.outOf100', 'Out of 100 benchmark score')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Irrigation Water Balance Advisor */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('advisor.irrigationGuidance', 'Irrigation Guidance')}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                irrigation.status === 'POSTPONE'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : irrigation.status === 'REDUCE'
                  ? 'bg-teal-100 text-teal-800 border border-teal-200'
                  : irrigation.status === 'IRRIGATE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {irrigation.badge}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 mb-2">
              {irrigation.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {irrigation.reason}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">{t('advisor.recommendedAction', 'Recommended Action:')}</span>
              <p>{irrigation.action}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('advisor.waterBalance', 'Water Balance:')}</span>
            <span className="font-semibold text-slate-800">{irrigation.waterBalance} ({irrigation.metric})</span>
          </div>
        </div>

        {/* 2. Crop Thermal Stress & Frost Hazard */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('advisor.cropThermalLoad', 'Crop Thermal Load')}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                thermalStress.riskLevel === 'Severe'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : thermalStress.riskLevel === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {thermalStress.badge}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 mb-2">
              {thermalStress.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {thermalStress.detail}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">{t('advisor.cropProtection', 'Crop Protection Strategy:')}</span>
              <p>{thermalStress.recommendation}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('advisor.hazardLevel', 'Thermal Hazard Level:')}</span>
            <span className={`font-semibold ${
              thermalStress.riskLevel === 'Severe' ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {thermalStress.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* 3. Agrochemical Spraying Feasibility Window */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('advisor.sprayingWindow', 'Spraying Window')}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                spraying.status === 'OPTIMAL'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {spraying.badge}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 mb-2">
              {spraying.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {spraying.detail}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">{t('advisor.applicationProtocol', 'Application Protocol:')}</span>
              <p>{spraying.recommendation}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('advisor.driftHazard', 'Drift Hazard:')}</span>
            <span className="font-semibold text-slate-800">{spraying.driftRisk} Drift Risk</span>
          </div>
        </div>

        {/* 4. Fungal & Foliar Disease Threat (Mills & Blight Models) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('advisor.fungalPathogen', 'Fungal Pathogen Threat')}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                diseaseRisk.status === 'HIGH'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : diseaseRisk.status === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {diseaseRisk.badge}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 mb-2">
              {diseaseRisk.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {diseaseRisk.detail}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">{t('advisor.countermeasure', 'Agronomic Countermeasure:')}</span>
              <p>{diseaseRisk.recommendation}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('advisor.infectionIndex', 'Infection Pressure Index:')}</span>
            <span className="font-semibold text-slate-800">{diseaseRisk.riskScore}/100</span>
          </div>
        </div>

        {/* 5. Field Trafficability & Soil Workability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Tractor className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('advisor.soilTrafficability', 'Soil Trafficability')}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                trafficability.status === 'GOOD'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {trafficability.badge}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 mb-2">
              {trafficability.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {trafficability.detail}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">{t('advisor.heavyEquipment', 'Heavy Equipment Guidance:')}</span>
              <p>{trafficability.recommendation}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('advisor.fieldAccess', 'Field Access Status:')}</span>
            <span className="font-semibold text-slate-800">{trafficability.accessLevel}</span>
          </div>
        </div>

        {/* 6. Smart Agriculture Platform Expansion Banner */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100/70 rounded-2xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{t('advisor.nextPhaseEsp32', 'Next Phase: ESP32 IoT Soil Moisture Probes')}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              {t('advisor.esp32Desc', 'This weather advisor forms Module 1 of AgriSense. Soon, readings from physical ESP32 soil moisture, soil temperature, and NPK capacitive probes will fuse with this weather data for autonomous precision irrigation.')}
            </p>
          </div>

          <button
            onClick={onOpenModulesDrawer}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>{t('advisor.exploreArchitecture', 'Explore Platform Architecture')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Section 9 Agronomic Advisory Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('advisor.generalNotice', 'General Agronomic Recommendation Notice: These advisories are calculated using atmospheric models, WMO guidelines, and FAO-56 Penman-Monteith evapotranspiration formulas. Always inspect physical soil conditions and verify with local agronomists or physical in-situ sensor probes before initiating heavy irrigation or spraying applications.')}
        </p>
      </div>
    </section>
  );
}
