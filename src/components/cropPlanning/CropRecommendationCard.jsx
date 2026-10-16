import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Droplets,
  Calendar,
  Coins,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Bug,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { getMandiPriceForCrop } from '../../services/mandiPriceService';

export default function CropRecommendationCard({
  rec,
  onSelectForCosting,
  onSelectForMandi,
  farmerState = 'Punjab'
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('varieties'); // 'varieties' | 'inputs' | 'irrigation' | 'pests'

  const { crop, scores, suitabilityTier, riskLevel, primaryJustification, baselineCostPerAcre } = rec;
  const mandiPrice = getMandiPriceForCrop(crop.id, farmerState);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'HIGHLY_RECOMMENDED':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          badge: 'bg-emerald-700 text-white',
          label: t('cropPlanning.tierHighlyRecommended', 'Highly Recommended')
        };
      case 'SUITABLE':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          badge: 'bg-blue-700 text-white',
          label: t('cropPlanning.tierSuitable', 'Suitable')
        };
      default:
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          badge: 'bg-amber-700 text-white',
          label: t('cropPlanning.tierMarginal', 'Marginal / Alternative')
        };
    }
  };

  const tierStyle = getTierBadge(suitabilityTier);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col">
      
      {/* Top Header & Suitability Banner */}
      <div className={`p-4 sm:p-5 border-b ${tierStyle.bg} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${tierStyle.badge}`}>
                {tierStyle.label}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {crop.category.toUpperCase()}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {crop.name}
            </h3>
            <p className="text-[11px] text-slate-500 italic">
              {crop.botanicalName}
            </p>
          </div>
        </div>

        {/* Suitability Composite Score Gauge */}
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Match Score</span>
            <span className="text-base font-black text-emerald-800 font-mono">{scores.composite}%</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Primary Agronomic Justification */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 text-xs text-slate-700 flex items-start space-x-2">
        <Compass className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Why this crop:</strong> {primaryJustification}
        </p>
      </div>

      {/* 4-Metric Key Agronomic Snapshot */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-100">
        
        {/* Sowing & Duration */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1 uppercase">
            <Calendar className="w-3 h-3 text-emerald-700" />
            <span>Sowing Window</span>
          </span>
          <p className="font-black text-slate-900">{crop.sowingMonths.slice(0, 2).join(' - ')}</p>
          <p className="text-[10px] text-slate-500">{crop.durationDays}</p>
        </div>

        {/* Water Requirement */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1 uppercase">
            <Droplets className="w-3 h-3 text-blue-600" />
            <span>Water Demand</span>
          </span>
          <p className="font-black text-slate-900">{crop.waterRequirementMm}</p>
          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
            crop.waterRequirementLevel === 'Low'
              ? 'bg-emerald-100 text-emerald-800'
              : crop.waterRequirementLevel === 'Medium'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {crop.waterRequirementLevel} Footprint
          </span>
        </div>

        {/* Estimated Cost / Acre */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1 uppercase">
            <Coins className="w-3 h-3 text-amber-600" />
            <span>Cost / Acre</span>
          </span>
          <p className="font-black text-slate-900 font-mono">₹{baselineCostPerAcre.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">CACP/ICAR norm</p>
        </div>

        {/* Modal Mandi Price & MSP */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1 uppercase">
            <TrendingUp className="w-3 h-3 text-emerald-700" />
            <span>Modal Mandi Price</span>
          </span>
          <p className="font-black text-emerald-800 font-mono">₹{mandiPrice.modalPrice.toLocaleString()}<span className="text-[10px] text-slate-500 font-normal">/q</span></p>
          {crop.mspPerQuintal && (
            <p className="text-[10px] text-slate-600">MSP: ₹{crop.mspPerQuintal}/q</p>
          )}
        </div>

      </div>

      {/* Expandable Agronomic Accordion Details */}
      {isExpanded && (
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 space-y-4 animate-in fade-in duration-200">
          
          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
            {[
              { id: 'varieties', label: 'University Varieties', icon: Award },
              { id: 'inputs', label: 'Seed & Fertilizers', icon: Layers },
              { id: 'irrigation', label: 'Critical Irrigation', icon: Droplets },
              { id: 'pests', label: 'Pests & IPM Management', icon: Bug }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: VERIFIED UNIVERSITY VARIETIES */}
          {activeTab === 'varieties' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {crop.verifiedVarieties.map((v, i) => (
                  <div key={i} className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{v.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {v.university}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{v.features}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SEED & FERTILIZER INPUTS */}
          {activeTab === 'inputs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="font-bold text-slate-900 block">Sowing & Seed Rate:</span>
                <p className="text-slate-700"><strong>Seed Quantity:</strong> {crop.seedRatePerAcreKg}</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">{crop.culturalAdvice}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="font-bold text-slate-900 block">Fertilizer Schedule (per acre):</span>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {Object.entries(crop.fertilizerDosage).map(([k, val]) => (
                    <li key={k} className="capitalize">
                      <strong>{k.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: CRITICAL IRRIGATION STAGES */}
          {activeTab === 'irrigation' && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Moisture Critical Growth Stages:</span>
              <div className="space-y-1.5">
                {crop.criticalIrrigationStages.map((stage, i) => (
                  <div key={i} className="flex items-start space-x-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed">{stage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PESTS, DISEASES & ALTERNATIVES */}
          {activeTab === 'pests' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                {crop.commonPestsAndDiseases.map((p, i) => (
                  <div key={i} className="p-3 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="font-bold text-rose-950 flex items-center space-x-1.5">
                      <Bug className="w-3.5 h-3.5 text-rose-600" />
                      <span>{p.name}</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{p.prevention}</p>
                  </div>
                ))}
              </div>

              {/* Alternative Resilient Crop Callout */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Low Water / High Risk Alternatives:</strong> If water or canal supply is delayed, consider: {crop.alternativeResilientCrops.map(c => c.replace('_', ' ')).join(', ')}.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Card Action Footer */}
      <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3 mt-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? t('common.hideDetails', 'Hide Technical Agronomic Details') : t('common.showDetails', 'View Varieties, Inputs & Irrigation Schedule')}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectForMandi(crop.id)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            <span>Mandi Prices</span>
          </button>

          <button
            onClick={() => onSelectForCosting(crop.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Cost & Profit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
