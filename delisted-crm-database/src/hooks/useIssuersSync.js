import { useState, useEffect } from "react";
import { ALL_GLOBAL_ISSUERS } from "../data/global_issuers_seed";

const LOCAL_STORAGE_KEY = "DELISTED_CRM_DATABASE_V11_GLOBAL";
const LAST_SYNC_KEY = "DELISTED_CRM_LAST_SYNC_TIMESTAMP";
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * TOCA Custom Hook: useIssuersSync
 * Isolates local storage hydration, state mutation, 24-hour sync lifecycle,
 * and non-destructive data population from visual JSX components.
 */
export function useIssuersSync() {
  const [issuers, setIssuers] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed loading local storage CRM state:", e);
    }
    return ALL_GLOBAL_ISSUERS;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issuers));
    } catch (e) {
      console.error("Failed saving CRM state to local storage:", e);
    }
  }, [issuers]);

  // Live Auto-Sync with Non-Destructive Data Population & Enrichment
  const triggerLiveSync = async () => {
    setIsSyncing(true);
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
      } catch (e) {
        console.error("Error fetching live contacts map:", e);
      }

      let liveFetched = [];
      let offset = 0;
      const batchSize = 500;
      let hasMore = true;

      // Dynamically paginate until all available upstream records are fetched
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
        } catch (e) {
          console.error(`Error fetching signals at offset ${offset}:`, e);
          hasMore = false;
        }
      }

      if (liveFetched.length > 0) {
        setIssuers((prev) => {
          const existingMap = new Map();
          prev.forEach(item => {
            const key = String(item.cik || item.id || "").replace(/^0+/, "");
            if (key) existingMap.set(key, { ...item });
          });

          const newItems = [];

          liveFetched.forEach((item) => {
            const normCik = String(item.cik || "").replace(/^0+/, "");
            if (!normCik) return;

            const ticker = (item.ticker || "OTC").toUpperCase().trim();
            const cMatch = contactMapCik[normCik] || contactMapTicker[ticker] || {};

            const rawLegal = cMatch.legal_counsel;
            const legalCounsel = (rawLegal && rawLegal.trim() && !["none", "null", "not available"].includes(rawLegal.toLowerCase())) 
              ? rawLegal.trim() 
              : "Not Available";

            const rawEmail = cMatch.email;
            const email = (rawEmail && !rawEmail.startsWith("ir@") && !rawEmail.startsWith("contact@") && rawEmail.includes("@")) 
              ? rawEmail 
              : "Not Available";

            const rawPhone = cMatch.phone;
            const phone = (rawPhone && rawPhone.trim().length >= 7) ? rawPhone.trim() : "Not Available";

            const rawCeo = cMatch.ceo || cMatch.contact_name;
            const ceo = (rawCeo && rawCeo !== item.companyName && rawCeo.trim().length > 2) ? rawCeo.trim() : "Not Available";

            if (existingMap.has(normCik)) {
              // Non-destructive enrichment: populate newly discovered contacts without overwriting user status/notes
              const current = existingMap.get(normCik);
              if ((!current.email || current.email === "Not Available") && email !== "Not Available") {
                current.email = email;
              }
              if ((!current.phone || current.phone === "Not Available") && phone !== "Not Available") {
                current.phone = phone;
              }
              if ((!current.ceo || current.ceo === "Not Available") && ceo !== "Not Available") {
                current.ceo = ceo;
              }
              if ((!current.legalCounsel || current.legalCounsel === "Not Available") && legalCounsel !== "Not Available") {
                current.legalCounsel = legalCounsel;
              }
              if (!current.details && item.details) {
                current.details = item.details;
              }
              existingMap.set(normCik, current);
            } else {
              // Newly discovered issuer
              newItems.push({
                id: item.id || `live-${item.cik}`,
                region: item.region || "US",
                cik: item.cik,
                companyName: item.companyName || "Unknown Issuer",
                ticker: ticker,
                delistDate: item.delistDate || new Date().toISOString().slice(0, 10),
                form: item.form || "15-12G",
                exchange: item.exchange || "Delisted → OTC",
                eventType: item.eventType || "Delisting Notice",
                secLandingPage: item.secLandingPage || `https://www.sec.gov/edgar/searchedgar/companysearch?CIK=${item.cik}`,
                secFullText: item.secFullText || "",
                location: item.location || "United States",
                email: email,
                phone: phone,
                ceo: ceo,
                cfo: "Not Available",
                otcProfileUrl: ticker && ticker !== "OTC" ? `https://www.otcmarkets.com/stock/${ticker}/profile` : "https://www.otcmarkets.com",
                legalCounsel: legalCounsel,
                status: "new",
                cleanShellScore: legalCounsel !== "Not Available" ? 88 : 72,
                shellRating: legalCounsel !== "Not Available" ? "Prime Clean Shell" : "Standard Distressed Asset",
                notes: [],
                activities: [],
                details: item.details || "Delisted issuer filing."
              });
            }
          });

          // Recombine enriched existing issuers and new items
          const updatedExisting = prev.map(item => {
            const key = String(item.cik || item.id || "").replace(/^0+/, "");
            return existingMap.get(key) || item;
          });

          return [...newItems, ...updatedExisting];
        });
      }

      try {
        localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
      } catch (e) {}
    } catch (err) {
      console.error("Live EDGAR sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 24-Hour Automated Synchronization Lifecycle
  useEffect(() => {
    const checkAndSync = () => {
      try {
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        const now = Date.now();
        if (!lastSync || now - parseInt(lastSync, 10) >= SYNC_INTERVAL_MS) {
          triggerLiveSync();
        }
      } catch (e) {
        triggerLiveSync();
      }
    };

    checkAndSync();
    // Hourly heartbeat check to trigger when 24-hour window arrives
    const timer = setInterval(checkAndSync, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    issuers,
    setIssuers,
    isSyncing,
    triggerLiveSync
  };
}
