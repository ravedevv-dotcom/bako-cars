/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Car, RefreshCw, Globe, Sparkles, MessageCircle, ArrowUpRight, ShieldCheck, Tag } from 'lucide-react';

interface AboutServicesMiniSectionProps {
  onExploreInventory?: () => void;
  onTradeInClick?: () => void;
  onContactClick?: () => void;
}

export default function AboutServicesMiniSection({
  onExploreInventory,
  onTradeInClick,
  onContactClick,
}: AboutServicesMiniSectionProps) {
  const waUrl = "https://wa.me/message/JCOUM7I4Z2XVB1?text=" + encodeURIComponent("Hello Bako Cars, I want to inquire about your vehicle sales, trade-in, 40% discount vehicle importation, or on-stand car wash & detailing services.");

  const services = [
    {
      id: 'sales',
      number: '01',
      title: 'WE SELL PRESTIGE CARS',
      subtitle: 'VERIFIED SHOWROOM FLEET',
      description: 'Handpicked exotic Mercedes-Benz, performance Toyotas, Range Rovers, and luxury sports cars with full paid customs duties and verified titles.',
      icon: Car,
      accent: 'border-white/20 hover:border-white',
      badge: 'DUTY PAID',
      actionText: 'BROWSE INVENTORY',
      onClick: onExploreInventory,
    },
    {
      id: 'trade',
      number: '02',
      title: 'TRADE & VEHICLE UPGRADE',
      subtitle: 'INSTANT FAIR APPRAISALS',
      description: 'Upgrade your current machine with zero hassle. We offer market-leading valuations, transparent vehicle exchanges, and rapid ownership transfer.',
      icon: RefreshCw,
      accent: 'border-white/20 hover:border-sky-400',
      badge: 'SAME-DAY DEAL',
      actionText: 'TRADE-IN INQUIRY',
      onClick: onTradeInClick,
    },
    {
      id: 'import',
      number: '03',
      title: 'DIRECT VEHICLE IMPORTATION',
      subtitle: 'USA • EUROPE • DUBAI • CANADA',
      description: 'Custom vehicle procurement from global auctions and verified premier dealers straight to Abuja with express customs clearance and door-to-door delivery.',
      icon: Globe,
      accent: 'border-sky-400/60 hover:border-sky-400 ring-1 ring-sky-400/20',
      badge: '🔥 40% OFF IMPORT PROMO',
      badgeClass: 'bg-sky-500 text-black font-black animate-pulse',
      actionText: 'CLAIM 40% IMPORT DEAL',
      isPromo: true,
      onClick: onContactClick,
    },
    {
      id: 'carwash',
      number: '04',
      title: 'ON-STAND CAR WASH & DETAILING',
      subtitle: 'PRECISION AUTO SPA AT THE GALLERY',
      description: 'Visit our stand behind Tsukunda House for executive hand wash, interior leather rejuvenation, ceramic protection, and showroom mirror-finish detailing.',
      icon: Sparkles,
      accent: 'border-white/20 hover:border-emerald-400',
      badge: 'ON-SITE STAND',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      actionText: 'BOOK AUTO DETAILING',
      onClick: onContactClick,
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-black via-[#080808] to-black py-14 border-t border-b border-white/10 relative overflow-hidden" id="about-bako-services-mini">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-sky-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Header Title with Signature Accent */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold text-sky-400 tracking-[0.3em]">
                THE COMPLETE AUTOMOTIVE ECOSYSTEM
              </span>
              <span className="w-8 h-[1px] bg-sky-400" />
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
              <h2 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-wider uppercase">
                WHAT WE DO AT BAKO CARS
              </h2>
              <span className="font-signature text-2xl sm:text-3xl text-sky-400 italic transform -rotate-2 select-none">
                Abuja Premier Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[11px] font-bold tracking-widest uppercase px-4 py-2.5 transition-all shadow-lg"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>DIRECT DESK CHAT</span>
            </a>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className={`relative bg-[#0b0b0b] border ${service.accent} p-6 flex flex-col justify-between transition-all duration-300 hover:bg-[#111111] group shadow-xl ${
                  service.isPromo ? 'bg-gradient-to-b from-[#0b131b] to-[#0a0a0a]' : ''
                }`}
                id={`service-card-${service.id}`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon + Number / Promo Badge */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 bg-black border ${service.isPromo ? 'border-sky-400 text-sky-400' : 'border-white/20 text-white'} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className={`font-mono text-[9px] uppercase px-2 py-0.5 tracking-wider inline-block ${
                        service.badgeClass || 'bg-white/10 text-white/80 border border-white/15'
                      }`}>
                        {service.badge}
                      </span>
                    </div>
                  </div>

                  {/* Main Title and Subtitle */}
                  <div>
                    <span className="font-mono text-[8px] text-white/40 tracking-[0.25em] block uppercase">
                      {service.subtitle}
                    </span>
                    <h3 className="font-sans font-black text-base text-white uppercase tracking-wide mt-1 group-hover:text-sky-300 transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="font-mono text-[11px] text-white/60 uppercase tracking-wide leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-6 border-t border-white/10 mt-5">
                  <button
                    onClick={() => {
                      if (service.onClick) {
                        service.onClick();
                      } else {
                        window.open(waUrl, '_blank');
                      }
                    }}
                    className="w-full flex items-center justify-between font-sans text-[10px] font-extrabold tracking-widest text-white/70 group-hover:text-white uppercase transition-colors text-left cursor-pointer"
                  >
                    <span>{service.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-sky-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
