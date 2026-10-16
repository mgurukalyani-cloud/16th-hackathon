import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  AlertCircle,
  X,
  Check,
  Leaf,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_PLANT_IMAGES } from '../../services/plantDiseaseService';

export default function ImageUploader({
  onImageSelected,
  onSampleSelected,
  selectedImage,
  onClearImage
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Validate and read file
  const processFile = (file) => {
    setValidationError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setValidationError('Unsupported format. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (max 10MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setValidationError(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 10MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelected({
        source: e.target.result,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileType: file.type,
        isSample: false
      });
    };
    reader.onerror = () => {
      setValidationError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
            : selectedImage
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-7 h-7 text-emerald-700" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('plantHealth.uploadPhoto', 'Upload Leaf Photograph')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {t('plantHealth.dragDrop', 'Drag & drop from your computer, or tap to choose from your photo gallery (JPG, PNG, WebP up to 10MB)')}
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {t('plantHealth.browsePhotos', 'Browse Local Photos')}
          </button>
        </div>

        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Quick Test Agricultural Samples Palette */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('plantHealth.quickTestSamples', 'Quick Test: Pre-verified Agricultural Leaf Samples')}
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {t('plantHealth.clickSpecimen', 'Click any specimen to load immediately')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SAMPLE_PLANT_IMAGES.map((sample) => (
            <button
              key={sample.id}
              data-sample-id={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="text-left p-2 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/50 bg-white transition-all flex flex-col group cursor-pointer shadow-2xs"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                  {sample.crop}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                {sample.expectedCondition}
              </p>
              <span className="text-[10px] text-slate-500 truncate mt-0.5">
                {sample.crop}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
