import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './_lib/db.js';
import { enrichWithKimi } from './_lib/sec.js';

// Wait helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Load .env.local manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

async function runBackfill() {
  console.log("Starting backfill script for Kimi enrichment...");
  
  try {
    const rows = await query("SELECT accession, data FROM filings_144", []);
    console.log(`Found ${rows.length} filings in database.`);
    
    let count = 0;
    for (const row of rows) {
      const filing = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      
      // If filing already has a CEO that is not 'Not Available', skip it
      if (filing.ceo && filing.ceo !== 'Not Available') {
        continue;
      }
      
      console.log(`Enriching ${filing.ticker} (${filing.issuer})...`);
      
      // Wait to rate limit requests (4 req/sec = 250ms)
      await sleep(250);
      
      const kimiData = await enrichWithKimi(filing.issuer, filing.ticker);
      
      filing.ceo = kimiData.ceo;
      filing.cfo = kimiData.cfo;
      filing.legalCounsel = kimiData.legalCounsel;
      filing.lawFirm = kimiData.lawFirm;
      
      await query(
        "UPDATE filings_144 SET data = $1 WHERE accession = $2",
        [JSON.stringify(filing), row.accession]
      );
      
      console.log(`Updated ${filing.ticker}: CEO = ${filing.ceo}, Legal Counsel = ${filing.legalCounsel}, Law Firm = ${filing.lawFirm}`);
      count++;
    }
    
    console.log(`Backfill finished. Enriched ${count} filings.`);
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err.message);
    process.exit(1);
  }
}

runBackfill();
