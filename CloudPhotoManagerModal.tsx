/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Search,
  Star,
  Download,
  CloudUpload,
  AlertCircle,
  Loader2,
  RefreshCw,
  FolderArchive,
} from 'lucide-react';
import { Car } from './types';
import {
  uploadVehiclePhotosToCloud,
  deleteVehiclePhotoFromCloud,
  makePhotoCoverInCloud,
  syncAllLocalPhotosToCloud,
  downloadAllUploadedPhotosAsZip,
  getLocalUploadsStats,
} from './cloudPhotoStorage';

interface CloudPhotoManagerModalProps {
  cars: Car[];
  initialCarId?: string;
  onClose: () => void;
  onPhotosUpdated?: () => void;
}

export default function CloudPhotoManagerModal({
  cars,
  initialCarId,
  onClose,
  onPhotosUpdated,
}: CloudPhotoManagerModalProps) {
  const [selectedCarId, setSelectedCarId] = useState<string>(initialCarId || (cars[0]?.id ?? ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [localStats, setLocalStats] = useState<{ carCount: number; photoCount: number }>({ carCount: 0, photoCount: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCar = cars.find((c) => c.id === selectedCarId) || cars[0];
  const currentImages = selectedCar?.images || [];

  useEffect(() => {
    getLocalUploadsStats().then((stats) => {
      setLocalStats({ carCount: stats.carCount, photoCount: stats.photoCount });
    });
  }, [currentImages]);

  // Filter cars for sidebar list
  const filteredCars = cars.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.make.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      String(c.year).includes(q)
    );
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedCar) return;

    setIsUploading(true);
    setStatusMessage({
      text: `Optimizing and uploading ${files.length} photo(s) to Live Cloud & Domain...`,
      type: 'info',
    });

    try {
      await uploadVehiclePhotosToCloud(selectedCar.id, files, 12);
      setStatusMessage({
        text: `Successfully published ${files.length} photo(s) for ${selectedCar.year} ${selectedCar.make} ${selectedCar.model}! Now live on domain.`,
        type: 'success',
      });
      if (onPhotosUpdated) onPhotosUpdated();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatusMessage({
        text: 'Upload failed: ' + (err?.message || 'Check your internet connection.'),
        type: 'error',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!selectedCar) return;
    try {
      await deleteVehiclePhotoFromCloud(selectedCar.id, index, currentImages);
      setStatusMessage({
        text: `Photo removed from cloud gallery.`,
        type: 'info',
      });
      if (onPhotosUpdated) onPhotosUpdated();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleMakeCover = async (index: number) => {
    if (!selectedCar || index === 0) return;
    try {
      await makePhotoCoverInCloud(selectedCar.id, index, currentImages);
      setStatusMessage({
        text: `Selected photo set as primary showroom cover photo!`,
        type: 'success',
      });
      if (onPhotosUpdated) onPhotosUpdated();
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  const handleSyncAllLocalToCloud = async () => {
    setIsSyncingAll(true);
    setStatusMessage(null);
    try {
      const result = await syncAllLocalPhotosToCloud((info) => {
        setSyncProgress(`Publishing ${info.completedCars + 1}/${info.totalCars}: ${info.currentCarName}`);
      });
      setStatusMessage({
        text: `Successfully synced ${result.totalPhotos} photo(s) across ${result.totalCars} vehicle(s) directly to the Live Cloud & Domain!`,
        type: 'success',
      });
      setLocalStats({ carCount: 0, photoCount: 0 });
      if (onPhotosUpdated) onPhotosUpdated();
    } catch (err: any) {
      setStatusMessage({
        text: 'Sync error: ' + (err?.message || String(err)),
        type: 'error',
      });
    } finally {
      setIsSyncingAll(false);
      setSyncProgress('');
    }
  };

  const handleDownloadZipBackup = async () => {
    setIsDownloadingZip(true);
    setZipProgress(0);
    try {
      await downloadAllUploadedPhotosAsZip(cars, (pct) => setZipProgress(pct));
      setStatusMessage({
        text: 'Backup ZIP archive generated and downloaded successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Could not create zip backup.',
        type: 'error',
      });
    } finally {
      setIsDownloadingZip(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <CloudUpload className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-sans uppercase tracking-wider text-white">
                  Showroom Live Photo Publisher
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest font-semibold">
                  Live Cloud Sync
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Upload photos directly to the web. Real-time visible to all visitors on your live domain.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Backup Button */}
            <button
              onClick={handleDownloadZipBackup}
              disabled={isDownloadingZip}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 hover:text-white transition-colors border border-neutral-700 disabled:opacity-50"
              title="Download all uploaded photos as a ZIP file"
            >
              {isDownloadingZip ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Zipping {zipProgress}%</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backup ZIP</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Sync Notification if local files exist */}
        {localStats.photoCount > 0 && (
          <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Found <strong className="text-white">{localStats.photoCount} photos</strong> across{' '}
                <strong className="text-white">{localStats.carCount} vehicles</strong> stored on this laptop that need cloud publishing.
              </span>
            </div>
            <button
              onClick={handleSyncAllLocalToCloud}
              disabled={isSyncingAll}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-lg shadow-amber-500/20"
            >
              {isSyncingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>{syncProgress || 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-black" />
                  <span>Publish All To Live Domain Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-2 text-xs font-mono flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-b border-emerald-500/30'
                : statusMessage.type === 'error'
                ? 'bg-red-950/60 text-red-300 border-b border-red-500/30'
                : 'bg-blue-950/60 text-blue-300 border-b border-blue-500/30'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-neutral-400 hover:text-white ml-2 text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Vehicle Selector */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col bg-neutral-900/30 h-48 md:h-auto">
            {/* Search */}
            <div className="p-3 border-b border-neutral-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter 270+ vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-neutral-900 border border-neutral-700/80 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60">
              {filteredCars.map((car) => {
                const hasImgs = car.images && car.images.length > 0;
                const isSelected = car.id === selectedCarId;
                return (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={`w-full text-left p-3 transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-l-4 border-l-amber-500'
                        : 'hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase">
                        <span>{car.year}</span>
                        <span>•</span>
                        <span>{car.make}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {car.model}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {hasImgs ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          {car.images!.length} photo{car.images!.length === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          Needs Photos
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Photo Upload & Gallery */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Target Car Header Card */}
            {selectedCar && (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-0.5">
                    Selected Vehicle Target
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedCar.year} {selectedCar.make} {selectedCar.model}
                  </h3>
                  <div className="text-xs font-mono text-neutral-400 mt-1">
                    Price: ₦{selectedCar.price?.toLocaleString()} • {selectedCar.location || 'Abuja Showroom'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Publishing to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-black" />
                        <span>Select Photos from Laptop</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/20'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                <ImageIcon className="w-7 h-7 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-1">
                Drop Photos Here or Click to Browse
              </h4>
              <p className="text-xs text-neutral-400 font-mono max-w-md">
                No renaming necessary! Select up to 12 photos in any order. The system automatically optimizes and publishes them to the live cloud and domain.
              </p>
            </div>

            {/* Current Photos Gallery */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-300">
                    Live Cloud Gallery ({currentImages.length} Photos)
                  </h4>
                  {currentImages.length > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live on Web
                    </span>
                  )}
                </div>
                {currentImages.length > 0 && (
                  <span className="text-[10px] font-mono text-neutral-500">
                    Slot 1 is the main Cover Photo
                  </span>
                )}
              </div>

              {currentImages.length === 0 ? (
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-8 text-center text-neutral-500 font-mono text-xs">
                  No photos uploaded for this vehicle yet. Use the upload box above to add photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {currentImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-4/3 bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-md"
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                          Cover Photo
                        </div>
                      )}

                      {/* Slot index */}
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                        #{idx + 1}
                      </div>

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMakeCover(idx);
                            }}
                            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors"
                            title="Make Cover Photo"
                          >
                            <Star className="w-4 h-4 fill-black" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(idx);
                          }}
                          className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/60 flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected to Cloud Database & GitHub Domain Repo</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs transition-colors"
          >
            Close Showroom Manager
          </button>
        </div>

      </div>
    </div>
  );
}
