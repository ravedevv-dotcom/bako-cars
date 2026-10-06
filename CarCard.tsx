/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, MouseEvent } from 'react';
import {
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  FolderDown,
  Loader2,
  Car as CarIcon,
  Camera,
} from 'lucide-react';
import { Car, getImageUrl, handleImageFallback } from './types';
import { downloadAllVehicleImages } from './imageDownloader';

interface CarCardProps {
  car: Car;
  onViewDetails: (car: Car) => void;
  isCompared?: boolean;
  onToggleCompare?: (carId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (carId: string) => void;
  onOpenPriceAlert?: (car: Car) => void;
  onUploadPhotos?: (carId: string) => void;
}

export default function CarCard({
  car,
  onViewDetails,
  isCompared = false,
  onToggleCompare,
  isFavorite = false,
  onToggleFavorite,
  onUploadPhotos,
}: CarCardProps) {
  const [copied, setCopied] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  const formatCurrency = (val: number) => {
    if (!val || val <= 0) return 'INQUIRE FOR PRICE';
    return '₦' + new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDownloadAllPhotos = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!car.images || car.images.length === 0) return;
    setIsDownloadingAll(true);
    setDownloadMsg('Preparing ZIP...');
    try {
      await downloadAllVehicleImages(car, (curr, tot) => {
        setDownloadMsg(`Archiving ${curr}/${tot}`);
      });
      setDownloadMsg('Complete!');
      setTimeout(() => setDownloadMsg(''), 2500);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadMsg('Failed');
      setTimeout(() => setDownloadMsg(''), 2500);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?carId=${car.id}`;
    const shareData = {
      title: `${car.year ? `${car.year} ` : ''}${car.make} ${car.model} | Bako Cars`,
      text: `Check out this ${car.year ? `${car.year} ` : ''}${car.make} ${car.model} at Bako Cars!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Could not copy link:', err);
      }
    }
  };

  const handlePrevImage = (e: MouseEvent) => {
    e.stopPropagation();
    if (!car.images || car.images.length === 0) return;
    setCurrentImgIdx((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: MouseEvent) => {
    e.stopPropagation();
    if (!car.images || car.images.length === 0) return;
    setCurrentImgIdx((prev) => (prev + 1) % car.images.length);
  };

  const waUrl = `https://wa.me/message/JCOUM7I4Z2XVB1?text=${encodeURIComponent(
    `Hello Bako Cars, I am interested in the ${car.year ? `${car.year} ` : ''}${car.make} ${car.model} (Stock #: ${car.stockNumber || car.id}). Please send more details.`
  )}`;

  const imagesCount = car.images ? car.images.length : 0;

  return (
    <div
      onClick={() => onViewDetails(car)}
      className="group bg-[#0A0A0A] border border-neutral-800/80 hover:border-neutral-500 rounded-lg overflow-hidden transition-all duration-300 flex flex-col justify-between h-full hover:shadow-2xl hover:shadow-black/80 cursor-pointer text-white"
      id={`car-card-${car.id}`}
    >
      <div>
        {/* Top Image Viewport with Carousel Arrows & Watermark */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 border-b border-neutral-800">
          {/* Brand Watermark Overlay */}
          <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none select-none text-right">
            <span className="font-serif italic font-extrabold text-[12px] text-black tracking-tight drop-shadow-sm block leading-none">
              BAKO CARS
            </span>
            <span className="font-sans text-[7px] text-black font-extrabold uppercase tracking-[0.2em] block mt-0.5">
              ABUJA
            </span>
          </div>

          {imagesCount > 0 ? (
            <>
              {/* Main Car Photo */}
              <img
                src={getImageUrl(car.images[currentImgIdx] || car.images[0], 600)}
                alt={`${car.make} ${car.model}`}
                decoding="async"
                className="relative z-0 w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  handleImageFallback(e, car.images[currentImgIdx] || car.images[0]);
                }}
              />

              {/* Top Left Badge */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5">
                <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white font-mono text-[9px] font-bold uppercase rounded border border-white/10">
                  PHOTO {currentImgIdx + 1}/{imagesCount}
                </span>
              </div>

              {/* Carousel Navigation Arrows */}
              {imagesCount > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <button
                    onClick={handlePrevImage}
                    className="p-1.5 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 transition-all pointer-events-auto shadow-lg cursor-pointer"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="p-1.5 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 transition-all pointer-events-auto shadow-lg cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Thumbnail Dots */}
              {imagesCount > 1 && (
                <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center items-center space-x-1">
                  {car.images.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImgIdx(dotIdx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dotIdx === currentImgIdx
                          ? 'w-5 bg-white'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      title={`Photo ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Showroom Placeholder for vehicles awaiting photography */
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center p-6 text-center select-none relative group/ph">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2.5">
                <CarIcon className="w-6 h-6 text-white/40" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-300 font-bold mb-0.5">
                Photoshoot In Progress
              </span>
              <span className="text-[10px] text-neutral-500 font-mono mb-2">
                Official Bako Showroom Photos Coming Soon
              </span>
              {onUploadPhotos && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadPhotos(car.id);
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Photos to Cloud</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 pb-3 space-y-3">
          {/* Subtitle Header & Main Title */}
          <div>
            <div className="font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-[0.15em] mb-0.5">
              {car.year ? `${car.year} ` : ''}{car.make}
            </div>
            <h3 className="font-sans text-sm sm:text-[15px] font-black uppercase text-white tracking-wide leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-neutral-200 transition-colors">
              {car.model}
            </h3>
          </div>

          {/* Showroom Key Spec Stack */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] font-mono py-2.5 border-y border-neutral-800/80">
            <div>
              <span className="text-neutral-500 mr-1.5">DUTY:</span>
              <span className="font-bold text-emerald-400">PAID & CLEARED</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-1.5">STOCK #:</span>
              <span className="font-bold text-neutral-200">{car.stockNumber || '10230'}</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-1.5">TRANSMISSION:</span>
              <span className="font-bold text-neutral-200 uppercase truncate inline-block max-w-[85px] align-bottom" title={car.transmission}>
                {car.transmission?.toUpperCase() || 'AUTOMATIC'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 mr-1.5">DRIVETRAIN:</span>
              <span className="font-bold text-neutral-200 uppercase">{car.drivetrain?.toUpperCase() || 'AWD'}</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-1.5">GALLERY:</span>
              <span className="font-bold text-sky-400 uppercase">
                {imagesCount > 0 ? `${imagesCount} PHOTOS` : 'COMING SOON'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 mr-1.5">LOCATION:</span>
              <span className="font-bold text-neutral-200 uppercase truncate inline-block max-w-[85px] align-bottom" title={car.location}>
                {car.location ? car.location.split(',')[0].toUpperCase() : 'ABUJA'}
              </span>
            </div>
          </div>

          {/* Actions Bar: Save, Compare, Multi-Download & Share */}
          <div className="flex items-center justify-between pt-1 gap-1 text-[10px] font-mono">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(car.id);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 border rounded transition-all ${
                  isFavorite
                    ? 'bg-red-600/20 text-red-400 border-red-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
                title={isFavorite ? 'Remove Favourite' : 'Add Favourite'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                <span className="uppercase text-[9px] font-bold">{isFavorite ? 'SAVED' : 'SAVE'}</span>
              </button>
            )}

            {onToggleCompare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(car.id);
                }}
                className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider border rounded transition-all ${
                  isCompared
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
              >
                <span>{isCompared ? '✓ COMPARED' : '+ COMPARE'}</span>
              </button>
            )}

            {/* Multi-Image Download (ZIP) Button on Card */}
            {imagesCount > 0 && (
              <button
                type="button"
                onClick={handleDownloadAllPhotos}
                disabled={isDownloadingAll}
                className="p-1.5 border rounded bg-neutral-900 text-emerald-400 hover:text-white border-neutral-800 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center space-x-1"
                title={`Download all ${imagesCount} photos in a ZIP archive`}
              >
                {isDownloadingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FolderDown className="w-3.5 h-3.5" />
                )}
                {downloadMsg && <span className="text-[8px] font-mono">{downloadMsg}</span>}
              </button>
            )}

            <button
              onClick={handleShare}
              className={`p-1.5 border rounded transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
              }`}
              title="Share Vehicle"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing & CTA Section */}
      <div className="p-4 sm:p-5 pt-0 mt-1 space-y-3">
        {/* Price Display */}
        <div>
          <div className="font-sans text-xl sm:text-2xl font-black tracking-tight text-white">
            {formatCurrency(car.price)}
          </div>
          <div className="font-mono text-[9px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5">
            + DUTY PAID &bull; VERIFIED ABUJA STOCK
          </div>
        </div>

        {/* CTA: INQUIRE ON WHATSAPP */}
        <div className="pt-1">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase py-3 px-4 rounded text-xs tracking-wider transition-all duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            id={`inquire-wa-btn-${car.id}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>INQUIRE ON WHATSAPP</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg overflow-hidden h-[460px] flex flex-col justify-between animate-pulse">
      <div>
        <div className="relative aspect-[16/10] w-full bg-neutral-900 border-b border-neutral-800" />
        <div className="p-4 space-y-3">
          <div className="w-1/3 h-2.5 bg-neutral-800 rounded" />
          <div className="w-3/4 h-5 bg-neutral-800 rounded" />
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-neutral-800">
            <div className="h-3 bg-neutral-800 rounded" />
            <div className="h-3 bg-neutral-800 rounded" />
            <div className="h-3 bg-neutral-800 rounded" />
            <div className="h-3 bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="w-1/2 h-6 bg-neutral-800 rounded" />
        <div className="w-full h-9 bg-neutral-800 rounded" />
        <div className="w-full h-8 bg-neutral-800 rounded" />
      </div>
    </div>
  );
}
