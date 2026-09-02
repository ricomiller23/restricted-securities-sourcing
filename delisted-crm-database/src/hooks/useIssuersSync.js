import { useState, useEffect, useRef } from "react";
import { ALL_GLOBAL_ISSUERS } from "../data/global_issuers_seed";
import { validateDelistedIssuer } from "../utils/schema_validator";
import { getAllIssuersFromDB, saveAllIssuersToDB } from "../utils/db";

const LOCAL_STORAGE_KEY = "DELISTED_CRM_DATABASE_V11_GLOBAL";
const LAST_SYNC_KEY = "DELISTED_CRM_LAST_SYNC_TIMESTAMP";
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * TOCA Custom Hook: useIssuersSync (Enterprise Grade)
 * Features:
 * - High-capacity IndexedDB storage (unlimited scaling beyond 5MB).
 * - Transparent localStorage fallback and automatic migration.
 * - Dedicated Web Worker background synchronization (zero UI thread freezing).
 * - Non-destructive field enrichment and schema guardrails.
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
      console.warn("localStorage read warning:", e);
    }
    return ALL_GLOBAL_ISSUERS;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const workerRef = useRef(null);

  // Initialize from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    getAllIssuersFromDB()
      .then((dbData) => {
        if (isMounted && dbData && Array.isArray(dbData) && dbData.length > 0) {
          setIssuers(dbData);
        } else if (isMounted && issuers && issuers.length > 0) {
          saveAllIssuersToDB(issuers);
        }
      })
      .catch((err) => console.warn("IndexedDB init warning:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state changes to both IndexedDB and localStorage (mirror)
  useEffect(() => {
    if (issuers && issuers.length > 0) {
      saveAllIssuersToDB(issuers);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issuers));
      } catch (e) {
        // Silently handled: IndexedDB has full persistence
      }
    }
  }, [issuers]);

  // Process live fetched items with non-destructive merge
  const handleLiveRecordsMerge = (liveFetched, contactMapCik = {}, contactMapTicker = {}) => {
    if (!Array.isArray(liveFetched) || liveFetched.length === 0) return;

    setIssuers((prev) => {
      const existingMap = new Map();
      prev.forEach((item) => {
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
          const validated = validateDelistedIssuer({
            ...item,
            ticker,
            email,
            phone,
            ceo,
            legalCounsel
          });
          if (validated) {
            newItems.push(validated);
          }
        }
      });

      const updatedExisting = prev.map((item) => {
        const key = String(item.cik || item.id || "").replace(/^0+/, "");
        return existingMap.get(key) || item;
      });

      return [...newItems, ...updatedExisting];
    });
  };

  // Live Auto-Sync: Uses Web Worker when available or direct fallback
  const triggerLiveSync = async () => {
    setIsSyncing(true);

    // 1. Try Web Worker background execution
    if (typeof window !== "undefined" && window.Worker) {
      try {
        if (!workerRef.current) {
          workerRef.current = new Worker(new URL("../workers/secSyncWorker.js", import.meta.url), { type: "module" });
        }

        workerRef.current.onmessage = (e) => {
          const { type, liveFetched, contactMapCik, contactMapTicker } = e.data || {};
          if (type === "SYNC_SUCCESS") {
            handleLiveRecordsMerge(liveFetched, contactMapCik, contactMapTicker);
            try {
              localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
            } catch (err) {}
          }
          setIsSyncing(false);
        };

        workerRef.current.onerror = () => {
          fallbackDirectSync();
        };

        workerRef.current.postMessage({ type: "START_SYNC" });
        return;
      } catch (err) {
        // Fallback to direct async fetch
      }
    }

    fallbackDirectSync();
  };

  // Fallback direct async sync
  const fallbackDirectSync = async () => {
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
      } catch (e) {}

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
        } catch (e) {
          hasMore = false;
        }
      }

      handleLiveRecordsMerge(liveFetched, contactMapCik, contactMapTicker);
      try {
        localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
      } catch (e) {}
    } catch (err) {
      console.error("Direct sync error:", err);
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
    const timer = setInterval(checkAndSync, 60 * 60 * 1000);
    return () => {
      clearInterval(timer);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    issuers,
    setIssuers,
    isSyncing,
    triggerLiveSync
  };
}
