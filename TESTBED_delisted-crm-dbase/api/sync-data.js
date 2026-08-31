export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=43200, stale-while-revalidate=43200'
  );

  const isCron = req.headers['x-vercel-cron'] === '1';
  const syncStart = Date.now();

  try {
    const EDGAR_BASE = 'https://edgar-insider-scout.vercel.app';
    const offsets = [0, 500, 1000, 1500];

    const [contactsResult, ...issuerResults] = await Promise.allSettled([
      fetchJSON(`${EDGAR_BASE}/api/contacts`),
      ...offsets.map((off) =>
        fetchJSON(
          `${EDGAR_BASE}/api/signals/fallen-angels/delisted-issuers?from=${off}&dateRange=all&exchange=all`
        )
      ),
    ]);

    const contactMapCik = {};
    const contactMapTicker = {};
    if (
      contactsResult.status === 'fulfilled' &&
      contactsResult.value &&
      contactsResult.value.data
    ) {
      for (const c of contactsResult.value.data) {
        if (c.cik)
          contactMapCik[String(c.cik).replace(/^0+/, '')] = c;
        if (c.ticker)
          contactMapTicker[String(c.ticker).toUpperCase().trim()] = c;
      }
    }

    const allIssuers = [];
    const seenCiks = new Set();
    for (const result of issuerResults) {
      if (
        result.status === 'fulfilled' &&
        result.value &&
        result.value.data
      ) {
        for (const item of result.value.data) {
          const normCik = String(item.cik || '').replace(/^0+/, '');
          if (normCik && !seenCiks.has(normCik)) {
            seenCiks.add(normCik);
            allIssuers.push(item);
          }
        }
      }
    }

    const enriched = allIssuers.map((item, idx) => {
      const normCik = String(item.cik || '').replace(/^0+/, '');
      const ticker = (item.ticker || 'OTC').toUpperCase().trim();
      const cMatch =
        contactMapCik[normCik] || contactMapTicker[ticker] || {};

      const rawLegal = cMatch.legal_counsel;
      const legalCounsel =
        rawLegal &&
        rawLegal.trim() &&
        !['none', 'null', 'not available'].includes(
          rawLegal.toLowerCase()
        )
          ? rawLegal.trim()
          : 'Not Available';

      const rawEmail = cMatch.email;
      const email =
        rawEmail &&
        !rawEmail.startsWith('ir@') &&
        !rawEmail.startsWith('contact@') &&
        rawEmail.includes('@')
          ? rawEmail
          : 'Not Available';

      const rawPhone = cMatch.phone;
      const phone =
        rawPhone && rawPhone.trim().length >= 7
          ? rawPhone.trim()
          : 'Not Available';

      const rawCeo = cMatch.ceo || cMatch.contact_name;
      const ceo =
        rawCeo &&
        rawCeo !== item.companyName &&
        rawCeo.trim().length > 2
          ? rawCeo.trim()
          : 'Not Available';

      const formStr = String(item.form || '').toUpperCase();
      let detailsFallback = 'Delisted issuer filing.';
      if (formStr.includes('15-12G'))
        detailsFallback =
          'Voluntary de-registration of securities under Section 12(g) of the Exchange Act.';
      else if (formStr.includes('15-15D'))
        detailsFallback =
          'Voluntary suspension of reporting duties under Section 15(d) of the Exchange Act.';
      else if (formStr.includes('15F'))
        detailsFallback =
          'Voluntary de-registration and suspension of reporting duties by a foreign private issuer.';
      else if (formStr.includes('15'))
        detailsFallback =
          'Voluntary de-registration of securities (Form 15).';
      else if (formStr.includes('25'))
        detailsFallback =
          'Delisting of securities from exchange listing (Form 25).';

      const otcProfileUrl =
        ticker && ticker !== 'OTC'
          ? `https://www.otcmarkets.com/stock/${ticker}/profile`
          : 'https://www.otcmarkets.com';

      return {
        id: item.id || `delisted-${idx + 1}`,
        cik: item.cik || '',
        companyName: item.companyName || 'Unknown Issuer',
        ticker: ticker,
        delistDate:
          item.delistDate || new Date().toISOString().slice(0, 10),
        form: item.form || '15-12G',
        exchange: item.exchange || 'Delisted → OTC',
        eventType: item.eventType || 'Delisting Notice',
        secLandingPage:
          item.secLandingPage ||
          `https://www.sec.gov/edgar/searchedgar/companysearch?CIK=${item.cik}`,
        secFullText: item.secFullText || '',
        location: item.location || 'United States',
        email: email,
        phone: phone,
        ceo: ceo,
        cfo: 'Not Available',
        otcProfileUrl: otcProfileUrl,
        legalCounsel: legalCounsel,
        details: item.details || detailsFallback,
      };
    });

    const elapsed = Date.now() - syncStart;

    console.log(
      `[SYNC] ${isCron ? 'CRON' : 'REQUEST'} | ${enriched.length} issuers | ${elapsed}ms`
    );

    return res.status(200).json({
      success: true,
      lastSync: new Date().toISOString(),
      totalRecords: enriched.length,
      syncDurationMs: elapsed,
      source: isCron ? 'cron' : 'request',
      data: enriched,
    });
  } catch (error) {
    console.error('[SYNC ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      lastSync: new Date().toISOString(),
      data: [],
    });
  }
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DELISTED-CRM-SYNC/1.0',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
