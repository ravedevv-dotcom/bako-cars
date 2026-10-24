async function testEndpoints() {
  const folderId = "16J5DKm-M9oOxMGXSioqn6HoZDVUl9OAR";
  const endpoints = [
    "https://drive.google.com/drive/u/0/batchexecute",
    "https://drive.google.com/_/DriveUi/data/batchexecute",
    "https://drive.google.com/drive/u/0/_/DriveUi/data/batchexecute",
    "https://drive.google.com/_/DriveUi/data/batchexecute?rpcids=aZljm",
    "https://drive.google.com/drive/folders/" + folderId + "/batchexecute"
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: "f.req=%5B%5B%5B%22aZljm%22%2C%22%5B%5D%22%2Cnull%2C%22generic%22%5D%5D%5D"
      });
      console.log(`Endpoint ${ep} status: ${res.status}`);
      const txt = await res.text();
      console.log(`Length: ${txt.length}, snippet:`, txt.substring(0, 80));
    } catch (e: any) {
      console.log(`Error ${ep}:`, e.message);
    }
  }
}

testEndpoints();
