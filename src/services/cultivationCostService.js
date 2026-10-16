/**
 * AgriSense Cultivation Cost, Yield Scenarios & Profitability Engine
 * 
 * Compliant with CACP (Commission for Agricultural Costs & Prices) A2+FL Cost Norms
 * and State Agricultural University Package of Practices.
 */

import { CROPS_DATABASE } from './cropPlanningService';
import { getMandiPriceForCrop } from './mandiPriceService';

/**
 * Standard CACP / SAU Cost of Cultivation Benchmarks (per acre in ₹)
 */
export const DEFAULT_CULTIVATION_HEADS_BY_CROP = {
  wheat: {
    landPreparation: 3200,      // 2 disc ploughings + 1 rotavator
    seeds: 2200,                // 40 kg certified seed @ ₹55/kg
    fertilizers: 3800,          // Urea (₹650) + DAP (₹1,350) + MOP + Zinc + FYM
    irrigation: 2400,           // 4-5 tube-well irrigations (electricity/diesel)
    labour: 2600,               // Sowing, weeding, channel clearing
    plantProtection: 1500,      // Herbicide (Clodinafop) + rust fungicide
    harvestingMachinery: 2200,  // Combine harvester rental with straw reaper
    transportMarketing: 600     // Gunny bags + mandi transport
  },
  mustard: {
    landPreparation: 2800,
    seeds: 950,                 // 1.5 kg certified seed
    fertilizers: 3100,          // Urea + SSP (Sulphur rich) + MOP
    irrigation: 1200,           // 2 light irrigations
    labour: 2200,               // Thinning, hoeing, weeding
    plantProtection: 1400,      // Aphid & white rust control
    harvestingMachinery: 1400,  // Manual harvesting + threshing
    transportMarketing: 450
  },
  gram_chickpea: {
    landPreparation: 2800,
    seeds: 2600,                // 30 kg seed @ ₹85/kg + Rhizobium
    fertilizers: 2400,          // DAP + minimal starter N
    irrigation: 1200,           // 1-2 irrigations
    labour: 2000,               // Weeding
    plantProtection: 1600,      // Pheromone traps + Pod borer spray
    harvestingMachinery: 1400,
    transportMarketing: 500
  },
  cotton: {
    landPreparation: 3600,
    seeds: 3600,                // 2 packets Bt seed @ ₹850 + refuge
    fertilizers: 5800,          // Heavy N-P-K + Magnesium Sulphate
    irrigation: 3200,           // 5-6 irrigations
    labour: 6500,               // 3-4 manual pickings (highest labour head)
    plantProtection: 3800,      // Pink bollworm & sucking pest sprays
    harvestingMachinery: 0,     // Cotton picked manually
    transportMarketing: 1500
  },
  paddy_rice: {
    landPreparation: 4200,      // Puddling & harrowing
    seeds: 1800,                // Certified nursery seed
    fertilizers: 4800,          // Urea + DAP + MOP + Zinc
    irrigation: 4500,           // Heavy pumping hours for standing water
    labour: 4800,               // Nursery uprooting & transplanting
    plantProtection: 2200,      // Stem borer & blast control
    harvestingMachinery: 2200,  // Combine harvester
    transportMarketing: 800
  },
  maize: {
    landPreparation: 2800,
    seeds: 2400,                // Single-cross hybrid seed
    fertilizers: 4200,          // N-P-K balanced split
    irrigation: 2200,           // 3-4 critical irrigations
    labour: 2500,               // Manual weeding & thinning
    plantProtection: 1800,      // Fall armyworm whorl application
    harvestingMachinery: 1600,  // Sheller / thresher
    transportMarketing: 600
  },
  soybean: {
    landPreparation: 2800,
    seeds: 3200,                // 25 kg seed
    fertilizers: 3200,          // DAP + Gypsum
    irrigation: 1200,           // Mostly rainfed / 1 supplemental
    labour: 2400,               // Intercultural weeding
    plantProtection: 1500,      // Girdle beetle & rust spray
    harvestingMachinery: 1200,
    transportMarketing: 500
  },
  tomato: {
    landPreparation: 4500,
    seeds: 4200,                // Hybrid F1 seed
    fertilizers: 8500,          // High fertilizer & fertigation
    irrigation: 4200,           // Regular drip irrigation
    labour: 12000,              // Staking, pruning, 10-12 multiple pickings
    plantProtection: 6500,      // Intensive ToLCV, borer and blight IPM
    harvestingMachinery: 0,
    transportMarketing: 6100    // Plastic crates & daily mandi transport
  },
  potato: {
    landPreparation: 4500,
    seeds: 18000,               // Seed tubers (12 quintals @ ₹1,500/q - largest cost head)
    fertilizers: 6500,          // Heavy potash & phosphorus
    irrigation: 3200,           // Furrow / sprinkler
    labour: 4500,               // Planting & earthing up
    plantProtection: 2800,      // Late blight sprays
    harvestingMachinery: 2500,  // Tractor potato digger
    transportMarketing: 1800
  },
  onion: {
    landPreparation: 3800,
    seeds: 3500,                // Quality seed
    fertilizers: 6200,          // N-P-K + Sulphur
    irrigation: 3400,           // Light frequent irrigations
    labour: 9800,               // Transplanting, weeding & hand digging
    plantProtection: 3200,      // Thrips & purple blotch control
    harvestingMachinery: 0,
    transportMarketing: 3100    // Curing, grading & bag transport
  }
};

/**
 * Returns itemized cultivation heads for a given crop
 */
export function getCultivationCostBreakdown(cropId, customOverrides = {}) {
  const defaults = DEFAULT_CULTIVATION_HEADS_BY_CROP[cropId] || {
    landPreparation: 3000,
    seeds: 2000,
    fertilizers: 3500,
    irrigation: 2000,
    labour: 3500,
    plantProtection: 1800,
    harvestingMachinery: 1800,
    transportMarketing: 700
  };

  const heads = {
    landPreparation: customOverrides.landPreparation ?? defaults.landPreparation,
    seeds: customOverrides.seeds ?? defaults.seeds,
    fertilizers: customOverrides.fertilizers ?? defaults.fertilizers,
    irrigation: customOverrides.irrigation ?? defaults.irrigation,
    labour: customOverrides.labour ?? defaults.labour,
    plantProtection: customOverrides.plantProtection ?? defaults.plantProtection,
    harvestingMachinery: customOverrides.harvestingMachinery ?? defaults.harvestingMachinery,
    transportMarketing: customOverrides.transportMarketing ?? defaults.transportMarketing
  };

  const subtotal = Object.values(heads).reduce((sum, val) => sum + Number(val), 0);
  // Add 4% contingency & operational reserve
  const contingency = Math.round(subtotal * 0.04);
  const totalCostPerAcre = subtotal + contingency;

  return {
    heads: [
      { id: 'landPreparation', label: 'Land Preparation & Tillage', cost: heads.landPreparation, isCustom: customOverrides.landPreparation !== undefined, benchmark: defaults.landPreparation },
      { id: 'seeds', label: 'Seeds, Seed Treatment & Nursery', cost: heads.seeds, isCustom: customOverrides.seeds !== undefined, benchmark: defaults.seeds },
      { id: 'fertilizers', label: 'Chemical Fertilizers & FYM Organic Manure', cost: heads.fertilizers, isCustom: customOverrides.fertilizers !== undefined, benchmark: defaults.fertilizers },
      { id: 'irrigation', label: 'Irrigation Pumping, Diesel / Power & Canal Cess', cost: heads.irrigation, isCustom: customOverrides.irrigation !== undefined, benchmark: defaults.irrigation },
      { id: 'labour', label: 'Human Labour (Weeding, Interculture, Sowing)', cost: heads.labour, isCustom: customOverrides.labour !== undefined, benchmark: defaults.labour },
      { id: 'plantProtection', label: 'Plant Protection Chemicals (Herbicides, IPM Sprays)', cost: heads.plantProtection, isCustom: customOverrides.plantProtection !== undefined, benchmark: defaults.plantProtection },
      { id: 'harvestingMachinery', label: 'Machinery Rental, Combine Harvester & Thresher', cost: heads.harvestingMachinery, isCustom: customOverrides.harvestingMachinery !== undefined, benchmark: defaults.harvestingMachinery },
      { id: 'transportMarketing', label: 'Post-Harvest Bags, Loading & APMC Mandi Transport', cost: heads.transportMarketing, isCustom: customOverrides.transportMarketing !== undefined, benchmark: defaults.transportMarketing },
      { id: 'contingency', label: 'Operational Reserve & Miscellaneous Contingency (4%)', cost: contingency, isCustom: false, benchmark: contingency }
    ],
    subtotal,
    contingency,
    totalCostPerAcre,
    isCustomized: Object.keys(customOverrides).length > 0
  };
}

/**
 * Calculates complete 3x3 Scenario Matrix:
 * Yield (Low, Average, High) x Price (Low, Modal, High)
 */
export function calculateProfitabilityScenarios(cropId, landAreaAcres = 2.0, customCostOverrides = {}, customModalPrice = null) {
  const crop = CROPS_DATABASE.find(c => c.id === cropId) || CROPS_DATABASE[0];
  const mandiPriceData = getMandiPriceForCrop(cropId);
  const costBreakdown = getCultivationCostBreakdown(cropId, customCostOverrides);

  const costPerAcre = costBreakdown.totalCostPerAcre;
  const totalFarmExpenditure = Math.round(costPerAcre * landAreaAcres);

  // Yield Benchmarks (Quintals per Acre)
  const yields = crop.benchmarkYieldQuintalsPerAcre || { low: 15, avg: 20, high: 25 };
  
  // Price Benchmarks (₹ per Quintal)
  const baseModalPrice = customModalPrice || mandiPriceData.modalPrice;
  const minPrice = mandiPriceData.minPrice || Math.round(baseModalPrice * 0.9);
  const maxPrice = mandiPriceData.maxPrice || Math.round(baseModalPrice * 1.12);

  const yieldScenarios = [
    { id: 'low', label: 'Low Yield (Weather / Pest Stress)', yieldPerAcre: yields.low, totalYield: yields.low * landAreaAcres },
    { id: 'avg', label: 'Average Yield (Normal Season)', yieldPerAcre: yields.avg, totalYield: yields.avg * landAreaAcres },
    { id: 'high', label: 'High Yield (Favorable Microclimate)', yieldPerAcre: yields.high, totalYield: yields.high * landAreaAcres }
  ];

  const priceScenarios = [
    { id: 'low', label: 'Low Price (Harvest Peak Glut)', pricePerQuintal: minPrice },
    { id: 'modal', label: 'Modal Mandi Price (Current Expected)', pricePerQuintal: baseModalPrice },
    { id: 'high', label: 'High Price (Quality Premium / Lean Season)', pricePerQuintal: maxPrice }
  ];

  // 3x3 Scenario Matrix
  const matrix = [];
  yieldScenarios.forEach(y => {
    priceScenarios.forEach(p => {
      const grossRevenue = Math.round(y.totalYield * p.pricePerQuintal);
      const grossRevenuePerAcre = Math.round(y.yieldPerAcre * p.pricePerQuintal);
      const netReturn = grossRevenue - totalFarmExpenditure;
      const netReturnPerAcre = grossRevenuePerAcre - costPerAcre;
      const roiPercent = Math.round((netReturn / totalFarmExpenditure) * 100);

      matrix.push({
        yieldId: y.id,
        yieldLabel: y.label,
        yieldPerAcre: y.yieldPerAcre,
        totalYield: y.totalYield,
        priceId: p.id,
        priceLabel: p.label,
        pricePerQuintal: p.pricePerQuintal,
        grossRevenue,
        grossRevenuePerAcre,
        netReturn,
        netReturnPerAcre,
        roiPercent,
        isProfitable: netReturn > 0
      });
    });
  });

  // Break-even Selling Price (₹/quintal needed to cover total cost at average yield)
  const breakEvenPricePerQuintal = Math.round(costPerAcre / yields.avg);

  // Baseline Scenario (Average Yield x Modal Price)
  const baseScenario = matrix.find(m => m.yieldId === 'avg' && m.priceId === 'modal');

  // MSP Comparison & Margin
  let mspMarginPerQuintal = null;
  let mspStatus = 'NOT_APPLICABLE';
  if (crop.mspPerQuintal) {
    mspMarginPerQuintal = baseModalPrice - crop.mspPerQuintal;
    mspStatus = mspMarginPerQuintal >= 0 ? 'TRADING_ABOVE_MSP' : 'TRADING_BELOW_MSP';
  }

  // Key Financial & Agronomic Risk Factors
  const riskFactors = [
    { name: 'Weather / Rain Inconsistency', impact: 'Dry spells during flowering or untimely heavy rain at harvest can swing yield by ±20-30%.' },
    { name: 'Market Arrival Volatility', impact: 'Post-harvest mandi arrivals trigger sharp short-term price softening of 8-15%.' },
    { name: 'Pest Outbreak Risk', impact: 'Inadequate early IPM scouting can compromise marketable quality and downgrade produce from FAQ to distress grade.' },
    { name: 'Fertilizer & Diesel Input Inflation', impact: 'Variations in fuel and machine rental rates directly influence land preparation and transport costs.' }
  ];

  return {
    crop,
    landAreaAcres,
    costBreakdown,
    totalFarmExpenditure,
    yieldScenarios,
    priceScenarios,
    matrix,
    baseScenario,
    breakEvenPricePerQuintal,
    mspPerQuintal: crop.mspPerQuintal,
    mspMarketingSeason: crop.mspMarketingSeason,
    mspMarginPerQuintal,
    mspStatus,
    riskFactors
  };
}
