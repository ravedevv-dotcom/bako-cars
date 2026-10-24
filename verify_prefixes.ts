import fs from "fs";
import { GOOGLE_DRIVE_IMAGE_CDN } from "./driveCdnMap";
import { Car } from "./types";

const newDriveMap: Record<string, string> = JSON.parse(fs.readFileSync("new_drive_map.json", "utf8"));
const allFileNames = Object.keys(newDriveMap);

function getFilesForPrefix(prefix: string): string[] {
  const matches = allFileNames.filter(f => f.startsWith(prefix));
  // Sort so that "main image" is first
  matches.sort((a, b) => {
    const aIsMain = a.toLowerCase().includes("main image") || a.toLowerCase().includes("main img");
    const bIsMain = b.toLowerCase().includes("main image") || b.toLowerCase().includes("main img");
    if (aIsMain && !bIsMain) return -1;
    if (!aIsMain && bIsMain) return 1;
    return a.localeCompare(b);
  });
  return matches;
}

console.log("Checking prefix images:");
const prefixes = [
  "2014-mercedes-benz-e350",
  "2017-acura-mdx",
  "2026-brand-new-toyota-landcruiser-vxr",
  "good-deal‼️2016-toyota-camry-se-keyless",
  "2020-mercedes-benz-glc300",
  "2023-mercedes-benz-c43",
  "2021-mercedes-benz-glc300",
  "2018-dodge-challenger",
  "good-deal‼️2022-mercedes-benz-glc300",
  "2015-mercedes-benz-cla45",
  "2011-hyundai-elantra",
  "good-deal-❗️❗️❗️🪙2015-lexus-is250-f-sport",
  "2015-mercedes-benz-c300-different-on-still-add",
  "2025-mercedes-benz-glc300",
  "2017-mercedes-benz-c43",
  "2017-lexus-es350",
  "2023-mercedes-benz-glc300",
  "2013-kia-cerato",
  "2016-mercedes-benz-c63s",
  "brandnew-2026-toyota-hilux",
  "2020-mercedes-benz-gla250",
  "2024-toyota-corolla-se",
  "2026-brandnew-changan-cs75-pro",
  "2013-bmw-520i"
];

for (const p of prefixes) {
  const files = getFilesForPrefix(p);
  console.log(`Prefix "${p}": ${files.length} files. Main: ${files[0]}`);
}
