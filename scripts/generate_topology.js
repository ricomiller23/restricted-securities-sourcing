#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('[TOPOLOGY] Generating repository topology map...');

const topology = {
  generatedAt: new Date().toISOString(),
  projectName: 'Restricted Securities Sourcing & Delisted CRM Ecosystem',
  applications: {
    scout144: {
      type: 'Full-Stack Express + Vite SPA',
      backendPort: 5005,
      frontendPort: 3000,
      entryPoints: {
        server: 'server.js',
        client: 'src/main.jsx'
      },
      routes: [],
      components: [],
      modules: []
    },
    delistedCrm: {
      type: 'Vite React CRM & Intelligence Engine',
      port: 5173,
      cloudUrl: 'https://delisted-crm-database.vercel.app',
      entryPoints: {
        client: 'delisted-crm-database/src/main.jsx',
        app: 'delisted-crm-database/src/App.jsx'
      },
      components: [],
      hooks: [],
      dataSeeds: []
    }
  },
  specs: [],
  governance: {
    constitution: '.specify/memory/constitution.md',
    startupGuide: 'start.ai',
    tocaStandard: '.config/ai/toca.ai',
    progressLog: '.config/ai/progress.ai',
    handoff: '.config/ai/handoff.ai'
  }
};

// 1. Extract Express Routes from server.js
try {
  const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf-8');
  const routeRegex = /app\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = routeRegex.exec(serverCode)) !== null) {
    topology.applications.scout144.routes.push({
      method: match[1].toUpperCase(),
      path: match[2]
    });
  }
} catch (e) {
  console.warn('[TOPOLOGY] Warning reading server.js routes:', e.message);
}

// 2. Scan Scout 144 components and lib modules
const scanDir = (dirPath, targetArray, relativePrefix = '') => {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        targetArray.push(path.join(relativePrefix, file));
      }
    }
  }
};

scanDir(path.join(ROOT_DIR, 'src/components'), topology.applications.scout144.components, 'src/components');
scanDir(path.join(ROOT_DIR, 'lib'), topology.applications.scout144.modules, 'lib');

// 3. Scan Delisted CRM components, hooks, data
scanDir(path.join(ROOT_DIR, 'delisted-crm-database/src/components'), topology.applications.delistedCrm.components, 'delisted-crm-database/src/components');
scanDir(path.join(ROOT_DIR, 'delisted-crm-database/src/hooks'), topology.applications.delistedCrm.hooks, 'delisted-crm-database/src/hooks');
scanDir(path.join(ROOT_DIR, 'delisted-crm-database/src/data'), topology.applications.delistedCrm.dataSeeds, 'delisted-crm-database/src/data');

// 4. Scan active and historical specs
const specsDir = path.join(ROOT_DIR, 'specs/0');
if (fs.existsSync(specsDir)) {
  const entries = fs.readdirSync(specsDir);
  for (const entry of entries) {
    if (fs.statSync(path.join(specsDir, entry)).isDirectory()) {
      topology.specs.push(`specs/0/${entry}`);
    }
  }
}

// Write out .config/ai/topology.json
const outDir = path.join(ROOT_DIR, '.config/ai');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'topology.json');

fs.writeFileSync(outFile, JSON.stringify(topology, null, 2), 'utf-8');

console.log(`[TOPOLOGY] ✅ Topology successfully written to: .config/ai/topology.json`);
console.log(` - Express Routes Indexed: ${topology.applications.scout144.routes.length}`);
console.log(` - Scout 144 Components: ${topology.applications.scout144.components.length}`);
console.log(` - Delisted CRM Components: ${topology.applications.delistedCrm.components.length}`);
console.log(` - Delisted CRM Hooks: ${topology.applications.delistedCrm.hooks.length}`);
console.log(` - Specifications Cataloged: ${topology.specs.length}`);
