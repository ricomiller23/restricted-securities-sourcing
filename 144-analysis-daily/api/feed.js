// api/feed.js — Rewritten to use Neon Postgres with optional syncing
import xml2js from 'xml2js';
import { 
  HEADERS, 
  sleep, 
  loadCompanyTickers, 
  cleanXmlKeys, 
  scoreTarget, 
  fetchIssuerContact,
  fetchMarketData,
  enrichWithKimi
} from './_lib/sec.js';
import { query, ensureTable } from './_lib/db.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const lookbackMonths = 6;
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - lookbackMonths);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  try {
    // Ensure DB table exists
    await ensureTable();

    // ─── STEP 1: Query existing records from Postgres ───
    const existingRows = await query(
      `SELECT accession, data, enriched FROM filings_144`,
      []
    );

    const dbCount = existingRows.length;
    const shouldSync = req.query.sync === '1' || dbCount === 0;

    let targets = [];
    let newFetchesCount = 0;
    let totalFTSHits = dbCount;
    let isComplete = true;

    if (!shouldSync) {
      // Instant return path: just map the rows from the DB and return immediately
      for (const row of existingRows) {
        const filing = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        const checkPrice = (filing.currentPrice !== null && filing.currentPrice !== undefined)
          ? filing.currentPrice : filing.impliedPrice;
        if (filing.isOtc && checkPrice < 5.0) {
          targets.push(filing);
        }
      }
    } else {
      // Sync path: Query SEC FTS, fetch missing, enrich, update DB
      const { cikToTicker } = await loadCompanyTickers();
      const existingMap = new Map(existingRows.map(r => [r.accession, r]));

      const queries = ['OTCQB', 'OTCQX', 'OTC', 'Pink', '"OTC Markets"'];
      const searchPromises = queries.map(async (qTerm) => {
        try {
          const pageHits = [];
          const pageSize = 100;
          for (let from = 0; from < 300; from += pageSize) {
            const actualUrl = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(qTerm)}&dateRange=custom&startdt=${startStr}&enddt=${endStr}&forms=144&from=${from}&size=${pageSize}`;
            const ftsRes = await fetch(actualUrl, { headers: HEADERS });
            if (!ftsRes.ok) break;
            const ftsData = await ftsRes.json();
            const hits = ftsData?.hits?.hits || [];
            pageHits.push(...hits);
            const total = ftsData?.hits?.total?.value || 0;
            if (hits.length < pageSize || pageHits.length >= total) break;
          }
          return pageHits;
        } catch (e) {
          return [];
        }
      });
      
      const searchResults = await Promise.all(searchPromises);
      const hitMap = new Map();
      for (const hits of searchResults) {
        for (const hit of hits) {
          const adsh = hit._source?.adsh;
          if (adsh) hitMap.set(adsh, hit);
        }
      }
      const allHits = Array.from(hitMap.values());
      totalFTSHits = allHits.length;
      const MAX_NEW_FETCHES = 80;

      for (const hit of allHits) {
        const src = hit._source || {};
        const cik = src.ciks?.[0] || '';
        const adsh = src.adsh;
        const accession = adsh ? adsh.replace(/-/g, '') : '';
        const fileDate = src.file_date;
        if (!accession) continue;

        if (existingMap.has(accession)) continue;
        if (newFetchesCount >= MAX_NEW_FETCHES) continue;

        newFetchesCount++;
        await sleep(60);

        const fileUrl = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/primary_doc.xml`;
        
        try {
          const fileRes = await fetch(fileUrl, { headers: HEADERS });
          if (!fileRes.ok) continue;

          const xmlText = await fileRes.text();
          const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
          const rawJson = await xmlParser.parseStringPromise(xmlText);
          const cleanJson = cleanXmlKeys(rawJson);
          const formData = cleanJson?.edgarSubmission?.formData || {};
          if (!formData || Object.keys(formData).length === 0) continue;

          const scored = scoreTarget(formData, fileDate);

          // Resolve Ticker
          const displayName = src.display_names?.[0] || '';
          let parsedTicker = 'OTC';
          const tickerMatch = displayName.match(/\s+\(([A-Z0-9.\-]+)\)\s+\(CIK/i);
          if (tickerMatch) {
            parsedTicker = tickerMatch[1].toUpperCase();
          } else if (cik) {
            parsedTicker = cikToTicker[String(cik).padStart(10, '0')] || 'OTC';
          }

          scored.ticker = parsedTicker;
          scored.accession = accession;
          scored.rawXmlUrl = fileUrl;
          scored.rawHtmlUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}`;
          scored.filedAt = fileDate;

          // Insert into Postgres
          await query(
            `INSERT INTO filings_144 (accession, data, enriched) VALUES ($1, $2, FALSE)
             ON CONFLICT (accession) DO NOTHING`,
            [accession, JSON.stringify(scored)]
          );
          existingMap.set(accession, { accession, data: scored, enriched: false });
        } catch (err) {
          console.error(`Error fetching ${accession}:`, err.message);
        }
      }

      // Re-build targets from existingMap
      for (const [acc, row] of existingMap) {
        const filing = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        const checkPrice = (filing.currentPrice !== null && filing.currentPrice !== undefined)
          ? filing.currentPrice : filing.impliedPrice;
        if (filing.isOtc && checkPrice < 5.0) {
          filing._enriched = row.enriched;
          targets.push(filing);
        }
      }

      // Enrich up to 15 unenriched filings
      const unenriched = targets.filter(f => !f._enriched);
      const toEnrich = unenriched.slice(0, 15);

      if (toEnrich.length > 0) {
        const enrichPromises = toEnrich.map(async (filing) => {
          try {
            const marketData = await fetchMarketData(filing.ticker);
            filing.currentPrice = marketData.currentPrice;
            filing.avgVolume = marketData.avgVolume;

            if (!filing.issuerPhone && filing.issuerCik) {
              const contactInfo = await fetchIssuerContact(filing.issuerCik);
              filing.issuerPhone = contactInfo.phone;
              if (contactInfo.address) filing.issuerAddress = contactInfo.address;
            }

            // Fetch Kimi enrichment (CEO, CFO, General Counsel, Law Firm)
            try {
              const kimiData = await enrichWithKimi(filing.issuer, filing.ticker);
              filing.ceo = kimiData.ceo;
              filing.cfo = kimiData.cfo;
              filing.legalCounsel = kimiData.legalCounsel;
              filing.lawFirm = kimiData.lawFirm;
            } catch (kimiErr) {
              console.warn(`Kimi enrichment failed in feed API:`, kimiErr.message);
              filing.ceo = filing.ceo || 'Not Available';
              filing.cfo = filing.cfo || 'Not Available';
              filing.legalCounsel = filing.legalCounsel || 'Not Available';
              filing.lawFirm = filing.lawFirm || 'Not Available';
            }

            // Update DB with enriched data
            await query(
              `UPDATE filings_144 SET data = $1, enriched = TRUE, updated_at = NOW() WHERE accession = $2`,
              [JSON.stringify(filing), filing.accession]
            );
          } catch (e) {
            console.warn(`Enrichment failed for ${filing.ticker}:`, e.message);
          }
        });
        await Promise.allSettled(enrichPromises);
      }

      isComplete = newFetchesCount === 0 || (existingMap.size >= totalFTSHits);
    }

    // Recalculate Total Value for all returning targets
    targets.forEach(filing => {
      const livePrice = (filing.currentPrice !== null && filing.currentPrice !== undefined)
        ? filing.currentPrice : filing.impliedPrice;
      filing.aggregateMktValue = filing.sharesToSell > 0 && livePrice > 0
        ? Math.round(filing.sharesToSell * livePrice) : 0;
      delete filing._enriched;
    });

    // Sort: newest first, then by score
    targets.sort((a, b) => {
      const dateDiff = new Date(b.filedAt) - new Date(a.filedAt);
      if (dateDiff !== 0) return dateDiff;
      return b.score - a.score;
    });

    res.status(200).json({
      lookback: `${lookbackMonths} months`,
      dateRange: { start: startStr, end: endStr },
      totalFilingsFound: totalFTSHits,
      processedCount: dbCount + newFetchesCount,
      targets,
      newFetchesMade: newFetchesCount,
      cacheWarmingProgress: isComplete ? 'Complete' : 'In Progress'
    });
  } catch (err) {
    console.error('Feed API error:', err);
    res.status(500).json({ error: err.message });
  }
}
