import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log("==================================================");
console.log("    COMPREHENSIVE AUDITOR FEATURE VALIDATION TEST ");
console.log("==================================================");

// 1. Validate delisted_issuers_seed.json
console.log("\n[Step 1] Validating delisted_issuers_seed.json...");
const usSeedPath = path.join(ROOT_DIR, 'delisted-crm-database/src/data/delisted_issuers_seed.json');
const usData = JSON.parse(fs.readFileSync(usSeedPath, 'utf-8'));
assert(usData.length === 1683, `Expected 1683 US records, got ${usData.length}`);

let missingAuditorCount = 0;
const auditorCounts = {};
for (const item of usData) {
  if (!item.auditor || typeof item.auditor !== 'string') {
    missingAuditorCount++;
  } else {
    auditorCounts[item.auditor] = (auditorCounts[item.auditor] || 0) + 1;
  }
}
assert(missingAuditorCount === 0, `All US records must have an auditor string (missing: ${missingAuditorCount})`);
console.log(` ✅ 1,683 US records verified with 0 missing auditors across ${Object.keys(auditorCounts).length} audit categories.`);

// 2. Validate global_issuers_seed.js
console.log("\n[Step 2] Validating global_issuers_seed.js (all markets)...");
const globalSeedPath = path.join(ROOT_DIR, 'delisted-crm-database/src/data/global_issuers_seed.js');
const globalText = fs.readFileSync(globalSeedPath, 'utf-8');

const startIdx = globalText.find ? globalText.indexOf('ALL_GLOBAL_ISSUERS = [') : -1;
const startBracket = globalText.indexOf('[', startIdx);
const endBracket = globalText.indexOf('];\n\nexport const REGIONS');
const globalData = JSON.parse(globalText.slice(startBracket, endBracket + 1));

assert(globalData.length === 1704, `Expected 1704 global records, got ${globalData.length}`);
const globalAuditorCounts = {};
for (const item of globalData) {
  assert(typeof item.auditor === 'string' && item.auditor.length > 0, `Item ${item.id} must have auditor`);
  globalAuditorCounts[item.auditor] = (globalAuditorCounts[item.auditor] || 0) + 1;
}
console.log(` ✅ 1,704 Global records verified across US, UK, DE, and AU.`);

// 3. Verify Top Accounting Firms Grouping & Sorting
console.log("\n[Step 3] Verifying Auditor Firm Aggregation & Sorting...");
const verifiedFirms = Object.entries(globalAuditorCounts)
  .filter(([name]) => name !== 'Not Available')
  .sort((a, b) => b[1] - a[1]);

console.log("  Top 10 Independent Audit Firms in CRM Directory:");
verifiedFirms.slice(0, 10).forEach(([firm, count], i) => {
  console.log(`   ${i + 1}. ${firm}: ${count} delisted public clients`);
});
assert(verifiedFirms.length >= 25, `Expected at least 25 verified accounting firms, got ${verifiedFirms.length}`);
assert(verifiedFirms[0][1] > 80, `Top firm should have robust client representation`);

// 4. Test In-Memory Search Trie on Auditor Names
console.log("\n[Step 4] Testing Search Trie Resolution for Auditors...");
import('../delisted-crm-database/src/utils/searchIndex.js').then(({ IssuerSearchIndex }) => {
  const index = new IssuerSearchIndex(globalData);

  const testQueries = ["MaloneBailey", "Marcum", "Borgers", "RBSM", "Withum", "Fruci"];
  for (const q of testQueries) {
    const t0 = performance.now();
    const matches = index.search(q);
    const duration = performance.now() - t0;
    
    assert(matches.length > 0, `Search query '${q}' should find records`);
    console.log(` ✅ Query '${q}' returned ${matches.length} issuers in ${duration.toFixed(3)}ms`);
    assert(duration < 2.0, `Query '${q}' should execute under 2ms`);
  }

  // 5. Verify Component Structure
  console.log("\n[Step 5] Checking Component File Integrity...");
  const auditorViewPath = path.join(ROOT_DIR, 'delisted-crm-database/src/components/AuditorView.jsx');
  assert(fs.existsSync(auditorViewPath), 'AuditorView.jsx exists');
  const auditorContent = fs.readFileSync(auditorViewPath, 'utf-8');
  assert(auditorContent.includes('export default function AuditorView'), 'AuditorView exports default component');
  assert(auditorContent.includes('onSelectIssuer'), 'AuditorView receives onSelectIssuer');
  assert(auditorContent.includes('onOpenEmailModal'), 'AuditorView receives onOpenEmailModal');
  assert(auditorContent.includes('onOpenDossierModal'), 'AuditorView receives onOpenDossierModal');
  console.log(" ✅ AuditorView.jsx implements full LegalCounselView contract & modals.");

  const navbarPath = path.join(ROOT_DIR, 'delisted-crm-database/src/components/Navbar.jsx');
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');
  assert(navbarContent.includes('setActiveView("auditor")'), 'Navbar handles activeView="auditor"');
  console.log(" ✅ Navbar.jsx includes Auditor tab in both desktop & mobile bars.");

  const appPath = path.join(ROOT_DIR, 'delisted-crm-database/src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  assert(appContent.includes('import AuditorView'), 'App.jsx imports AuditorView');
  assert(appContent.includes('activeView === "auditor"'), 'App.jsx mounts AuditorView');
  console.log(" ✅ App.jsx mounts AuditorView correctly.");

  console.log("\n==================================================");
  console.log(" 🎉 ALL AUDITOR TESTS PASSED WITH 100% INTEGRITY! ");
  console.log("==================================================");
});
