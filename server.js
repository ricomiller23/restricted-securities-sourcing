import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import { runMorningSync, getTargetSyncDates } from './scripts/morning_sync.js';
import { telemetry } from './lib/telemetry.js';
import { getActiveMarketDate, validateFreshness } from './lib/freshness.js';
import { secIngester } from './lib/sec_ingest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Request Timing & Observability Middleware
app.use((req, res, next) => {
  const reqStart = performance.now();

  // Intercept writeHead to ensure headers can be appended
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const elapsed = parseFloat((performance.now() - reqStart).toFixed(2));
    res.setHeader('X-Response-Time', `${elapsed}ms`);
    res.setHeader('Server-Timing', `total;dur=${elapsed}`);
    return originalWriteHead.apply(this, args);
  };

  res.on('finish', () => {
    const elapsed = parseFloat((performance.now() - reqStart).toFixed(2));
    telemetry.recordRequest(req.method, req.originalUrl || req.url, elapsed, res.statusCode);
    const status = res.statusCode;
    const statusColor = status < 300 ? '\x1b[32m' : (status < 400 ? '\x1b[33m' : '\x1b[31m');
    const timeColor = elapsed < 50 ? '\x1b[36m' : (elapsed < 200 ? '\x1b[33m' : '\x1b[31m');
    console.log(`[API] ${req.method} ${req.originalUrl || req.url} -> ${statusColor}${status}\x1b[0m (${timeColor}${elapsed}ms\x1b[0m)`);
  });

  next();
});

const UA = "MillerSourcingOutreach/1.0 (contact: eric.miller@millersourcing.com)";
const HEADERS = { "User-Agent": UA };
const SLEEP_MS = 150; // Rate limit: ~6-7 requests per second

const CACHE_DIR = path.join(__dirname, 'cache');
const SUBMISSIONS_CACHE_DIR = path.join(CACHE_DIR, 'submissions');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
if (!fs.existsSync(SUBMISSIONS_CACHE_DIR)) fs.mkdirSync(SUBMISSIONS_CACHE_DIR);

const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const LEADS_FILE = path.join(__dirname, 'leads.json');

// Ticker Mapping Cache
const TICKERS_CACHE_FILE = path.join(CACHE_DIR, 'company_tickers.json');
let cikToTicker = {};
let cikToName = {};

const loadCompanyTickers = async () => {
  const startT = performance.now();
  try {
    let rawData;
    let shouldFetch = true;

    if (fs.existsSync(TICKERS_CACHE_FILE)) {
      const stats = fs.statSync(TICKERS_CACHE_FILE);
      const ageMs = Date.now() - stats.mtimeMs;
      // Use cached tickers if less than 24h old
      if (ageMs < 24 * 60 * 60 * 1000) {
        try {
          rawData = JSON.parse(fs.readFileSync(TICKERS_CACHE_FILE, 'utf8'));
          shouldFetch = false;
        } catch (e) {
          console.error("Failed to parse cached company tickers:", e);
        }
      }
    }

    if (shouldFetch) {
      console.log("Fetching company tickers from SEC...");
      try {
        const res = await fetch("https://www.sec.gov/files/company_tickers.json", { headers: HEADERS });
        if (res.ok) {
          rawData = await res.json();
          fs.writeFileSync(TICKERS_CACHE_FILE, JSON.stringify(rawData, null, 2));
        } else {
          console.warn(`Failed to fetch tickers from SEC (status ${res.status}). Trying to fall back to cache.`);
          if (fs.existsSync(TICKERS_CACHE_FILE)) {
            rawData = JSON.parse(fs.readFileSync(TICKERS_CACHE_FILE, 'utf8'));
          }
        }
      } catch (err) {
        console.error("Error fetching company tickers:", err.message);
        if (fs.existsSync(TICKERS_CACHE_FILE)) {
          rawData = JSON.parse(fs.readFileSync(TICKERS_CACHE_FILE, 'utf8'));
        }
      }
    }

    if (rawData) {
      cikToTicker = {};
      cikToName = {};
      for (const key in rawData) {
        const item = rawData[key];
        if (item && item.cik_str !== undefined) {
          const paddedCik = String(item.cik_str).padStart(10, '0');
          cikToTicker[paddedCik] = String(item.ticker).toUpperCase();
          cikToName[paddedCik] = item.title;
        }
      }
      const elapsed = performance.now() - startT;
      telemetry.recordStartupMilestone('tickerLoadMs', elapsed);
      console.log(`Loaded ${Object.keys(cikToTicker).length} CIK-to-ticker mappings in ${elapsed.toFixed(2)}ms.`);
    }
  } catch (err) {
    console.error("Critical error in loadCompanyTickers:", err);
  }
};

let filingsIndex = [];
let isIndexingFilings = false;

const COMPACT_INDEX_FILE = path.join(CACHE_DIR, 'filings_index_cache.json');
const COMPACT_MANIFEST_FILE = path.join(CACHE_DIR, 'filings_index_manifest.json');

const parseSingleDateFile = (filePath, date, settings) => {
  const filings = [];
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const rawFilingsList = content.rawFilings || [];

    for (const item of rawFilingsList) {
      const scored = scoreTarget(item.rawData, settings);
      const paddedCik = String(scored.issuerCik || '').padStart(10, '0');
      const ticker = cikToTicker[paddedCik] || scored.exchange || 'OTC';

      let city = '';
      let state = '';
      if (scored.sellerAddress) {
        const parts = scored.sellerAddress.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const zip = parts.pop();
          const statePart = parts.pop();
          const cityPart = parts.pop();
          city = cityPart || '';
          state = statePart || '';
        }
      }

      filings.push({
        id: item.accession,
        accessionNumber: item.accession,
        formType: item.rawData.formType || "144",
        filedAt: date,
        score: Math.round(scored.score),
        hasAgedDebt: scored.isHighValue,
        hasRestricted: true,
        has3a10: false,
        rawXmlUrl: `https://www.sec.gov/Archives/edgar/data/${scored.issuerCik}/${item.accession}/primary_doc.xml`,
        primaryDocUrl: `https://www.sec.gov/Archives/edgar/data/${scored.issuerCik}/${item.accession}/primary_doc.xml`,
        rawHtmlUrl: `https://www.sec.gov/Archives/edgar/data/${scored.issuerCik}/${item.accession}`,
        Issuer: {
          cik: paddedCik,
          ticker: ticker,
          name: scored.issuer,
          marketTier: scored.isOtc ? "PINK_LIMITED" : "NASDAQ"
        },
        Insider: {
          cik: '',
          fullName: scored.seller,
          city: city,
          state: state
        },
        relationship: scored.relationship,
        sharesToSell: scored.sharesToSell,
        sharesOutstanding: scored.sharesOutstanding,
        slicePct: scored.slicePct,
        aggregateMktValue: scored.aggregateMktValue,
        impliedPrice: scored.impliedPrice,
        acquisitionBasis: scored.acquisitionBasis,
        broker: scored.broker,
        sellerAddress: scored.sellerAddress,
        brokerAddress: scored.brokerAddress,
        depositWindow: scored.depositWindow,
        saleWindow: scored.saleWindow
      });
    }
  } catch (e) {
    console.error(`Failed to index file ${filePath}:`, e);
  }
  return filings;
};

const indexCachedFilings = async (forceFull = false) => {
  if (isIndexingFilings) return;
  isIndexingFilings = true;
  const startTime = performance.now();

  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    if (!fs.existsSync(CACHE_DIR)) return;

    const files = fs.readdirSync(CACHE_DIR);
    const dateFiles = files.filter(f => f.startsWith('2026-') && f.endsWith('.json'));

    const settingsStat = fs.statSync(SETTINGS_FILE);
    const currentManifest = {
      settingsMtime: settingsStat.mtimeMs,
      fileMtimes: {}
    };
    for (const f of dateFiles) {
      currentManifest.fileMtimes[f] = fs.statSync(path.join(CACHE_DIR, f)).mtimeMs;
    }

    let previousManifest = null;
    if (fs.existsSync(COMPACT_MANIFEST_FILE)) {
      try {
        previousManifest = JSON.parse(fs.readFileSync(COMPACT_MANIFEST_FILE, 'utf8'));
      } catch (e) {}
    }

    // Check if we can use the pre-indexed compact cache directly
    const settingsChanged = !previousManifest || previousManifest.settingsMtime !== currentManifest.settingsMtime;
    if (!forceFull && !settingsChanged && fs.existsSync(COMPACT_INDEX_FILE)) {
      try {
        let cachedIndex = JSON.parse(fs.readFileSync(COMPACT_INDEX_FILE, 'utf8'));
        
        // Find if any date files were added or modified
        const changedFiles = dateFiles.filter(f => {
          return !previousManifest.fileMtimes[f] || previousManifest.fileMtimes[f] !== currentManifest.fileMtimes[f];
        });

        if (changedFiles.length === 0) {
          filingsIndex = cachedIndex;
          const elapsed = performance.now() - startTime;
          telemetry.recordStartupMilestone('indexHydrationMs', elapsed);
          console.log(`[Fast Launch] Loaded ${filingsIndex.length} filings from compact index in ${elapsed.toFixed(2)}ms.`);
          isIndexingFilings = false;
          return;
        }

        console.log(`[Incremental Index] ${changedFiles.length} new/modified cache file(s) detected. Updating...`);
        const changedDates = new Set(changedFiles.map(f => f.replace('.json', '')));
        let mergedIndex = cachedIndex.filter(item => !changedDates.has(item.filedAt));

        for (const file of changedFiles) {
          const date = file.replace('.json', '');
          const newItems = parseSingleDateFile(path.join(CACHE_DIR, file), date, settings);
          mergedIndex.push(...newItems);
        }

        mergedIndex.sort((a, b) => b.filedAt.localeCompare(a.filedAt) || b.score - a.score);
        filingsIndex = mergedIndex;

        fs.writeFileSync(COMPACT_INDEX_FILE, JSON.stringify(filingsIndex));
        fs.writeFileSync(COMPACT_MANIFEST_FILE, JSON.stringify(currentManifest, null, 2));

        const elapsed = performance.now() - startTime;
        telemetry.recordStartupMilestone('indexHydrationMs', elapsed);
        console.log(`[Incremental Index] Successfully updated index (${filingsIndex.length} filings) in ${elapsed.toFixed(2)}ms.`);
        isIndexingFilings = false;
        return;
      } catch (err) {
        console.warn("[Fast Launch] Compact cache read failed, falling back to full index:", err.message);
      }
    }

    // Full indexing
    console.log(`[Full Index] Re-indexing all ${dateFiles.length} date files...`);
    let tempIndex = [];
    for (const file of dateFiles) {
      const date = file.replace('.json', '');
      const items = parseSingleDateFile(path.join(CACHE_DIR, file), date, settings);
      tempIndex.push(...items);
    }

    tempIndex.sort((a, b) => b.filedAt.localeCompare(a.filedAt) || b.score - a.score);
    filingsIndex = tempIndex;

    // Save compact cache and manifest
    fs.writeFileSync(COMPACT_INDEX_FILE, JSON.stringify(filingsIndex));
    fs.writeFileSync(COMPACT_MANIFEST_FILE, JSON.stringify(currentManifest, null, 2));

    const elapsed = performance.now() - startTime;
    telemetry.recordStartupMilestone('indexHydrationMs', elapsed);
    console.log(`[Full Index] Successfully indexed ${filingsIndex.length} filings and saved compact cache in ${elapsed.toFixed(2)}ms.`);
  } catch (err) {
    console.error("Failed to build filings index:", err);
  } finally {
    isIndexingFilings = false;
  }
};

// Global backfill state
let backfillState = {
  status: 'idle', // 'idle', 'indexing', 'fetching', 'completed', 'failed'
  totalFilings: 0,
  processedFilings: 0,
  currentDate: '',
  error: null
};

// Helper sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to clean and convert to float
const getNum = (x) => {
  if (!x) return 0;
  const str = Array.isArray(x) ? x[0] : x;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
};

// Helper to clean string fields
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

// Parse local tag name (namespace-agnostic)
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

// Extract address block helper
const parseAddress = (addrObj) => {
  if (!addrObj) return '';
  const street1 = getStr(addrObj.street1);
  const street2 = getStr(addrObj.street2);
  const city = getStr(addrObj.city);
  const state = getStr(addrObj.stateOrCountry || addrObj.stateOrProvince);
  const zip = getStr(addrObj.zipCode || addrObj.zip);
  
  return [street1, street2, city, state, zip].filter(Boolean).join(', ');
};

// Fetch issuer contact details from SEC and cache them
const getLocalIssuerContact = (cik) => {
  if (!cik) return { phone: '', address: '' };
  const paddedCik = String(cik).padStart(10, '0');
  const cachePath = path.join(SUBMISSIONS_CACHE_DIR, `${paddedCik}.json`);
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (e) {}
  }
  return { phone: '', address: '' };
};

const fetchIssuerContact = async (cik) => {
  if (!cik) return { phone: '', address: '' };
  
  const paddedCik = String(cik).padStart(10, '0');
  const cachePath = path.join(SUBMISSIONS_CACHE_DIR, `${paddedCik}.json`);
  
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (e) {
      console.error("Failed to read submission cache", e);
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
    console.error(`Error fetching CIK details: ${err.message}`);
    return { phone: '', address: '' };
  }
};

// Project timelines based on filing data
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
  } else if (type === 'convertible') {
    if (acquiredDate) {
      const acqDate = new Date(acquiredDate);
      if (!isNaN(acqDate)) {
        const depDate = new Date(acqDate);
        depDate.setMonth(depDate.getMonth() + 6);
        const formatDate = (d) => d.toISOString().split('T')[0];
        depositWindow = `Eligible starting ${formatDate(depDate)} (6mo holding)`;
        saleWindow = `Post-deposit clearance`;
      } else {
        depositWindow = 'Estimated 6 months from acquired date';
        saleWindow = 'Post-deposit clearance';
      }
    } else {
      depositWindow = 'Pending acquired date validation';
      saleWindow = 'Post-deposit clearance';
    }
  } else if (type === '3(a)(10)') {
    depositWindow = 'Immediate (Court approved)';
    saleWindow = 'Subject to leakage limit';
  }

  return { depositWindow, saleWindow };
};

// Dynamic scoring logic based on settings
const scoreTarget = (data, settings) => {
  const {
    weight_otc,
    weight_high_val_basis,
    weight_control,
    weight_slice_pct,
    weight_size_cap,
    high_value_basis_terms,
    control_words
  } = settings;

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

// Background backfiller
const runBackfill = async () => {
  backfillState = { status: 'indexing', totalFilings: 0, processedFilings: 0, currentDate: '', error: null };
  const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));

  try {
    const quarters = ['QTR1', 'QTR2'];
    const allFilings = [];

    for (const qtr of quarters) {
      const indexUrl = `https://www.sec.gov/Archives/edgar/full-index/2026/${qtr}/master.idx`;
      console.log(`Backfill: Fetching quarterly index for 2026 ${qtr}...`);
      const res = await fetch(indexUrl, { headers: HEADERS });
      if (!res.ok) continue;

      const text = await res.text();
      const lines = text.split('\n');
      
      let dashFound = false;
      for (const line of lines) {
        if (!dashFound) {
          if (line.startsWith('-----')) dashFound = true;
          continue;
        }

        const parts = line.split('|');
        if (parts.length === 5) {
          const [cik, name, form, filedDate, filename] = parts;
          if ((form === "144" || form === "144/A") && filedDate.startsWith('2026')) {
            const accession = filename.split('/').pop().replace('.txt', '').replace(/-/g, '');
            allFilings.push({ cik: cik.trim(), date: filedDate, accession });
          }
        }
      }
    }

    // Group filings by date
    const dateGroups = allFilings.reduce((acc, f) => {
      acc[f.date] = acc[f.date] || [];
      acc[f.date].push(f);
      return acc;
    }, {});

    // Filter dates that are NOT already cached to save requests
    const datesToFetch = Object.keys(dateGroups).filter(date => {
      const cachePath = path.join(CACHE_DIR, `${date}.json`);
      return !fs.existsSync(cachePath);
    });

    // Calculate total filings that we need to fetch
    const totalToFetch = datesToFetch.reduce((acc, date) => acc + dateGroups[date].length, 0);
    
    if (totalToFetch === 0) {
      backfillState.status = 'completed';
      backfillState.processedFilings = 0;
      backfillState.totalFilings = 0;
      indexCachedFilings();
      return;
    }

    backfillState.status = 'fetching';
    backfillState.totalFilings = totalToFetch;

    const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    for (const date of datesToFetch) {
      backfillState.currentDate = date;
      const filings = dateGroups[date];
      const rawFilings = [];

      for (const f of filings) {
        if (backfillState.status !== 'fetching') return; // Cancelled or stopped

        await sleep(SLEEP_MS);
        const fileUrl = `https://www.sec.gov/Archives/edgar/data/${f.cik}/${f.accession}/primary_doc.xml`;
        try {
          const fileRes = await fetch(fileUrl, { headers: HEADERS });
          if (!fileRes.ok) {
            backfillState.processedFilings++;
            continue;
          }

          const xmlText = await fileRes.text();
          const rawJson = await xmlParser.parseStringPromise(xmlText);
          const cleanJson = cleanXmlKeys(rawJson);
          const formData = cleanJson?.edgarSubmission?.formData || {};

          if (formData && Object.keys(formData).length > 0) {
            rawFilings.push({ accession: f.accession, rawData: formData });
          }
        } catch (err) {
          console.error(`Backfill error on filing ${f.accession}:`, err.message);
        }
        backfillState.processedFilings++;
      }

      // Save to cache file
      const cachePath = path.join(CACHE_DIR, `${date}.json`);
      fs.writeFileSync(cachePath, JSON.stringify({ date, rawFilings }, null, 2));
    }

    backfillState.status = 'completed';
    indexCachedFilings();
  } catch (err) {
    console.error("Backfill failed:", err);
    backfillState.status = 'failed';
    backfillState.error = err.message;
  }
};

// API: Get backfill status
app.get('/api/backfill/status', (req, res) => {
  res.json(backfillState);
});

// API: Start backfill
app.post('/api/backfill/start', (req, res) => {
  if (backfillState.status === 'indexing' || backfillState.status === 'fetching') {
    return res.status(400).json({ error: "Backfill process is already running." });
  }

  // Trigger asynchronously
  runBackfill();
  res.json({ message: "Backfill started successfully" });
});

// Morning Sync State & Endpoints
let isSyncRunning = false;

// API: Get morning sync status & history
app.get('/api/sync/status', (req, res) => {
  const syncHistoryFile = path.join(CACHE_DIR, 'sync_history.json');
  let history = [];
  if (fs.existsSync(syncHistoryFile)) {
    try {
      history = JSON.parse(fs.readFileSync(syncHistoryFile, 'utf8'));
    } catch (e) {}
  }
  const lastSync = history.length > 0 ? history[0] : null;
  res.json({
    isSyncRunning,
    lastSync,
    history
  });
});

// API: Trigger morning sync manually
app.post('/api/sync/trigger', async (req, res) => {
  if (isSyncRunning) {
    return res.status(400).json({ error: "Morning synchronization is already in progress." });
  }

  isSyncRunning = true;
  res.json({ message: "Morning synchronization initiated in background." });

  (async () => {
    try {
      console.log("[Server API] Triggered manual morning sync...");
      await runMorningSync();
      await indexCachedFilings();
    } catch (err) {
      console.error("[Server API] Manual morning sync error:", err);
    } finally {
      isSyncRunning = false;
    }
  })();
});

// API: Get Live Telemetry & Timing Metrics
app.get('/api/metrics', (req, res) => {
  const cacheStats = {
    totalFilingsIndexed: filingsIndex.length,
    compactCacheExists: fs.existsSync(COMPACT_INDEX_FILE),
    compactCacheSizeMb: fs.existsSync(COMPACT_INDEX_FILE) ? parseFloat((fs.statSync(COMPACT_INDEX_FILE).size / 1024 / 1024).toFixed(2)) : 0,
    rawCacheFilesCount: fs.existsSync(CACHE_DIR) ? fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('2026-') && f.endsWith('.json')).length : 0
  };
  res.json(telemetry.getMetrics({ cacheStats }));
});

// Alias for observability
app.get('/api/observability', (req, res) => {
  res.redirect('/api/metrics');
});

// API: Get settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to read settings file" });
  }
});

// API: Save settings
app.post('/api/settings', (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    indexCachedFilings();
    res.json({ message: "Settings saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to write settings file" });
  }
});

// API: Get 24-Hour Market Freshness Status
app.get('/api/feed/freshness', (req, res) => {
  const activeMarketDate = getActiveMarketDate();
  const freshnessInfo = validateFreshness(activeMarketDate, CACHE_DIR);
  res.json(freshnessInfo);
});

// API: Get Active Ingestion Progress
app.get('/api/sync/progress', (req, res) => {
  res.json(secIngester.getProgress());
});

// API: Get Issuer Contact Info (on-demand enrichment)
app.get('/api/issuers/:cik/contact', async (req, res) => {
  const { cik } = req.params;
  try {
    const contact = await fetchIssuerContact(cik);
    res.json(contact);
  } catch (err) {
    res.json({ phone: '', address: '' });
  }
});

// API: Get Form 144 feed (Instant Cache + Accelerated 24h Ingestion)
app.get('/api/feed', async (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  const cachePath = path.join(CACHE_DIR, `${date}.json`);
  const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));

  // 1. Instant Cache Hit (< 1ms)
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const targets = [];
      for (const item of cached.rawFilings || []) {
        const scoreData = scoreTarget(item.rawData, settings);
        const contactInfo = getLocalIssuerContact(scoreData.issuerCik);
        targets.push({
          ...scoreData,
          issuerPhone: contactInfo.phone,
          issuerAddress: contactInfo.address,
          accession: item.accession
        });
      }

      const filtered = targets.filter(t => t.isOtc && t.impliedPrice < 5.0);
      filtered.sort((a, b) => b.score - a.score);
      const freshness = validateFreshness(date, CACHE_DIR);
      return res.json({ date, targets: filtered, freshness, isSyncing: false });
    } catch (err) {
      console.error("Cache read error:", err);
    }
  }

  // 2. Uncached Date: Accelerated non-blocking ingestion
  const currentProgress = secIngester.getProgress();
  if (currentProgress.status === 'ingesting_xml' || currentProgress.status === 'fetching_index') {
    return res.json({
      date,
      targets: [],
      isSyncing: true,
      progress: currentProgress,
      message: `Syncing SEC EDGAR Form 144 daily index for ${date}...`
    });
  }

  // Trigger accelerated parallel ingestion asynchronously
  (async () => {
    try {
      const result = await secIngester.ingestDateFilings(date, CACHE_DIR);
      if (result.status === 'ingested') {
        await indexCachedFilings();
      }
    } catch (e) {
      console.error("Accelerated ingest error:", e);
    }
  })();

  res.json({
    date,
    targets: [],
    isSyncing: true,
    progress: secIngester.getProgress(),
    message: `Started accelerated SEC sync for ${date}...`
  });
});

// API: Get CRM leads
app.get('/api/leads', (req, res) => {
  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to read CRM leads database" });
  }
});

// API: Create CRM lead
app.post('/api/leads', (req, res) => {
  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const newLead = {
      id: Date.now().toString(),
      status: "New",
      notes: [],
      createdAt: new Date().toISOString(),
      ...req.body
    };

    // Prevent duplicate saves of same accession
    if (leads.some(l => l.accession === newLead.accession && newLead.accession)) {
      return res.status(400).json({ error: "This target has already been saved to your CRM list." });
    }

    leads.push(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// API: Update CRM lead status or notes
app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Lead not found" });
    }

    leads[index] = {
      ...leads[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    res.json(leads[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// API: Delete CRM lead
app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  try {
    let leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const exists = leads.some(l => l.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Lead not found" });
    }

    leads = leads.filter(l => l.id !== id);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    res.json({ message: "Lead removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

// API: SEC Full-Text Search Proxy (Supports 3(a)(10) & Debentures under $5)
app.get('/api/fts', async (req, res) => {
  const { q, forms, start, end, from = 0 } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Query query string parameter 'q' is required" });
  }

  const searchUrl = new URL("https://efts.sec.gov/LATEST/search-index");
  searchUrl.searchParams.append("q", q);
  if (forms) searchUrl.searchParams.append("forms", forms);
  searchUrl.searchParams.append("dateRange", "custom");
  if (start) searchUrl.searchParams.append("startdt", start);
  if (end) searchUrl.searchParams.append("enddt", end);
  searchUrl.searchParams.append("from", from);

  try {
    console.log(`Querying SEC FTS: ${searchUrl.toString()}`);
    const searchRes = await fetch(searchUrl.toString(), { headers: HEADERS });
    if (!searchRes.ok) {
      throw new Error(`SEC FTS HTTP error ${searchRes.status}`);
    }
    const data = await searchRes.json();
    
    const enrichedHits = [];
    const hitsList = data.hits?.hits || [];
    
    for (const hit of hitsList) {
      const src = hit._source || {};
      const contact = await fetchIssuerContact(src.cik);
      
      const isConvertible = String(q).toLowerCase().includes('convertible') || String(q).toLowerCase().includes('debenture');
      const is3a10 = String(q).toLowerCase().includes('3(a)(10)');
      
      const timeline = projectTimeline(
        isConvertible ? 'convertible' : (is3a10 ? '3(a)(10)' : '144'),
        null,
        src.file_date
      );

      enrichedHits.push({
        ...hit,
        contactPhone: contact.phone,
        contactAddress: contact.address,
        depositWindow: timeline.depositWindow,
        saleWindow: timeline.saleWindow
      });
    }

    if (data.hits) {
      data.hits.hits = enrichedHits;
    }
    
    res.json(data);
  } catch (err) {
    console.error("SEC FTS search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// API: Get filings (unified historical search register)
app.get('/api/filings', (req, res) => {
  const { form, limit = 20, cursor, cik, filter, q } = req.query;
  const numLimit = parseInt(limit);
  const offset = parseInt(cursor || '0');

  let results = [...filingsIndex];

  // Filter by form
  if (form) {
    if (form === "FORM_3" || form === "F3") {
      results = results.filter(f => f.formType === "FORM_3" || f.formType === "3");
    } else if (form === "FORM_4" || form === "F4") {
      results = results.filter(f => f.formType === "FORM_4" || f.formType === "4");
    } else if (form === "S1") {
      results = results.filter(f => f.formType.startsWith("S-1") || f.formType.startsWith("S1"));
    } else if (form === "13D") {
      results = results.filter(f => f.formType === "13D" || f.formType === "SC13D" || f.formType === "SC13G");
    } else if (form === "144") {
      results = results.filter(f => f.formType === "144" || f.formType === "144/A");
    } else {
      results = results.filter(f => f.formType.toLowerCase() === form.toLowerCase());
    }
  }

  // Filter by CIK
  if (cik) {
    const cleanCik = String(cik).replace(/^0+/, '');
    results = results.filter(f => 
      String(f.Issuer.cik).replace(/^0+/, '') === cleanCik
    );
  }

  // Filter by flags
  if (filter === 'debt') {
    results = results.filter(f => f.hasAgedDebt);
  } else if (filter === 'restricted') {
    results = results.filter(f => f.hasRestricted);
  } else if (filter === '3a10') {
    results = results.filter(f => f.has3a10);
  } else if (filter === 'today') {
    if (filingsIndex.length > 0) {
      const maxDate = filingsIndex[0].filedAt;
      results = results.filter(f => f.filedAt === maxDate);
    }
  }

  // Filter by search query (q)
  if (q && String(q).trim()) {
    const searchVal = String(q).toLowerCase().trim();
    results = results.filter(f => 
      f.Issuer.name.toLowerCase().includes(searchVal) ||
      (f.Issuer.ticker && f.Issuer.ticker.toLowerCase().includes(searchVal)) ||
      f.Insider.fullName.toLowerCase().includes(searchVal) ||
      f.formType.toLowerCase().includes(searchVal) ||
      (f.broker && f.broker.toLowerCase().includes(searchVal))
    );
  }

  const total = results.length;
  const sliced = results.slice(offset, offset + numLimit);
  const nextCursor = (offset + numLimit < total) ? String(offset + numLimit) : null;

  res.json({ data: sliced, nextCursor, total });
});

// API: Get filing details
app.get('/api/filings/:id', async (req, res) => {
  const { id } = req.params;
  const filing = filingsIndex.find(f => f.id === id || f.accessionNumber === id);
  if (!filing) {
    return res.status(404).json({ error: "Filing not found." });
  }

  try {
    const contactInfo = await fetchIssuerContact(filing.Issuer.cik);
    res.json({
      ...filing,
      issuerPhone: contactInfo.phone,
      issuerAddress: contactInfo.address
    });
  } catch (err) {
    res.json(filing);
  }
});

// Calculate ms until next 8:00 AM America/New_York
const getMsUntilNext8AMEst = () => {
  const now = new Date();
  const estFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric",
    hour12: false
  });
  const parts = estFormatter.formatToParts(now);
  const partMap = {};
  parts.forEach(p => partMap[p.type] = p.value);

  const estHour = parseInt(partMap.hour, 10);
  const estMin = parseInt(partMap.minute, 10);
  const estSec = parseInt(partMap.second, 10);

  let hoursUntil = 8 - estHour;
  let minsUntil = 0 - estMin;
  let secsUntil = 0 - estSec;

  let totalSecs = hoursUntil * 3600 + minsUntil * 60 + secsUntil;
  if (totalSecs <= 0) {
    // Already past 8:00 AM EST today, schedule for tomorrow
    totalSecs += 24 * 3600;
  }
  return totalSecs * 1000;
};

const scheduleDailyMorningCron = () => {
  const msUntilNext = getMsUntilNext8AMEst();
  const mins = Math.round(msUntilNext / 60000);
  console.log(`[Scheduler] Next daily 8:00 AM EST morning sync scheduled in ~${mins} minutes.`);

  setTimeout(async () => {
    console.log("[Scheduler] Executing scheduled 8:00 AM EST morning sync...");
    isSyncRunning = true;
    try {
      await runMorningSync();
      await indexCachedFilings();
    } catch (err) {
      console.error("[Scheduler] Morning sync error:", err);
    } finally {
      isSyncRunning = false;
      // Reschedule for next day
      scheduleDailyMorningCron();
    }
  }, msUntilNext);
};

// Check if recent business day is cached; if not, auto-sync on startup
const checkStartupCatchupSync = async () => {
  const startT = performance.now();
  const targetDates = getTargetSyncDates(2); // today and yesterday
  const missingDate = targetDates.some(date => !fs.existsSync(path.join(CACHE_DIR, `${date}.json`)));
  if (missingDate) {
    console.log("[Startup] Missing recent date cache, running background catch-up sync...");
    isSyncRunning = true;
    try {
      await runMorningSync();
      await indexCachedFilings();
    } catch (err) {
      console.error("[Startup] Background catch-up sync error:", err);
    } finally {
      isSyncRunning = false;
    }
  } else {
    console.log("[Startup] Recent market date cache is up to date.");
  }
  const elapsed = performance.now() - startT;
  telemetry.recordStartupMilestone('startupCatchupMs', elapsed);
};

// Immediate non-blocking server listen for instant startup response
app.listen(PORT, '127.0.0.1', () => {
  const bindMs = performance.now() - telemetry.processStartTime;
  telemetry.recordStartupMilestone('serverBindMs', bindMs);
  console.log(`Backend server running on http://127.0.0.1:${PORT} (bound in ${bindMs.toFixed(2)}ms)`);
});

// Asynchronous background hydration & scheduler
(async () => {
  await loadCompanyTickers();
  await indexCachedFilings();
  scheduleDailyMorningCron();
  checkStartupCatchupSync();
})();
