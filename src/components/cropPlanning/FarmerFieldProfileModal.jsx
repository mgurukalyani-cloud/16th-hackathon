import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  Droplets,
  Coins,
  Maximize2,
  Check,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { SEASONS, SOIL_TYPES, IRRIGATION_TYPES, CROP_CATEGORIES } from '../../services/cropPlanningService';

export default function FarmerFieldProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  location
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    state: profile.state || location?.state || 'Punjab',
    district: profile.district || location?.name || 'Ludhiana',
    mandal: profile.mandal || 'Ludhiana East',
    village: profile.village || 'Ayali Kalan',
    season: profile.season || 'rabi',
    sowingMonth: profile.sowingMonth || 'November',
    soilType: profile.soilType || 'alluvial_loam',
    soilPh: profile.soilPh || 7.0,
    irrigationType: profile.irrigationType || 'borewell',
    landAreaAcres: profile.landAreaAcres || 2.0,
    areaUnit: profile.areaUnit || 'acres',
    budgetPerAcre: profile.budgetPerAcre || 25000,
    cropCategory: profile.cropCategory || 'all'
  });

  if (!isOpen) return null;

  const currentSeasonObj = SEASONS.find(s => s.id === formData.season) || SEASONS[0];

  const handleSeasonChange = (newSeason) => {
    const sObj = SEASONS.find(s => s.id === newSeason);
    setFormData(prev => ({
      ...prev,
      season: newSeason,
      sowingMonth: sObj?.months[0] || 'June'
    }));
  };

  const handleSoilChange = (newSoil) => {
    const sObj = SOIL_TYPES.find(s => s.id === newSoil);
    setFormData(prev => ({
      ...prev,
      soilType: newSoil,
      soilPh: sObj?.defaultPh || 7.0
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleResetDefaults = () => {
    setFormData({
      state: location?.state || 'Punjab',
      district: location?.name || 'Ludhiana',
      mandal: 'Ludhiana East',
      village: 'Ayali Kalan',
      season: 'rabi',
      sowingMonth: 'November',
      soilType: 'alluvial_loam',
      soilPh: 7.0,
      irrigationType: 'borewell',
      landAreaAcres: 2.0,
      areaUnit: 'acres',
      budgetPerAcre: 25000,
      cropCategory: 'all'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200">
              <Layers className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {t('cropPlanning.editFieldProfile', 'Farmer Location & Field Profile')}
              </h2>
              <p className="text-xs text-emerald-200">
                {t('cropPlanning.profileSubtitle', 'Customizes seasonal crop recommendations and cost calculations')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Geographic Hierarchy */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('cropPlanning.geographicLocation', 'Farm Location (State, District, Mandal & Village)')}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">State:</span>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 bg-slate-50/50"
                  placeholder="e.g. Punjab, Telangana, Maharashtra"
                  required
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">District:</span>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 bg-slate-50/50"
                  placeholder="e.g. Ludhiana, Warangal, Nashik"
                  required
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mandal / Taluka / Tehsil:</span>
                <input
                  type="text"
                  value={formData.mandal}
                  onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-slate-50/50"
                  placeholder="e.g. Ludhiana East"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Village / Gram Panchayat:</span>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-slate-50/50"
                  placeholder="e.g. Ayali Kalan"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Season & Sowing Month */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('cropPlanning.seasonAndSowing', 'Cropping Season & Intended Sowing Month')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SEASONS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSeasonChange(s.id)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    formData.season === s.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-black">{s.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500">{s.name.includes('(') ? s.name.split('(')[1].replace(')', '') : s.id}</p>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Intended Sowing Month:</span>
              <select
                value={formData.sowingMonth}
                onChange={(e) => setFormData({ ...formData, sowingMonth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-slate-800 bg-slate-50/50"
              >
                {currentSeasonObj.months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Soil Type & pH */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('cropPlanning.soilCharacteristics', 'Soil Type & Soil pH')}</span>
            </label>
            <div className="space-y-2">
              <select
                value={formData.soilType}
                onChange={(e) => handleSoilChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-slate-800 bg-slate-50/50"
              >
                {SOIL_TYPES.map(soil => (
                  <option key={soil.id} value={soil.id}>
                    {soil.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 italic">
                {SOIL_TYPES.find(s => s.id === formData.soilType)?.description}
              </p>
            </div>

            {/* pH Slider with Neutral/Acidic indicator */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Soil Reaction (pH):</span>
                <span className="font-mono font-bold text-emerald-800 px-2 py-0.5 rounded-lg bg-emerald-100 text-xs">
                  pH {formData.soilPh} ({formData.soilPh < 6.5 ? 'Acidic' : formData.soilPh > 7.5 ? 'Alkaline' : 'Neutral / Optimal'})
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={formData.soilPh}
                onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>4.5 (Acidic)</span>
                <span>7.0 (Neutral)</span>
                <span>9.0 (Alkaline)</span>
              </div>
            </div>
          </div>

          {/* Section 4: Water Availability & Irrigation Source */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('cropPlanning.waterAvailability', 'Irrigation Infrastructure & Water Availability')}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {IRRIGATION_TYPES.map(irr => (
                <button
                  key={irr.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, irrigationType: irr.id })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    formData.irrigationType === irr.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs">{irr.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{irr.reliability}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Land Area & Available Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('cropPlanning.landArea', 'Total Land Area')}</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0.25"
                  max="500"
                  step="0.25"
                  value={formData.landAreaAcres}
                  onChange={(e) => setFormData({ ...formData, landAreaAcres: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-slate-800 bg-slate-50/50"
                  required
                />
                <span className="text-xs font-bold text-slate-600 px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  Acres
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('cropPlanning.budgetPerAcre', 'Available Budget / Acre')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="5000"
                  max="200000"
                  step="1000"
                  value={formData.budgetPerAcre}
                  onChange={(e) => setFormData({ ...formData, budgetPerAcre: parseInt(e.target.value, 10) || 10000 })}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-slate-800 bg-slate-50/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 6: Preferred Crop Category */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              {t('cropPlanning.preferredCategory', 'Preferred Crop Category:')}
            </span>
            <div className="flex flex-wrap gap-2">
              {CROP_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, cropCategory: cat.id })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    formData.cropCategory === cat.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('common.resetDefaults', 'Reset Defaults')}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('cropPlanning.applyProfile', 'Apply Field Profile & Calculate')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
