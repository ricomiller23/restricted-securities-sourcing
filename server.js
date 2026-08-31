import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

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
      console.log(`Loaded ${Object.keys(cikToTicker).length} CIK-to-ticker mappings.`);
    }
  } catch (err) {
    console.error("Critical error in loadCompanyTickers:", err);
  }
};

let filingsIndex = [];
let isIndexingFilings = false;

const indexCachedFilings = async () => {
  if (isIndexingFilings) return;
  isIndexingFilings = true;
  console.log("Indexing cached 2026 filings...");
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    if (!fs.existsSync(CACHE_DIR)) return;
    const files = fs.readdirSync(CACHE_DIR);
    const dateFiles = files.filter(f => f.startsWith('2026-') && f.endsWith('.json'));

    let tempIndex = [];

    for (const file of dateFiles) {
      const date = file.replace('.json', '');
      const filePath = path.join(CACHE_DIR, file);
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

          tempIndex.push({
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
        console.error(`Failed to index file ${file}:`, e);
      }
    }

    tempIndex.sort((a, b) => {
      const dateCompare = b.filedAt.localeCompare(a.filedAt);
      if (dateCompare !== 0) return dateCompare;
      return b.score - a.score;
    });

    filingsIndex = tempIndex;
    console.log(`Successfully indexed ${filingsIndex.length} filings.`);
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
    console.log(`Fetching issuer details for CIK ${paddedCik} from SEC...`);
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

// API: Get Form 144 feed (with optional caching)
app.get('/api/feed', async (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  const cachePath = path.join(CACHE_DIR, `${date}.json`);
  const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));

  // If cached file exists, read and re-score (in case user updated settings weights)
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const targets = [];
      for (const item of cached.rawFilings) {
        const scoreData = scoreTarget(item.rawData, settings);
        
        // Enrich with Issuer details (cached internally)
        const contactInfo = await fetchIssuerContact(scoreData.issuerCik);
        
        targets.push({
          ...scoreData,
          issuerPhone: contactInfo.phone,
          issuerAddress: contactInfo.address,
          accession: item.accession
        });
      }

      // Filter: OTC and under $5.00 share price
      const filtered = targets.filter(t => t.isOtc && t.impliedPrice < 5.0);
      filtered.sort((a, b) => b.score - a.score);
      return res.json({ date, targets: filtered });
    } catch (err) {
      console.error("Cache read error, falling back to fetch:", err);
    }
  }

  const [year, monthStr, dayStr] = date.split('-');
  const month = parseInt(monthStr);
  const q = Math.floor((month - 1) / 3) + 1;
  const indexUrl = `https://www.sec.gov/Archives/edgar/daily-index/${year}/QTR${q}/master.${year}${monthStr}${dayStr}.idx`;

  try {
    console.log(`Fetching daily SEC index: ${indexUrl}`);
    const indexRes = await fetch(indexUrl, { headers: HEADERS });
    if (indexRes.status === 404 || indexRes.status === 403) {
      return res.json({ date, targets: [], message: "No filings found for this date (weekend, holiday, or index not yet published)" });
    }
    if (!indexRes.ok) {
      throw new Error(`SEC Index HTTP error ${indexRes.status}`);
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

    console.log(`Found ${filingsToFetch.length} Form 144 filings to process...`);
    const rawFilings = [];
    const targets = [];
    const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    for (const f of filingsToFetch) {
      await sleep(SLEEP_MS);
      const fileUrl = `https://www.sec.gov/Archives/edgar/data/${f.cik}/${f.accession}/primary_doc.xml`;
      try {
        const fileRes = await fetch(fileUrl, { headers: HEADERS });
        if (!fileRes.ok) continue;

        const xmlText = await fileRes.text();
        const rawJson = await xmlParser.parseStringPromise(xmlText);
        
        // Clean namespaces out of keys recursively
        const cleanJson = cleanXmlKeys(rawJson);
        const formData = cleanJson?.edgarSubmission?.formData || {};

        if (formData && Object.keys(formData).length > 0) {
          rawFilings.push({ accession: f.accession, rawData: formData });
          const scored = scoreTarget(formData, settings);
          
          // Enrich with Issuer details (cached internally)
          const contactInfo = await fetchIssuerContact(scored.issuerCik);

          targets.push({ 
            ...scored, 
            issuerPhone: contactInfo.phone,
            issuerAddress: contactInfo.address,
            accession: f.accession 
          });
        }
      } catch (err) {
        console.error(`Error processing filing ${f.accession}:`, err.message);
      }
    }

    // Write to cache
    fs.writeFileSync(cachePath, JSON.stringify({ date, rawFilings }, null, 2));

    // Filter: OTC and under $5.00 share price
    const filtered = targets.filter(t => t.isOtc && t.impliedPrice < 5.0);
    filtered.sort((a, b) => b.score - a.score);
    res.json({ date, targets: filtered });
  } catch (err) {
    console.error("Fetch/Parse error:", err);
    res.status(500).json({ error: err.message });
  }
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

// Boot up initialization
(async () => {
  await loadCompanyTickers();
  await indexCachedFilings();
})();

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});
