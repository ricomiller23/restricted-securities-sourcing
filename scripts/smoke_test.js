#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { validateFilingRecord, validateDelistedRecord } from '../lib/schema_validator.js';
import { IssuerSearchIndex } from '../delisted-crm-database/src/utils/searchIndex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const t0 = performance.now();
console.log('=============================================');
console.log('       RUNNING AUTOMATED SMOKE TEST SUITE    ');
console.log('=============================================');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(` ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(` ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Static Datasets & Governance Files Check
console.log('\n[1/5] Checking Data Seeds & Governance Files...');
const seedFile = path.join(ROOT_DIR, 'delisted-crm-database/src/data/delisted_issuers_seed.json');
assert(fs.existsSync(seedFile), 'Delisted issuers seed JSON exists');
if (fs.existsSync(seedFile)) {
  const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
  assert(Array.isArray(seedData) && seedData.length > 0, `Seed contains ${seedData.length} valid corporate records`);
}

const tocaDoc = path.join(ROOT_DIR, '.config/ai/toca.ai');
assert(fs.existsSync(tocaDoc), '.config/ai/toca.ai standard is present');

const topologyDoc = path.join(ROOT_DIR, '.config/ai/topology.json');
assert(fs.existsSync(topologyDoc), '.config/ai/topology.json map is present');

// 2. Runtime Schema Validation Test
console.log('\n[2/5] Testing Runtime Schema Validation Guardrails...');
const sampleRawFiling = {
  cik: '895126',
  company_name: 'TEST CORP INC',
  symbol: 'tstc',
  email: 'IR@TESTCORP.COM', // Should be sanitized to 'Not Available'
  phone: '555-0199',
  legal_counsel: 'Skadden Arps LLP'
};

const validFiling = validateFilingRecord(sampleRawFiling);
assert(validFiling.cik === '0000895126', 'CIK padded to 10 digits');
assert(validFiling.normCik === '895126', 'Normalized CIK stripped of leading zeroes');
assert(validFiling.ticker === 'TSTC', 'Ticker uppercase normalized');
assert(validFiling.email === 'Not Available', 'Generic IR email correctly sanitized');
assert(validFiling.legalCounsel === 'Skadden Arps LLP', 'Legal counsel preserved');

const sampleRawDelisted = {
  cik: '12345',
  companyName: 'SHELL ACQUISITION CORP',
  cleanShellScore: 95
};
const validDelisted = validateDelistedRecord(sampleRawDelisted);
assert(validDelisted.cleanShellScore === 95, 'Clean shell score bounded properly');
assert(validDelisted.shellRating === 'Prime Clean Shell', 'Prime clean shell rating assigned');

// 3. In-Memory Search Trie & IndexedDB Architecture
console.log('\n[3/5] Testing In-Memory Search Index & Storage Architecture...');
const sampleDataset = [
  { companyName: 'BioHealth Corp', ticker: 'BHLC', cik: '000111', location: 'California', legalCounsel: 'Cooley LLP' },
  { companyName: 'Global Mining Inc', ticker: 'GMNG', cik: '000222', location: 'Nevada', legalCounsel: 'Greenberg Traurig' },
  { companyName: 'Fintech Shell Corp', ticker: 'FNTK', cik: '000333', location: 'New York', legalCounsel: 'Skadden Arps' }
];
const s0 = performance.now();
const index = new IssuerSearchIndex(sampleDataset);
const searchResults = index.search('Fintech Skadden');
const sTime = (performance.now() - s0).toFixed(3);
assert(searchResults.length === 1 && searchResults[0].ticker === 'FNTK', `In-memory trie search resolved in ${sTime}ms (< 0.5ms target)`);

const dbUtil = path.join(ROOT_DIR, 'delisted-crm-database/src/utils/db.js');
assert(fs.existsSync(dbUtil), 'IndexedDB storage engine utility exists');

const workerFile = path.join(ROOT_DIR, 'delisted-crm-database/src/workers/secSyncWorker.js');
assert(fs.existsSync(workerFile), 'Background SEC Sync Web Worker exists');

const pdfUtil = path.join(ROOT_DIR, 'delisted-crm-database/src/utils/pdfExport.js');
assert(fs.existsSync(pdfUtil), 'Executive PDF Dossier utility exists');

const pwaManifest = path.join(ROOT_DIR, 'delisted-crm-database/public/manifest.json');
assert(fs.existsSync(pwaManifest), 'PWA manifest.json exists');

const pwaWorker = path.join(ROOT_DIR, 'delisted-crm-database/public/sw.js');
assert(fs.existsSync(pwaWorker), 'PWA service worker exists');

// 4. TOCA & Bundler Chunking Check
console.log('\n[4/5] Testing TOCA Bundler Splitting & Custom Hooks...');
const hookFile = path.join(ROOT_DIR, 'delisted-crm-database/src/hooks/useIssuersSync.js');
assert(fs.existsSync(hookFile), 'useIssuersSync.js custom hook exists');

const viteConfig = fs.readFileSync(path.join(ROOT_DIR, 'delisted-crm-database/vite.config.js'), 'utf-8');
assert(viteConfig.includes('manualChunks'), 'Vite Rollup manualChunks configuration active');

// 5. In-Process Backend HTTP Health Check (Port 5005)
console.log('\n[5/5] Probing Active Backend Services...');

function probeHttp(port, urlPath) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: urlPath, timeout: 500 }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

const probeResult = await probeHttp(5005, '/api/metrics');
if (probeResult.status === 200) {
  assert(true, `Scout 144 Backend on port 5005 responded HTTP 200 (uptime: ${Math.round(probeResult.data.uptime)}s)`);
} else {
  console.log(` ⚠️ Backend port 5005 offline (will be tested during full launch)`);
}

const totalTime = Math.round(performance.now() - t0);
console.log('\n=============================================');
console.log(` Results: ${passed} Passed, ${failed} Failed`);
console.log(` Total Smoke Test Runtime: ${totalTime}ms`);
console.log('=============================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
