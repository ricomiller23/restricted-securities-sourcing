#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const REGIONAL_DIRECTORIES = [
  "144-analysis-daily",
  "AUSTRALIA-delisted-crm-database",
  "AUSTRALIA-edgar-insider-scout",
  "AUSTRALIA-filings-outreach",
  "AUSTRALIA-future-3a10-candidates",
  "FRANKFORT-delisted-crm-database",
  "FRANKFORT-edgar-insider-scout",
  "FRANKFORT-filings-outreach",
  "FRANKFORT-future-3a10-candidates",
  "LONDON-delisted-crm-database",
  "LONDON-edgar-insider-scout",
  "LONDON-filings-outreach",
  "LONDON-future-3a10-candidates",
  "TESTBED_delisted-crm-dbase",
  "delisted-crm-database"
];

console.log("=================================================");
console.log("    DEPLOYING ALL MONOREPO HUBS TO VERCEL       ");
console.log("=================================================");

const results = [];

for (const dir of REGIONAL_DIRECTORIES) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`[SKIP] Directory not found: ${dir}`);
    continue;
  }

  console.log(`\n🚀 Deploying [${dir}]...`);
  try {
    const env = {
      ...process.env,
      DEVELOPER_DIR: '/Library/Developer/CommandLineTools',
      PATH: `/Users/ericmiller/.homebrew/bin:${process.env.PATH}`
    };

    const output = execSync('npx -y vercel --prod --yes', {
      cwd: dirPath,
      env,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const urlMatch = output.match(/Production:\s+(https:\/\/[^\s]+)/) || output.match(/(https:\/\/[a-zA-Z0-9-]+\.vercel\.app)/);
    const prodUrl = urlMatch ? urlMatch[1] : 'Deployed (Check Vercel Dashboard)';

    console.log(`  ✅ [${dir}] Live at: ${prodUrl}`);
    results.push({ name: dir, url: prodUrl, status: 'Success' });
  } catch (err) {
    console.error(`  ❌ [${dir}] Failed: ${err.message}`);
    results.push({ name: dir, url: 'Failed', status: 'Error' });
  }
}

console.log("\n=================================================");
console.log("          ALL VERCEL DEPLOYMENTS SUMMARY         ");
console.log("=================================================");
console.table(results);
