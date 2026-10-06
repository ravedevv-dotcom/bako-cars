/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo, ChangeEvent, DragEvent } from 'react';
import { X, Upload, CheckCircle2, Search, Camera, Image as ImageIcon, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { Car, getImageUrl } from './types';
import { batchUploadCarImages, setCarUploadedImages } from './imageUploadStorage';
import { saveVehicle } from './inventoryStore';

interface ShowroomPhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Car[];
  onVehiclesUpdated?: (updated: Car[]) => void;
}

export default function ShowroomPhotoManagerModal({
  isOpen,
  onClose,
  vehicles,
  onVehiclesUpdated,
}: ShowroomPhotoManagerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarId, setSelectedCarId] = useState<string>(vehicles[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter vehicles for dropdown / list
  const filteredVehicles = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return vehicles;
    return vehicles.filter(
      (c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        String(c.year).includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }, [vehicles, searchTerm]);

  const selectedCar = useMemo(() => {
    return vehicles.find((c) => c.id === selectedCarId) || vehicles[0];
  }, [vehicles, selectedCarId]);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    if (!selectedCar) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setStatusMsg(null);

    try {
      // 1. Process, compress, and save to local IndexedDB
      const dataUrls = await batchUploadCarImages(selectedCar.id, validFiles, 15);

      // 2. Sync to cloud Firestore so all visitors on all devices see the photos
      const updatedCar: Car = {
        ...selectedCar,
        images: dataUrls,
      };
      await saveVehicle(updatedCar);

      // 3. Update local state
      if (onVehiclesUpdated) {
        onVehiclesUpdated(
          vehicles.map((v) => (v.id === selectedCar.id ? updatedCar : v))
        );
      }

      setStatusMsg({
        type: 'success',
        text: `Successfully uploaded ${dataUrls.length} photos and synced to cloud!`,
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('Error saving car photos:', err);
      setStatusMsg({
        type: 'error',
        text: `Error saving photos: ${err?.message || 'Please try again'}`,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearPhotos = async () => {
    if (!selectedCar) return;
    if (!window.confirm(`Are you sure you want to clear photos for ${selectedCar.year} ${selectedCar.make} ${selectedCar.model}?`)) return;

    try {
      await setCarUploadedImages(selectedCar.id, []);
      const updatedCar: Car = { ...selectedCar, images: [] };
      await saveVehicle(updatedCar);

      if (onVehiclesUpdated) {
        onVehiclesUpdated(
          vehicles.map((v) => (v.id === selectedCar.id ? updatedCar : v))
        );
      }

      setStatusMsg({
        type: 'success',
        text: 'Photos cleared for this vehicle.',
      });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to clear photos.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-sans font-black text-base sm:text-lg tracking-wide uppercase text-white">
                  Showroom Photo Manager
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] uppercase tracking-widest font-bold">
                  Cloud Synced
                </span>
              </div>
              <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                Attach official photography from your laptop to any vehicle listing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Vehicle Selector */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold block">
              1. Select Vehicle to Attach Photos to:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter vehicles by make, model, year (e.g. LX600, TX350, Camry)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-3 py-2 text-xs font-mono text-white focus:border-sky-400 focus:outline-none cursor-pointer"
            >
              {filteredVehicles.map((car) => {
                const photosCount = (car.images || []).length;
                return (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} — {photosCount > 0 ? `${photosCount} photos` : 'NO PHOTOS YET'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Vehicle Info Card */}
          {selectedCar && (
            <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-sky-400 block font-bold">
                  Target Vehicle:
                </span>
                <span className="font-sans font-black text-sm uppercase text-white tracking-wide block">
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </span>
                <span className="font-mono text-[10px] text-neutral-400 block mt-0.5">
                  Duty: Paid &bull; {selectedCar.location} &bull; Active Photos: {(selectedCar.images || []).length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {(selectedCar.images || []).length > 0 && (
                  <button
                    onClick={handleClearPhotos}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-mono text-[10px] uppercase font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                  {selectedCar.price > 0 ? `₦${selectedCar.price.toLocaleString()}` : 'Price on Application'}
                </span>
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? 'border-sky-400 bg-sky-950/20 scale-[0.99]'
                : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/40 hover:bg-neutral-900/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sky-400 shadow-lg">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <span className="font-sans font-black text-sm sm:text-base uppercase tracking-wider text-white block">
                {isUploading ? 'OPTIMIZING & SYNCING PHOTOS TO CLOUD...' : 'DRAG & DROP PHOTOS HERE OR CLICK TO BROWSE'}
              </span>
              <span className="font-mono text-[11px] text-neutral-400 block mt-1">
                Select one or multiple photos from your computer (.JPG, .PNG, .WEBP)
              </span>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-lg pointer-events-none mt-2"
            >
              Browse Files on Laptop
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded text-xs font-mono flex items-center space-x-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Active Photos Preview */}
          {selectedCar && (selectedCar.images || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
                  Active Photos ({(selectedCar.images || []).length}):
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Photo #1 is the showroom cover image
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {(selectedCar.images || []).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[16/10] bg-neutral-900 rounded overflow-hidden border border-neutral-800 group"
                  >
                    <img
                      src={getImageUrl(img, 300)}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-black/80 text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900/60 flex justify-between items-center">
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              Photos sync automatically to Firestore Cloud & Live Domain
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-sans font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
