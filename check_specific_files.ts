import fs from "fs";

const newMap = JSON.parse(fs.readFileSync("new_drive_map.json", "utf8"));
const filenames = Object.keys(newMap);

// Check 2017 c43 and 2025 glc300 specifically
console.log("=== 2017 C43 ===");
filenames.filter(f => f.includes("c43")).forEach(f => console.log(f));

console.log("\n=== 2025 GLC300 ===");
filenames.filter(f => f.includes("2025-mercedes-benz-glc300")).forEach(f => console.log(f));
