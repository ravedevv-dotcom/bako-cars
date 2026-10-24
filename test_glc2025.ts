import fs from "fs";
import { Car } from "./types";
import { getDriveImageUrl } from "./driveCdnMap";

const newDriveMap: Record<string, string> = JSON.parse(fs.readFileSync("new_drive_map.json", "utf8"));
const allFileNames = Object.keys(newDriveMap);

function getFilesForPrefix(prefix: string): string[] {
  const matches = allFileNames.filter(f => f.startsWith(prefix));
  matches.sort((a, b) => {
    const aIsMain = a.toLowerCase().includes("main image") || a.toLowerCase().includes("main img");
    const bIsMain = b.toLowerCase().includes("main image") || b.toLowerCase().includes("main img");
    if (aIsMain && !bIsMain) return -1;
    if (!aIsMain && bIsMain) return 1;
    return a.localeCompare(b);
  });
  return matches;
}

// Split 2025 GLC300
const glc2025All = allFileNames.filter(f => f.startsWith("2025-mercedes-benz-glc300"));
const glc2025Black = glc2025All.filter(f => f.includes("black exterior and black interioir"));
glc2025Black.sort((a, b) => {
  const aIsMain = a.toLowerCase().includes("main image");
  const bIsMain = b.toLowerCase().includes("main image");
  if (aIsMain && !bIsMain) return -1;
  if (!aIsMain && bIsMain) return 1;
  return a.localeCompare(b);
});

const glc2025Other = glc2025All.filter(f => !f.includes("black exterior and black interioir"));
glc2025Other.sort((a, b) => {
  const aIsMain = a.toLowerCase().includes("main image");
  const bIsMain = b.toLowerCase().includes("main image");
  if (aIsMain && !bIsMain) return -1;
  if (!aIsMain && bIsMain) return 1;
  return a.localeCompare(b);
});

console.log("glc2025Black count:", glc2025Black.length, "main:", glc2025Black[0]);
console.log("glc2025Other count:", glc2025Other.length, "main:", glc2025Other[0]);
