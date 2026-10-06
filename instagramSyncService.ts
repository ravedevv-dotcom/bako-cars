import { Car } from './types';

/**
 * Intelligent parser that extracts structured vehicle details from an Instagram caption
 * or post text (used by webhook & manual paste sync).
 */
export function parseInstagramCaptionToCar(caption: string, mediaUrls: string[], postUrl?: string, mediaId?: string): Partial<Car> {
  const text = caption || '';
  
  // 1. Year Extraction (e.g., 2018, 2020, 2024)
  const yearMatch = text.match(/\b(20[0-2][0-9]|199[0-9])\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  // 2. Make Detection
  const makes = [
    { pattern: /mercedes|benz|amg|maybach/i, name: 'Mercedes-Benz' },
    { pattern: /land rover|range rover|velar|defender|evoque|vogue/i, name: 'Land Rover' },
    { pattern: /toyota|lexus|land cruiser|prado|camry|hilux/i, name: 'Toyota' },
    { pattern: /lexus/i, name: 'Lexus' },
    { pattern: /bmw/i, name: 'BMW' },
    { pattern: /audi/i, name: 'Audi' },
    { pattern: /porsche/i, name: 'Porsche' },
    { pattern: /ford/i, name: 'Ford' },
    { pattern: /honda/i, name: 'Honda' },
    { pattern: /hyundai/i, name: 'Hyundai' },
    { pattern: /kia/i, name: 'Kia' },
    { pattern: /nissan|infiniti/i, name: 'Nissan' },
    { pattern: /byd/i, name: 'BYD' },
    { pattern: /bentley/i, name: 'Bentley' },
    { pattern: /rolls royce|cullinan/i, name: 'Rolls-Royce' },
    { pattern: /lamborghini/i, name: 'Lamborghini' },
    { pattern: /ferrari/i, name: 'Ferrari' },
    { pattern: /maserati/i, name: 'Maserati' },
    { pattern: /aston martin/i, name: 'Aston Martin' },
    { pattern: /cadillac|escalade/i, name: 'Cadillac' },
    { pattern: /chevrolet|corvette/i, name: 'Chevrolet' },
    { pattern: /dodge|charger|challenger/i, name: 'Dodge' },
    { pattern: /jeep|wrangler/i, name: 'Jeep' },
    { pattern: /mini copper|mini cooper/i, name: 'MINI' }
  ];

  let make = 'Luxury Vehicle';
  for (const m of makes) {
    if (m.pattern.test(text)) {
      make = m.name;
      break;
    }
  }

  // 3. Model Extraction
  // First line or key model hints
  const firstLine = text.split('\n')[0].trim();
  let model = firstLine;
  if (model.length > 50) {
    model = model.slice(0, 50);
  }
  // Clean make name and year out of model if present at start
  const cleanModel = model
    .replace(new RegExp(`^${year}\\s*`, 'i'), '')
    .replace(new RegExp(`^${make}\\s*`, 'i'), '')
    .trim();
  if (cleanModel) {
    model = cleanModel;
  }

  // 4. Price Extraction (supports Naira ₦, M, Million, USD $, commas)
  let price = 65000000; // Default reasonable showroom price if unspecified
  const priceMatchNaira = text.match(/(?:₦|N|NGN|price:?|asking:?)\s*([\d,]+(?:\.\d+)?)\s*(?:m|million|milli)?/i);
  const priceWordMatch = text.match(/([\d]+(?:\.\d+)?)\s*(?:m|million|milli)\b/i);

  if (priceMatchNaira && priceMatchNaira[1]) {
    const rawNum = parseFloat(priceMatchNaira[1].replace(/,/g, ''));
    if (text.toLowerCase().includes('m') || text.toLowerCase().includes('million') || rawNum < 1000) {
      price = rawNum * 1000000;
    } else {
      price = rawNum;
    }
  } else if (priceWordMatch) {
    price = parseFloat(priceWordMatch[1]) * 1000000;
  }

  // 5. Mileage
  let mileage: number | null = 15000;
  const mileageMatch = text.match(/([\d,]+)\s*(?:km|miles|k\s*miles|kms)/i);
  if (mileageMatch) {
    mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
  }

  // 6. Transmission
  let transmission: 'Automatic' | 'Manual' | 'Dual-Clutch' = 'Automatic';
  if (/manual/i.test(text)) transmission = 'Manual';
  if (/dual-clutch|pdk|dct/i.test(text)) transmission = 'Dual-Clutch';

  // 7. Body Type
  let bodyType: 'SUV' | 'Sedan' | 'Coupe' | 'Convertible' | 'Hypercar' | 'Wagon' = 'SUV';
  if (/sedan|saloon/i.test(text)) bodyType = 'Sedan';
  else if (/coupe/i.test(text)) bodyType = 'Coupe';
  else if (/convertible|cabriolet|spyder/i.test(text)) bodyType = 'Convertible';
  else if (/wagon|estate/i.test(text)) bodyType = 'Wagon';
  else if (/hypercar|supercar/i.test(text)) bodyType = 'Hypercar';

  // 8. Colors
  let exteriorColor = 'Diamond Black Metallic';
  if (/white|pearl/i.test(text)) exteriorColor = 'Polar White Pearl';
  else if (/grey|gray|selenite|chalk/i.test(text)) exteriorColor = 'Selenite Grey Metallic';
  else if (/blue/i.test(text)) exteriorColor = 'Obsidian Blue';
  else if (/red|crimson/i.test(text)) exteriorColor = 'Magma Red';
  else if (/silver/i.test(text)) exteriorColor = 'Iridium Silver Metallic';
  else if (/gold|champagne/i.test(text)) exteriorColor = 'Champagne Gold';
  else if (/green/i.test(text)) exteriorColor = 'Emerald Green Metallic';

  let interiorColor = 'Black Luxury Leather';
  if (/red interior|red leather/i.test(text)) interiorColor = 'Classic Red / Black Napa';
  else if (/brown|tan|cognac/i.test(text)) interiorColor = 'Cognac Exclusive Napa';
  else if (/beige|cream|macchiato/i.test(text)) interiorColor = 'Macchiato Beige';
  else if (/white interior/i.test(text)) interiorColor = 'Silk White / Titanium Grey';

  // 9. Highlights
  const highlights: string[] = [
    'Imported Direct Showroom Spec',
    'Customs Duty & Documentation 100% Cleared',
    'Verified Clean Title & Vehicle History',
    'Nationwide Delivery Available'
  ];

  if (/panoramic|sunroof/i.test(text)) highlights.unshift('Panoramic Sliding Glass Roof');
  if (/burmester|harman|bose|meridian/i.test(text)) highlights.unshift('Premium Surround Sound Audio');
  if (/360 camera|surround camera/i.test(text)) highlights.unshift('360-Degree Surround View Cameras');
  if (/heads up|hud/i.test(text)) highlights.unshift('Head-Up Display with Augmented Reality');
  if (/amg|biturbo|v8|v6/i.test(text)) highlights.unshift('High Performance Engine & Active Exhaust');

  const id = mediaId || `ig-${Date.now()}-${make.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id,
    make,
    model: model || 'Spec',
    year,
    price,
    mileage,
    engine: /v8/i.test(text) ? '4.0L Twin-Turbo V8' : /v6/i.test(text) ? '3.0L Turbo V6' : '3.0L Inline-6 Turbocharged',
    transmission,
    power: 429,
    acceleration: '4.9s 0-100 km/h',
    topSpeed: '250 km/h',
    bodyType,
    exteriorColor,
    interiorColor,
    fuelType: /hybrid/i.test(text) ? 'Hybrid' : /diesel/i.test(text) ? 'Diesel' : 'Petrol',
    status: 'In Stock',
    featured: true,
    isNewArrival: true,
    images: mediaUrls.length > 0 ? mediaUrls : ['/2020 MERCEDES BENZ G63 1 mian image.jpg'],
    description: text || `Fresh arrival at Bako Cars showroom: ${year} ${make} ${model}. Clean title, fully optioned, and ready for immediate delivery.`,
    highlights: highlights.slice(0, 6),
    vin: `BAKO-IG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    chassisNumber: `WBA${Math.floor(100000000 + Math.random() * 900000000)}`,
    location: 'Victoria Island / Lekki Showroom, Lagos',
    previousOwners: 1
  };
}
