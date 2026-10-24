import fs from "fs";

// 1. Load new_drive_map.json
const newDriveMap = JSON.parse(fs.readFileSync("new_drive_map.json", "utf8"));
console.log("Loaded new_drive_map.json entries:", Object.keys(newDriveMap).length);

// 2. Load driveCdnMap.ts
const driveCdnContent = fs.readFileSync("driveCdnMap.ts", "utf8");

// Check how many items from newDriveMap are already in driveCdnMap
let alreadyIn = 0;
let newToAdd: Record<string, string> = {};
for (const [k, v] of Object.entries(newDriveMap)) {
  if (driveCdnContent.includes(`"${k}"`)) {
    alreadyIn++;
  } else {
    newToAdd[k] = v as string;
  }
}
console.log(`Already in driveCdnMap: ${alreadyIn}, New to add: ${Object.keys(newToAdd).length}`);
