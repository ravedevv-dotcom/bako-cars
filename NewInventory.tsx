/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Share2, ChevronLeft, ChevronRight, Check, Bell, MessageCircle } from 'lucide-react';
import { Car, getImageUrl, handleImageFallback } from './types';
import { SHOWROOM_VEHICLES } from './data';

interface NewInventoryProps {
  onViewDetails: (car: Car) => void;
  onGetApproved: (car: Car) => void;
  onOpenPriceAlert?: (car: Car) => void;
  vehicles?: Car[];
}

export default function NewInventory({ onViewDetails, onGetApproved, onOpenPriceAlert, vehicles = SHOWROOM_VEHICLES }: NewInventoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Popular Listings - strictly the 5 requested vehicles in exact order
  const TARGET_INVENTORY_IDS = [
    'mercedes-g63-2020',
    'range-rover-velar-black-2020',
    'mercedes-gle53-2022',
    'mercedes-s63-2015',
    'range-rover-velar-2020',
  ];

  const NEW_ARRIVALS: Car[] = TARGET_INVENTORY_IDS
    .map((id) => vehicles.find((car) => car.id === id) || SHOWROOM_VEHICLES.find((car) => car.id === id))
    .filter((car): car is Car => car !== undefined);

  const getCustomTransmissionDisplay = (car: Car) => {
    if (car.id === 'mercedes-e63s-2020') return '9-SPEED SHIFTABLE AU';
    if (car.id === 'honda-s2000-2001') return '6 SPEED MANUAL';
    if (car.id === 'rolls-royce-wraith-2018') return '8-SPEED SHIFTABLE AU';
    return car.transmission.toUpperCase();
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollOffset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const shareCar = (car: Car, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Check out this pristine ${car.year} ${car.make} ${car.model} at Bako Cars!`;
    navigator.clipboard.writeText(`${window.location.origin}/?car=${car.id}`);
    setCopiedId(car.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (val: number) => {
    return '₦' + new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="w-full bg-black py-12" id="new-inventory-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title with correct Bottom light blue accent line */}
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
          <div className="space-y-2">
            <h2 className="font-sans font-black tracking-widest text-xl sm:text-2xl text-white uppercase relative inline-block">
              POPULAR LISTINGS
              {/* Thin blue underline bar spanning exactly under the heading */}
              <span className="absolute -bottom-4 left-0 h-[3px] bg-sky-400 w-24 block" />
            </h2>
          </div>

          {/* Navigation buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 border border-white/10 hover:border-white/40 text-white/60 hover:text-white bg-neutral-900 transition-all rounded-none cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 border border-white/10 hover:border-white/40 text-white/60 hover:text-white bg-neutral-900 transition-all rounded-none cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel container with beautiful horizontal scrollbar */}
        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          {NEW_ARRIVALS.map((car) => (
            <div
              key={car.id}
              className="shrink-0 w-[290px] sm:w-[325px] snap-start bg-[#090909] border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* 1. Image block with Watermark */}
              <div 
                onClick={() => onViewDetails(car)}
                className="relative aspect-[4/3] w-full overflow-hidden bg-black border-b border-white/10 cursor-pointer"
              >
                <img
                  src={getImageUrl(car.images[0], 540)}
                  alt={`${car.make} ${car.model}`}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    handleImageFallback(e, car.images[0]);
                  }}
                />

                {/* Watermark overlay "Bako Cars" */}
                <div className="absolute top-3 right-3 select-none pointer-events-none text-right">
                  <span className="font-serif italic font-extrabold text-[13px] text-black tracking-tight drop-shadow-sm block leading-none">
                    BAKO CARS
                  </span>
                  <span className="font-sans text-[7.5px] text-black font-extrabold uppercase tracking-[0.2em] block mt-0.5">
                    ABUJA
                  </span>
                </div>

                {/* 12-Photo Slot Badge */}
                <div className="absolute top-3 left-3 select-none pointer-events-none">
                  <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white font-mono text-[8.5px] font-bold uppercase rounded border border-white/10">
                    {car.images.length > 0 ? `${car.images.length}/12 PHOTOS` : '12 SLOTS READY'}
                  </span>
                </div>
              </div>

              {/* 2. Specs detail presentation area */}
              <div 
                onClick={() => onViewDetails(car)}
                className="p-5 flex-grow cursor-pointer"
              >
                {/* Year Model Make heading */}
                <h3 className="font-mono text-[10px] tracking-widest text-white/45 uppercase leading-tight font-semibold">
                  {car.year} {car.make}
                </h3>
                {/* Highlight text title */}
                <h4 className="font-sans text-[12px] sm:text-[13px] font-black text-white hover:text-sky-400 transition-colors uppercase tracking-wider mt-1.5 line-clamp-1">
                  {car.model}
                </h4>

                {/* Monospaced tabular specifications rows */}
                <div className="mt-5 space-y-1.5 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                  <div className="flex justify-between border-b border-white/[0.03] pb-1">
                    <span>DUTY</span>
                    <span className="text-emerald-400 font-medium">PAID & CLEARED</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-1">
                    <span>STOCK #</span>
                    <span className="text-white font-medium">{car.stockNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-1">
                    <span>TRANSMISSION</span>
                    <span className="text-white font-medium truncate max-w-[160px]">{getCustomTransmissionDisplay(car)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-1">
                    <span>DRIVETRAIN</span>
                    <span className="text-white font-medium">{car.drivetrain?.toUpperCase() || 'AWD'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>FUEL TYPE</span>
                    <span className="text-white font-medium">{car.fuelType.toUpperCase()}</span>
                  </div>
                </div>

                {/* Investment Price Display */}
                <div className="mt-5 font-sans font-black text-lg sm:text-xl text-white tracking-wider flex items-center justify-between">
                  <div>
                    {car.price && car.price > 0 ? (
                      formatCurrency(car.price)
                    ) : (
                      <span className="text-xs font-mono text-emerald-400">INQUIRE FOR PRICE</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => shareCar(car, e)}
                    className="p-1.5 border border-white/10 hover:border-white text-white/60 hover:text-white transition-colors"
                    title="Share link"
                  >
                    {copiedId === car.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 3. Action Button - INQUIRE ON WHATSAPP */}
              <div className="p-5 pt-0">
                <a
                  href={`https://wa.me/message/JCOUM7I4Z2XVB1?text=${encodeURIComponent(
                    `Hello Bako Cars, I am interested in the ${car.year} ${car.make} ${car.model} (Stock #: ${car.stockNumber}). Please send details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-black text-[10px] uppercase tracking-[0.15em] py-2.5 transition-colors duration-300 flex items-center justify-center space-x-1.5 cursor-pointer block text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>INQUIRE ON WHATSAPP</span>
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
