/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';
import { getImageUrl, handleImageFallback } from './types';

export default function InstagramSection() {
  return (
    <section className="w-full bg-black py-12" id="instagram-brand-section">
      {/* INSTAGRAM account linking integration and brand visual title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT: Stacked title matching the "OUR INSTAGRAM" handwritten design - reduced scale */}
          <div className="lg:col-span-5 text-left space-y-2 relative">
            <div className="relative inline-block mt-2">
              <span className="font-display tracking-[0.2em] text-white/50 text-[10px] uppercase font-bold">
                CURATED BY
              </span>
              {/* Handwritten overlapping "Bako Cars" */}
              <span className="absolute -top-[23px] left-[78px] font-signature text-[40px] text-white/90 italic opacity-90 pointer-events-none whitespace-nowrap transform -rotate-2 select-none">
                Bako Cars
              </span>
            </div>

            <div className="flex flex-col">
              <h3 className="font-sans font-black tracking-widest text-2xl sm:text-3xl leading-none uppercase">
                <span className="text-sky-400 mr-2">OUR</span>
                <span className="text-white">INSTAGRAM</span>
              </h3>
              {/* Sky Blue Signature bar line */}
              <div className="h-[3px] bg-sky-400 w-28 mt-3" />
            </div>
          </div>

          {/* RIGHT: Clickable Instagram Account Widget Block matching original screen capture */}
          <div className="lg:col-span-7">
            <a
              href="https://www.instagram.com/bakocars_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-start justify-between gap-6 bg-[#090909] border border-white/10 p-6 sm:p-8 hover:bg-neutral-900/60 hover:border-white/20 transition-all duration-300 rounded-none w-full group relative"
              id="instagram-profile-widget"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full text-center sm:text-left">
                {/* 1. Glowing Stories Profile Avatar Frame with Bako Cars brand icon */}
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] transition-transform duration-300 group-hover:scale-105">
                    <div className="p-[1.5px] bg-black rounded-full">
                      <div className="w-[74px] h-[74px] rounded-full bg-black border border-white/10 overflow-hidden relative">
                        <img
                          src={getImageUrl('bakocars logo.jpg')}
                          alt="Bako Cars Logo"
                          className="w-full h-full object-cover object-center"
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            handleImageFallback(e, 'bakocars logo.jpg');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Username, Sub-text information, Stats and bio details */}
                <div className="flex-grow space-y-2.5">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                      <span className="font-sans font-extrabold tracking-wide text-white text-base sm:text-lg group-hover:text-sky-400 transition-colors">
                        bakocars_
                      </span>
                      {/* Verification blue emblem check mark */}
                      <div className="bg-[#0095f6] text-white rounded-full p-[2px] flex items-center justify-center w-4 h-4 shrink-0">
                        <svg viewBox="0 0 24 24" className="w-[10px] h-[10px] fill-current" stroke="currentColor" strokeWidth="4">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-white/60 tracking-wider font-medium mt-0.5">
                      IBakocars
                    </p>
                  </div>

                  {/* Verification Statistics counts */}
                  <div className="flex items-center justify-center sm:justify-start space-x-4 font-mono text-[10px] sm:text-[11px] tracking-wide text-white/40 uppercase">
                    <span>
                      <strong className="text-white font-sans mr-0.5 font-bold">1,271</strong> posts
                    </span>
                    <span>
                      <strong className="text-white font-sans mr-0.5 font-extrabold">14.5K</strong> followers
                    </span>
                    <span>
                      <strong className="text-white font-sans mr-0.5 font-bold">155</strong> following
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button styled as the original CTA button */}
              <div className="self-center sm:self-start shrink-0 pt-4 sm:pt-0">
                <div
                  className="px-5 py-3 border border-white/10 bg-black text-white hover:bg-white hover:text-black group-hover:border-white/30 group-hover:bg-white group-hover:text-black transition-all duration-300 text-[9px] font-mono font-bold uppercase tracking-[0.2em] w-full sm:w-auto text-center cursor-pointer"
                >
                  FOLLOW PAGE
                </div>
              </div>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
