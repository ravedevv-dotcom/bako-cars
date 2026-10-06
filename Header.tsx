/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Phone, Navigation, Disc, Menu, X, Car as CarIcon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onNavClick: (section: string) => void;
  activeSection: string;
  totalInventoryCount: number;
  favoritesCount?: number;
}

export default function Header({
  onNavClick,
  activeSection,
  totalInventoryCount,
  favoritesCount = 0,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'favourites', label: 'Favourites', count: favoritesCount },
    { id: 'concierge', label: 'Why Bako' },
    { id: 'contact', label: 'Visit Showroom' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 h-20 flex items-center ${
          scrolled
            ? 'glass border-b border-white/10 shadow-lg backdrop-blur-lg bg-black/60'
            : 'bg-transparent border-b border-white/5'
        }`}
        id="app-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between w-full">
            {/* Logo with perfect breathing room */}
            <button
              onClick={() => {
                onNavClick('hero');
                setMobileMenuOpen(false);
              }}
              className="group flex items-baseline gap-1.5 text-left cursor-pointer transition-opacity hover:opacity-85"
              id="header-logo-btn"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">BAKO</span>
              <span className="text-xl sm:text-2xl font-light text-white/50 tracking-[0.25em] uppercase">CARS</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12 lg:space-x-16 text-[11px] uppercase tracking-[0.3em] font-medium ml-auto mr-12 lg:mr-20" id="desktop-nav">
              {navItems.map((item) => (
                <button
                   key={item.id}
                   onClick={() => onNavClick(item.id)}
                   className={`transition-all duration-300 py-1.5 cursor-pointer hover:text-white ${
                     activeSection === item.id ? 'text-white border-b border-white font-bold' : 'text-white/50'
                   }`}
                   id={`nav-link-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Actions Panel */}
            <div className="hidden md:flex items-center space-x-3" id="header-desktop-actions">
              <button
                onClick={() => onNavClick('favourites')}
                className={`px-4 py-2 border text-[10px] tracking-[0.2em] uppercase font-bold cursor-pointer transition-all duration-300 flex items-center space-x-1.5 ${
                  activeSection === 'favourites'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'border-white/20 hover:border-red-500 text-white/90 hover:text-white bg-transparent'
                }`}
                id="header-favourites-btn"
                title="View Saved Favourites"
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'fill-current text-red-500' : 'text-white/60'}`} />
                <span>FAVOURITES {favoritesCount > 0 ? `(${favoritesCount})` : ''}</span>
              </button>

              <button
                onClick={() => onNavClick('contact')}
                className="px-6 py-2 border border-white/20 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-white hover:text-black cursor-pointer text-white transition-all duration-300"
                id="header-inquiry-btn"
              >
                Inquiry
              </button>
            </div>

            {/* Hamburger Button for Mobile */}
            <div className="flex md:hidden items-center" id="mobile-nav-toggle-container">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 border border-white/10 rounded-none bg-black text-white hover:text-white/80 focus:outline-none transition-colors"
                id="mobile-menu-btn"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Hamburger Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
              id="mobile-menu-backdrop"
            />

            {/* Sidebar Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-[#090909] border-l border-white/10 z-50 p-6 flex flex-col justify-between shadow-2xl md:hidden"
              id="mobile-menu-drawer"
            >
              <div className="space-y-8">
                {/* Drawer Header logo & close */}
                <div className="flex items-center justify-between pb-6 border-b border-white/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black tracking-tighter text-white">BAKO</span>
                    <span className="text-base font-light text-white/50 tracking-wider">CARS</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 border border-white/10 hover:border-white text-white/60 hover:text-white transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Drawer Links */}
                <nav className="flex flex-col space-y-5">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavClick(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left font-sans text-xs sm:text-sm tracking-[0.25em] uppercase py-2 cursor-pointer transition-colors ${
                        activeSection === item.id
                          ? 'text-white font-bold border-l-2 border-sky-400 pl-3'
                          : 'text-white/60 hover:text-white hover:pl-1 transition-all'
                      }`}
                      id={`mobile-nav-link-${item.id}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    onNavClick('inventory');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-[9px] font-mono text-white transition-colors uppercase tracking-[0.16em]"
                >
                  <div className="flex items-center space-x-2">
                    <CarIcon className="w-3.5 h-3.5 text-white/70" />
                    <span>SHOWROOM INVENTORY</span>
                  </div>
                  <span className="bg-white text-black text-[8px] px-1.5 py-0.5 font-bold">
                    {totalInventoryCount} LIVE
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNavClick('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-black font-sans font-bold text-[10px] tracking-[0.2em] uppercase py-3.5 text-center transition-opacity hover:opacity-90"
                >
                  INQUIRE / CALL NOW
                </button>

                <div className="text-center font-mono text-[8px] text-white/30 tracking-widest pt-2 uppercase">
                  ABUJA, NIGERIA • SINCE 2020
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
