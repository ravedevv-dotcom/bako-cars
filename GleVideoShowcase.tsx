import React, { useRef, useEffect } from 'react';
import { Sparkles, ChevronRight, Eye } from 'lucide-react';
import { Car } from './types';

interface GleVideoShowcaseProps {
  gleVehicle?: Car;
  onViewSpecs: () => void;
}

export default function GleVideoShowcase({ gleVehicle, onViewSpecs }: GleVideoShowcaseProps) {
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
    <section className="w-full bg-black py-16 border-t border-b border-white/10 relative overflow-hidden" id="gle-video-showcase-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-[9px] font-mono text-white tracking-[0.2em] uppercase bg-white/10 px-3 py-1 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>CINEMATIC MOTORING FEATURE</span>
            </div>
            <h2 className="font-sans text-2xl sm:text-4xl font-black text-white tracking-[0.15em] uppercase">
              2022 MERCEDES-BENZ GLE 53 AMG
            </h2>
            <p className="text-white/50 font-mono text-[10px] tracking-widest uppercase">
              4MATIC+ · 429 HP AMG ENHANCED INLINE-6 TURBO · OBSIDIAN BLACK
            </p>
          </div>

          <button
            onClick={onViewSpecs}
            className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-sans text-xs font-black tracking-[0.2em] uppercase flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer group"
          >
            <Eye className="w-4 h-4 text-black" />
            <span>VIEW COMPLETE SPECS</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Cinematic Video Container */}
        <div className="relative w-full aspect-video sm:aspect-[21/9] overflow-hidden bg-black border border-white/15 shadow-2xl pointer-events-none select-none">
          <video
            ref={videoRef}
            src="/gle53-showcase-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center bg-black"
          >
            <source src="/gle53-showcase-video.mp4" type="video/mp4" />
            <source src="/gle53-main-video.mp4" type="video/mp4" />
            <source src="/GLE%2053%20MAIN%20VIDEO.mp4" type="video/mp4" />
            <source src="/GLE 53 MAIN VIDEO.mp4" type="video/mp4" />
          </video>

          {/* Quick Watermark Tag in Corner */}
          <div className="absolute top-4 left-4 z-20">
            <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] uppercase bg-black/60 px-2.5 py-1 border border-white/10 backdrop-blur-sm">
              BAKO CINEMATICS · 4K 60FPS
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
