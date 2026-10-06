/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreClick: () => void;
  onContactClick: () => void;
}

export default function Hero({ onExploreClick, onContactClick }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      video.play().catch(() => {});
    };

    playVideo();
    video.addEventListener('canplay', playVideo);
    video.addEventListener('loadeddata', playVideo);

    return () => {
      video.removeEventListener('canplay', playVideo);
      video.removeEventListener('loadeddata', playVideo);
    };
  }, []);

  return (
    <section className="relative h-[90vh] md:h-screen w-full bg-black overflow-hidden" id="hero-section">
      
      {/* 1. CINEMATIC LOOPING VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* Deep luxurious dark overlays & vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 to-black/90 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />
        
        <video
          ref={videoRef}
          src="/s63-hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center scale-100 bg-black"
          id="hero-background-video"
          style={{ filter: 'brightness(0.7) contrast(1.1) saturate(0.95)' }}
        >
          <source src="/s63-hero-video.mp4" type="video/mp4" />
          <source src="/s63-main-video.mp4" type="video/mp4" />
          <source src="/S63%20MAIN%20VIDEO.mp4" type="video/mp4" />
          <source src="/S63 MAIN VIDEO.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. DYNAMICAL WATERMARK BACKGROUND OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none" />

      {/* 3. HERO CONTENT OVERLAY */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pt-24 pb-14 sm:pb-20 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between relative">
          
          {/* Top spacer */}
          <div />

          {/* CENTER PANEL: Hero Typography Header & Action Triggers synced perfectly */}
          <div className="text-center space-y-6 max-w-2xl mx-auto pointer-events-auto">
            
            {/* Styled "WELCOME TO" subtitle */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-1"
            >
              <p className="text-[10px] sm:text-[12px] font-mono font-bold text-white/55 tracking-[0.5em] uppercase">
                WELCOME TO
              </p>
            </motion.div>

            {/* Core Titles matching "MOTOR CARS OF CHICAGO" in layout hierarchy */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="relative select-none"
            >
              {/* Huge bold display title */}
              <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-sans tracking-[0.05em] font-black text-white uppercase leading-none">
                BAKO CARS
              </h1>
              
              {/* Overlayed Signature text "by Bako" or "OF Nigeria" */}
              <div className="relative -mt-2 sm:-mt-4 mr-4 sm:mr-8">
                <span className="font-signature text-[32px] sm:text-[54px] md:text-[62px] text-sky-400 font-extralight block transform -rotate-3 leading-none italic select-none">
                  of Nigeria
                </span>
              </div>
            </motion.div>

            {/* Action buttons matching screenshot layout & borders perfectly */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
            >
              {/* Button A: Solid dark action with borders */}
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto bg-black/80 hover:bg-black border border-white/25 hover:border-sky-400 text-white font-sans font-extrabold text-[11px] sm:text-[12px] tracking-[0.25em] uppercase px-8 py-3.5 hover:text-sky-400 transition-all duration-300 rounded-none flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>BROWSE INVENTORY</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-white/60 group-hover:text-sky-400" />
              </button>

              {/* Button B: Distinct luxury high-contrast white button */}
              <button
                onClick={onContactClick}
                className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black font-sans font-extrabold text-[11px] sm:text-[12px] tracking-[0.25em] uppercase px-8 py-3.5 transition-all duration-300 rounded-none flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>SELL YOUR VEHICLE</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

          </div>

          {/* BOTTOM ROW: Description & Social shortcuts flanking left and right */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 pt-10 pointer-events-auto" id="hero-bottom-meta-tray">
            
            {/* Left corner showroom mission statements from screenshot */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="max-w-md text-left border-l-2 border-sky-400 pl-4 space-y-1"
            >
              <p className="font-mono text-[9px] sm:text-[10px] text-white/80 leading-relaxed tracking-wider uppercase">
                BAKO CARS OF NIGERIA OFFERS A CURATED SELECTION OF EXOTIC AND LUXURY VEHICLES, ALONG WITH BESPOKE CUSTOM BUILDS. FROM SUPERCARS TO REIMAGINED G-WAGONS, EVERY VEHICLE IS HAND SELECTED TO IMPRESS.
              </p>
            </motion.div>

            {/* Right corner floating vertical social links stacked precisely from screenshot */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex md:flex-col gap-2 relative shrink-0 z-30 mr-28 sm:mr-32 md:mr-0"
            >
              {/* Threads Icon Box */}
              <a
                href="https://www.threads.com/@bakocars_?xmt=AQG07HJ0ePjlGe-joG58PzkaeklhTkn4ijgP3i3vSmEOy_o"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-black/65 border border-white/10 flex items-center justify-center text-white/70 hover:text-sky-400 hover:border-sky-400/40 transition-all duration-300 rounded-none group"
                title="Threads"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 12c.5 0 .9-.2 1.2-.5.3-.3.5-.7.5-1.2 0-.5-.2-.9-.5-1.2s-.7-.5-1.2-.5-.9.2-1.2.5s-.5.7-.5 1.2c0 .5.2.9.5 1.2s.7.5 1.2.5z" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                </svg>
              </a>

              {/* Instagram Icon Box */}
              <a
                href="https://www.instagram.com/bakocars_/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-black/65 border border-white/10 flex items-center justify-center text-white/70 hover:text-sky-400 hover:border-sky-400/40 transition-all duration-300 rounded-none group"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </motion.div>

          </div>

        </div>
      </div>

    </section>
  );
}
