// Launch Time Benchmark & Profiling Suite
// Measures cold-start timings, disk/parse throughput, server readiness, and launcher response.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT_DIR, 'cache');
const TICKERS_CACHE_FILE = path.join(CACHE_DIR, 'company_tickers.json');
const COMPACT_INDEX_FILE = path.join(CACHE_DIR, 'filings_index_cache.json');
const BENCHMARK_REPORT_FILE = path.join(ROOT_DIR, 'specs/0/0.003-launch-time-optimization-and-benchmarking/benchmark_results.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const measureAsync = async (fn) => {
  const start = performance.now();
  const res = await fn();
  const end = performance.now();
  return { result: res, durationMs: parseFloat((end - start).toFixed(2)) };
};

// 1. Benchmark Raw Cache Disk Read & Parse
const benchmarkRawDiskScan = () => {
  const start = performance.now();
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('2026-') && f.endsWith('.json'));
  let totalFilings = 0;
  let totalBytes = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CACHE_DIR, file), 'utf8');
    totalBytes += raw.length;
    const parsed = JSON.parse(raw);
    totalFilings += (parsed.rawFilings || []).length;
  }
  const end = performance.now();
  return {
    fileCount: files.length,
    totalFilings,
    totalMb: parseFloat((totalBytes / 1024 / 1024).toFixed(2)),
    durationMs: parseFloat((end - start).toFixed(2))
  };
};

// 2. Benchmark Compact Index Disk Read & Parse
const benchmarkCompactIndexLoad = () => {
  if (!fs.existsSync(COMPACT_INDEX_FILE)) {
    return { available: false, durationMs: null, sizeMb: null, count: 0 };
  }
  const start = performance.now();
  const content = fs.readFileSync(COMPACT_INDEX_FILE, 'utf8');
  const parsed = JSON.parse(content);
  const end = performance.now();
  return {
    available: true,
    count: parsed.length,
    sizeMb: parseFloat((content.length / 1024 / 1024).toFixed(2)),
    durationMs: parseFloat((end - start).toFixed(2))
  };
};

// 3. Benchmark Port Readiness
const waitForPort = async (port, pathUrl = '/', timeoutMs = 10000) => {
  const start = performance.now();
  const url = `http://127.0.0.1:${port}${pathUrl}`;
  while (performance.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(500) });
      if (res.ok || res.status < 500) {
        return parseFloat((performance.now() - start).toFixed(2));
      }
    } catch (e) {
      await sleep(20);
    }
  }
  return null;
};

// 4. Measure Express Server Cold Start
const benchmarkServerBoot = async () => {
  const child = spawn('node', ['server.js'], { cwd: ROOT_DIR, stdio: 'ignore' });
  try {
    const readyMs = await waitForPort(5005, '/api/settings', 8000);
    return readyMs;
  } finally {
    child.kill('SIGTERM');
  }
};

// 5. Measure Vite Client Boot
const benchmarkViteBoot = async () => {
  const child = spawn('npx', ['vite', '--port', '3000'], { cwd: ROOT_DIR, stdio: 'ignore' });
  try {
    const readyMs = await waitForPort(3000, '/', 8000);
    return readyMs;
  } finally {
    child.kill('SIGTERM');
  }
};

export const runFullBenchmark = async () => {
  console.log("=================================================");
  console.log("   Scout 144 Launch & Performance Benchmark     ");
  console.log("=================================================\n");

  console.log("1. Measuring raw disk scan (117+ daily JSON files)...");
  const rawDisk = benchmarkRawDiskScan();
  console.log(`   -> Read ${rawDisk.fileCount} files (${rawDisk.totalMb} MB, ${rawDisk.totalFilings} filings) in ${rawDisk.durationMs}ms`);

  console.log("2. Measuring pre-compiled compact index load...");
  const compact = benchmarkCompactIndexLoad();
  if (compact.available) {
    console.log(`   -> Loaded pre-indexed cache (${compact.sizeMb} MB, ${compact.count} filings) in ${compact.durationMs}ms`);
  } else {
    console.log("   -> Pre-compiled index not yet generated (baseline mode).");
  }

  console.log("3. Measuring Backend Express Cold Start time (port 5005)...");
  const serverBootMs = await benchmarkServerBoot();
  console.log(`   -> Server responded in ${serverBootMs}ms`);

  console.log("4. Measuring Vite Dev Server Cold Start time (port 3000)...");
  const viteBootMs = await benchmarkViteBoot();
  console.log(`   -> Vite responded in ${viteBootMs}ms`);

  const summary = {
    timestamp: new Date().toISOString(),
    rawDiskScan: rawDisk,
    compactIndexLoad: compact,
    serverColdBootMs: serverBootMs,
    viteColdBootMs: viteBootMs,
    estimatedBaselineLauncherMs: (serverBootMs || 1500) + (viteBootMs || 1000) + 2000, // including blind sleep 2
    estimatedOptimizedLauncherMs: Math.max(serverBootMs || 300, viteBootMs || 400) + 50 // with active polling
  };

  const reportDir = path.dirname(BENCHMARK_REPORT_FILE);
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(BENCHMARK_REPORT_FILE, JSON.stringify(summary, null, 2));

  console.log("\n=================================================");
  console.log("Benchmark Summary:");
  console.log(`- Raw Cache Parse Time:       ${rawDisk.durationMs}ms`);
  if (compact.available) {
    console.log(`- Optimized Index Parse Time: ${compact.durationMs}ms (${((1 - compact.durationMs / rawDisk.durationMs) * 100).toFixed(1)}% faster)`);
  }
  console.log(`- Express Backend Ready:      ${serverBootMs}ms`);
  console.log(`- Vite Frontend Ready:         ${viteBootMs}ms`);
  console.log("=================================================\n");

  return summary;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFullBenchmark().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
