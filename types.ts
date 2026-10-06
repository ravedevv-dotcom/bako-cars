import React from 'react';
import { getDriveImageUrl } from './driveCdnMap';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  mileage: number | null;
  engine: string;
  transmission: 'Automatic' | 'Manual' | 'PDK' | 'Dual-Clutch';
  power: number;
  acceleration: string;
  topSpeed: string;
  bodyType: 'Coupe' | 'Sedan' | 'SUV' | 'Convertible' | 'Hypercar' | 'Wagon' | 'Truck';
  exteriorColor: string;
  interiorColor: string;
  fuelType: 'Petrol' | 'Hybrid' | 'Electric' | 'Diesel';
  status: 'In Stock' | 'Reserved' | 'Sold' | 'Incoming';
  featured: boolean;
  isNewArrival?: boolean;
  videoUrl?: string;
  drivetrain?: string;
  images: string[];
  description: string;
  highlights: string[];
  vin: string;
  chassisNumber: string;
  stockNumber?: string;
  location: string;
  previousOwners: number;
}

export interface FilterState {
  search: string;
  make: string;
  bodyType: string;
  transmission: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  sortBy: 'price-asc' | 'price-desc' | 'year-desc';
}

export interface Inquiry {
  id?: string;
  carId?: string;
  carName?: string;
  inquiryType?: 'Inquiry' | 'Test Drive' | 'Finance Quote' | 'Trade-In';
  type?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  preferredContact?: 'Phone' | 'Email' | 'WhatsApp';
  message: string;
  tradeInVehicle?: string;
  dateSubmitted?: string;
  status?: 'New' | 'Contacted' | 'Closed';
}

export function getImageUrl(path: string | undefined | null, width: number = 720): string {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop';
  }
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  let cleanPath = path.trim();
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }

  // Videos should never go through the image thumbnail CDN
  if (/\.(mp4|webm|mov|m4v|ogg)$/i.test(cleanPath)) {
    return '/' + encodeURIComponent(cleanPath).replace(/%2F/g, '/');
  }

  // Check if there is a direct Google Drive CDN hosted version
  const driveCdn = getDriveImageUrl(cleanPath, width);
  if (driveCdn) {
    return driveCdn;
  }

  return '/' + encodeURIComponent(cleanPath).replace(/%2F/g, '/');
}

export function getVideoUrl(path: string | undefined | null): string {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return '/gle53-showcase-video.mp4';
  }
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  let cleanPath = path.trim();
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }

  if (cleanPath.toLowerCase().includes('s63')) {
    return '/s63-hero-video.mp4';
  }
  if (cleanPath.toLowerCase().includes('gle')) {
    return '/gle53-showcase-video.mp4';
  }

  return '/' + encodeURIComponent(cleanPath).replace(/%2F/g, '/');
}

export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  _originalPath?: string
) {
  const img = e.currentTarget;
  const retry = parseInt(img.dataset.retryCount || '0', 10);

  // If a googleusercontent LH3 link failed, try Google Drive direct thumbnail
  if (retry === 0) {
    img.dataset.retryCount = '1';
    const driveMatch = img.src.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      img.src = `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w800`;
      return;
    }
  }

  // Fallback to high-performance CDN placeholder so cards never look broken
  if (retry < 2) {
    img.dataset.retryCount = '2';
    img.src = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop';
  }
}
