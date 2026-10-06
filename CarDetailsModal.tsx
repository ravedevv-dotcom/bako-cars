/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, MouseEvent } from 'react';
import {
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  Maximize2,
  Film,
  Camera,
  Download,
  FolderDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Inquiry, getImageUrl, getVideoUrl, handleImageFallback } from './types';
import { downloadSingleImage, downloadAllVehicleImages } from './imageDownloader';

interface CarDetailsModalProps {
  car: Car | null;
  onClose: () => void;
  onSubmitInquiry: (inquiry: Omit<Inquiry, 'id' | 'dateSubmitted' | 'status'>) => void;
  initialInquiryType?: 'Inquiry' | 'Test Drive' | 'Finance Quote' | 'Trade-In';
}

export const DETAIL_SLOT_LABELS = [
  'Slot 1: Cover / Main Exterior',
  'Slot 2: Front Three-Quarter',
  'Slot 3: Side Profile',
  'Slot 4: Rear & Exhaust',
  'Slot 5: Cockpit & Dashboard',
  'Slot 6: Steering & Console',
  'Slot 7: Rear Cabin & Seats',
  'Slot 8: Wheels & Details',
  'Slot 9: Engine Bay',
  'Slot 10: Trunk & Cargo',
  'Slot 11: Roof / Sunroof & Badging',
  'Slot 12: Additional Feature / Key',
];

export default function CarDetailsModal({
  car,
  onClose,
  onSubmitInquiry,
  initialInquiryType = 'Inquiry',
}: CarDetailsModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // Inquiry Form State
  const [inquiryType, setInquiryType] = useState<'Inquiry' | 'Test Drive' | 'Finance Quote' | 'Trade-In'>(initialInquiryType);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Touch gesture state for hand swipes
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && car && car.images && car.images.length > 1) {
        setActiveImageIdx((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && car && car.images && car.images.length > 1) {
        setActiveImageIdx((prev) => (prev + 1) % car.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, car, onClose]);

  useEffect(() => {
    if (car) {
      setActiveImageIdx(0);
      setIsVideoMode((!car.images || car.images.length === 0) && Boolean(car.videoUrl));
    }
  }, [car]);

  if (!car) return null;

  const currentImages = car.images || [];

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?carId=${car.id}`;
    const shareData = {
      title: `${car.year ? `${car.year} ` : ''}${car.make} ${car.model} | Bako Cars`,
      text: `Check out this ${car.year ? `${car.year} ` : ''}${car.make} ${car.model} at Bako Cars of Abuja!`,
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

  const formatCurrency = (val: number) => {
    if (!val || val <= 0) return 'INQUIRE FOR PRICE';
    return '₦' + new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrevImage = () => {
    if (currentImages.length <= 1) return;
    setActiveImageIdx((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (currentImages.length <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % currentImages.length);
  };

  // Single Image Download
  const handleDownloadActiveImage = async (e: MouseEvent) => {
    e.stopPropagation();
    const activeUrl = currentImages[activeImageIdx];
    if (!activeUrl) return;

    setIsDownloadingSingle(true);
    try {
      const filename = `${car.year ? `${car.year}-` : ''}${car.make}-${car.model}-slot-${activeImageIdx + 1}.jpg`.replace(/[^a-zA-Z0-9.-]/g, '_');
      await downloadSingleImage(getImageUrl(activeUrl, 1600), filename);
    } catch (err) {
      console.error('Single image download failed:', err);
    } finally {
      setIsDownloadingSingle(false);
    }
  };

  // Multi-Image Download (ZIP Archive)
  const handleDownloadAllImages = async (e: MouseEvent) => {
    e.stopPropagation();
    if (currentImages.length === 0) return;

    setIsDownloadingAll(true);
    setDownloadProgress('Preparing...');
    try {
      await downloadAllVehicleImages(car, (current, total) => {
        setDownloadProgress(`Archiving ${current} of ${total}...`);
      });
      setDownloadProgress('Complete!');
      setTimeout(() => setDownloadProgress(''), 3000);
    } catch (err: any) {
      console.error('ZIP download failed:', err);
      setDownloadProgress('Failed');
      setTimeout(() => setDownloadProgress(''), 3000);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent, isLightbox = false) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    } else if (isLightbox && deltaY > 90 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      setIsLightboxOpen(false);
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitInquiry({
        carId: car.id,
        carName: `${car.year ? `${car.year} ` : ''}${car.make} ${car.model}`,
        fullName,
        phone: phoneNumber,
        email: emailAddress,
        inquiryType,
        message: inquiryMessage,
      });
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 600);
  };

  const waInquiryUrl = `https://wa.me/message/JCOUM7I4Z2XVB1?text=${encodeURIComponent(
    `Hello Bako Cars, I am interested in the ${car.year ? `${car.year} ` : ''}${car.make} ${car.model} (Stock #: ${car.stockNumber || car.id}). Please provide inspection details.`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Top Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-neutral-800/80 bg-neutral-900/80 z-20">
          <div className="flex items-center space-x-2">
            <span className="font-serif italic font-extrabold text-sm text-white tracking-wider">BAKO CARS</span>
            <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">&bull; ABUJA SHOWROOM</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={waInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-neutral-700 hover:border-emerald-500 bg-neutral-900 text-emerald-400 rounded transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              onClick={handleShare}
              className={`p-2 border rounded transition-colors space-x-1 flex items-center font-mono text-[10px] font-bold ${
                copied
                  ? 'bg-emerald-500 border-emerald-500 text-black'
                  : 'border-neutral-700 hover:border-white bg-neutral-900 text-white'
              }`}
              title="Share Vehicle"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Scroll Workspace */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-grow space-y-6">
          {/* Header Title Bar */}
          <div>
            <div className="font-mono text-[11px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-1">
              {car.year ? `${car.year} ` : ''}{car.make}
            </div>
            <h1 className="font-sans text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
              {car.model}
            </h1>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* LEFT COLUMN: Gallery & Vehicle Description */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Media Mode Switcher (if video exists) */}
              {car.videoUrl && (
                <div className="flex items-center space-x-2 pb-1 border-b border-white/10">
                  <button
                    onClick={() => setIsVideoMode(false)}
                    className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                      !isVideoMode
                        ? 'bg-white text-black font-extrabold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>PHOTO GALLERY ({currentImages.length})</span>
                  </button>
                  <button
                    onClick={() => setIsVideoMode(true)}
                    className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isVideoMode
                        ? 'bg-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-900 text-amber-400 border border-amber-500/30 hover:bg-neutral-800'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>MAIN VIDEO REEL</span>
                  </button>
                </div>
              )}

              {/* Main Media Viewport */}
              <div className="space-y-3">
                <div
                  className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 rounded-lg border border-neutral-800 group"
                  onClick={() => !isVideoMode && currentImages.length > 0 && setIsLightboxOpen(true)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={(e) => handleTouchEnd(e, false)}
                >
                  {/* Watermark in Top Right */}
                  <div className="absolute top-3 right-3 z-10 pointer-events-none select-none text-right">
                    <span className="font-serif italic font-extrabold text-[14px] text-black tracking-tight drop-shadow-sm block leading-none">
                      BAKO CARS
                    </span>
                    <span className="font-sans text-[8px] text-black font-extrabold uppercase tracking-[0.2em] block mt-0.5">
                      ABUJA
                    </span>
                  </div>

                  {(isVideoMode && car.videoUrl) ? (
                    <video
                      src={getVideoUrl(car.videoUrl)}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    >
                      <source src={getVideoUrl(car.videoUrl)} type="video/mp4" />
                      <source src={`/${encodeURIComponent(car.videoUrl)}`} type="video/mp4" />
                      <source src="/GLE%2053%20MAIN%20VIDEO.mp4" type="video/mp4" />
                    </video>
                  ) : currentImages.length > 0 ? (
                    <>
                      {/* Top Left Controls: Zoom, Single Download, Multi-Download */}
                      <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                          className="p-2 bg-black/80 hover:bg-black text-white rounded border border-white/20 transition-all backdrop-blur-sm cursor-pointer"
                          title="Fullscreen zoom"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={handleDownloadActiveImage}
                          disabled={isDownloadingSingle}
                          className="p-2 bg-black/80 hover:bg-black text-white rounded border border-white/20 transition-all backdrop-blur-sm cursor-pointer"
                          title="Download this high-resolution photo"
                        >
                          {isDownloadingSingle ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          ) : (
                            <Download className="w-4 h-4 text-white hover:text-amber-400 transition-colors" />
                          )}
                        </button>

                        <button
                          onClick={handleDownloadAllImages}
                          disabled={isDownloadingAll}
                          className="px-2.5 py-1.5 bg-black/80 hover:bg-black text-emerald-400 rounded border border-emerald-500/40 transition-all backdrop-blur-sm cursor-pointer flex items-center space-x-1 font-mono text-[9px] font-bold uppercase"
                          title="Download all vehicle photos as a ZIP archive"
                        >
                          {isDownloadingAll ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>{downloadProgress || 'PACKAGING...'}</span>
                            </>
                          ) : (
                            <>
                              <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
                              <span>DOWNLOAD ALL ({currentImages.length})</span>
                            </>
                          )}
                        </button>
                      </div>

                      <img
                        src={getImageUrl(currentImages[activeImageIdx] || currentImages[0], 1080)}
                        alt={`${car.make} ${car.model}`}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          handleImageFallback(e, currentImages[activeImageIdx] || currentImages[0]);
                        }}
                      />

                      {/* Navigation Arrows */}
                      {currentImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black text-white rounded-full border border-white/20 transition-colors backdrop-blur-sm cursor-pointer z-10"
                            aria-label="Previous Image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black text-white rounded-full border border-white/20 transition-colors backdrop-blur-sm cursor-pointer z-10"
                            aria-label="Next Image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    /* Showroom Empty State */
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-8 text-center space-y-3 select-none">
                      <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 shadow-lg">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="font-sans font-black text-white text-base sm:text-lg tracking-wider uppercase block">
                          Studio Photoshoot In Progress
                        </span>
                        <span className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase font-bold block mt-1">
                          Official Showroom Imagery Coming Soon
                        </span>
                        <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest max-w-sm mx-auto mt-2">
                          Contact our Abuja sales team via WhatsApp for real-time video inspection or walkaround.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* THE PHOTO THUMBNAILS GRID */}
                {!isVideoMode && currentImages.length > 1 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 px-0.5">
                      <span className="uppercase tracking-wider font-bold text-neutral-300">
                        GALLERY ({currentImages.length} PHOTOS)
                      </span>
                      <span className="hidden sm:inline text-neutral-500">
                        Click any photo to view in high resolution
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" id="image-thumbnails-wrapper">
                      {currentImages.map((img, index) => {
                        const slotLabel = DETAIL_SLOT_LABELS[index] || `Photo ${index + 1}`;
                        const isActive = index === activeImageIdx;

                        return (
                          <div
                            key={index}
                            className={`aspect-[16/10] rounded-md overflow-hidden border transition-all relative group cursor-pointer ${
                              isActive
                                ? 'border-sky-400 ring-2 ring-sky-400/50 bg-neutral-900 shadow-lg scale-[1.02]'
                                : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900 opacity-80 hover:opacity-100'
                            }`}
                            onClick={() => setActiveImageIdx(index)}
                            title={`View ${slotLabel}`}
                          >
                            <img
                              src={getImageUrl(img, 240)}
                              alt={slotLabel}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                handleImageFallback(e, img);
                              }}
                            />

                            <div className="absolute top-1 left-1 z-10">
                              <span className="bg-black/85 text-white text-[7px] font-mono px-1 rounded">
                                #{index + 1}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Photo Actions Bar: Multi-Image Download */}
                {!isVideoMode && currentImages.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-xs border-t border-neutral-800/80">
                    <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase">
                      PHOTO {activeImageIdx + 1} OF {currentImages.length}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Download Single Image */}
                      <button
                        type="button"
                        onClick={handleDownloadActiveImage}
                        disabled={isDownloadingSingle}
                        className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-white rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Download current photo to your device"
                      >
                        {isDownloadingSingle ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                        ) : (
                          <Download className="w-3 h-3 text-amber-400" />
                        )}
                        <span>DOWNLOAD PHOTO</span>
                      </button>

                      {/* Multi-Image Download (ZIP Archive) */}
                      <button
                        type="button"
                        onClick={handleDownloadAllImages}
                        disabled={isDownloadingAll}
                        className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 hover:text-white rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Download all high-resolution photos of this vehicle as a ZIP archive"
                      >
                        {isDownloadingAll ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                            <span className="text-emerald-400">{downloadProgress || 'PACKAGING...'}</span>
                          </>
                        ) : (
                          <>
                            <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
                            <span>DOWNLOAD ALL ({currentImages.length})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Description Container */}
              <div className="bg-[#121212] border border-neutral-800/80 rounded-lg p-5 sm:p-6 space-y-4">
                <h3 className="font-sans text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white border-b border-neutral-800 pb-3">
                  VEHICLE DESCRIPTION
                </h3>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed uppercase tracking-wider font-mono">
                  {car.description || `THIS ${car.year ? `${car.year} ` : ''}${car.make} ${car.model} DELIVERS A FOCUSED MIX OF PERFORMANCE, LUXURY, AND PRESENCE. AVAILABLE FOR IMMEDIATE INSPECTION AND NATIONWIDE DELIVERY IN NIGERIA.`}
                </p>

                {/* Highlights List */}
                {car.highlights && car.highlights.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/80">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-2 font-bold">
                      VERIFIED ATTRIBUTES & PACKAGES
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
                      {car.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="uppercase">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Specifications, Pricing & Lead Form */}
            <div className="lg:col-span-5 space-y-5">
              {/* Specification Card */}
              <div className="bg-[#121212] border border-neutral-800/80 rounded-lg p-5 sm:p-6 space-y-4">
                <h3 className="font-sans text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white border-b border-neutral-800 pb-3">
                  SPECIFICATION BRIEF
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">STOCK #</span>
                    <span className="font-bold text-white uppercase">{car.stockNumber || car.id}</span>
                  </div>
                  {car.year ? (
                    <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                      <span className="text-neutral-400 uppercase tracking-wider">YEAR</span>
                      <span className="font-bold text-white">{car.year}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">BODY STYLE</span>
                    <span className="font-bold text-white uppercase">{car.bodyType || 'SUV'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">POWERTRAIN</span>
                    <span className="font-bold text-white uppercase truncate max-w-[200px]" title={car.engine}>
                      {car.engine || 'High Performance'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">TRANSMISSION</span>
                    <span className="font-bold text-white uppercase">{car.transmission || 'Automatic'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">DRIVETRAIN</span>
                    <span className="font-bold text-white uppercase">{car.drivetrain || 'AWD'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">PHOTO GALLERY</span>
                    <span className="font-bold text-sky-400 uppercase">
                      {currentImages.length > 0 ? `${currentImages.length} PHOTOS` : 'COMING SOON'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 uppercase tracking-wider">SHOWROOM LOCATION</span>
                    <span className="font-bold text-white uppercase">{car.location || 'Abuja'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 uppercase tracking-wider">INSPECTION STATUS</span>
                    <span className="font-bold text-emerald-400 uppercase">VERIFIED IN STOCK</span>
                  </div>
                </div>

                {/* Investment Price Presentation */}
                <div className="pt-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                    TOTAL INVESTMENT VALUE
                  </span>
                  <div className="font-sans text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {formatCurrency(car.price)}
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 font-bold block mt-1 uppercase">
                    &bull; FULL NIGERIA CUSTOMS DUTY PAID &bull; VERIFIED TITLE
                  </span>
                </div>

                {/* Primary Action Button: INQUIRE ON WHATSAPP */}
                <div className="pt-2">
                  <a
                    href={waInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase py-3.5 px-4 rounded text-xs tracking-wider transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>INQUIRE ON WHATSAPP DIRECTLY</span>
                  </a>
                </div>
              </div>

              {/* Inquiry & Test Drive Form */}
              <div className="bg-[#121212] border border-neutral-800/80 rounded-lg p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <h3 className="font-sans text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white">
                    REQUEST PRIVATE CONCIERGE
                  </h3>
                  <span className="font-mono text-[9px] text-neutral-400 uppercase">ABUJA FLEET</span>
                </div>

                {submitSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                      INQUIRY LOGGED WITH BAKO CONCIERGE
                    </p>
                    <p className="font-mono text-[10px] text-neutral-400 uppercase">
                      Our desk will reach you on {phoneNumber} shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      {(['Inquiry', 'Test Drive', 'Finance Quote', 'Trade-In'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInquiryType(type)}
                          className={`py-2 px-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors cursor-pointer text-center ${
                            inquiryType === type
                              ? 'bg-white text-black border-white'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alhaji Ibrahim"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:border-white focus:outline-none text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                        PHONE NUMBER (WHATSAPP) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0816 733 2017"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:border-white focus:outline-none text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="vip@client.ng"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:border-white focus:outline-none text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                        INSPECTION NOTES / REQUESTS
                      </label>
                      <textarea
                        rows={2}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Request showroom inspection or specific vehicle questions..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:border-white focus:outline-none text-xs font-mono resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-sans font-black text-xs uppercase tracking-widest rounded transition-colors duration-200 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>TRANSMITTING...</span>
                        </>
                      ) : (
                        <span>SUBMIT PRIVATE REQUEST</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      <AnimatePresence>
        {isLightboxOpen && currentImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-2 sm:p-6"
            onClick={() => setIsLightboxOpen(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, true)}
          >
            <div className="relative max-w-7xl max-h-[95vh] w-full flex items-center justify-center">
              <img
                src={getImageUrl(currentImages[activeImageIdx] || currentImages[0], 2048)}
                alt={`${car.make} ${car.model}`}
                className="max-w-full max-h-[90vh] object-contain"
              />

              {/* Lightbox Controls */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  onClick={handleDownloadActiveImage}
                  className="p-2.5 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 transition-all cursor-pointer"
                  title="Download Photo"
                >
                  <Download className="w-5 h-5 text-amber-400" />
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2.5 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 transition-all cursor-pointer"
                  title="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-1.5 rounded-full border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider">
                Photo {activeImageIdx + 1} of {currentImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
