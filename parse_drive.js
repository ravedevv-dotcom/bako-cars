const fs = require('fs');
const html = fs.readFileSync('drive_folder.html', 'utf8');

console.log('HTML size:', html.length);

const keywords = ['BMW', 'X5', 'BYD', 'QIN', 'WRANGLER', 'JEEP', '2025', '2022', '2013', 'ACCORD'];
keywords.forEach(k => {
  let count = 0;
  let pos = 0;
  while ((pos = html.toUpperCase().indexOf(k, pos)) !== -1) {
    count++;
    const snippet = html.substring(Math.max(0, pos - 60), Math.min(html.length, pos + 120));
    if (count <= 3) {
      console.log(`Snippet for ${k}:`, JSON.stringify(snippet));
    }
    pos += k.length;
  }
  console.log(`Keyword ${k}: ${count} occurrences`);
});
