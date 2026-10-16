import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Coins,
  Calculator,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CheckCircle2,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { CROPS_DATABASE } from '../../services/cropPlanningService';
import { calculateProfitabilityScenarios, getCultivationCostBreakdown } from '../../services/cultivationCostService';

export default function CultivationCostCalculator({
  selectedCropId = 'wheat',
  landAreaAcres = 2.0,
  onCropChange,
  farmerState = 'Punjab'
}) {
  const { t } = useTranslation();

  const [activeCropId, setActiveCropId] = useState(selectedCropId);
  const [acres, setAcres] = useState(landAreaAcres);
  const [customOverrides, setCustomOverrides] = useState({});
  const [selectedYieldId, setSelectedYieldId] = useState('avg');
  const [selectedPriceId, setSelectedPriceId] = useState('modal');

  const handleCropSelect = (newCropId) => {
    setActiveCropId(newCropId);
    setCustomOverrides({}); // reset overrides on crop switch
    if (onCropChange) onCropChange(newCropId);
  };

  const handleCostHeadChange = (headId, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCustomOverrides(prev => ({
      ...prev,
      [headId]: num
    }));
  };

  const handleResetToBenchmarks = () => {
    setCustomOverrides({});
  };

  const data = calculateProfitabilityScenarios(activeCropId, acres, customOverrides);
  const { crop, costBreakdown, totalFarmExpenditure, yieldScenarios, priceScenarios, matrix, baseScenario, breakEvenPricePerQuintal, mspPerQuintal, mspMarketingSeason, mspMarginPerQuintal, mspStatus, riskFactors } = data;

  // Selected scenario in 3x3 matrix
  const currentScenario = matrix.find(m => m.yieldId === selectedYieldId && m.priceId === selectedPriceId) || baseScenario;

  return (
    <div className="space-y-6">
      
      {/* Top Crop Selection & Land Area Ribbon */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {t('cropPlanning.costCalculatorTitle', 'Cultivation Cost, Yield Scenarios & Net Profit Engine')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('cropPlanning.calculatorSubtitle', 'CACP benchmark norms with editable inputs and 3x3 market scenario matrix')}
            </p>
          </div>
        </div>

        {/* Crop Selector Dropdown & Area Input */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Crop:</span>
            <select
              value={activeCropId}
              onChange={(e) => handleCropSelect(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-black text-slate-800 bg-slate-50 cursor-pointer"
            >
              {CROPS_DATABASE.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.season.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Land Area:</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0.25"
                max="500"
                step="0.25"
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
                className="w-20 px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-black text-center text-slate-800 bg-slate-50"
              />
              <span className="text-xs font-bold text-slate-600">Acres</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section: Itemized Cost Sheet (Left) + Scenario Matrix & Profit (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ITEMIZED EXPENDITURE BREAKDOWN (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Itemized Cost of Cultivation
              </h3>
              <p className="text-[11px] text-slate-500">
                Tap any value to edit with local market rates
              </p>
            </div>
            {costBreakdown.isCustomized && (
              <button
                onClick={handleResetToBenchmarks}
                className="flex items-center space-x-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Norms</span>
              </button>
            )}
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {costBreakdown.heads.map((head) => (
              <div
                key={head.id}
                className={`p-3 rounded-2xl border transition-all ${
                  head.isCustom
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="pr-2">
                    <span className="font-bold text-slate-800 block text-xs">{head.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {head.isCustom ? 'Custom Farmer Rate' : 'CACP Official Benchmark'}
                    </span>
                  </div>

                  {head.id !== 'contingency' ? (
                    <div className="relative shrink-0">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={head.cost}
                        onChange={(e) => handleCostHeadChange(head.id, e.target.value)}
                        className="w-24 pl-6 pr-2 py-1 rounded-xl border border-slate-300 text-xs font-black text-right text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-xs text-slate-700">
                      ₹{head.cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Cost Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Cost per Acre:</span>
              <span className="font-mono font-bold text-sm text-white">₹{costBreakdown.totalCostPerAcre.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-700/80 pt-2">
              <span className="font-bold text-emerald-300">Total Farm Outlay ({acres} Acres):</span>
              <span className="font-mono font-black text-lg text-emerald-400">₹{totalFarmExpenditure.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3x3 SCENARIOS, NET RETURN & MSP (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Profit / Net Return Showcase Card */}
          <div className={`p-6 rounded-3xl border ${
            currentScenario.isProfitable
              ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white border-emerald-800'
              : 'bg-gradient-to-br from-rose-950 via-rose-900 to-red-950 text-white border-rose-800'
          } shadow-lg space-y-5`}>
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/20">
                {currentScenario.isProfitable ? 'Projected Net Gain' : 'Deficit Warning'}
              </span>

              <div className="flex items-center space-x-1.5 text-xs text-slate-200 bg-white/10 px-3 py-1 rounded-full">
                <span>Scenario:</span>
                <strong className="text-white capitalize">{selectedYieldId} Yield × {selectedPriceId} Price</strong>
              </div>
            </div>

            {/* Huge Net Return Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-emerald-200 block">Total Net Return ({acres} Acres):</span>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
                  {currentScenario.isProfitable ? '+' : ''}₹{currentScenario.netReturn.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Net Return / Acre: <strong>{currentScenario.isProfitable ? '+' : ''}₹{currentScenario.netReturnPerAcre.toLocaleString()}</strong>
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Estimated Gross Revenue:</span>
                  <span className="font-mono font-bold">₹{currentScenario.grossRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Cultivation Cost:</span>
                  <span className="font-mono font-bold text-amber-200">- ₹{totalFarmExpenditure.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-1 font-bold">
                  <span>Return on Investment (ROI):</span>
                  <span className={`font-mono ${currentScenario.roiPercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {currentScenario.roiPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Break-even & MSP Safeguard Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-white/15">
              <div className="bg-black/25 rounded-xl p-3 space-y-0.5">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Break-Even Selling Price</span>
                <p className="font-mono font-black text-sm text-amber-300">
                  ₹{breakEvenPricePerQuintal.toLocaleString()} / Quintal
                </p>
                <p className="text-[10px] text-slate-300">Minimum price to recover all costs at average yield</p>
              </div>

              {mspPerQuintal ? (
                <div className="bg-black/25 rounded-xl p-3 space-y-0.5">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">CCEA Minimum Support Price (MSP)</span>
                  <p className="font-mono font-black text-sm text-emerald-300">
                    ₹{mspPerQuintal.toLocaleString()} / Quintal
                  </p>
                  <p className="text-[10px] text-slate-300">{mspMarketingSeason}</p>
                </div>
              ) : (
                <div className="bg-black/25 rounded-xl p-3 space-y-0.5">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Price Mechanism</span>
                  <p className="font-mono font-black text-sm text-slate-200">Market-Determined</p>
                  <p className="text-[10px] text-slate-300">Horticultural / Perishable Commodity</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive 3x3 Scenario Matrix Selector */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>3x3 Sensitivity Matrix: Explore What-If Scenarios</span>
            </h3>

            {/* Scenario Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Yield Scenario</th>
                    <th className="py-2.5 px-3">Price Scenario</th>
                    <th className="py-2.5 px-3 text-right">Production</th>
                    <th className="py-2.5 px-3 text-right">Selling Price</th>
                    <th className="py-2.5 px-3 text-right">Net Return ({acres} A)</th>
                    <th className="py-2.5 px-3 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrix.map((row, idx) => {
                    const isSelected = row.yieldId === selectedYieldId && row.priceId === selectedPriceId;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSelectedYieldId(row.yieldId);
                          setSelectedPriceId(row.priceId);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/90 font-bold text-slate-900 ring-1 ring-emerald-400'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold capitalize">{row.yieldId} ({row.yieldPerAcre} q/A)</td>
                        <td className="py-2 px-3 capitalize">{row.priceId}</td>
                        <td className="py-2 px-3 text-right font-mono">{row.totalYield} q</td>
                        <td className="py-2 px-3 text-right font-mono">₹{row.pricePerQuintal}</td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${row.isProfitable ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {row.isProfitable ? '+' : ''}₹{row.netReturn.toLocaleString()}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${row.roiPercent >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {row.roiPercent}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic">
              Click any row in the sensitivity table to inspect that scenario in the main profit card above.
            </p>
          </div>

          {/* Risk Factors & Transparency Notice */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-3">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Key Agronomic & Financial Risk Factors</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-amber-950">
              {riskFactors.map((rf, i) => (
                <div key={i} className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 space-y-0.5">
                  <span className="font-bold text-amber-900 block">{rf.name}:</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{rf.impact}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-amber-100/50 text-[10px] text-amber-900 leading-relaxed">
              <strong>Non-Guaranteed Estimate Disclaimer:</strong> Agricultural revenues depend on actual weather, pest incidence, soil moisture, and real-time mandi arrivals. AgriSense estimates provide directional decision support and do not guarantee profits.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
