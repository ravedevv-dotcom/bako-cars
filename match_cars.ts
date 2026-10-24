import { GOOGLE_DRIVE_IMAGE_CDN } from "./driveCdnMap";

const cars = [
  "E350", "MDX", "LANDCRUISER", "CAMRY", "GLC300", "C43", "CHALLENGER", "CLA45",
  "ELANTRA", "IS250", "C300", "ES350", "CERATO", "C63S", "HILUX", "GLA250", "COROLLA", "CHANGAN", "CS75"
];

const allImageNames = Object.keys(GOOGLE_DRIVE_IMAGE_CDN);
console.log("Total images in GOOGLE_DRIVE_IMAGE_CDN:", allImageNames.length);

for (const c of cars) {
  const matches = allImageNames.filter(name => name.toUpperCase().includes(c));
  console.log(`Car "${c}": ${matches.length} images found in driveCdnMap`);
  if (matches.length > 0) {
    console.log("  Sample:", matches.slice(0, 5));
  }
}
