/**
 * AgriSense Comprehensive Demo Agricultural Weather Dataset
 * Used for offline environments, demos, or when the user toggles demo mode.
 * Clearly marked as simulated data.
 */

export const DEMO_LOCATION = {
  id: 'demo-punjab-01',
  name: 'Ludhiana Agricultural Belt',
  admin1: 'Punjab',
  country: 'India',
  country_code: 'IN',
  latitude: 30.9010,
  longitude: 75.8573,
  elevation: 247,
  timezone: 'Asia/Kolkata',
  isDemo: true
};

export const DEMO_PRESET_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'Ludhiana Agricultural Belt',
    admin1: 'Punjab',
    country: 'India',
    country_code: 'IN',
    latitude: 30.9010,
    longitude: 75.8573,
    elevation: 247,
    timezone: 'Asia/Kolkata',
    cropFocus: 'Wheat, Rice, Cotton',
    isDemo: false
  },
  {
    id: 'loc-2',
    name: 'Salinas Valley',
    admin1: 'California',
    country: 'United States',
    country_code: 'US',
    latitude: 36.6777,
    longitude: -121.6555,
    elevation: 16,
    timezone: 'America/Los_Angeles',
    cropFocus: 'Lettuce, Broccoli, Strawberries',
    isDemo: false
  },
  {
    id: 'loc-3',
    name: 'Nashik Grape & Onion Valley',
    admin1: 'Maharashtra',
    country: 'India',
    country_code: 'IN',
    latitude: 19.9975,
    longitude: 73.7898,
    elevation: 600,
    timezone: 'Asia/Kolkata',
    cropFocus: 'Grapes, Onions, Sugarcane',
    isDemo: false
  },
  {
    id: 'loc-4',
    name: 'Ames Corn Belt',
    admin1: 'Iowa',
    country: 'United States',
    country_code: 'US',
    latitude: 42.0308,
    longitude: -93.6319,
    elevation: 287,
    timezone: 'America/Chicago',
    cropFocus: 'Corn, Soybeans',
    isDemo: false
  },
  {
    id: 'loc-5',
    name: 'Valencia Citrus Groves',
    admin1: 'Valencian Community',
    country: 'Spain',
    country_code: 'ES',
    latitude: 39.4699,
    longitude: -0.3763,
    elevation: 15,
    timezone: 'Europe/Madrid',
    cropFocus: 'Citrus, Olives, Almonds',
    isDemo: false
  }
];

export function getDemoWeatherData() {
  const now = new Date();
  const currentIso = now.toISOString();

  // Generate 48 hours of hourly data
  const hourlyTimes = [];
  const hourlyTemps = [];
  const hourlyHumidity = [];
  const hourlyPrecipProb = [];
  const hourlyPrecip = [];
  const hourlyWind = [];
  const hourlyVpd = [];
  const hourlySoilTemp = [];

  for (let i = 0; i < 48; i++) {
    const d = new Date(now.getTime() + i * 3600000);
    const hour = d.getHours();
    hourlyTimes.push(d.toISOString().slice(0, 16));

    // Temperature curve: lowest around 5 AM, highest around 2 PM
    const tempOffset = Math.sin(((hour - 5) / 24) * 2 * Math.PI);
    const temp = Math.round((24 + tempOffset * 7.5 + (Math.random() * 1 - 0.5)) * 10) / 10;
    hourlyTemps.push(temp);

    // Humidity curve: inversely proportional to temp
    const hum = Math.round(Math.max(35, Math.min(92, 68 - tempOffset * 25 + Math.random() * 4)));
    hourlyHumidity.push(hum);

    // Rain probability higher in afternoon of tomorrow
    const rainProb = i > 18 && i < 30 ? Math.round(45 + Math.random() * 25) : Math.round(5 + Math.random() * 15);
    hourlyPrecipProb.push(rainProb);
    hourlyPrecip.push(rainProb > 50 ? Math.round((Math.random() * 3.5) * 10) / 10 : 0);

    // Wind
    hourlyWind.push(Math.round((8 + Math.abs(tempOffset) * 6 + Math.random() * 3) * 10) / 10);

    // VPD
    const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const ea = es * (hum / 100);
    hourlyVpd.push(Math.round((es - ea) * 100) / 100);

    // Soil temp (more damped than air temp)
    hourlySoilTemp.push(Math.round((21 + tempOffset * 2.5) * 10) / 10);
  }

  // Generate 10 days of forecast daily data
  const dailyTimes = [];
  const dailyMaxTemps = [];
  const dailyMinTemps = [];
  const dailyPrecipSum = [];
  const dailyPrecipProb = [];
  const dailyWeatherCodes = [1, 2, 61, 80, 2, 0, 1, 3, 2, 0];
  const dailyWindMax = [];
  const dailyEt0 = [];

  for (let d = 0; d < 10; d++) {
    const dayDate = new Date(now.getTime() + d * 86400000);
    dailyTimes.push(dayDate.toISOString().slice(0, 10));

    const maxT = Math.round(28 + Math.sin(d) * 4);
    const minT = Math.round(18 + Math.sin(d + 1) * 3);
    dailyMaxTemps.push(maxT);
    dailyMinTemps.push(minT);

    const rain = d === 2 ? 14.5 : d === 3 ? 6.2 : d === 7 ? 3.0 : 0.0;
    dailyPrecipSum.push(rain);
    dailyPrecipProb.push(rain > 0 ? Math.round(65 + Math.random() * 25) : Math.round(10 + Math.random() * 15));

    dailyWindMax.push(Math.round(12 + Math.random() * 8));
    dailyEt0.push(Math.round((4.2 - (rain > 5 ? 2.1 : 0) + Math.random() * 0.8) * 10) / 10);
  }

  // Generate 30 days of historical data
  const historyTimes = [];
  const historyMaxTemps = [];
  const historyMinTemps = [];
  const historyPrecipSum = [];
  const historyHumidityMean = [];
  const historyEt0 = [];
  const historyWeatherCodes = [];

  for (let h = 30; h >= 1; h--) {
    const histDate = new Date(now.getTime() - h * 86400000);
    historyTimes.push(histDate.toISOString().slice(0, 10));

    const maxT = Math.round(29 + Math.cos(h / 3) * 3.5 + (Math.random() * 2 - 1));
    const minT = Math.round(17 + Math.cos(h / 3) * 2.5 + (Math.random() * 2 - 1));
    historyMaxTemps.push(maxT);
    historyMinTemps.push(minT);

    const rain = (h === 4 || h === 12 || h === 21) ? Math.round((8 + Math.random() * 18) * 10) / 10 : (h === 13 || h === 22) ? 2.5 : 0;
    historyPrecipSum.push(rain);
    historyHumidityMean.push(Math.round(58 + (rain > 0 ? 22 : 0) + Math.random() * 8));
    historyEt0.push(Math.round((4.5 - (rain > 5 ? 2.0 : 0)) * 10) / 10);
    historyWeatherCodes.push(rain > 10 ? 63 : rain > 0 ? 61 : (h % 3 === 0 ? 2 : 0));
  }

  return {
    isDemo: true,
    dataSource: 'Demo Simulated Meteorological Engine',
    location: DEMO_LOCATION,
    current: {
      time: currentIso,
      temperature_2m: 26.4,
      relative_humidity_2m: 64,
      apparent_temperature: 27.8,
      is_day: 1,
      precipitation: 0.0,
      weather_code: 2, // Partly cloudy
      cloud_cover: 38,
      pressure_msl: 1012.8,
      wind_speed_10m: 11.2,
      wind_direction_10m: 135, // SE
      wind_gusts_10m: 16.5,
      uv_index: 6.2,
      dew_point_2m: 19.1,
      soil_temperature_0cm: 25.2,
      soil_moisture_0_to_1cm: 0.32,
      sunrise: `${dailyTimes[0]}T06:22`,
      sunset: `${dailyTimes[0]}T18:04`,
      daylight_hours: '11h 42m'
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTemps,
      relative_humidity_2m: hourlyHumidity,
      precipitation_probability: hourlyPrecipProb,
      precipitation: hourlyPrecip,
      wind_speed_10m: hourlyWind,
      vapour_pressure_deficit: hourlyVpd,
      soil_temperature_0cm: hourlySoilTemp
    },
    daily: {
      time: dailyTimes,
      weather_code: dailyWeatherCodes,
      temperature_2m_max: dailyMaxTemps,
      temperature_2m_min: dailyMinTemps,
      precipitation_sum: dailyPrecipSum,
      precipitation_probability_max: dailyPrecipProb,
      wind_speed_10m_max: dailyWindMax,
      et0_fao_evapotranspiration: dailyEt0,
      sunrise: dailyTimes.map(t => `${t}T06:22`),
      sunset: dailyTimes.map(t => `${t}T18:04`),
      uv_index_max: [6.5, 6.2, 3.8, 5.0, 7.1, 7.4, 6.9, 5.5, 6.7, 7.0]
    },
    historical: {
      time: historyTimes,
      weather_code: historyWeatherCodes,
      temperature_2m_max: historyMaxTemps,
      temperature_2m_min: historyMinTemps,
      precipitation_sum: historyPrecipSum,
      relative_humidity_2m_mean: historyHumidityMean,
      et0_fao_evapotranspiration: historyEt0,
      source: 'Recorded station agro-meteorological observations'
    }
  };
}
