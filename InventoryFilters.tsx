/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, RotateCcw, Clock, ArrowRight } from 'lucide-react';
import { FilterState } from './types';

interface InventoryFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  minInventoryPrice: number;
  maxInventoryPrice: number;
  resultsCount: number;
}

const MAX_BUDGET_CEILING = 500000000; // 500 Million Naira

const QUICK_TAGS = ['Mercedes', 'Lexus', 'Toyota', 'CLS 550', 'RX 350', 'V8', 'AMG', 'Sedan', 'SUV', 'Coupe'];

export default function InventoryFilters({
  filters,
  setFilters,
  minInventoryPrice,
  resultsCount,
}: InventoryFiltersProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bako_recent_searches');
      return saved ? JSON.parse(saved) : ['Mercedes', 'GLE 450', 'AMG'];
    } catch {
      return ['Mercedes', 'GLE 450', 'AMG'];
    }
  });

  const scrollToResults = () => {
    setTimeout(() => {
      const target = document.getElementById('inventory-grid') || document.getElementById('inventory-filters-container');
      if (target) {
        const yOffset = -100;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 80);
  };

  const addRecentSearchAndTrigger = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, 4);
        try {
          localStorage.setItem('bako_recent_searches', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }
    scrollToResults();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecentSearchAndTrigger(filters.search);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      make: 'All',
      bodyType: 'All',
      transmission: 'All',
      minPrice: minInventoryPrice,
      maxPrice: MAX_BUDGET_CEILING,
      minYear: 2010,
      sortBy: 'price-desc',
    });
  };

  return (
    <div className="glass shadow-2xl rounded-none p-5 sm:p-6 mb-10 glow border border-white/10" id="inventory-filters-container">
      {/* Universal Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <label htmlFor="inventory-search-input" className="sr-only">Search Showroom Fleet</label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="inventory-search-input"
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-black border border-white/15 rounded-none text-base text-white placeholder-white/40 transition-colors focus:border-white focus:ring-1 focus:ring-white/20 font-sans tracking-wide"
              placeholder="Type model, make, trim or spec (e.g., GLE, Mercedes, V8, Coupe, Camry)..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRecentSearchAndTrigger(filters.search);
                }
              }}
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-black font-sans text-xs font-black tracking-[0.2em] uppercase rounded-none transition-all cursor-pointer flex items-center justify-center space-x-2 shrink-0 shadow-lg"
            id="search-action-btn"
          >
            <span>SEARCH FLEET</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Tags & Recent Searches */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2" id="quick-search-tags">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider flex items-center space-x-1 mr-1">
              <Clock className="w-3 h-3 text-white/40" />
              <span>POPULAR SEARCHES:</span>
            </span>

            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFilters({ ...filters, search: tag });
                  addRecentSearchAndTrigger(tag);
                }}
                className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-all cursor-pointer rounded-none uppercase tracking-wider border ${
                  filters.search.toLowerCase() === tag.toLowerCase()
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 hover:bg-white/15 border-white/15 text-white/80 hover:text-white'
                }`}
                id={`quick-tag-${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">SORT:</span>
            <select
              id="inventory-sort-select"
              className="appearance-none bg-black border border-white/15 px-3 py-1 text-[10px] font-mono text-white/80 uppercase tracking-wider cursor-pointer focus:border-white/40"
              value={filters.sortBy}
              onChange={(e) => {
                setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] });
              }}
            >
              <option value="price-desc">PRICE: HIGH TO LOW</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="year-desc">YEAR: NEWEST FIRST</option>
            </select>
          </div>
        </div>
      </form>

      {/* Results Bar & Clear Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 mt-4 border-t border-white/10 gap-3">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-ping" />
          <span className="text-xs font-mono text-white/60 tracking-wider uppercase">
            MATCHING <span className="text-white font-bold">{resultsCount}</span> VEHICLES FOUND
          </span>
        </div>

        {filters.search && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer tracking-wider uppercase"
            id="filters-reset-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CLEAR SEARCH ({filters.search})</span>
          </button>
        )}
      </div>
    </div>
  );
}
