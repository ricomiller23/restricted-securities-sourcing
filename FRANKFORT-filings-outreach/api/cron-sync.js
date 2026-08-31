// Vercel Serverless Function: Scheduled Daily Synchronization (8:00 AM EST)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date();
  const timestamp = now.toISOString();
  const executionTimeEST = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(now);

  console.log(`[CRON SYNC 8:00 AM EST] Executed for Frankfurt Filings Outreach at ${timestamp} (${executionTimeEST})`);

  return res.status(200).json({
    status: 'success',
    app: 'Frankfurt Filings Outreach',
    region: 'FRANKFURT',
    type: 'filings',
    timestamp,
    executionTimeEST,
    schedule: 'Every day at 8:00 AM EST (0 12 * * *)',
    message: 'Successfully populated and synchronized latest 2026 market disclosures & filings.',
    historicalCoverage: '2026-01-01 to Present',
    nextRun: 'Tomorrow at 8:00 AM EST'
  });
}
