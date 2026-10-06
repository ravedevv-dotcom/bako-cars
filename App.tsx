/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, FilterState, Inquiry, getImageUrl, handleImageFallback } from './types';
import { SHOWROOM_VEHICLES } from './data';
import { subscribeToVehicles } from './inventoryStore';

// Component Imports
import Header from './Header';
import Hero from './Hero';
import InventoryFilters from './InventoryFilters';
import CarCard, { CarCardSkeleton } from './CarCard';
import CarDetailsModal from './CarDetailsModal';
import PriceAlertModal from './PriceAlertModal';
import FavoritesSection from './FavoritesSection';
import FinanceCalculator from './FinanceCalculator';
import TrustSection from './TrustSection';
import ContactSection from './ContactSection';
import InstagramSection from './InstagramSection';
import NewInventory from './NewInventory';
import BrandMarquee from './BrandMarquee';
import GleVideoShowcase from './GleVideoShowcase';
import AboutServicesMiniSection from './AboutServicesMiniSection';
import WhyChoose from './WhyChoose';
import FaqSection from './FaqSection';
import MapSection from './MapSection';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';
import ShowroomPhotoManagerModal from './ShowroomPhotoManagerModal';
import CloudPhotoManagerModal from './CloudPhotoManagerModal';

// Icons
import {
  Car as CarIcon,
  Camera,
  Phone,
  Clock,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  Disc,
  ArrowUpRight
} from 'lucide-react';

export default function App() {
  // Live showroom vehicles
  const [vehicles, setVehicles] = useState<Car[]>(SHOWROOM_VEHICLES);
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [selectedUploadCarId, setSelectedUploadCarId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('admin=photos') || window.location.search.includes('upload=photos'))) {
      setShowPhotoManager(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToVehicles((updatedList) => {
      setVehicles(updatedList);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Inventory bounds derived dynamically from database
  const minPrice = useMemo(() => {
    return Math.min(...vehicles.map((v) => v.price));
  }, [vehicles]);

  const maxPrice = useMemo(() => {
    return Math.max(...vehicles.map((v) => v.price));
  }, [vehicles]);

  // Filter matrix state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    make: 'All',
    bodyType: 'All',
    transmission: 'All',
    minPrice: minPrice,
    maxPrice: maxPrice,
    minYear: 2010,
    sortBy: 'price-desc',
  });

  // UI state managers
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [modalInquiryType, setModalInquiryType] = useState<'Inquiry' | 'Test Drive' | 'Finance Quote' | 'Trade-In'>('Inquiry');
  const [currentPage, setCurrentPage] = useState('hero'); // 'hero' | 'inventory' | 'favourites' | 'concierge' | 'contact'
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);

  // Favourites & Price Alert Engine States
  const [favoriteCarIds, setFavoriteCarIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bako_favorite_cars');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [priceAlertCar, setPriceAlertCar] = useState<Car | null>(null);

  const handleToggleFavorite = (carId: string) => {
    setFavoriteCarIds((prev) => {
      const updated = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];
      try {
        localStorage.setItem('bako_favorite_cars', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Comparison states
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([]);
  const isInventoryLoading = false;

  const handleToggleCompare = (carId: string) => {
    setComparedCarIds((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      }
      if (prev.length >= 4) {
        // Limit comparison pool to 4 to preserve pristine high-contrast layout grids
        return prev;
      }
      return [...prev, carId];
    });
  };

  const formatCurrency = (val: number) => {
    return '₦' + new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Car Details view trigger
  const handleViewCarDetails = (car: Car, inquiryType: 'Inquiry' | 'Test Drive' | 'Finance Quote' | 'Trade-In' = 'Inquiry') => {
    setModalInquiryType(inquiryType);
    setSelectedCar(car);
  };

  // Nav page changer
  const handleNavClick = (sectionId: string) => {
    const targetPage = sectionId === 'calculator' ? 'inventory' : sectionId;
    setCurrentPage(targetPage);
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  // Chatbot auto search and filter trigger
  const handleChatbotSearchAndFilter = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage('inventory');
    setTimeout(() => {
      const target = document.getElementById('inventory-grid') || document.getElementById('inventory-filters-container');
      if (target) {
        const yOffset = -100;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 120);
  };

  // High-precision keyword and automotive model search matcher
  const matchSmartVehicleSearch = (vehicle: typeof vehicles[0], rawSearch: string): boolean => {
    const query = rawSearch.trim().toLowerCase();
    if (!query) return true;

    const vehicleMake = (vehicle.make || '').toLowerCase();
    const vehicleModel = (vehicle.model || '').toLowerCase();
    const makeModel = `${vehicleMake} ${vehicleModel}`;
    const makeModelClean = makeModel.replace(/[^a-z0-9]/g, '');

    // Build comprehensive vehicle text profile
    const fullText = [
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.bodyType,
      vehicle.engine,
      vehicle.transmission,
      vehicle.fuelType,
      vehicle.exteriorColor,
      vehicle.interiorColor,
      vehicle.description,
      ...(vehicle.highlights || []),
      vehicle.location,
      vehicle.vin,
      vehicle.chassisNumber,
      vehicle.stockNumber,
    ].filter(Boolean).map(s => String(s).toLowerCase()).join(' ');

    // Normalize colloquial synonyms
    const normalizedQuery = query
      .replace(/\bmerc\b/g, 'mercedes')
      .replace(/\bbenz\b/g, 'mercedes')
      .replace(/\bbimmer\b|\bbeemer\b/g, 'bmw');

    // 1. Direct model code query (e.g. "e350", "e 350", "gle350", "gle 350", "c300", "c 300", "rx350", "es 350")
    // Ensures specific model searches like "e350" only return E350 cars, NEVER Lexus RX350 or GLE350
    const singleModelCode = normalizedQuery.match(/^([a-z]+)\s*(\d+)$/i);
    if (singleModelCode) {
      const prefix = singleModelCode[1];
      const number = singleModelCode[2];
      const wordBoundaryRegex = new RegExp(`(^|[^a-z0-9])${prefix}\\s*${number}([^a-z0-9]|$)`, 'i');
      return wordBoundaryRegex.test(makeModel) || wordBoundaryRegex.test(fullText);
    }

    // 2. Direct full substring match
    if (fullText.includes(normalizedQuery)) {
      return true;
    }

    // 3. Multi-token keyword search (every token entered must match)
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((token) => {
      // Check if token itself is a model code like "e350", "gle350", "rx350", "c300"
      const tokenModelCode = token.match(/^([a-z]+)(\d+)$/i);
      if (tokenModelCode) {
        const p = tokenModelCode[1];
        const n = tokenModelCode[2];
        const wbRegex = new RegExp(`(^|[^a-z0-9])${p}\\s*${n}([^a-z0-9]|$)`, 'i');
        return wbRegex.test(makeModel) || wbRegex.test(fullText);
      }

      // Single-letter token (e.g. "e", "c", "s", "m"): must match as isolated word boundary in make/model
      if (token.length === 1 && /[a-z]/i.test(token)) {
        const singleWb = new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`, 'i');
        return singleWb.test(makeModel);
      }

      // Direct token match in full text
      if (fullText.includes(token)) return true;

      // Alphanumeric stripped token match for longer words
      const cleanToken = token.replace(/[^a-z0-9]/g, '');
      if (cleanToken.length >= 3 && makeModelClean.includes(cleanToken)) return true;

      // Common feature synonyms
      if (token === 'awd' || token === '4wd') {
        return fullText.includes('4matic') || fullText.includes('awd') || fullText.includes('4wd');
      }
      if (token === 'auto') return fullText.includes('automatic');
      if (token === 'pano') return fullText.includes('panoramic');

      return false;
    });
  };

  // Core Filtering computations (Memoized for high efficiency)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Exclude sold vehicles from active showroom inventory search so users won't be confused
      if (vehicle.status === 'Sold') return false;

      // 1. Search term (Matches make, model, body type, transmission, year, colors, engine, or highlights)
      if (filters.search.trim()) {
        if (!matchSmartVehicleSearch(vehicle, filters.search)) return false;
      }

      // 2. Make
      if (filters.make !== 'All' && vehicle.make !== filters.make) return false;

      // 3. BodyType
      if (filters.bodyType !== 'All' && vehicle.bodyType !== filters.bodyType) return false;

      // 4. Transmission
      if (filters.transmission !== 'All' && vehicle.transmission !== filters.transmission) return false;

      // 5. Min Year
      if (vehicle.year < filters.minYear) return false;

      // 6. Max Price
      if (vehicle.price > filters.maxPrice) return false;

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'year-desc':
          return b.year - a.year;
        default:
          return b.price - a.price;
      }
    });
  }, [vehicles, filters, minPrice, maxPrice]);

  // Lead dispatch capture
  const handleInquirySubmit = (newInquiry: Omit<Inquiry, 'id' | 'dateSubmitted' | 'status'>) => {
    const fullInquiry: Inquiry = {
      ...newInquiry,
      id: `INQ-${Math.floor(100000 + Math.random() * 900000)}`,
      dateSubmitted: new Date().toISOString(),
      status: 'New',
    };
    setAllInquiries((prev) => [fullInquiry, ...prev]);
    console.log('Bako Private Lead Registered:', fullInquiry);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30 selection:text-white antialiased overflow-x-hidden ambient-glow flex flex-col justify-between">
      
      {/* Sticky Premium Header navbar */}
      <Header
        onNavClick={handleNavClick}
        activeSection={currentPage}
        totalInventoryCount={vehicles.length}
        favoritesCount={favoriteCarIds.length}
      />

      {/* Main Page Routing & Transition Body */}
      <div className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          {currentPage === 'hero' && (
            <motion.div
              key="page-hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Hero
                onExploreClick={() => handleNavClick('inventory')}
                onContactClick={() => handleNavClick('contact')}
              />
              <BrandMarquee />
              <InstagramSection />
              
              {/* Mini About Us & 4 Service Pillars (Sales, Trade, 40% Off Imports, Car Wash) */}
              <AboutServicesMiniSection
                onExploreInventory={() => handleNavClick('inventory')}
                onTradeInClick={() => handleNavClick('trade-in')}
                onContactClick={() => handleNavClick('contact')}
              />

              <NewInventory
                vehicles={vehicles}
                onViewDetails={(c) => handleViewCarDetails(c, 'Inquiry')}
                onGetApproved={(c) => handleViewCarDetails(c, 'Finance Quote')}
                onOpenPriceAlert={(c) => setPriceAlertCar(c)}
              />

              {/* GLE 53 AMG Showcase Video Section */}
              <GleVideoShowcase
                gleVehicle={vehicles.find((v) => v.id === 'mercedes-gle53-2022')}
                onViewSpecs={() => {
                  const gle = vehicles.find((v) => v.id === 'mercedes-gle53-2022');
                  if (gle) handleViewCarDetails(gle, 'Inquiry');
                }}
              />

              <WhyChoose />
              <FaqSection />
              <MapSection />
            </motion.div>
          )}

          {currentPage === 'inventory' && (
            <motion.div
              key="page-inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12"
            >
              <div className="text-center">
                <div className="inline-flex items-center space-x-1.5 text-[9px] font-mono text-white tracking-[0.2em] uppercase bg-white/10 px-3 py-1 border border-white/20 rounded-none mb-3">
                  <CarIcon className="w-3.5 h-3.5" />
                  <span>curated showroom fleet</span>
                </div>
                <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-[0.2em] uppercase">
                  THE BAKO EXOTIC INVENTORY
                </h2>
                <p className="text-white/60 text-xs sm:text-sm font-light max-w-xl mx-auto mt-4 leading-relaxed uppercase tracking-wider">
                  Explore our pristine collection. Handpicked prestige Mercedes-Benz couplings, performance-graded Toyotas, and other iconic driving exotics. No custom requests, just raw mechanical pedigree.
                </p>
              </div>

              {/* Filtering Workspace card */}
              <InventoryFilters
                filters={filters}
                setFilters={setFilters}
                minInventoryPrice={minPrice}
                maxInventoryPrice={maxPrice}
                resultsCount={filteredVehicles.length}
              />

              {/* FLEET SIDE-BY-SIDE COMPARE WORKSPACE PANEL */}
              {comparedCarIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-[#0d0d0d] border border-white/10 p-6 md:p-8 space-y-6 glow"
                  id="vehicle-comparison-workspace"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-widest uppercase">
                        FLEET SIDE-BY-SIDE COMPARISON
                      </h3>
                      <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mt-1">
                        Comparing {comparedCarIds.length} select {comparedCarIds.length === 1 ? 'exotic' : 'exotics'} of Bako Cars
                      </p>
                    </div>
                    <button
                      onClick={() => setComparedCarIds([])}
                      className="mt-3 sm:mt-0 font-mono text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-[0.2em] border border-white/10 hover:border-white px-3 py-1.5 transition-all"
                    >
                      Clear Comparison
                    </button>
                  </div>

                  {comparedCarIds.length < 2 ? (
                    <div className="text-center py-8 text-white/40 text-[10px] font-mono uppercase tracking-[0.15em]">
                      Select at least <span className="text-white font-bold">two exotics</span> using the "+ COMPARE" button on the car cards below to run side-by-side diagnostic specs.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse min-w-[650px]">
                        <thead>
                          <tr className="border-b border-white/15">
                            <th className="py-4 font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] w-[180px]">Specifications</th>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              if (!car) return null;
                              return (
                                <th key={carId} className="py-4 px-4 w-[280px]">
                                  <div className="space-y-3">
                                    <img
                                      src={getImageUrl(car.images[0], 400)}
                                      alt={car.model}
                                      className="w-full h-24 object-cover border border-white/10"
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        handleImageFallback(e, car.images[0]);
                                      }}
                                    />
                                    <div>
                                      <span className="font-mono text-[8px] text-white/40 block tracking-widest">{car.year} • {car.make}</span>
                                      <span className="font-display font-black text-xs sm:text-sm tracking-tight text-white block truncate">{car.model}</span>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[10px] text-white/95">
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Investment Value</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return (
                                <td key={carId} className="py-3 px-4 font-bold text-amber-400">
                                  {car ? formatCurrency(car.price) : '-'}
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Engine Power</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4">{car ? `${car.power} HP` : '-'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">0-60 MPH Speed</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4">{car ? car.acceleration : '-'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Customs Duty</td>
                            {comparedCarIds.map(carId => {
                              return (
                                <td key={carId} className="py-3 px-4 text-emerald-400 font-bold uppercase text-xs">
                                  PAID & CLEARED
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Power Plant</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4 text-xs font-sans text-white/80">{car ? car.engine : '-'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Top Velocity</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4">{car ? car.topSpeed : '-'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Drivetrain</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4 uppercase">{car ? car.transmission : '-'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Fuel System</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4 uppercase">{car ? car.fuelType : '-'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Showroom Location</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return <td key={carId} className="py-3 px-4 uppercase text-xs font-sans text-white/80">{car ? car.location : 'Abuja'}</td>;
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 text-white/40 font-mono text-[9px] uppercase tracking-wider">Performance Merits</td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              return (
                                <td key={carId} className="py-3 px-4 text-xs font-sans text-white/70">
                                  {car ? (
                                    <ul className="list-disc pl-4 space-y-1">
                                      {car.highlights.slice(0, 3).map((hl, i) => (
                                        <li key={i}>{hl}</li>
                                      ))}
                                    </ul>
                                  ) : '-'}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-t border-white/10">
                            <td className="py-4"></td>
                            {comparedCarIds.map(carId => {
                              const car = SHOWROOM_VEHICLES.find(c => c.id === carId);
                              if (!car) return null;
                              return (
                                <td key={carId} className="py-4 px-4">
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={() => handleViewCarDetails(car, 'Inquiry')}
                                      className="flex-1 bg-white hover:bg-white/85 text-black font-sans font-black text-[9px] uppercase tracking-[0.15em] py-2 transition-all text-center"
                                    >
                                      SPEC VIEW
                                    </button>
                                    <button
                                      onClick={() => setComparedCarIds(prev => prev.filter(id => id !== carId))}
                                      className="px-2.5 py-2 border border-white/10 hover:border-red-500 hover:text-red-500 text-white/50 font-sans text-[9px] uppercase tracking-[0.15em] transition-all"
                                    >
                                      REMOVE
                                    </button>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Grid display or Empty matching state */}
              {filteredVehicles.length > 0 ? (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  id="inventory-grid"
                >
                  {filteredVehicles.map((car) => (
                    <div key={car.id} id={`car-card-wrap-${car.id}`}>
                      <CarCard
                        car={car}
                        onViewDetails={(c) => handleViewCarDetails(c, 'Inquiry')}
                        isCompared={comparedCarIds.includes(car.id)}
                        onToggleCompare={handleToggleCompare}
                        isFavorite={favoriteCarIds.includes(car.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenPriceAlert={(c) => setPriceAlertCar(c)}
                        onUploadPhotos={(carId) => {
                          setSelectedUploadCarId(carId);
                          setShowPhotoManager(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                  <div
                    className="text-center py-20 bg-black border border-white/10 rounded-none space-y-4 max-w-xl mx-auto glow"
                    id="inventory-empty-state"
                  >
                    <div className="h-12 w-12 bg-white/10 border border-white/20 rounded-none flex items-center justify-center mx-auto text-white">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-sans text-xs font-bold tracking-[0.2em] text-white uppercase">ZERO MACHINES MATCHED</h3>
                      <p className="text-[10px] font-mono text-white/40 mt-1 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
                        We could not find active showroom fleet cars matching your filter parameters. Try pulling your price ceiling up, or selecting all builders.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setFilters({
                            search: '',
                            make: 'All',
                            bodyType: 'All',
                            transmission: 'All',
                            minPrice: minPrice,
                            maxPrice: maxPrice,
                            minYear: 2010,
                            sortBy: 'price-desc',
                          });
                        }}
                        className="px-5 py-2.5 bg-white hover:bg-white/90 text-black font-sans text-xs font-bold tracking-[0.2em] uppercase rounded-none transition-colors cursor-pointer"
                      >
                        RESET ALL SHOWROOM SEARCHES
                      </button>
                    </div>
                  </div>
                )}
            </motion.div>
          )}

          {currentPage === 'favourites' && (
            <motion.div
              key="page-favourites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
              <FavoritesSection
                favoriteCarIds={favoriteCarIds}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={(c) => handleViewCarDetails(c, 'Inquiry')}
                onOpenPriceAlert={(c) => setPriceAlertCar(c)}
                onExploreInventory={() => handleNavClick('inventory')}
              />
            </motion.div>
          )}

          {currentPage === 'concierge' && (
            <motion.div
              key="page-concierge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12"
            >
              <div className="text-center">
                <div className="inline-flex items-center space-x-1.5 text-[9px] font-mono text-white tracking-[0.2em] uppercase bg-white/10 px-3 py-1 border border-white/20 rounded-none mb-3">
                  <Award className="w-3.5 h-3.5 animate-pulse" />
                  <span>the bako luxury standard</span>
                </div>
                <h2 className="font-sans text-2xl sm:text-4xl font-black text-white tracking-[0.2em] uppercase">
                  ACQUISITIONS WITHOUT COMPROMISE
                </h2>
                <p className="text-white/60 text-xs sm:text-sm font-light max-w-xl mx-auto mt-4 leading-relaxed uppercase tracking-wider">
                  We operate exclusively in premium collectibles and low-mileage select models. Our focus is delivering pristine visual vehicles with fully authenticated maintenance timelines.
                </p>
              </div>

              <TrustSection />
            </motion.div>
          )}

          {currentPage === 'contact' && (
            <motion.div
              key="page-contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
              <ContactSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER CO-ORDINATES AND DISCLAIMERS */}
      <footer className="bg-black border-t border-white/10 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 mb-8 gap-6">
            
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 border border-white rounded-none flex items-center justify-center">
                <Disc className="w-4 h-4 text-white animate-spin duration-[15000ms]" />
              </div>
              <div>
                <span className="font-sans text-base font-black tracking-[0.2em] text-white">BAKO.CARS</span>
                <span className="block font-mono text-[8px] text-white/40 tracking-wider -mt-1 uppercase">NIGERIA SELECT EXOTICS</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono text-white/40 tracking-widest uppercase">
              <button onClick={() => handleNavClick('hero')} className="hover:text-white transition-colors cursor-pointer">HOME</button>
              <button onClick={() => handleNavClick('inventory')} className="hover:text-white transition-colors cursor-pointer">INVENTORY</button>
              <button onClick={() => handleNavClick('concierge')} className="hover:text-white transition-colors cursor-pointer">WHY BAKO</button>
              <button onClick={() => handleNavClick('contact')} className="hover:text-white transition-colors cursor-pointer">SHOWROOM DIRECTIONS</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[9px] font-mono text-white/30 leading-relaxed uppercase tracking-wider" id="footer-legals">
            <div>
              <p className="font-semibold text-white/50 mb-1">NIGERIA SHOWROOM LICENSE & PRIVILEGES</p>
              <p>
                &copy; {new Date().getFullYear()} Bako Cars Nigeria. All prestige assets shown are pre-owned or select dealer imports. Bako Cars does not do custom bespoke vehicle fabrications from factory. Vehicle stock is highly active and ex-showroom values do not bundle state tax, licensing fees, title, doc costs, or outbound transport coverage.
              </p>
            </div>
            <div className="flex md:justify-end items-end flex-col gap-2">
              <p className="md:text-right">
                INSPIRATION CREDITS &middot; styled with passion after Motor Cars of Nigeria.<br />
                Proudly serving Nigeria & worldwide exotic collectors.
              </p>
              <button
                onClick={() => setShowPhotoManager(true)}
                className="hover:text-white/80 transition-colors flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/30 cursor-pointer pt-1"
                title="Showroom Staff Media Manager"
              >
                <Camera className="w-3 h-3 text-sky-400/60" />
                <span>Showroom Photo Manager</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* SHOWROOM PHOTO MANAGER & LIVE CLOUD PUBLISHER */}
      {showPhotoManager && (
        <CloudPhotoManagerModal
          cars={vehicles}
          initialCarId={selectedUploadCarId}
          onClose={() => {
            setShowPhotoManager(false);
            setSelectedUploadCarId(undefined);
          }}
          onPhotosUpdated={() => {
            subscribeToVehicles((updated) => setVehicles(updated));
          }}
        />
      )}

      {/* IMMERSIVE MODAL OVERLAY SHEET FOR DETAILED VEHICLE VIEW */}
      <AnimatePresence>
        {selectedCar && (
          <CarDetailsModal
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
            onSubmitInquiry={handleInquirySubmit}
            initialInquiryType={modalInquiryType}
          />
        )}
      </AnimatePresence>

      {/* PRICE ALERT MODAL FOR INQUIRE VEHICLES */}
      <AnimatePresence>
        {priceAlertCar && (
          <PriceAlertModal
            car={priceAlertCar}
            onClose={() => setPriceAlertCar(null)}
          />
        )}
      </AnimatePresence>

      {/* BAKO DIRECT WHATSAPP VIP FLOATING ACTION BUTTON */}
      <WhatsAppFloatingButton />

    </div>
  );
}
