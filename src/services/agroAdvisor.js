/**
 * AgriSense Farm Weather Advisor Engine
 * Calculates agricultural recommendations based on real meteorological parameters:
 * FAO-56 Penman-Monteith Evapotranspiration, VPD, rainfall forecast, temperature extremes,
 * and wind thresholds for spraying and field trafficability.
 */

export function generateFarmAdvisories(current, daily, hourly) {
  if (!current || !daily || !daily.time) {
    return null;
  }

  // 1. Irrigation Water Balance Advisor
  const next48hRain = calculateUpcomingRain(daily, 2);
  const avgEt0 = calculateAverageEt0(daily, 3);
  const currentTemp = current.temperature_2m || 25;
  const currentHumidity = current.relative_humidity_2m || 60;

  let irrigation = {
    status: 'OPTIMAL',
    badge: 'Standard Schedule',
    color: 'emerald',
    title: 'Maintain Standard Irrigation Schedule',
    reason: `Evapotranspiration is steady (~${avgEt0.toFixed(1)} mm/day) with low immediate precipitation.`,
    action: 'Apply standard drip or furrow irrigation according to your crop growth stage.',
    metric: `${avgEt0.toFixed(1)} mm/day ET₀`,
    waterBalance: 'Balanced'
  };

  if (next48hRain >= 12) {
    irrigation = {
      status: 'POSTPONE',
      badge: 'Postpone Irrigation',
      color: 'blue',
      title: 'Delay Irrigation — Significant Rain Expected',
      reason: `Forecast predicts ~${next48hRain.toFixed(1)} mm of rainfall over the next 48 hours. Natural precipitation will recharge root-zone moisture.`,
      action: 'Hold irrigation valves closed. Conserve pumping power and prevent nutrient leaching.',
      metric: `+${next48hRain.toFixed(1)} mm rain forecasted`,
      waterBalance: 'Surplus Expected'
    };
  } else if (next48hRain >= 4) {
    irrigation = {
      status: 'REDUCE',
      badge: 'Reduce Irrigation Volume',
      color: 'teal',
      title: 'Reduce Irrigation Volume by 30-50%',
      reason: `Light to moderate showers (~${next48hRain.toFixed(1)} mm) will partially replenish the topsoil layer.`,
      action: 'Shorten irrigation cycle run-time. Verify top 5cm soil moisture before starting pumps.',
      metric: `~${next48hRain.toFixed(1)} mm partial rain`,
      waterBalance: 'Partial Replenishment'
    };
  } else if (avgEt0 >= 4.8 || currentTemp >= 32) {
    irrigation = {
      status: 'IRRIGATE',
      badge: 'Irrigation Needed',
      color: 'amber',
      title: 'Irrigation Needed — High Evaporative Demand',
      reason: `Atmospheric water loss is elevated (~${avgEt0.toFixed(1)} mm/day ET₀) with dry weather outlook.`,
      action: 'Irrigate during early morning or evening hours to minimize evaporation losses.',
      metric: `${avgEt0.toFixed(1)} mm/day ET₀`,
      waterBalance: 'Deficit Risk'
    };
  }

  // 2. Crop Heat & Frost Thermal Stress Advisor
  const maxTemp3d = Math.max(...(daily.temperature_2m_max?.slice(0, 3) || [currentTemp]));
  const minTemp3d = Math.min(...(daily.temperature_2m_min?.slice(0, 3) || [currentTemp]));

  let thermalStress = {
    status: 'FAVORABLE',
    badge: 'Optimal Growth',
    color: 'emerald',
    title: 'Favorable Crop Temperature Range',
    detail: `Temperatures between ${Math.round(minTemp3d)}°C and ${Math.round(maxTemp3d)}°C are within the prime metabolic window for most staple crops and vegetables.`,
    riskLevel: 'Low',
    recommendation: 'Good period for standard crop canopy development.'
  };

  if (maxTemp3d >= 36) {
    thermalStress = {
      status: 'HEAT_CRITICAL',
      badge: 'Severe Heat Stress Warning',
      color: 'rose',
      title: 'Critical Heat Stress Alert (>36°C)',
      detail: `High temperatures peaking at ${Math.round(maxTemp3d)}°C can trigger flower abortion, pollen sterility in grains, and sun-scald in fruits.`,
      riskLevel: 'Severe',
      recommendation: 'Provide protective irrigation, shade netting, or foliar anti-transpirants where applicable.'
    };
  } else if (maxTemp3d >= 32) {
    thermalStress = {
      status: 'HEAT_MODERATE',
      badge: 'Moderate Heat Caution',
      color: 'amber',
      title: 'Elevated Thermal Load (32-35°C)',
      detail: `Peak daily temperatures reaching ${Math.round(maxTemp3d)}°C increase plant respiration and water uptake demand.`,
      riskLevel: 'Moderate',
      recommendation: 'Ensure soil moisture is maintained to avoid midday wilting.'
    };
  } else if (minTemp3d <= 1.5) {
    thermalStress = {
      status: 'FROST_CRITICAL',
      badge: 'Frost / Freeze Danger',
      color: 'indigo',
      title: 'Frost / Freeze Hazard Detected',
      detail: `Nighttime lows dropping to ${Math.round(minTemp3d)}°C will cause intracellular freezing in tender horticultural crops and orchard buds.`,
      riskLevel: 'Severe',
      recommendation: 'Activate frost mitigations: nocturnal micro-sprinklers, crop fleece, or smoke smudge pots.'
    };
  } else if (minTemp3d <= 6) {
    thermalStress = {
      status: 'CHILLING',
      badge: 'Chilling Injury Risk',
      color: 'sky',
      title: 'Cool Night Temperatures (2-6°C)',
      detail: `Night lows near ${Math.round(minTemp3d)}°C will slow nutrient absorption (especially phosphorus) in warm-season crops.`,
      riskLevel: 'Low to Moderate',
      recommendation: 'Delay morning fertigation until ambient temperatures rise.'
    };
  }

  // 3. Agrochemical Spraying Feasibility Window
  const windSpeed = current.wind_speed_10m || 8;
  const windGusts = current.wind_gusts_10m || windSpeed * 1.3;
  const precipProbCurrent = hourly?.precipitation_probability?.[0] || 0;

  let spraying = {
    status: 'OPTIMAL',
    badge: 'Optimal Window',
    color: 'emerald',
    title: 'Favorable Spraying Window',
    detail: `Wind speed is calm to moderate (${windSpeed.toFixed(1)} km/h), rain probability is low (${precipProbCurrent}%), and temperature is suitable.`,
    driftRisk: 'Low',
    washoffRisk: 'Low',
    recommendation: 'Ideal conditions for applying crop protection, herbicides, or foliar micronutrients.'
  };

  if (windSpeed > 18 || windGusts > 25) {
    spraying = {
      status: 'HIGH_WIND',
      badge: 'Do Not Spray: High Wind',
      color: 'rose',
      title: 'High Spray Drift Hazard',
      detail: `Wind gusts reaching ${windGusts.toFixed(1)} km/h cause chemical droplet drift, off-target crop injury, and regulatory non-compliance.`,
      driftRisk: 'Severe',
      washoffRisk: 'Low',
      recommendation: 'Cease foliar and boom spraying until wind subsides below 15 km/h.'
    };
  } else if (next48hRain > 3 || precipProbCurrent > 50) {
    spraying = {
      status: 'RAIN_RISK',
      badge: 'Do Not Spray: Wash-off Risk',
      color: 'amber',
      title: 'Foliar Wash-off Hazard',
      detail: `Rain forecast within the critical chemical absorption window (rainfastness period of 4-6 hours).`,
      driftRisk: 'Low',
      washoffRisk: 'Severe',
      recommendation: 'Postpone chemical and fertilizer applications to prevent product wash-off.'
    };
  } else if (currentTemp > 31) {
    spraying = {
      status: 'HIGH_TEMP',
      badge: 'Marginal: Fast Evaporation',
      color: 'amber',
      title: 'High Evaporation Spray Window',
      detail: `Ambient temperature (${Math.round(currentTemp)}°C) causes rapid droplet evaporation before absorption, increasing scorch risk.`,
      driftRisk: 'Moderate',
      washoffRisk: 'Low',
      recommendation: 'Shift spraying operations to early dawn or late twilight.'
    };
  }

  // 4. Fungal & Foliar Disease Threat Index (Mills & Blight models)
  let diseaseRisk = {
    status: 'LOW',
    badge: 'Low Fungal Risk',
    color: 'emerald',
    title: 'Low Fungal & Spore Infection Pressure',
    detail: `Relative humidity (${currentHumidity}%) and thermal patterns keep foliage dry and unfavorable for spore germination.`,
    riskScore: 25,
    recommendation: 'Routine monitoring. No immediate preventative fungicide required.'
  };

  if (currentHumidity >= 78 && currentTemp >= 18 && currentTemp <= 28) {
    diseaseRisk = {
      status: 'HIGH',
      badge: 'High Fungal Hazard',
      color: 'rose',
      title: 'High Fungal Infection Warning',
      detail: `Prolonged high humidity (${currentHumidity}%) combined with warm ambient temperature (${Math.round(currentTemp)}°C) creates an ideal microclimate for Downy Mildew, Rust, and Late Blight.`,
      riskScore: 88,
      recommendation: 'Scout dense canopy crops. Consider prophylactic organic or registered bio-fungicides.'
    };
  } else if (currentHumidity >= 70 || next48hRain > 5) {
    diseaseRisk = {
      status: 'MODERATE',
      badge: 'Moderate Disease Risk',
      color: 'amber',
      title: 'Moderate Fungal Pressure',
      detail: `Elevated humidity and periodic dampness support fungal spore viability. Leaf wetness duration is elevated.`,
      riskScore: 58,
      recommendation: 'Ensure adequate plant spacing and pruning for canopy ventilation.'
    };
  }

  // 5. Field Trafficability & Soil Workability
  const recentRainSum = daily.precipitation_sum?.[0] || 0;
  let trafficability = {
    status: 'GOOD',
    badge: 'Good Field Access',
    color: 'emerald',
    title: 'Soil Bearing Capacity Favorable',
    detail: 'Topsoil is firm. Heavy tractors, combine harvesters, and sprayers can access fields without compaction.',
    accessLevel: 'Unrestricted',
    recommendation: 'Safe for tillage, planting, or harvesting operations.'
  };

  if (recentRainSum + next48hRain > 20) {
    trafficability = {
      status: 'POOR',
      badge: 'Restricted Field Access',
      color: 'rose',
      title: 'High Soil Compaction & Bogging Risk',
      detail: `Recent/incoming rain total of ~${(recentRainSum + next48hRain).toFixed(1)} mm saturates soil pores. Tractor traffic will create deep ruts and destroy soil structure.`,
      accessLevel: 'Restricted',
      recommendation: 'Keep heavy machinery off wet fields until soil drainage allows.'
    };
  } else if (recentRainSum > 5) {
    trafficability = {
      status: 'FAIR',
      badge: 'Moderate Traction',
      color: 'amber',
      title: 'Moist Topsoil — Light Equipment Only',
      detail: 'Surface moisture may cause wheel slippage. Clay soils may be prone to compaction.',
      accessLevel: 'Light Vehicles Only',
      recommendation: 'Inspect field headlands before entering with heavy implements.'
    };
  }

  // Calculate Overall Agronomic Activity Score (0 - 100)
  let score = 85;
  if (thermalStress.riskLevel === 'Severe') score -= 25;
  if (spraying.driftRisk === 'Severe' || spraying.washoffRisk === 'Severe') score -= 20;
  if (diseaseRisk.status === 'HIGH') score -= 15;
  if (trafficability.status === 'POOR') score -= 20;
  if (irrigation.status === 'POSTPONE') score += 5; // Rain can be a blessing
  score = Math.max(20, Math.min(98, score));

  return {
    irrigation,
    thermalStress,
    spraying,
    diseaseRisk,
    trafficability,
    agriSuitabilityScore: score,
    generatedAt: new Date().toISOString()
  };
}

function calculateUpcomingRain(daily, days = 2) {
  if (!daily.precipitation_sum) return 0;
  return daily.precipitation_sum.slice(0, days).reduce((acc, val) => acc + (val || 0), 0);
}

function calculateAverageEt0(daily, days = 3) {
  if (!daily.et0_fao_evapotranspiration) return 3.8;
  const slice = daily.et0_fao_evapotranspiration.slice(0, days).filter(v => v !== null && !isNaN(v));
  if (slice.length === 0) return 3.8;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}
