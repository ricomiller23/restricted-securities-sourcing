// api/daily-scan.js — Rewritten to use Neon Postgres for persistent state
import xml2js from 'xml2js';
import {
  HEADERS,
  sleep,
  loadCompanyTickers,
  cleanXmlKeys,
  scoreTarget,
  fetchMarketData,
  fetchIssuerContact,
  enrichWithKimi
} from './_lib/sec.js';
import { query, ensureTable } from './_lib/db.js';

// Send email via Resend
const sendEmail = async (newFilings) => {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ALERT_EMAIL;

  if (!apiKey || !toEmail) {
    console.warn('Email not configured. Set RESEND_API_KEY and ALERT_EMAIL env vars in Vercel.');
    return false;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const tableRows = newFilings.map(f => `
    <tr style="border-bottom:1px solid #1e2a3a;">
      <td style="padding:10px;font-weight:bold;color:#00ffa3;">${f.ticker || 'OTC'}</td>
      <td style="padding:10px;">${f.issuer}</td>
      <td style="padding:10px;text-align:right;">${f.sharesToSell > 0 ? f.sharesToSell.toLocaleString() : 'N/A'}</td>
      <td style="padding:10px;text-align:right;">${f.currentPrice != null ? '$' + f.currentPrice.toFixed(2) : '$' + (f.impliedPrice || 0).toFixed(2)}</td>
      <td style="padding:10px;text-align:right;">${f.aggregateMktValue > 0 ? '$' + Math.round(f.aggregateMktValue).toLocaleString() : 'N/A'}</td>
      <td style="padding:10px;">${f.status}</td>
      <td style="padding:10px;">${f.filedAt || 'Today'}</td>
    </tr>
  `).join('');

  const html = `
    <div style="background:#0a0f1a;color:#c8d8e8;font-family:Arial,sans-serif;padding:32px;border-radius:12px;max-width:900px;margin:0 auto;">
      <h1 style="color:#00ffa3;margin:0 0 8px;">📈 144 Analysis Daily — New Filings Alert</h1>
      <p style="color:#7a9bb5;margin:0 0 24px;">${today}</p>
      <div style="background:#0d1a2a;border:1px solid #1e3a5f;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <h2 style="margin:0 0 4px;font-size:28px;color:#00cfff;">${newFilings.length}</h2>
        <p style="margin:0;color:#7a9bb5;">New OTC Pink/QB/QX Form 144 filings detected today under $5.00</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#0d1a2a;color:#7a9bb5;text-align:left;">
            <th style="padding:10px;">Ticker</th>
            <th style="padding:10px;">Issuer</th>
            <th style="padding:10px;text-align:right;">Shares to Sell</th>
            <th style="padding:10px;text-align:right;">Stock Price</th>
            <th style="padding:10px;text-align:right;">Total Value</th>
            <th style="padding:10px;">Status</th>
            <th style="padding:10px;">Filed</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin-top:24px;color:#7a9bb5;font-size:12px;">
        View all filings at: <a href="https://144-analysis-daily.vercel.app" style="color:#00ffa3;">144-analysis-daily.vercel.app</a>
      </p>
    </div>
  `;

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: '144 Analysis Daily <alerts@144analysis.com>',
        to: [toEmail],
        subject: `📈 ${newFilings.length} New OTC Form 144 Filings — ${today}`,
        html
      })
    });
    return emailRes.ok;
  } catch (e) {
    console.error('Email send failed:', e.message);
    return false;
  }
};

export default async function handler(req, res) {
  // Verify this is from Vercel Cron or an authorized request
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await ensureTable();
    const today = new Date().toISOString().split('T')[0];

    // Look back 3 days to catch any late weekend/holiday filings
    const scanStart = new Date();
    scanStart.setDate(scanStart.getDate() - 3);
    const scanStartStr = scanStart.toISOString().split('T')[0];

    const { cikToTicker } = await loadCompanyTickers();

    const OTC_QUERY = '"form 144" AND (OTCQB OR OTCQX OR OTCPK OR OTC)';
    const searchUrl = new URL('https://efts.sec.gov/LATEST/search-index');
    searchUrl.searchParams.append('q', OTC_QUERY);
    searchUrl.searchParams.append('forms', '144');
    searchUrl.searchParams.append('dateRange', 'custom');
    searchUrl.searchParams.append('startdt', scanStartStr);
    searchUrl.searchParams.append('enddt', today);
    searchUrl.searchParams.append('size', '100');

    const searchRes = await fetch(searchUrl.toString(), { headers: HEADERS });
    if (!searchRes.ok) throw new Error(`FTS error: ${searchRes.status}`);

    const searchData = await searchRes.json();
    const hits = searchData.hits?.hits || [];

    // Query which hit accessions are already in Postgres
    const accessions = hits.map(h => {
      const adsh = h._source?.adsh;
      return adsh ? adsh.replace(/-/g, '') : null;
    }).filter(Boolean);

    const existingRows = await query(
      `SELECT accession FROM filings_144 WHERE accession = ANY($1)`,
      [accessions]
    );
    const seenSet = new Set(existingRows.map(r => r.accession));

    const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const newFilings = [];

    for (const hit of hits) {
      const src = hit._source || {};
      const cik = src.ciks?.[0] || '';
      const adsh = src.adsh;
      const accession = adsh ? adsh.replace(/-/g, '') : '';
      const fileDate = src.file_date;

      if (!cik || !accession || seenSet.has(accession)) continue;

      await sleep(150);
      const fileUrl = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/primary_doc.xml`;

      try {
        const fileRes = await fetch(fileUrl, { headers: HEADERS });
        if (!fileRes.ok) continue;

        const xmlText = await fileRes.text();
        const rawJson = await xmlParser.parseStringPromise(xmlText);
        const cleanJson = cleanXmlKeys(rawJson);
        const formData = cleanJson?.edgarSubmission?.formData || {};

        if (!formData || Object.keys(formData).length === 0) continue;

        const scored = scoreTarget(formData, fileDate);

        // Only include OTC
        if (!scored.isOtc) continue;

        const displayName = src.display_names?.[0] || '';
        let parsedTicker = 'OTC';
        const tickerMatch = displayName.match(/\s+\(([A-Z0-9.\-]+)\)\s+\(CIK/i);
        if (tickerMatch) parsedTicker = tickerMatch[1].toUpperCase();
        else if (cik) parsedTicker = cikToTicker[String(cik).padStart(10, '0')] || 'OTC';

        scored.ticker = parsedTicker;
        scored.accession = accession;
        scored.rawXmlUrl = fileUrl;
        scored.rawHtmlUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}`;
        scored.filedAt = fileDate;

        // Fetch Live Price & Volume
        const marketData = await fetchMarketData(parsedTicker);
        scored.currentPrice = marketData.currentPrice;
        scored.avgVolume = marketData.avgVolume;

        const price = scored.currentPrice !== null ? scored.currentPrice : scored.impliedPrice;
        if (price >= 5.0) continue; // Only under $5

        // Fetch issuer contact details
        if (scored.issuerCik) {
          const contactInfo = await fetchIssuerContact(scored.issuerCik);
          scored.issuerPhone = contactInfo.phone;
          if (contactInfo.address) scored.issuerAddress = contactInfo.address;
        }

        // Fetch Kimi enrichment (CEO, CFO, General Counsel, Law Firm)
        try {
          const kimiData = await enrichWithKimi(scored.issuer, scored.ticker);
          scored.ceo = kimiData.ceo;
          scored.cfo = kimiData.cfo;
          scored.legalCounsel = kimiData.legalCounsel;
          scored.lawFirm = kimiData.lawFirm;
        } catch (kimiErr) {
          console.warn(`Kimi enrichment failed in daily scan:`, kimiErr.message);
          scored.ceo = 'Not Available';
          scored.cfo = 'Not Available';
          scored.legalCounsel = 'Not Available';
          scored.lawFirm = 'Not Available';
        }

        // Recalculate Total Value
        scored.aggregateMktValue = scored.sharesToSell > 0 && price > 0
          ? Math.round(scored.sharesToSell * price) : 0;

        newFilings.push(scored);

        // Insert into database as enriched
        await query(
          `INSERT INTO filings_144 (accession, data, enriched) VALUES ($1, $2, TRUE)
           ON CONFLICT (accession) DO UPDATE SET data = EXCLUDED.data, enriched = TRUE, updated_at = NOW()`,
          [accession, JSON.stringify(scored)]
        );
      } catch (err) {
        console.warn(`Daily scan error for ${accession}:`, err.message);
      }
    }

    let emailSent = false;
    if (newFilings.length > 0) {
      emailSent = await sendEmail(newFilings);
    }

    res.status(200).json({
      date: today,
      newFilingsFound: newFilings.length,
      emailSent,
      newFilings: newFilings.map(f => ({ ticker: f.ticker, issuer: f.issuer, sharesToSell: f.sharesToSell, status: f.status }))
    });
  } catch (err) {
    console.error('Daily scan error:', err);
    res.status(500).json({ error: err.message });
  }
}
