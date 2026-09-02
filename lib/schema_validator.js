// Runtime SEC Filing & Issuer Schema Validator Guardrails
// Validates, normalizes, and sanitizes upstream SEC filings and contact feeds to prevent runtime UI crashes.

export function sanitizeCik(rawCik) {
  if (!rawCik) return '';
  return String(rawCik).trim().padStart(10, '0');
}

export function sanitizeNormalizedCik(rawCik) {
  if (!rawCik) return '';
  return String(rawCik).trim().replace(/^0+/, '');
}

export function sanitizeEmail(rawEmail) {
  if (!rawEmail || typeof rawEmail !== 'string') return 'Not Available';
  const clean = rawEmail.trim().toLowerCase();
  if (clean.startsWith('ir@') || clean.startsWith('contact@') || !clean.includes('@') || clean.length < 5) {
    return 'Not Available';
  }
  return clean;
}

export function sanitizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return 'Not Available';
  const clean = rawPhone.trim();
  if (clean.length < 7 || ['none', 'null', 'not available', '000-000-0000'].includes(clean.toLowerCase())) {
    return 'Not Available';
  }
  return clean;
}

export function sanitizeLegalCounsel(rawLegal) {
  if (!rawLegal || typeof rawLegal !== 'string') return 'Not Available';
  const clean = rawLegal.trim();
  if (['none', 'null', 'not available', 'n/a', 'unknown'].includes(clean.toLowerCase()) || clean.length < 2) {
    return 'Not Available';
  }
  return clean;
}

export function validateFilingRecord(item, index = 0) {
  if (!item || typeof item !== 'object') return null;

  const cik = sanitizeCik(item.cik || item.CIK);
  const companyName = (item.companyName || item.company_name || item.name || 'Unknown Issuer').trim();
  const ticker = (item.ticker || item.symbol || 'OTC').toUpperCase().trim();
  const filingDate = item.filingDate || item.date || item.delistDate || new Date().toISOString().slice(0, 10);

  return {
    id: item.id || `filing-${cik || index}-${filingDate}`,
    cik: cik,
    normCik: sanitizeNormalizedCik(cik),
    companyName: companyName,
    ticker: ticker,
    filingDate: filingDate,
    form: (item.form || item.formType || '144').toUpperCase().trim(),
    shares: Number(item.shares || item.securitiesToSell || 0) || 0,
    approxValue: Number(item.approxValue || item.marketValue || 0) || 0,
    broker: (item.broker || item.brokerName || 'Not Disclosed').trim(),
    relationship: (item.relationship || item.insiderRelationship || 'Officer / Director').trim(),
    legalCounsel: sanitizeLegalCounsel(item.legalCounsel || item.legal_counsel),
    email: sanitizeEmail(item.email),
    phone: sanitizePhone(item.phone)
  };
}

export function validateDelistedRecord(item, index = 0) {
  if (!item || typeof item !== 'object') return null;

  const cik = sanitizeCik(item.cik || item.CIK);
  const normCik = sanitizeNormalizedCik(cik);
  const companyName = (item.companyName || item.company_name || 'Unknown Issuer').trim();
  const ticker = (item.ticker || item.symbol || 'OTC').toUpperCase().trim();
  const legalCounsel = sanitizeLegalCounsel(item.legalCounsel || item.legal_counsel);

  const cleanShellScore = typeof item.cleanShellScore === 'number'
    ? Math.max(0, Math.min(100, item.cleanShellScore))
    : (legalCounsel !== 'Not Available' ? 88 : 72);

  return {
    id: item.id || `delisted-${normCik || index}`,
    region: item.region || 'US',
    cik: cik,
    companyName: companyName,
    ticker: ticker,
    delistDate: item.delistDate || item.date || new Date().toISOString().slice(0, 10),
    form: item.form || '15-12G',
    exchange: item.exchange || 'Delisted → OTC',
    eventType: item.eventType || 'Delisting Notice',
    secLandingPage: item.secLandingPage || (cik ? `https://www.sec.gov/edgar/searchedgar/companysearch?CIK=${cik}` : 'https://www.sec.gov'),
    secFullText: item.secFullText || '',
    location: item.location || 'United States',
    email: sanitizeEmail(item.email),
    phone: sanitizePhone(item.phone),
    ceo: (item.ceo && item.ceo !== companyName && item.ceo.length > 2) ? item.ceo.trim() : 'Not Available',
    cfo: item.cfo || 'Not Available',
    otcProfileUrl: ticker && ticker !== 'OTC' ? `https://www.otcmarkets.com/stock/${ticker}/profile` : 'https://www.otcmarkets.com',
    legalCounsel: legalCounsel,
    status: item.status || 'new',
    cleanShellScore: cleanShellScore,
    shellRating: cleanShellScore >= 80 ? 'Prime Clean Shell' : 'Standard Distressed Asset',
    notes: Array.isArray(item.notes) ? item.notes : [],
    activities: Array.isArray(item.activities) ? item.activities : [],
    details: item.details || 'Delisted corporate filing.'
  };
}
