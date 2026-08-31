// Morning Synchronization Engine
// Ingests latest SEC Form 144 daily indices, enriches contacts, refreshes tickers, and triggers regional syncs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const UA = "MillerSourcingOutreach/1.0 (contact: eric.miller@millersourcing.com)";
const HEADERS = { "User-Agent": UA };
const SLEEP_MS = 150; // Rate limit: ~6-7 requests per second

const CACHE_DIR = path.join(ROOT_DIR, 'cache');
const SUBMISSIONS_CACHE_DIR = path.join(CACHE_DIR, 'submissions');
const SETTINGS_FILE = path.join(ROOT_DIR, 'settings.json');
const TICKERS_CACHE_FILE = path.join(CACHE_DIR, 'company_tickers.json');
const SYNC_HISTORY_FILE = path.join(CACHE_DIR, 'sync_history.json');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
if (!fs.existsSync(SUBMISSIONS_CACHE_DIR)) fs.mkdirSync(SUBMISSIONS_CACHE_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getNum = (x) => {
  if (!x) return 0;
  const str = Array.isArray(x) ? x[0] : x;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
};

const getStr = (x) => {
  if (!x) return '';
  let val = Array.isArray(x) ? x[0] : x;
  if (typeof val === 'object' && val !== null) {
    if (val._) val = val._;
    else if (val.text) val = val.text;
    else return '';
  }
  return String(val || '').trim();
};

const cleanXmlKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(cleanXmlKeys);

  const newObj = {};
  for (const key in obj) {
    const cleanKey = key.includes(':') ? key.split(':').pop() : key;
    newObj[cleanKey] = cleanXmlKeys(obj[key]);
  }
  return newObj;
};

const parseAddress = (addrObj) => {
  if (!addrObj) return '';
  const street1 = getStr(addrObj.street1);
  const street2 = getStr(addrObj.street2);
  const city = getStr(addrObj.city);
  const state = getStr(addrObj.stateOrCountry || addrObj.stateOrProvince);
  const zip = getStr(addrObj.zipCode || addrObj.zip);
  return [street1, street2, city, state, zip].filter(Boolean).join(', ');
};

const fetchIssuerContact = async (cik) => {
  if (!cik) return { phone: '', address: '' };
  const paddedCik = String(cik).padStart(10, '0');
  const cachePath = path.join(SUBMISSIONS_CACHE_DIR, `${paddedCik}.json`);

  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (e) {
      // Fall through to fetch
    }
  }

  const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
  try {
    await sleep(SLEEP_MS);
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return { phone: '', address: '' };

    const data = await res.json();
    const phone = data.phone || '';
    let address = '';
    const busAddr = data.addresses?.business;
    if (busAddr) {
      address = parseAddress(busAddr);
    }

    const result = { phone, address };
    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    return { phone: '', address: '' };
  }
};

const projectTimeline = (type, approxSaleDate, acquiredDate) => {
  let depositWindow = 'Immediate';
  let saleWindow = 'Immediate';

  if (type === '144') {
    if (approxSaleDate) {
      const saleDate = new Date(approxSaleDate);
      if (!isNaN(saleDate)) {
        const endDate = new Date(saleDate);
        endDate.setMonth(endDate.getMonth() + 3);

        const depositStart = new Date(saleDate);
        depositStart.setDate(depositStart.getDate() - 14);
        const depositEnd = new Date(saleDate);
        depositEnd.setDate(depositEnd.getDate() - 7);

        const formatDate = (d) => d.toISOString().split('T')[0];
        depositWindow = `${formatDate(depositStart)} to ${formatDate(depositEnd)}`;
        saleWindow = `${approxSaleDate} to ${formatDate(endDate)}`;
      }
    }
  }
  return { depositWindow, saleWindow };
};

const scoreTarget = (data, settings) => {
  const {
    weight_otc = 30,
    weight_high_val_basis = 25,
    weight_control = 20,
    weight_slice_pct = 15,
    weight_size_cap = 10,
    high_value_basis_terms = ["promissory", "debt", "settlement", "note", "conversion", "services"],
    control_words = ["officer", "director", "10%", "affiliate", "president", "ceo", "cfo", "control"]
  } = settings || {};

  const issuer = data.issuerInfo || {};
  const si = (Array.isArray(data.securitiesInformation) ? data.securitiesInformation[0] : data.securitiesInformation) || {};
  const stbList = Array.isArray(data.securitiesToBeSold)
    ? data.securitiesToBeSold
    : (data.securitiesToBeSold ? [data.securitiesToBeSold] : []);

  const exch = String(si.securitiesExchangeName || '').toUpperCase();
  const listedExchanges = ["NASDAQ", "NYSE", "AMEX", "ARCA", "BATS", "CBOE"];
  const isOtc = !listedExchanges.some(x => exch.includes(x));

  const rel = String(issuer.relationshipsToIssuer || '').toLowerCase();
  const isControl = control_words.some(w => rel.includes(w.toLowerCase()));

  const toSell = getNum(si.numberOfUnitsToBeSold);
  const outstanding = getNum(si.noOfUnitsOutstanding);
  const amv = getNum(si.aggregateMarketValue);
  const slicePct = outstanding ? (toSell / outstanding) * 100 : null;
  const impliedPrice = toSell > 0 ? amv / toSell : 0;

  const basisText = stbList.map(b =>
    `${b.natureOfAcquisitionTransaction || ''} ${b.natureOfPayment || ''}`
  ).join(' ').toLowerCase();

  const isHighValue = high_value_basis_terms.some(k => basisText.includes(k.toLowerCase()));
  const acquiredDate = stbList.length > 0 ? getStr(stbList[0].acquiredDate) : '';

  let score = 0;
  if (isOtc) score += weight_otc;
  if (isHighValue) score += weight_high_val_basis;
  if (isControl) score += weight_control;
  if (slicePct !== null && slicePct < 1.0) score += weight_slice_pct;
  score += Math.min(amv / 100000, weight_size_cap);

  const sellerAddress = parseAddress(issuer.address);
  const brokerAddress = parseAddress(si.brokerOrMarketMakerDetails?.address);

  const timeline = projectTimeline(
    isHighValue ? 'convertible' : '144',
    getStr(si.approxSaleDate),
    acquiredDate
  );

  return {
    issuer: getStr(issuer.issuerName),
    issuerCik: getStr(issuer.issuerCik),
    seller: getStr(issuer.nameOfPersonForWhoseAccountTheSecuritiesAreToBeSold),
    relationship: getStr(issuer.relationshipsToIssuer),
    exchange: getStr(si.securitiesExchangeName),
    isOtc,
    sharesToSell: Math.round(toSell),
    sharesOutstanding: Math.round(outstanding),
    slicePct: slicePct !== null ? Math.round(slicePct * 10000) / 10000 : null,
    aggregateMktValue: Math.round(amv),
    impliedPrice: Math.round(impliedPrice * 100) / 100,
    acquisitionBasis: basisText.trim(),
    isHighValue,
    broker: si.brokerOrMarketMakerDetails
      ? (Array.isArray(si.brokerOrMarketMakerDetails)
          ? getStr(si.brokerOrMarketMakerDetails[0]?.name)
          : getStr(si.brokerOrMarketMakerDetails.name)) || ''
      : '',
    approxSaleDate: getStr(si.approxSaleDate),
    acquiredDate,
    sellerAddress,
    brokerAddress,
    depositWindow: timeline.depositWindow,
    saleWindow: timeline.saleWindow,
    score: Math.round(score * 10) / 10
  };
};

/**
 * Returns recent target dates (formatted YYYY-MM-DD) for morning synchronization.
 * Checks the last N calendar days (default 5) to catch weekends/holidays.
 */
export const getTargetSyncDates = (daysBack = 5) => {
  const dates = [];
  const now = new Date();
  for (let i = 0; i <= daysBack; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Format YYYY-MM-DD
    const isoDate = d.toISOString().split('T')[0];
    dates.push(isoDate);
  }
  return dates;
};

/**
 * Refreshes SEC company ticker mapping cache if older than 24h.
 */
export const refreshCompanyTickers = async () => {
  try {
    let shouldFetch = true;
    if (fs.existsSync(TICKERS_CACHE_FILE)) {
      const stats = fs.statSync(TICKERS_CACHE_FILE);
      const ageMs = Date.now() - stats.mtimeMs;
      if (ageMs < 24 * 60 * 60 * 1000) {
        shouldFetch = false;
      }
    }

    if (shouldFetch) {
      console.log("[Morning Sync] Refreshing SEC company tickers...");
      const res = await fetch("https://www.sec.gov/files/company_tickers.json", { headers: HEADERS });
      if (res.ok) {
        const rawData = await res.json();
        fs.writeFileSync(TICKERS_CACHE_FILE, JSON.stringify(rawData, null, 2));
        console.log("[Morning Sync] Company tickers cache updated successfully.");
      }
    }
  } catch (err) {
    console.warn(`[Morning Sync] Note on ticker refresh: ${err.message}`);
  }
};

/**
 * Syncs Form 144 filings for a specific date from SEC EDGAR.
 */
export const syncDateFilings = async (dateStr) => {
  const cachePath = path.join(CACHE_DIR, `${dateStr}.json`);
  if (fs.existsSync(cachePath)) {
    return { date: dateStr, status: 'already_cached', count: 0 };
  }

  const [year, monthStr, dayStr] = dateStr.split('-');
  const month = parseInt(monthStr);
  const q = Math.floor((month - 1) / 3) + 1;
  const indexUrl = `https://www.sec.gov/Archives/edgar/daily-index/${year}/QTR${q}/master.${year}${monthStr}${dayStr}.idx`;

  console.log(`[Morning Sync] Checking SEC daily index for ${dateStr}...`);
  try {
    const indexRes = await fetch(indexUrl, { headers: HEADERS });
    if (indexRes.status === 404 || indexRes.status === 403) {
      return { date: dateStr, status: 'not_published', count: 0 };
    }
    if (!indexRes.ok) {
      return { date: dateStr, status: 'error', error: `HTTP ${indexRes.status}` };
    }

    const text = await indexRes.text();
    const lines = text.split('\n');
    const filingsToFetch = [];

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length === 5) {
        const [cik, name, form, filedDate, filename] = parts;
        if (form === "144" || form === "144/A") {
          const accession = filename.split('/').pop().replace('.txt', '').replace(/-/g, '');
          filingsToFetch.push({ cik: cik.trim(), accession });
        }
      }
    }

    console.log(`[Morning Sync] Found ${filingsToFetch.length} Form 144 filings for ${dateStr}. Ingesting...`);
    const rawFilings = [];
    const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    for (const f of filingsToFetch) {
      await sleep(SLEEP_MS);
      const fileUrl = `https://www.sec.gov/Archives/edgar/data/${f.cik}/${f.accession}/primary_doc.xml`;
      try {
        const fileRes = await fetch(fileUrl, { headers: HEADERS });
        if (!fileRes.ok) continue;

        const xmlText = await fileRes.text();
        const rawJson = await xmlParser.parseStringPromise(xmlText);
        const cleanJson = cleanXmlKeys(rawJson);
        const formData = cleanJson?.edgarSubmission?.formData || {};

        if (formData && Object.keys(formData).length > 0) {
          rawFilings.push({ accession: f.accession, rawData: formData });
        }
      } catch (err) {
        // Continue processing batch
      }
    }

    fs.writeFileSync(cachePath, JSON.stringify({ date: dateStr, rawFilings }, null, 2));
    console.log(`[Morning Sync] Saved ${rawFilings.length} filings to cache/${dateStr}.json`);
    return { date: dateStr, status: 'ingested', count: rawFilings.length };
  } catch (err) {
    console.error(`[Morning Sync] Error syncing date ${dateStr}:`, err.message);
    return { date: dateStr, status: 'failed', error: err.message };
  }
};

/**
 * Triggers regional cloud synchronization if script exists.
 */
export const syncRegionalApps = async () => {
  try {
    const syncScript = path.join(__dirname, 'daily_sync_all_apps.cjs');
    if (fs.existsSync(syncScript)) {
      console.log("[Morning Sync] Triggering regional apps sync (London, Frankfurt, Australia)...");
      const { runDailySync } = await import('./daily_sync_all_apps.cjs');
      if (typeof runDailySync === 'function') {
        await runDailySync();
      }
    }
  } catch (err) {
    console.warn(`[Morning Sync] Regional apps sync note: ${err.message}`);
  }
};

/**
 * Main Morning Sync Orchestrator
 */
export const runMorningSync = async () => {
  const startTime = new Date();
  console.log("=================================================");
  console.log(`[Morning Sync] Starting Morning Data Pipeline at ${startTime.toISOString()}`);
  console.log("=================================================");

  const syncSummary = {
    startedAt: startTime.toISOString(),
    completedAt: null,
    status: 'running',
    datesProcessed: [],
    totalFilingsIngested: 0,
    errors: []
  };

  try {
    // 1. Refresh company tickers
    await refreshCompanyTickers();

    // 2. Ingest recent business days
    const targetDates = getTargetSyncDates(4);
    for (const dateStr of targetDates) {
      const res = await syncDateFilings(dateStr);
      syncSummary.datesProcessed.push(res);
      if (res.status === 'ingested') {
        syncSummary.totalFilingsIngested += res.count;
      } else if (res.status === 'failed' || res.status === 'error') {
        syncSummary.errors.push(`${dateStr}: ${res.error}`);
      }
    }

    // 3. Trigger regional app synchronization
    await syncRegionalApps();

    syncSummary.status = 'completed';
    syncSummary.completedAt = new Date().toISOString();
  } catch (err) {
    console.error("[Morning Sync] Fatal error during sync cycle:", err);
    syncSummary.status = 'failed';
    syncSummary.completedAt = new Date().toISOString();
    syncSummary.errors.push(err.message);
  }

  // Record history
  try {
    let history = [];
    if (fs.existsSync(SYNC_HISTORY_FILE)) {
      try {
        history = JSON.parse(fs.readFileSync(SYNC_HISTORY_FILE, 'utf8'));
      } catch (e) {}
    }
    history.unshift(syncSummary);
    // Keep last 30 sync logs
    history = history.slice(0, 30);
    fs.writeFileSync(SYNC_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (e) {
    console.error("Failed to write sync history:", e);
  }

  console.log("=================================================");
  console.log(`[Morning Sync] Cycle finished with status: ${syncSummary.status}. Ingested ${syncSummary.totalFilingsIngested} filings.`);
  console.log("=================================================");

  return syncSummary;
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMorningSync().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
