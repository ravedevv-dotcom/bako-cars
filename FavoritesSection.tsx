/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Trash2, Car as CarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Car } from './types';
import { SHOWROOM_VEHICLES } from './data';
import CarCard from './CarCard';

interface FavoritesSectionProps {
  favoriteCarIds: string[];
  onToggleFavorite: (carId: string) => void;
  onViewDetails: (car: Car) => void;
  onOpenPriceAlert?: (car: Car) => void;
  onExploreInventory: () => void;
}

export default function FavoritesSection({
  favoriteCarIds,
  onToggleFavorite,
  onViewDetails,
  onOpenPriceAlert,
  onExploreInventory,
}: FavoritesSectionProps) {
  const favoriteCars = SHOWROOM_VEHICLES.filter((car) => favoriteCarIds.includes(car.id));

  const handleClearAll = () => {
    favoriteCarIds.forEach((id) => onToggleFavorite(id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10" id="favorites-section-container">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-[9px] font-mono text-pink-400 tracking-[0.2em] uppercase bg-pink-950/40 px-3 py-1 border border-pink-500/30 mb-3">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>SAVED VEHICLE BOOKMARKS ({favoriteCars.length})</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-4xl font-black text-white tracking-[0.2em] uppercase">
            YOUR FAVOURITES
          </h2>
          <p className="text-white/60 text-xs sm:text-sm font-light max-w-xl mt-2 leading-relaxed uppercase tracking-wider">
            Quickly access and compare your saved vehicles without searching or scrolling down.
          </p>
        </div>

        {favoriteCars.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 px-4 py-2 bg-black border border-red-500/40 hover:border-red-500 text-red-400 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer self-start md:self-auto"
            id="clear-all-favorites-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR ALL FAVOURITES</span>
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {favoriteCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="favorites-grid">
          {favoriteCars.map((car) => (
            <div key={car.id} className="relative group">
              <CarCard
                car={car}
                onViewDetails={onViewDetails}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onOpenPriceAlert={onOpenPriceAlert}
              />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-black border border-white/10 rounded-none space-y-5 max-w-xl mx-auto glow"
          id="favorites-empty-state"
        >
          <div className="h-14 w-14 bg-white/5 border border-white/15 rounded-none flex items-center justify-center mx-auto text-pink-400">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold tracking-[0.2em] text-white uppercase">
              NO FAVOURITES BOOKMARKED YET
            </h3>
            <p className="text-[10px] font-mono text-white/50 mt-2 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
              Tap the heart icon on any vehicle in our showroom inventory to save it to your personal fleet list for instant access.
            </p>
          </div>
          <button
            onClick={onExploreInventory}
            className="px-6 py-3 bg-white hover:bg-white/90 text-black font-sans text-xs font-bold tracking-[0.2em] uppercase rounded-none transition-colors cursor-pointer shadow-lg inline-flex items-center space-x-2"
            id="fav-explore-inventory-btn"
          >
            <CarIcon className="w-4 h-4" />
            <span>EXPLORE SHOWROOM FLEET</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
