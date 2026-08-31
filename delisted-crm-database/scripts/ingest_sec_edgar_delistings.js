import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UA = "MillerSourcingOutreach/1.0 (contact: eric.miller@millersourcing.com)";
const HEADERS = { "User-Agent": UA, "Accept-Encoding": "gzip, deflate" };

const ROOT_DIR = path.resolve(__dirname, '../..');
const DELISTED_DIR = path.resolve(__dirname, '..');
const TICKERS_FILE = path.join(ROOT_DIR, 'cache', 'company_tickers.json');
const CACHE_DIR = path.join(DELISTED_DIR, 'cache_edgar_indices');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// Load ticker mappings
let cikToTicker = {};
if (fs.existsSync(TICKERS_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(TICKERS_FILE, 'utf8'));
    for (const key of Object.keys(raw)) {
      const item = raw[key];
      if (item && item.cik_str) {
        const padded = String(item.cik_str).padStart(10, '0');
        cikToTicker[padded] = item.ticker;
        cikToTicker[String(item.cik_str)] = item.ticker;
      }
    }
    console.log(`Loaded ${Object.keys(cikToTicker).length} CIK-to-ticker mappings.`);
  } catch (e) {
    console.error("Failed loading company_tickers.json:", e.message);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DELISTING_FORMS = new Set([
  '25', '25-NSE', '25/A',
  '15-12G', '15-12B', '15-15D',
  '15-12G/A', '15-12B/A', '15-15D/A',
  '15F-12G', '15F-12B', '15F-15D'
]);

const QUARTERS = [
  { year: 2023, qtr: 1 },
  { year: 2023, qtr: 2 },
  { year: 2023, qtr: 3 },
  { year: 2023, qtr: 4 },
  { year: 2024, qtr: 1 },
  { year: 2024, qtr: 2 },
  { year: 2024, qtr: 3 },
  { year: 2024, qtr: 4 },
  { year: 2025, qtr: 1 },
  { year: 2025, qtr: 2 },
  { year: 2025, qtr: 3 },
  { year: 2025, qtr: 4 },
  { year: 2026, qtr: 1 },
  { year: 2026, qtr: 2 }
];

async function fetchMasterIndex(year, qtr) {
  const cacheFile = path.join(CACHE_DIR, `master_${year}_QTR${qtr}.idx`);
  if (fs.existsSync(cacheFile)) {
    console.log(`Using cached master index for ${year} QTR${qtr}`);
    return fs.readFileSync(cacheFile, 'utf8');
  }

  const url = `https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${qtr}/master.idx`;
  console.log(`Downloading SEC master index from ${url} ...`);
  try {
    await sleep(200);
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`Master index for ${year} QTR${qtr} returned HTTP ${res.status}`);
      return null;
    }
    const text = await res.text();
    fs.writeFileSync(cacheFile, text);
    return text;
  } catch (err) {
    console.error(`Failed downloading master index for ${year} QTR${qtr}:`, err.message);
    return null;
  }
}

function parseMasterIndex(text) {
  if (!text) return [];
  const lines = text.split('\n');
  let dataStartIndex = -1;

  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    if (lines[i].startsWith('---')) {
      dataStartIndex = i + 1;
      break;
    }
  }

  if (dataStartIndex === -1) return [];

  const records = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('|');
    if (parts.length >= 5) {
      const cik = parts[0].trim();
      const companyName = parts[1].trim();
      const formType = parts[2].trim();
      const dateFiled = parts[3].trim();
      const filename = parts[4].trim();

      if (DELISTING_FORMS.has(formType)) {
        records.push({
          cik,
          companyName,
          formType,
          dateFiled,
          filename
        });
      }
    }
  }
  return records;
}

function classifyEventType(form) {
  if (form.startsWith('25-NSE')) return 'Delisting Notice (Form 25-NSE)';
  if (form.startsWith('25')) return 'Delisting (Form 25)';
  if (form.startsWith('15-12G')) return 'Voluntary De-Registration (Form 15-12G)';
  if (form.startsWith('15-12B')) return 'Exchange Deregistration (Form 15-12B)';
  if (form.startsWith('15-15D')) return 'Duty Suspension (Form 15-15D)';
  if (form.startsWith('15F')) return 'Foreign Issuer Deregistration (Form 15F)';
  return `Delisting Filing (${form})`;
}

function calculateScore(form, companyName) {
  let score = 70;
  if (form.includes('25')) score += 15;
  if (form.includes('15-12G')) score += 10;
  if (companyName.toUpperCase().includes('CORP') || companyName.toUpperCase().includes('INC')) score += 5;
  return Math.min(score, 95);
}

async function run() {
  console.log("=================================================");
  console.log(" Starting SEC EDGAR Delisted Ingestion Pipeline  ");
  console.log("=================================================");

  const rawDelistingFilings = [];

  for (const q of QUARTERS) {
    const text = await fetchMasterIndex(q.year, q.qtr);
    const parsed = parseMasterIndex(text);
    console.log(`Extracted ${parsed.length} Form 25 / Form 15 filings for ${q.year} QTR${q.qtr}`);
    rawDelistingFilings.push(...parsed);
  }

  console.log(`\nTotal raw delisting filings discovered: ${rawDelistingFilings.length}`);

  // Deduplicate by CIK (keeping most recent filing)
  const byCik = new Map();

  for (const item of rawDelistingFilings) {
    const paddedCik = String(item.cik).padStart(10, '0');
    const existing = byCik.get(paddedCik);
    if (!existing || item.dateFiled > existing.dateFiled) {
      byCik.set(paddedCik, item);
    }
  }

  console.log(`Deduplicated unique SEC delisted corporate issuers: ${byCik.size}`);

  // Load existing international entries (AIM, Frankfurt, ASX) from global_issuers_seed.js
  const existingInternational = [];
  const globalSeedPath = path.join(DELISTED_DIR, 'src', 'data', 'global_issuers_seed.js');
  if (fs.existsSync(globalSeedPath)) {
    try {
      const content = fs.readFileSync(globalSeedPath, 'utf8');
      const match = content.match(/export const ALL_GLOBAL_ISSUERS = (\[[\s\S]*\]);/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        const nonUs = parsed.filter(p => p.region && p.region !== 'US');
        existingInternational.push(...nonUs);
        console.log(`Preserved ${existingInternational.length} verified international issuers (AIM, Frankfurt, ASX).`);
      }
    } catch (e) {
      console.warn("Could not parse existing international records:", e.message);
    }
  }

  const harmonizedRecords = [];
  let idx = 1;

  for (const [paddedCik, item] of byCik.entries()) {
    const ticker = cikToTicker[paddedCik] || cikToTicker[item.cik] || 'OTC';
    const eventType = classifyEventType(item.formType);
    const cleanShellScore = calculateScore(item.formType, item.companyName);

    const fullTextUrl = item.filename ? `https://www.sec.gov/Archives/${item.filename}` : '';
    const landingUrl = item.filename 
      ? `https://www.sec.gov/Archives/${item.filename.replace('.txt', '-index.html')}`
      : `https://www.sec.gov/edgar/searchedgar/companysearch?CIK=${item.cik}`;

    harmonizedRecords.push({
      id: `sec-${paddedCik}-${item.formType.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      cik: paddedCik,
      companyName: item.companyName,
      ticker: ticker,
      delistDate: item.dateFiled,
      form: item.formType,
      exchange: item.formType.includes('25') ? 'National Exchange → OTC' : 'SEC Deregistered',
      eventType: eventType,
      secLandingPage: landingUrl,
      secFullText: fullTextUrl,
      location: 'United States',
      email: 'Not Available',
      phone: 'Not Available',
      ceo: 'Not Available',
      cfo: 'Not Available',
      otcProfileUrl: ticker && ticker !== 'OTC' ? `https://www.otcmarkets.com/stock/${ticker}/profile` : 'https://www.otcmarkets.com',
      legalCounsel: 'Not Available',
      status: 'new',
      notes: [],
      region: 'US',
      cleanShellScore: cleanShellScore,
      shellRating: cleanShellScore >= 85 ? 'High Shell Viability' : 'Moderate Viability (Restructuring Candidate)',
      activities: [],
      reminders: null,
      details: `SEC EDGAR ${item.formType} delisting filing registered on ${item.dateFiled}. CIK: ${paddedCik}.`
    });
    idx++;
  }

  // Sort by delistDate descending (newest first)
  harmonizedRecords.sort((a, b) => (b.delistDate || '').localeCompare(a.delistDate || ''));

  const masterCatalog = [...harmonizedRecords, ...existingInternational];

  console.log(`\nFinal Expanded Master Catalog contains: ${masterCatalog.length} corporate issuers!`);

  // Write JSON seed
  const jsonOutPath = path.join(DELISTED_DIR, 'src', 'data', 'delisted_issuers_seed.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(harmonizedRecords, null, 2));
  console.log(`Saved JSON seed: ${jsonOutPath}`);

  // Write JS seed
  const jsOutContent = `// Master harmonized multi-market dataset
// Expanded SEC EDGAR + Global AIM/Frankfurt/ASX Catalog
export const ALL_GLOBAL_ISSUERS = ${JSON.stringify(masterCatalog, null, 2)};
`;
  fs.writeFileSync(globalSeedPath, jsOutContent);
  console.log(`Saved JS seed: ${globalSeedPath}`);

  console.log("=================================================");
  console.log(` ✅ Ingestion Complete: Expanded to ${masterCatalog.length} issuers!`);
  console.log("=================================================");
}

run();
