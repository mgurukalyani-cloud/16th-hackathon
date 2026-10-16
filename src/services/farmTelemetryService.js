/**
 * AgriSense Farm Telemetry & Root-Zone Soil Service
 * Provides real-time field measurements for:
 * - 4 distinct farm irrigation zones
 * - Soil pH and NPK macronutrient concentrations
 * - Main farm irrigation water tank and reservoir capacity
 * - Crop phenology and root-zone water balance
 */

export const INITIAL_IRRIGATION_ZONES = [
  {
    id: 'zone-1',
    zoneNumber: 1,
    name: 'North Orchard (Fruit Trees & Citrus)',
    cropType: 'Citrus & Sweet Lime',
    soilMoisturePct: 42.5,
    optimalMinMoisture: 40.0,
    optimalMaxMoisture: 52.0,
    status: 'OPTIMAL',
    statusLabel: 'Soil Moisture Optimal',
    soilTempC: 22.1,
    soilPh: 6.5,
    valveStatus: 'CLOSED',
    valveId: 'SOL-01-NORTH',
    lastIrrigated: 'Yesterday at 17:30',
    recommendedAction: 'No irrigation needed. Moisture levels are healthy.'
  },
  {
    id: 'zone-2',
    zoneNumber: 2,
    name: 'South Field (Vegetables & Pulses)',
    cropType: 'Tomatoes & Chickpeas',
    soilMoisturePct: 27.8,
    optimalMinMoisture: 35.0,
    optimalMaxMoisture: 48.0,
    status: 'NEEDS_WATER',
    statusLabel: 'Low Soil Moisture — Needs Water',
    soilTempC: 23.8,
    soilPh: 6.8,
    valveStatus: 'READY_TO_ACTUATE',
    valveId: 'SOL-02-SOUTH',
    lastIrrigated: '3 days ago',
    recommendedAction: 'Zone 2 requires irrigation cycle (~25 min drip) before midday peak thermal load.'
  },
  {
    id: 'zone-3',
    zoneNumber: 3,
    name: 'East Field (Paddy & Cereals)',
    cropType: 'Rice / Wheat Rotation',
    soilMoisturePct: 68.2,
    optimalMinMoisture: 60.0,
    optimalMaxMoisture: 75.0,
    status: 'ADEQUATE',
    statusLabel: 'Ample Moisture — Submerged Bed',
    soilTempC: 21.5,
    soilPh: 7.1,
    valveStatus: 'CLOSED',
    valveId: 'SOL-03-EAST',
    lastIrrigated: 'Today at 06:00',
    recommendedAction: 'Keep valves closed. Standing water depth is adequate.'
  },
  {
    id: 'zone-4',
    zoneNumber: 4,
    name: 'West Nursery & Polyhouse',
    cropType: 'Seedlings & Capsicum',
    soilMoisturePct: 49.0,
    optimalMinMoisture: 45.0,
    optimalMaxMoisture: 55.0,
    status: 'OPTIMAL',
    statusLabel: 'Optimal Micro-climate',
    soilTempC: 22.9,
    soilPh: 6.3,
    valveStatus: 'AUTO_SCHEDULED',
    valveId: 'SOL-04-NURSERY',
    lastIrrigated: '2 hours ago (Misting cycle)',
    recommendedAction: 'Automated misting pulse active. Next cycle in 4 hours.'
  }
];

export const INITIAL_WATER_TANK = {
  tankId: 'RESERVOIR-MAIN-01',
  capacityLiters: 15000,
  currentLevelLiters: 11700,
  fillPercentage: 78,
  waterSource: 'Borewell & Rainwater Harvesting Pit',
  pumpStatus: 'STANDBY',
  pumpControlMode: 'MANUAL_CONFIRMATION_REQUIRED',
  ecConductivityDsm: 0.45,
  inflowRateLpm: 0,
  outflowRateLpm: 0,
  lastRefilled: 'Today at 04:30 AM'
};

export const INITIAL_SOIL_ANALYSIS = {
  farmAveragePh: 6.7,
  phInterpretation: 'Near Neutral (Optimal nutrient availability range 6.5 - 7.2)',
  nitrogenPpm: 52,
  nitrogenStatus: 'Adequate for vegetative growth',
  phosphorusPpm: 22,
  phosphorusStatus: 'Good root establishment reserves',
  potassiumPpm: 41,
  potassiumStatus: 'Balanced cellular osmotic pressure',
  organicCarbonPct: 0.72,
  organicCarbonStatus: 'Medium fertility index',
  electricalConductivity: 0.38 // dS/m (Non-saline)
};

class FarmTelemetryService {
  constructor() {
    this.zones = [...INITIAL_IRRIGATION_ZONES];
    this.waterTank = { ...INITIAL_WATER_TANK };
    this.soilAnalysis = { ...INITIAL_SOIL_ANALYSIS };
  }

  // Get current snapshot of all 4 zones
  getIrrigationZones() {
    return this.zones;
  }

  // Find zone that urgently needs water
  getZonesNeedingWater() {
    return this.zones.filter(z => z.soilMoisturePct < z.optimalMinMoisture);
  }

  // Get water tank telemetry
  getWaterTankStatus() {
    return this.waterTank;
  }

  // Get soil pH and NPK measurements
  getSoilMeasurements() {
    return this.soilAnalysis;
  }

  // Synthesize Open-Meteo real soil data if available to keep readings grounded in real weather
  syncWithWeatherData(weatherCurrent) {
    if (!weatherCurrent) return;

    if (weatherCurrent.soil_temperature_0cm !== undefined) {
      const avgSoilTemp = weatherCurrent.soil_temperature_0cm;
      this.zones[0].soilTempC = Math.round((avgSoilTemp - 0.4) * 10) / 10;
      this.zones[1].soilTempC = Math.round((avgSoilTemp + 0.8) * 10) / 10;
      this.zones[2].soilTempC = Math.round((avgSoilTemp - 1.2) * 10) / 10;
      this.zones[3].soilTempC = Math.round(avgSoilTemp * 10) / 10;
    }

    if (weatherCurrent.soil_moisture_0_to_1cm !== undefined) {
      // Open-Meteo soil moisture is volumetric (m³/m³, e.g. 0.32 = 32%)
      const baseMoisture = Math.round(weatherCurrent.soil_moisture_0_to_1cm * 100);
      if (baseMoisture > 10 && baseMoisture < 80) {
        this.zones[0].soilMoisturePct = Math.min(65, Math.max(30, baseMoisture + 4));
        this.zones[1].soilMoisturePct = Math.min(45, Math.max(22, baseMoisture - 10)); // Maintain zone 2 deficit
        this.zones[2].soilMoisturePct = Math.min(85, Math.max(55, baseMoisture + 25));
        this.zones[3].soilMoisturePct = Math.min(60, Math.max(35, baseMoisture + 8));
      }
    }
  }
}

export const farmTelemetryService = new FarmTelemetryService();
export default farmTelemetryService;
