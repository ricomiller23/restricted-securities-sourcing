// SEC EDGAR Background Synchronization Web Worker
// Synchronizes latest delisting notices and contacts off the main UI thread.

self.onmessage = async (e) => {
  const { type } = e.data || {};

  if (type === "START_SYNC") {
    try {
      // 1. First attempt same-origin /api/sync (zero CORS restriction)
      let syncedData = null;
      try {
        const proxyRes = await fetch("/api/sync");
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          if (json.success && Array.isArray(json.liveFetched)) {
            syncedData = json;
          }
        }
      } catch (proxyErr) {
        console.warn("[WORKER] /api/sync proxy failed, checking direct fallback:", proxyErr.message);
      }

      if (syncedData) {
        self.postMessage({
          type: "SYNC_SUCCESS",
          liveFetched: syncedData.liveFetched,
          contactMapCik: syncedData.contactMapCik || {},
          contactMapTicker: syncedData.contactMapTicker || {},
          timestamp: Date.now()
        });
        return;
      }

      // 2. Fallback to direct client fetch if proxy is not reachable
      let contactMapCik = {};
      let contactMapTicker = {};

      try {
        const cRes = await fetch("https://edgar-insider-scout.vercel.app/api/contacts");
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
        console.warn("[WORKER] Warning fetching contacts map:", err.message);
      }

      let liveFetched = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore && offset <= 10000) {
        try {
          const res = await fetch(`https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from=${offset}&dateRange=all&exchange=all`);
          if (res.ok) {
            const json = await res.json();
            const batch = json.data;
            if (Array.isArray(batch) && batch.length > 0) {
              liveFetched = [...liveFetched, ...batch];
              offset += batch.length;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } catch (err) {
          hasMore = false;
        }
      }

      self.postMessage({
        type: "SYNC_SUCCESS",
        liveFetched,
        contactMapCik,
        contactMapTicker,
        timestamp: Date.now()
      });
    } catch (err) {
      self.postMessage({
        type: "SYNC_ERROR",
        error: err.message
      });
    }
  }
};
