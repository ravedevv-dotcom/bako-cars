/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, Copy, Check, ExternalLink } from 'lucide-react';

export default function MapSection() {
  const [copied, setCopied] = useState(false);
  const addressText = "2FWF+FH2, behind Tsukunda House, Abuja 900103, Nigeria";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Tsukunda House, Abuja, Nigeria")}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full bg-black py-16 border-t border-white/5" id="location-map-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching other brand pages */}
        <div className="text-center sm:text-left mb-10 pb-4 border-b border-white/5 relative">
          <h2 className="font-sans font-black tracking-widest text-xl sm:text-2xl text-white uppercase relative inline-block">
            <span className="text-sky-400 mr-2">OUR</span> SHOWROOM
            <span className="absolute -bottom-4 left-0 h-[3px] bg-sky-400 w-20 block" />
          </h2>
          <p className="mt-2 text-white/40 font-mono text-[9px] tracking-[0.4em] uppercase">
            VISIT BAKO CARS PRESTIGE GALLERY
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Showroom coordinates and metadata details */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-8">
            <div className="space-y-6">
              
              {/* Brand Watermark / Title */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-sans font-extrabold tracking-widest text-white text-base sm:text-lg uppercase">
                    BAKO CARS
                  </h3>
                  <div className="h-[2px] bg-sky-400 w-12" />
                </div>
                {/* Visual signature watermark */}
                <div className="text-right select-none pointer-events-none opacity-40">
                  <span className="font-sans text-[6px] font-black text-white tracking-[0.2em] block uppercase">
                    SHOWROOM
                  </span>
                  <span className="font-signature text-[18px] text-white italic leading-none -mt-1 block transform -rotate-2">
                    by Bako
                  </span>
                </div>
              </div>

              {/* Coordinates List details */}
              <div className="space-y-5 pt-2">
                
                {/* 1. Address card */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 border border-white/10 bg-black text-sky-400 rounded-none shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-grow">
                    <p className="font-mono text-[9px] text-white/35 tracking-widest uppercase font-semibold">ADDRESS</p>
                    <p className="font-sans text-[12px] sm:text-[13px] text-white/90 leading-relaxed max-w-sm">
                      {addressText}
                    </p>
                  </div>
                </div>

                {/* 2. Opening hours */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 border border-white/10 bg-black text-sky-400 rounded-none shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] text-white/35 tracking-widest uppercase font-semibold">GALLERY HOURS</p>
                    <div className="font-sans text-[11px] sm:text-[12px] text-white/80 space-y-0.5">
                      <p className="flex justify-between w-48 font-mono">
                        <span className="text-white/50">MON - SAT:</span>
                        <span className="text-white font-medium">9AM – 7PM</span>
                      </p>
                      <p className="flex justify-between w-48 font-mono">
                        <span className="text-white/50">SUNDAYS:</span>
                        <span className="text-sky-400 font-bold tracking-wider">APPOINTMENT</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Direct dealer contacts */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 border border-white/10 bg-black text-sky-400 rounded-none shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] text-white/35 tracking-widest uppercase font-semibold">TELEPHONE</p>
                    <p className="font-mono text-[11px] text-white/95 tracking-wider">
                      07058099349 <span className="text-white/30">|</span> 08167332017
                    </p>
                  </div>
                </div>

                {/* 4. On-Stand Car Wash & Detailing Bay */}
                <div className="p-3.5 border border-emerald-500/30 bg-emerald-950/20 rounded-none space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <p className="font-sans font-extrabold text-[11px] text-white uppercase tracking-wider">
                      WANNA DETAIL OR WASH YOUR CAR?
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-emerald-200/70 uppercase leading-relaxed">
                    Our on-stand precision car wash & auto detailing bay is active behind Tsukunda House. Walk in for instant foam bath, interior deep clean & ceramic coat!
                  </p>
                </div>

              </div>

            </div>

            {/* Interactive navigation controls */}
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Copy address button with micro-animation indicator */}
                <button
                  onClick={copyAddress}
                  className="px-4 py-3 border border-white/10 bg-black text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-2 rounded-none cursor-pointer select-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>COPY ADDRESS</span>
                    </>
                  )}
                </button>

                {/* Open external directions trigger */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border border-white/10 bg-black text-white hover:bg-sky-400 hover:text-black hover:border-sky-400 transition-all duration-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-2 rounded-none text-center"
                >
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>DIRECTIONS</span>
                </a>

              </div>

              {/* Direct WhatsApp channel connection info box */}
              <a
                href="https://wa.me/message/JCOUM7I4Z2XVB1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 border border-white/5 bg-neutral-950 hover:bg-[#111] hover:border-white/10 transition-colors w-full group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-sans font-bold text-white text-[11px]">WHATSAPP DIGITAL CONCIERGE</p>
                    <p className="font-mono text-[9px] text-white/40 tracking-wide">CONNECT IN REAL-TIME FOR ENQUIRIES</p>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </div>

          </div>

          {/* RIGHT COLUMN: Highly precise Google Maps interactive iframe */}
          <div className="lg:col-span-7 bg-[#090909] border border-white/10 p-2 flex flex-col justify-between relative group overflow-hidden">
            <div className="w-full h-[320px] sm:h-full min-h-[320px] relative overflow-hidden bg-neutral-950">
              <iframe
                title="Bako Cars Showroom Map"
                src="https://maps.google.com/maps?q=Tsukunda%20House,%20Abuja,%20Nigeria&t=m&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.1) brightness(0.85)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              
              {/* Glassmorphic minimalist styling elements */}
              <div className="absolute top-4 left-4 bg-black/80 border border-white/10 px-3 py-1.5 backdrop-blur-md flex items-center space-x-2 select-none pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span className="font-mono text-[8px] tracking-widest text-white/90 uppercase font-black">
                  BAKO CARS ABUJA HQ
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
