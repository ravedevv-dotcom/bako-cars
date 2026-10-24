async function groupEntries() {
  const folderId = "16J5DKm-M9oOxMGXSioqn6HoZDVUl9OAR";
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`);
  const html = await res.text();
  
  const entries: { id: string; name: string }[] = [];
  const regex = /id="entry-([a-zA-Z0-9_-]+)"[^>]*>.*?<div class="flip-entry-title[^"]*">([^<]+)<\/div>/gs;
  let match;
  while ((match = regex.exec(html)) !== null) {
    entries.push({ id: match[1], name: match[2].trim() });
  }

  // Group by car name prefix
  const groups: Record<string, { id: string; name: string }[]> = {};
  for (const e of entries) {
    // extract prefix before [
    const bracketIdx = e.name.indexOf("[");
    const prefix = bracketIdx !== -1 ? e.name.substring(0, bracketIdx).trim() : e.name;
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(e);
  }

  console.log("Total groups (cars):", Object.keys(groups).length);
  for (const [prefix, files] of Object.entries(groups)) {
    console.log(`\n=== CAR: "${prefix}" (${files.length} images) ===`);
    files.forEach(f => console.log(`  - [${f.id}] ${f.name}`));
  }
}

groupEntries();
