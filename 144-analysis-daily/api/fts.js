import { 
  HEADERS, 
  sleep, 
  loadCompanyTickers, 
  cleanXmlKeys, 
  scoreTarget, 
  fetchIssuerContact,
  calculateAvailability,
  fetchMarketData
} from './_lib/sec.js';
import xml2js from 'xml2js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, forms = "144", start, end, from = 0 } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const { cikToTicker } = await loadCompanyTickers();

    const searchUrl = new URL("https://efts.sec.gov/LATEST/search-index");
    searchUrl.searchParams.append("q", q);
    if (forms) {
      searchUrl.searchParams.append("forms", forms);
    }
    
    // Use custom date range if dates are provided, otherwise default to SEC's defaults
    if (start || end) {
      searchUrl.searchParams.append("dateRange", "custom");
      if (start) searchUrl.searchParams.append("startdt", start);
      if (end) searchUrl.searchParams.append("enddt", end);
    }
    
    searchUrl.searchParams.append("from", from);

    console.log(`Querying SEC FTS: ${searchUrl.toString()}`);
    const searchRes = await fetch(searchUrl.toString(), { headers: HEADERS });
    
    if (!searchRes.ok) {
      throw new Error(`SEC FTS returned HTTP error status ${searchRes.status}`);
    }

    const data = await searchRes.json();
    const hitsList = data.hits?.hits || [];
    const enrichedHits = [];
    const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    // Process up to 20 search hits in details to avoid Vercel timeouts (FTS results can be slow to parse XMLs)
    const processLimit = 20;
    const hitsToProcess = hitsList.slice(0, processLimit);

    for (const hit of hitsToProcess) {
      const src = hit._source || {};
      const cik = src.ciks?.[0] || '';
      const adsh = src.adsh; // Accession number with dashes (e.g. 0001213900-24-000001)
      const accession = adsh ? adsh.replace(/-/g, '') : '';
      const filerCik = adsh ? adsh.split('-')[0] : '';
      const fileDate = src.file_date;
      
      const displayName = src.display_names?.[0] || '';
      const companyName = displayName.split('  (')[0] || 'Unknown Company';
      
      let parsedTicker = 'OTC';
      const tickerMatch = displayName.match(/\s+\(([A-Z0-9.\-]+)\)\s+\(CIK/i);
      if (tickerMatch) {
        parsedTicker = tickerMatch[1].toUpperCase();
      } else if (cik) {
        parsedTicker = cikToTicker[String(cik).padStart(10, '0')] || 'OTC';
      }

      let enrichedData = {
        id: hit._id,
        cik: cik,
        accession: accession,
        form: src.form,
        companyName: companyName,
        fileDate: fileDate,
        title: hit._title || '',
        snippet: hit.highlight?.text?.[0] || src.title || '',
        ticker: parsedTicker,
        sharesToSell: 0,
        aggregateMktValue: 0,
        impliedPrice: 0,
        acquisitionBasis: '',
        status: 'Available',
        score: 0,
        isConvertible: false,
        depositWindow: 'Immediate',
        saleWindow: 'Immediate',
        eligibleDate: null,
        acquiredDate: null,
      };

      // If it's a Form 144, download the XML to extract rich structured data
      if ((src.form === "144" || src.form === "144/A") && cik && accession) {
        await sleep(120);
        const fileUrl = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/primary_doc.xml`;
        try {
          const fileRes = await fetch(fileUrl, { headers: HEADERS });
          if (fileRes.ok) {
            const xmlText = await fileRes.text();
            const rawJson = await xmlParser.parseStringPromise(xmlText);
            const cleanJson = cleanXmlKeys(rawJson);
            const formData = cleanJson?.edgarSubmission?.formData || {};

            if (formData && Object.keys(formData).length > 0) {
              const scored = scoreTarget(formData, fileDate);
              
              // Override details with XML content
              enrichedData.sharesToSell = scored.sharesToSell;
              enrichedData.aggregateMktValue = scored.aggregateMktValue;
              enrichedData.impliedPrice = scored.impliedPrice;
              enrichedData.acquisitionBasis = scored.acquisitionBasis;
              enrichedData.status = scored.status;
              enrichedData.score = scored.score;
              enrichedData.isConvertible = scored.isConvertible;
              enrichedData.depositWindow = scored.depositWindow;
              enrichedData.saleWindow = scored.saleWindow;
              enrichedData.eligibleDate = scored.eligibleDate;
              enrichedData.acquiredDate = scored.acquiredDate;
              enrichedData.seller = scored.seller;
              enrichedData.relationship = scored.relationship;
              enrichedData.broker = scored.broker;
              enrichedData.rawXmlUrl = fileUrl;
              enrichedData.rawHtmlUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}`;
              
              // Pull Contact Details
              const contactInfo = await fetchIssuerContact(cik);
              enrichedData.issuerPhone = contactInfo.phone;
              enrichedData.issuerAddress = contactInfo.address;
            }
          }
        } catch (xmlErr) {
          console.warn(`Could not parse XML for search hit ${accession}:`, xmlErr.message);
        }
      }

      // If XML parsing didn't fill in values but the snippet indicates it's a convertible/debt
      if (!enrichedData.isConvertible) {
        const textToSearch = (enrichedData.snippet + ' ' + enrichedData.title + ' ' + enrichedData.acquisitionBasis).toLowerCase();
        enrichedData.isConvertible = ["convertible", "debenture", "conversion", "note", "debt"].some(k => textToSearch.includes(k));
      }

      // Fetch Yahoo Finance Price and Avg Volume
      try {
        const marketData = await fetchMarketData(enrichedData.ticker);
        enrichedData.currentPrice = marketData.currentPrice;
        enrichedData.avgVolume = marketData.avgVolume;
      } catch (e) {
        enrichedData.currentPrice = null;
        enrichedData.avgVolume = null;
      }

      // Mark OTC status for display purposes (no hard filter — user searched for this)
      const listedExchanges = ["NASDAQ", "NYSE", "AMEX", "ARCA", "BATS", "CBOE", "NASD"];
      const exch = String(enrichedData.exchange || '').toUpperCase();
      enrichedData.isOtc = !listedExchanges.some(x => exch.includes(x));

      enrichedHits.push(enrichedData);
    }

    // Sort by file date (newest first), then score
    enrichedHits.sort((a, b) => {
      const dateDiff = new Date(b.fileDate || 0) - new Date(a.fileDate || 0);
      if (dateDiff !== 0) return dateDiff;
      return (b.score || 0) - (a.score || 0);
    });

    res.status(200).json({
      query: q,
      totalHits: data.hits?.total?.value || enrichedHits.length,
      hits: enrichedHits
    });
  } catch (err) {
    console.error("FTS search error:", err);
    res.status(500).json({ error: err.message });
  }
}
