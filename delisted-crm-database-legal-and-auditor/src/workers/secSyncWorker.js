// SEC EDGAR Background Synchronization Web Worker
// Processes thousands of SEC filings off the main UI thread to guarantee 60fps silky smooth scrolling.

self.onmessage = async (e) => {
  const { type, existingCiks = [] } = e.data || {};

  if (type === "START_SYNC") {
    try {
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
        console.warn("[WORKER] Warning fetching contacts map:", err);
      }

      let liveFetched = [];
      let offset = 0;
      const batchSize = 500;
      let hasMore = true;

      while (hasMore && offset <= 5000) {
        try {
          const res = await fetch(`https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from=${offset}&dateRange=all&exchange=all`);
          if (res.ok) {
            const json = await res.json();
            const batch = json.data;
            if (Array.isArray(batch) && batch.length > 0) {
              liveFetched = [...liveFetched, ...batch];
              offset += batch.length;
              if (batch.length < batchSize) hasMore = false;
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
