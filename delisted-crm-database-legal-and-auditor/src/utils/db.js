// High-Capacity IndexedDB Storage Engine for Delisted CRM
// Eliminates browser 5MB localStorage limits to seamlessly store 100,000+ corporate records and contact notes.

const DB_NAME = "DelistedCRM_DB";
const DB_VERSION = 1;
const STORE_ISSUERS = "issuers";
const STORE_META = "meta";

let dbInstance = null;

export function openDatabase() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_ISSUERS)) {
        const issuerStore = db.createObjectStore(STORE_ISSUERS, { keyPath: "id" });
        issuerStore.createIndex("cik", "cik", { unique: false });
        issuerStore.createIndex("ticker", "ticker", { unique: false });
        issuerStore.createIndex("region", "region", { unique: false });
        issuerStore.createIndex("status", "status", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn("IndexedDB failed to open, falling back to localStorage:", event.target.error);
      resolve(null);
    };
  });
}

export async function getAllIssuersFromDB() {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_ISSUERS, "readonly");
      const store = tx.objectStore(STORE_ISSUERS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result && request.result.length > 0 ? request.result : null);
      };
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveAllIssuersToDB(issuers) {
  if (!Array.isArray(issuers) || issuers.length === 0) return false;

  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_ISSUERS, "readwrite");
      const store = tx.objectStore(STORE_ISSUERS);

      for (let i = 0; i < issuers.length; i++) {
        store.put(issuers[i]);
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

export async function getMetaFromDB(key) {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readonly");
      const store = tx.objectStore(STORE_META);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function setMetaInDB(key, value) {
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readwrite");
      const store = tx.objectStore(STORE_META);
      store.put({ key, value });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}
