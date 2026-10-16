import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  UploadCloud,
  Leaf,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Search,
  ScanLine,
  RefreshCw
} from 'lucide-react';
import CameraScanner from './CameraScanner';
import ImageUploader from './ImageUploader';
import ImagePreview from './ImagePreview';
import PlantAnalysisResult from './PlantAnalysisResult';
import { analyzePlantImage } from '../../services/plantDiseaseService';

export default function PlantHealthPage({
  currentWeather,
  dailyWeather,
  location,
  tempUnit,
  onAnalysisResultChange
}) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [sampleHint, setSampleHint] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Handle capture from camera (supports precomputed result from in-modal inference)
  const handleCameraCapture = async (dataUrl, precomputedResult = null) => {
    const newImage = {
      source: dataUrl,
      fileName: `Camera_Capture_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`,
      fileSize: 'High Resolution Optical Frame',
      isSample: false
    };
    setSelectedImage(newImage);
    setSampleHint(null);
    setIsCameraOpen(false);

    // If result was already computed during in-modal review
    if (precomputedResult && precomputedResult.success) {
      setAnalysisResult(precomputedResult);
      setAnalysisError(null);
      onAnalysisResultChange?.(precomputedResult);
      return;
    }

    setAnalysisResult(null);
    setAnalysisError(null);
    onAnalysisResultChange?.(null);

    // Otherwise trigger pathology analysis
    setIsAnalyzing(true);
    try {
      const result = await analyzePlantImage(dataUrl, null);
      if (!result.success) {
        setAnalysisError(result.error || 'Failed to detect valid plant leaf tissue.');
        setAnalysisResult(null);
        onAnalysisResultChange?.(null);
      } else {
        setAnalysisResult(result);
        onAnalysisResultChange?.(result);
      }
    } catch (err) {
      setAnalysisError(err.message || 'An error occurred during image processing.');
      onAnalysisResultChange?.(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Switch to upload photo section if camera is unavailable or denied
  const handleSwitchToUpload = () => {
    setIsCameraOpen(false);
    setTimeout(() => {
      const uploadEl = document.getElementById('agrisense-upload-section');
      if (uploadEl) {
        uploadEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Handle upload selection
  const handleImageSelected = (imgData) => {
    setSelectedImage(imgData);
    setSampleHint(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Handle quick sample selection
  const handleSampleSelected = (sample) => {
    setSelectedImage({
      source: sample.url,
      fileName: `${sample.name}.jpg`,
      fileSize: 'Verified Field Specimen',
      isSample: true
    });
    setSampleHint(sample.sampleData);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Trigger analysis
  const handleAnalyze = async () => {
    if (!selectedImage || !selectedImage.source) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzePlantImage(selectedImage.source, sampleHint);
      if (!result.success) {
        setAnalysisError(result.error || 'Failed to detect valid plant leaf tissue.');
        setAnalysisResult(null);
        onAnalysisResultChange?.(null);
      } else {
        setAnalysisResult(result);
        onAnalysisResultChange?.(result);
      }
    } catch (err) {
      setAnalysisError(err.message || 'An error occurred during image processing.');
      onAnalysisResultChange?.(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset to scan another plant
  const handleReset = () => {
    setSelectedImage(null);
    setSampleHint(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    onAnalysisResultChange?.(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-800/60 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold">
            <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('plantHealth.bannerTitle', 'AI Plant & Leaf Pathology Diagnostics')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {t('plantHealth.heading', 'Plant Health & Leaf Disease Identification')}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            {t('plantHealth.description', 'Scan crops using your mobile rear camera or upload close-up leaf photographs to identify symptoms of fungal blights, rusts, bacterial spots, and nutrient deficiencies. Real-time atmospheric microclimates from your farm are synthesized to evaluate infection transmission risk.')}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {!analysisResult ? (
        <div className="space-y-6">
          {/* Dual Action Options (Option A: Camera, Option B: Upload) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Camera Scanner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    {t('plantHealth.optionA', 'Option A • In-Field Optical Scanning')}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {t('plantHealth.scanCamera', 'Scan Using Device Camera')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t('plantHealth.scanCameraDesc', 'Uses your phone or tablet camera to capture an in-situ leaf specimen with live viewfinder guides and optical focus reticles.')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCameraOpen(true)}
                className="mt-6 w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>{t('plantHealth.launchCamera', 'Launch Live Camera Scanner')}</span>
              </button>
            </div>

            {/* Option B: Image Uploader Card summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {t('plantHealth.optionB', 'Option B • File & Gallery Picker')}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {t('plantHealth.uploadPhoto', 'Upload Leaf Photograph')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t('plantHealth.uploadPhotoDesc', 'Select a photograph from your mobile gallery or computer files. Supports JPG, PNG, and WebP images up to 10MB.')}
                  </p>
                </div>
              </div>

              <span className="mt-6 text-xs text-slate-500 text-center font-medium bg-slate-50 py-2.5 rounded-2xl border border-slate-100">
                {t('plantHealth.dragDrop', 'Drag & drop from your computer, or tap to choose from your photo gallery')}
              </span>
            </div>
          </div>

          {/* Active Specimen Preview OR Image Uploader Component */}
          <div id="agrisense-upload-section">
            {selectedImage ? (
              <ImagePreview
                imageMetadata={selectedImage}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onClear={handleReset}
                onOpenReplace={() => setSelectedImage(null)}
              />
            ) : (
              <ImageUploader
                onImageSelected={handleImageSelected}
                onSampleSelected={handleSampleSelected}
                selectedImage={selectedImage}
                onClearImage={handleReset}
              />
            )}
          </div>

          {/* Error Message banner if analysis failed */}
          {analysisError && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 shadow-sm space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold text-sm text-rose-950">Diagnostic Analysis Notice:</strong>
                  <p className="text-rose-800 leading-relaxed">{analysisError}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/80">
                <button
                  onClick={() => { setAnalysisError(null); setIsCameraOpen(true); }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('plantHealth.launchCamera', 'Launch Camera Scanner')}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Choose Another Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Photography Guidelines Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('plantHealth.guidelinesTitle', 'Photography Guidelines for Accurate Diagnostic Recognition')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">{t('plantHealth.guide1Title', '1. Natural Daylight')}</strong>
                <span>{t('plantHealth.guide1Desc', 'Photograph under bright diffused morning or afternoon sunlight. Avoid harsh shadows or strong flash reflections.')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">{t('plantHealth.guide2Title', '2. Focus on Lesions')}</strong>
                <span>{t('plantHealth.guide2Desc', 'Hold camera 15-25cm away, ensuring the target leaf blade fills at least 60% of the frame in sharp focus.')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">{t('plantHealth.guide3Title', '3. Isolated Foliage')}</strong>
                <span>{t('plantHealth.guide3Desc', 'Place a hand or plain surface behind the leaf to prevent background soil or weeds from interfering with recognition.')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <PlantAnalysisResult
          analysis={analysisResult}
          imageSource={selectedImage?.source || (typeof selectedImage === 'string' ? selectedImage : '')}
          currentWeather={currentWeather}
          dailyWeather={dailyWeather}
          location={location}
          tempUnit={tempUnit}
          onReset={handleReset}
        />
      )}

      {/* Live Camera Scanner Modal */}
      {isCameraOpen && (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
          onSwitchToUpload={handleSwitchToUpload}
        />
      )}
    </div>
  );
}
