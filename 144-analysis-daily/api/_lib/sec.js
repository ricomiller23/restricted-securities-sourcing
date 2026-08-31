import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

export const UA = "144AnalysisDaily/1.0 (contact: eric.miller@millersourcing.com)";
export const HEADERS = { "User-Agent": UA };
export const SLEEP_MS = 150;

const TICKERS_CACHE_FILE = '/tmp/company_tickers.json';
const SUBMISSIONS_CACHE_DIR = '/tmp/submissions';

if (!fs.existsSync(SUBMISSIONS_CACHE_DIR)) {
  try {
    fs.mkdirSync(SUBMISSIONS_CACHE_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create submissions cache dir:", e.message);
  }
}

let cikToTicker = {};
let cikToName = {};
let tickersLoaded = false;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loadCompanyTickers = async () => {
  if (tickersLoaded && Object.keys(cikToTicker).length > 0) {
    return { cikToTicker, cikToName };
  }

  try {
    let rawData;
    let shouldFetch = true;

    if (fs.existsSync(TICKERS_CACHE_FILE)) {
      const stats = fs.statSync(TICKERS_CACHE_FILE);
      const ageMs = Date.now() - stats.mtimeMs;
      // Cache for 24 hours
      if (ageMs < 24 * 60 * 60 * 1000) {
        try {
          rawData = JSON.parse(fs.readFileSync(TICKERS_CACHE_FILE, 'utf8'));
          shouldFetch = false;
        } catch (e) {
          console.error("Failed to parse cached company tickers:", e);
        }
      }
    }

    if (shouldFetch) {
      console.log("Fetching company tickers from SEC...");
      try {
        const res = await fetch("https://www.sec.gov/files/company_tickers.json", { headers: HEADERS });
        if (res.ok) {
          rawData = await res.json();
          try {
            fs.writeFileSync(TICKERS_CACHE_FILE, JSON.stringify(rawData, null, 2));
          } catch (wErr) {
            console.warn("Could not write tickers cache file:", wErr.message);
          }
        } else {
          console.warn(`Failed to fetch tickers from SEC (status ${res.status}). Trying cache fallback.`);
          if (fs.existsSync(TICKERS_CACHE_FILE)) {
            rawData = JSON.parse(fs.readFileSync(TICKERS_CACHE_FILE, 'utf8'));
          }
        }
      } catch (err) {
        console.error("Error fetching company tickers:", err.message);
        if (fs.existsSync(TICKERS_CACHE_FILE)) {
          rawData = JSON.parse(fs.readFileSync(TICKERS_CACHE_FILE, 'utf8'));
        }
      }
    }

    if (rawData) {
      cikToTicker = {};
      cikToName = {};
      for (const key in rawData) {
        const item = rawData[key];
        if (item && item.cik_str !== undefined) {
          const paddedCik = String(item.cik_str).padStart(10, '0');
          cikToTicker[paddedCik] = String(item.ticker).toUpperCase();
          cikToName[paddedCik] = item.title;
        }
      }
      tickersLoaded = true;
      console.log(`Loaded ${Object.keys(cikToTicker).length} CIK-to-ticker mappings.`);
    }
  } catch (err) {
    console.error("Critical error in loadCompanyTickers:", err);
  }

  return { cikToTicker, cikToName };
};

export const getNum = (x) => {
  if (!x) return 0;
  const str = Array.isArray(x) ? x[0] : x;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
};

export const getStr = (x) => {
  if (!x) return '';
  let val = Array.isArray(x) ? x[0] : x;
  if (typeof val === 'object' && val !== null) {
    if (val._) val = val._;
    else if (val.text) val = val.text;
    else return '';
  }
  return String(val || '').trim();
};

export const cleanXmlKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(cleanXmlKeys);

  const newObj = {};
  for (const key in obj) {
    const cleanKey = key.includes(':') ? key.split(':').pop() : key;
    newObj[cleanKey] = cleanXmlKeys(obj[key]);
  }
  return newObj;
};

export const parseAddress = (addrObj) => {
  if (!addrObj) return '';
  const street1 = getStr(addrObj.street1);
  const street2 = getStr(addrObj.street2);
  const city = getStr(addrObj.city);
  const state = getStr(addrObj.stateOrCountry || addrObj.stateOrProvince);
  const zip = getStr(addrObj.zipCode || addrObj.zip);
  
  return [street1, street2, city, state, zip].filter(Boolean).join(', ');
};

export const fetchIssuerContact = async (cik) => {
  if (!cik) return { phone: '', address: '' };
  
  const paddedCik = String(cik).padStart(10, '0');
  const cachePath = path.join(SUBMISSIONS_CACHE_DIR, `${paddedCik}.json`);
  
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (e) {
      // Ignore parse error
    }
  }

  const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
  try {
    await sleep(SLEEP_MS);
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return { phone: '', address: '' };
    
    const data = await res.json();
    const phone = data.phone || '';
    
    let address = '';
    const busAddr = data.addresses?.business;
    if (busAddr) {
      address = parseAddress(busAddr);
    }
    
    const result = { phone, address };
    try {
      fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
    } catch (wErr) {
      // Read-only filesystem warning
    }
    return result;
  } catch (err) {
    console.error(`Error fetching CIK details: ${err.message}`);
    return { phone: '', address: '' };
  }
};

export const calculateAvailability = (type, approxSaleDate, acquiredDate, filedDate) => {
  let depositWindow = 'Immediate';
  let saleWindow = 'Immediate';
  let eligibleDate = null;
  let status = 'Available';

  const referenceDateStr = filedDate || approxSaleDate || new Date().toISOString().split('T')[0];
  const referenceDate = new Date(referenceDateStr);

  if (type === 'convertible' || type === 'debt') {
    if (acquiredDate) {
      const acqDate = new Date(acquiredDate);
      if (!isNaN(acqDate)) {
        const eligible = new Date(acqDate);
        eligible.setMonth(eligible.getMonth() + 6);
        eligibleDate = eligible.toISOString().split('T')[0];

        const daysToEligible = Math.ceil((eligible - referenceDate) / (1000 * 60 * 60 * 24));
        if (daysToEligible > 0) {
          status = `Restricted (Eligible in ${daysToEligible} days)`;
          depositWindow = `Eligible on ${eligibleDate}`;
          saleWindow = `Post-eligibility (${eligibleDate})`;
        } else {
          status = 'Eligible';
          depositWindow = 'Immediate (6-mo holding met)';
          saleWindow = approxSaleDate ? `${approxSaleDate} to +3 months` : 'Immediate';
        }
      } else {
        status = 'Needs acquired date validation';
        depositWindow = 'Pending validation';
        saleWindow = 'Pending validation';
      }
    } else {
      status = 'Needs acquired date validation';
      depositWindow = 'Pending validation';
      saleWindow = 'Pending validation';
    }
  } else {
    // Standard Form 144
    if (approxSaleDate) {
      const saleDate = new Date(approxSaleDate);
      if (!isNaN(saleDate)) {
        const endDate = new Date(saleDate);
        endDate.setMonth(endDate.getMonth() + 3);
        
        const depositStart = new Date(saleDate);
        depositStart.setDate(depositStart.getDate() - 14);
        const depositEnd = new Date(saleDate);
        depositEnd.setDate(depositEnd.getDate() - 7);

        const formatDate = (d) => d.toISOString().split('T')[0];
        depositWindow = `${formatDate(depositStart)} to ${formatDate(depositEnd)}`;
        saleWindow = `${approxSaleDate} to ${formatDate(endDate)}`;
        
        const daysToSale = Math.ceil((saleDate - referenceDate) / (1000 * 60 * 60 * 24));
        if (daysToSale > 0) {
          status = `Upcoming in ${daysToSale} days`;
        } else if (Math.ceil((endDate - referenceDate) / (1000 * 60 * 60 * 24)) >= 0) {
          status = 'Active Sale Window';
        } else {
          status = 'Expired Window';
        }
      }
    }
  }

  return { depositWindow, saleWindow, eligibleDate, status };
};

export const scoreTarget = (data, filedDate) => {
  const issuer = data.issuerInfo || {};
  const si = (Array.isArray(data.securitiesInformation) ? data.securitiesInformation[0] : data.securitiesInformation) || {};
  const stbList = Array.isArray(data.securitiesToBeSold) 
    ? data.securitiesToBeSold 
    : (data.securitiesToBeSold ? [data.securitiesToBeSold] : []);

  const exch = String(si.securitiesExchangeName || '').toUpperCase();
  const listedExchanges = ["NASDAQ", "NYSE", "AMEX", "ARCA", "BATS", "CBOE", "NASD", "NYSE MKT", "NYSE ARCA"];
  const isOtc = !listedExchanges.some(x => exch.includes(x));

  const rel = String(issuer.relationshipsToIssuer || '').toLowerCase();
  const isControl = ["officer", "director", "10%", "10% owner", "affiliate", "insider"].some(w => rel.includes(w));

  const toSell = getNum(si.noOfUnitsSold || si.numberOfUnitsToBeSold || si.numberOfUnitsSold || si.noOfUnitsToBeSold);
  const outstanding = getNum(si.noOfUnitsOutstanding || si.numberOfUnitsOutstanding);
  const amv = getNum(si.aggregateMarketValue || si.marketValue);
  const slicePct = outstanding ? (toSell / outstanding) * 100 : null;

  const impliedPrice = toSell > 0 ? amv / toSell : 0;

  const basisText = stbList.map(b => 
    `${b.natureOfAcquisitionTransaction || ''} ${b.natureOfPayment || ''}`
  ).join(' ').toLowerCase();

  // Convertible debentures detection
  const isConvertible = ["convertible", "debenture", "conversion", "note", "debt"].some(k => basisText.includes(k));
  const acquiredDate = stbList.length > 0 ? getStr(stbList[0].acquiredDate) : '';

  // Timing/Eligibility Analysis
  const timeline = calculateAvailability(
    isConvertible ? 'convertible' : '144',
    getStr(si.approxSaleDate),
    acquiredDate,
    filedDate
  );

  // Score Calculation (Vercel edition - clean logic)
  let score = 0;
  if (isOtc) score += 25;
  if (isConvertible) score += 20;
  if (isControl) score += 15;
  if (slicePct !== null && slicePct > 0.5) score += Math.min(slicePct * 10, 20);
  score += Math.min(amv / 50000, 20); // 1 point per $50k up to 20 points

  const sellerAddress = parseAddress(issuer.address);
  const brokerAddress = parseAddress(si.brokerOrMarketMakerDetails?.address);

  return {
    issuer: getStr(issuer.issuerName),
    issuerCik: getStr(issuer.issuerCik),
    seller: getStr(issuer.nameOfPersonForWhoseAccountTheSecuritiesAreToBeSold),
    relationship: getStr(issuer.relationshipsToIssuer),
    exchange: getStr(si.securitiesExchangeName),
    isOtc,
    sharesToSell: Math.round(toSell),
    sharesOutstanding: Math.round(outstanding),
    slicePct: slicePct !== null ? Math.round(slicePct * 10000) / 10000 : null,
    aggregateMktValue: Math.round(amv),
    impliedPrice: Math.round(impliedPrice * 100) / 100,
    acquisitionBasis: basisText.trim() || 'Standard Open Market/Option Exercise',
    isConvertible,
    acquiredDate,
    broker: si.brokerOrMarketMakerDetails 
      ? (Array.isArray(si.brokerOrMarketMakerDetails)
          ? getStr(si.brokerOrMarketMakerDetails[0]?.name)
          : getStr(si.brokerOrMarketMakerDetails.name)) || ''
      : '',
    approxSaleDate: getStr(si.approxSaleDate),
    sellerAddress,
    brokerAddress,
    depositWindow: timeline.depositWindow,
    saleWindow: timeline.saleWindow,
    eligibleDate: timeline.eligibleDate,
    status: timeline.status,
    score: Math.round(score * 10) / 10
  };
};

const MARKET_CACHE_DIR = '/tmp/market_data';
if (!fs.existsSync(MARKET_CACHE_DIR)) {
  try {
    fs.mkdirSync(MARKET_CACHE_DIR, { recursive: true });
  } catch (e) {}
}

export const fetchMarketData = async (ticker) => {
  if (!ticker || ticker === 'OTC' || ticker === 'Unknown') {
    return { currentPrice: null, avgVolume: null };
  }

  const cachePath = path.join(MARKET_CACHE_DIR, `${ticker.toLowerCase()}.json`);
  if (fs.existsSync(cachePath)) {
    try {
      const stats = fs.statSync(cachePath);
      const ageMs = Date.now() - stats.mtimeMs;
      // Cache market data for 4 hours to protect rate limit
      if (ageMs < 4 * 60 * 60 * 1000) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      }
    } catch (e) {}
  }

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=3mo&interval=1d`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    
    if (res.ok) {
      const json = await res.json();
      const meta = json.chart?.result?.[0]?.meta || {};
      const currentPrice = meta.regularMarketPrice || null;
      
      const volumes = json.chart?.result?.[0]?.indicators?.quote?.[0]?.volume || [];
      const validVolumes = volumes.filter(v => v !== null && v !== undefined);
      const avgVolume = validVolumes.length > 0 
        ? Math.round(validVolumes.reduce((a, b) => a + b, 0) / validVolumes.length)
        : null;

      const result = { currentPrice, avgVolume };
      try {
        fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));
      } catch (e) {}
      return result;
    }
  } catch (err) {
    console.warn(`Failed to fetch Yahoo market data for ${ticker}:`, err.message);
  }

  return { currentPrice: null, avgVolume: null };
};

export const enrichWithKimi = async (company, ticker) => {
  if (!company) return { ceo: 'Not Available', cfo: 'Not Available', legalCounsel: 'Not Available', lawFirm: 'Not Available' };
  
  const prompt = `Who is the current CEO, CFO, and General Counsel of ${company} (ticker ${ticker || 'N/A'})? Provide full names. Format exactly as: CEO: [Full Name] | CFO: [Full Name] | General Counsel: [Full Name] | Law Firm: [Firm Name LLP]`;

  const apiKey = process.env.MOONSHOT_API_KEY || "sk-wxWKYVDyrkuG3mF1fAzj5rvLLUjnG4uwtM0Q45NYjMnlqiL3";

  try {
    const res = await fetch("https://api.moonshot.ai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: "You are a financial research assistant. Only provide names you are confident about from SEC filings, proxy statements, or company websites. If unknown, write Not Available."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 250
      })
    });

    if (!res.ok) {
      throw new Error(`Moonshot API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    const extract = (label) => {
      const regex = new RegExp(`${label}:\\s*([^|\\n]+)`, 'i');
      const match = content.match(regex);
      if (match) {
        const val = match[1].trim();
        if (!['not available', 'n/a', 'unknown', 'none', ''].includes(val.toLowerCase())) {
          return val;
        }
      }
      return 'Not Available';
    };

    return {
      ceo: extract('CEO'),
      cfo: extract('CFO'),
      legalCounsel: extract('General Counsel'),
      lawFirm: extract('Law Firm')
    };
  } catch (err) {
    console.error(`Kimi enrichment failed for ${company}:`, err.message);
    return { ceo: 'Not Available', cfo: 'Not Available', legalCounsel: 'Not Available', lawFirm: 'Not Available' };
  }
};

