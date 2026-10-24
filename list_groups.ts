import fs from "fs";

async function listAllGroups() {
  const folderId = "16J5DKm-M9oOxMGXSioqn6HoZDVUl9OAR";
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`);
  const html = await res.text();
  
  const entries: { id: string; name: string }[] = [];
  const regex = /id="entry-([a-zA-Z0-9_-]+)"[^>]*>.*?<div class="flip-entry-title[^"]*">([^<]+)<\/div>/gs;
  let match;
  while ((match = regex.exec(html)) !== null) {
    entries.push({ id: match[1], name: match[2].trim() });
  }

  const groups: Record<string, { id: string; name: string }[]> = {};
  for (const e of entries) {
    const bracketIdx = e.name.indexOf("[");
    const prefix = bracketIdx !== -1 ? e.name.substring(0, bracketIdx).trim() : e.name;
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(e);
  }

  console.log(`Total files: ${entries.length}, Total car prefixes: ${Object.keys(groups).length}`);
  const summary = Object.entries(groups).map(([k, v]) => ({ prefix: k, count: v.length }));
  console.log(JSON.stringify(summary, null, 2));

  // Save the complete mapping of filename -> id so we can merge it into driveCdnMap.ts!
  const cdnAdditions: Record<string, string> = {};
  for (const e of entries) {
    cdnAdditions[e.name] = e.id;
  }
  fs.writeFileSync("new_drive_map.json", JSON.stringify(cdnAdditions, null, 2));
  console.log("Saved new_drive_map.json with", Object.keys(cdnAdditions).length, "entries");
}

listAllGroups();
