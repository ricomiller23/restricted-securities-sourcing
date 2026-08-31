import { loadCompanyTickers } from './_lib/sec.js';

export default async function handler(req, res) {
  // Set CORS headers for serverless environment
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { cikToTicker, cikToName } = await loadCompanyTickers();
    res.status(200).json({ tickers: cikToTicker, names: cikToName });
  } catch (error) {
    console.error("Tickers API error:", error);
    res.status(500).json({ error: error.message });
  }
}
