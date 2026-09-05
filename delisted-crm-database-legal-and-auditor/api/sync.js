// Vercel Serverless Function: /api/sync
// Bypasses browser CORS barriers and fetches latest SEC EDGAR delisted issuers and contacts server-side.

export default async function handler(req, res) {
  // Enable CORS headers so it can be called safely
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept": "application/json"
    };

    // 1. Fetch Contact Intelligence (Legal counsel, executive officers, emails, phones)
    let contactMapCik = {};
    let contactMapTicker = {};

    try {
      const cRes = await fetch("https://edgar-insider-scout.vercel.app/api/contacts", { headers });
      if (cRes.ok) {
        const cJson = await cRes.json();
        if (cJson.data && Array.isArray(cJson.data)) {
          cJson.data.forEach((c) => {
            if (c.cik) contactMapCik[String(c.cik).replace(/^0+/, "")] = c;
            if (c.ticker) contactMapTicker[String(c.ticker).toUpperCase().trim()] = c;
          });
        }
      }
    } catch (err) {
      console.warn("[API/SYNC] Warning fetching contact map:", err.message);
    }

    // 2. Fetch all Delisted Issuers with Dynamic Pagination (No 1,704 cap)
    let liveFetched = [];
    let seenIds = new Set();
    let offset = 0;
    let hasMore = true;

    while (hasMore && offset <= 10000) {
      try {
        const url = `https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from=${offset}&dateRange=all&exchange=all`;
        const sRes = await fetch(url, { headers });
        if (sRes.ok) {
          const sJson = await sRes.json();
          const batch = sJson.data || [];
          if (Array.isArray(batch) && batch.length > 0) {
            batch.forEach((item) => {
              const id = item.id || `${item.cik}_${item.delistDate || ""}`;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                liveFetched.push(item);
              }
            });
            offset += batch.length;
            if (batch.length === 0) hasMore = false;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (err) {
        console.warn(`[API/SYNC] Error fetching batch at offset ${offset}:`, err.message);
        hasMore = false;
      }
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      success: true,
      totalCount: liveFetched.length,
      contactCount: Object.keys(contactMapCik).length,
      timestamp: Date.now(),
      liveFetched,
      contactMapCik,
      contactMapTicker
    });

  } catch (error) {
    console.error("[API/SYNC] Critical Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
}
