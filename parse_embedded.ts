async function parseEmbedded() {
  const folderId = "16J5DKm-M9oOxMGXSioqn6HoZDVUl9OAR";
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`);
  const html = await res.text();
  
  // Extract all entry matches
  // <div class="flip-entry" id="entry-1a2b3c..."> ... <div class="flip-entry-title ...">filename.jpg</div>
  const entries: { id: string; name: string }[] = [];
  const regex = /id="entry-([a-zA-Z0-9_-]+)"[^>]*>.*?<div class="flip-entry-title[^"]*">([^<]+)<\/div>/gs;
  let match;
  while ((match = regex.exec(html)) !== null) {
    entries.push({ id: match[1], name: match[2].trim() });
  }

  console.log(`Parsed ${entries.length} entries!`);
  entries.forEach((e, idx) => {
    console.log(`${idx + 1}. [${e.id}] ${e.name}`);
  });
}

parseEmbedded();
