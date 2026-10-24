import fs from "fs";

const newDriveMap = JSON.parse(fs.readFileSync("new_drive_map.json", "utf8"));
const driveCdnContent = fs.readFileSync("driveCdnMap.ts", "utf8");

const linesToAdd: string[] = [];
for (const [key, id] of Object.entries(newDriveMap)) {
  if (!driveCdnContent.includes(`"${key}"`)) {
    linesToAdd.push(`  ${JSON.stringify(key)}: ${JSON.stringify(id)},`);
  }
}

console.log("Lines to add to driveCdnMap:", linesToAdd.length);

const target = `  "🪙2014-mini-copper-country-man[9].jpg": "1bcgd6H8CeifHEKeiLfMDUSkN2wLJyujg"\n};`;
const replacement = `  "🪙2014-mini-copper-country-man[9].jpg": "1bcgd6H8CeifHEKeiLfMDUSkN2wLJyujg",\n` + linesToAdd.join("\n") + `\n};`;

if (!driveCdnContent.includes(target)) {
  console.log("Target not found!");
} else {
  const updated = driveCdnContent.replace(target, replacement);
  fs.writeFileSync("driveCdnMap.ts", updated, "utf8");
  console.log("Successfully updated driveCdnMap.ts!");
}
