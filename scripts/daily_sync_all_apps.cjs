// Master Daily Synchronization Engine (8:00 AM EST)
// Orchestrates data integrity, real market ingestion, and cache updates across all 12 London, Frankfurt, and Australia apps.

const https = require("https");
const http = require("http");

const APPS = [
  { name: "Australia Edgar Insider Scout", url: "https://australia-edgar-insider-scout.vercel.app" },
  { name: "Australia Future 3(a)(10) Candidates", url: "https://australia-future-3a10-candidates.vercel.app" },
  { name: "Australia Delisted CRM Database", url: "https://australia-delisted-crm-database.vercel.app" },
  { name: "Australia Filings Outreach", url: "https://australia-filings-outreach.vercel.app" },
  { name: "Frankfurt Edgar Insider Scout", url: "https://frankfort-edgar-insider-scout.vercel.app" },
  { name: "Frankfurt Future 3(a)(10) Candidates", url: "https://frankfort-future-3a10-candidates.vercel.app" },
  { name: "Frankfurt Delisted CRM Database", url: "https://frankfort-delisted-crm-database.vercel.app" },
  { name: "Frankfurt Filings Outreach", url: "https://frankfort-filings-outreach.vercel.app" },
  { name: "London Edgar Insider Scout", url: "https://london-edgar-insider-scout.vercel.app" },
  { name: "London Future 3(a)(10) Candidates", url: "https://london-future-3a10-candidates.vercel.app" },
  { name: "London Delisted CRM Database", url: "https://london-delisted-crm-database.vercel.app" },
  { name: "London Filings Outreach", url: "https://london-filings-outreach.vercel.app" }
];

async function pingCron(app) {
  return new Promise((resolve) => {
    const cronUrl = `${app.url}/api/cron-sync`;
    const req = https.get(cronUrl, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        console.log(`[8:00 AM EST CRON SYNC] ${app.name} -> HTTP ${res.statusCode}`);
        resolve({ app: app.name, status: res.statusCode, ok: res.statusCode === 200 });
      });
    });
    req.on("error", (err) => {
      console.warn(`[8:00 AM EST CRON SYNC] ${app.name} -> Error: ${err.message}`);
      resolve({ app: app.name, status: "error", error: err.message });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ app: app.name, status: "timeout" });
    });
  });
}

async function runDailySync() {
  const estTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    dateStyle: "full",
    timeStyle: "long"
  }).format(new Date());

  console.log("=================================================");
  console.log(`Running Daily 8:00 AM EST Synchronization at ${estTime}`);
  console.log("=================================================");

  const results = [];
  for (const app of APPS) {
    const res = await pingCron(app);
    results.push(res);
  }

  console.log("=================================================");
  console.log("Daily Synchronization Cycle Complete for all 12 Apps.");
  console.log("=================================================");
}

if (require.main === module) {
  runDailySync();
}

module.exports = { runDailySync, APPS };
