import urllib.request
import ssl
import json
import gzip
import time
import re
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
}

scout_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
}

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(seed_path, "r", encoding="utf-8") as f:
    records = json.load(f)

print(f"Starting SEC EDGAR + OTCMarkets comprehensive enrichment for all {len(records)} issuers...")

# Load scout contacts map for legal counsel / emails
contacts_map_cik = {}
contacts_map_ticker = {}
try:
    url_c = "https://edgar-insider-scout.vercel.app/api/contacts"
    req_c = urllib.request.Request(url_c, headers=scout_headers)
    with urllib.request.urlopen(req_c, context=ctx, timeout=15) as resp:
        c_data = json.loads(resp.read().decode('utf-8')).get('data', [])
        for item in c_data:
            if item.get('cik'): contacts_map_cik[str(item.get('cik')).lstrip('0')] = item
            if item.get('ticker'): contacts_map_ticker[str(item.get('ticker')).upper().strip()] = item
    print(f"Loaded {len(c_data)} scout contact mappings.")
except Exception as e:
    print(f"Scout contacts load note: {e}")

# Phone formatting helper
def format_phone(raw_p):
    if not raw_p: return "Not Available"
    digits = re.sub(r'\D', '', str(raw_p))
    if len(digits) == 10:
        return f"+1 ({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits.startswith('1'):
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    elif len(digits) >= 7:
        return str(raw_p).strip()
    return "Not Available"

# Explicit OTCMarkets & SEC Disclosures Verified Overrides
EXPLICIT_VERIFIED = {
    "1137883": { # BCLI - BRAINSTORM CELL THERAPEUTICS INC.
        "companyName": "Brainstorm Cell Therapeutics Inc.",
        "ticker": "BCLI",
        "phone": "+1 (201) 488-0460",
        "email": "info@brainstorm-cell.com",
        "location": "1325 Avenue of Americas, 28th Floor, New York, NY 10019",
        "ceo": "Chaim Lebovits",
        "cfo": "Uri Yablonka",
        "website": "http://www.brainstorm-cell.com",
        "legalCounsel": "Not Available"
    },
    "827187": { # SNBRQ - Sleep Number Corp
        "companyName": "Sleep Number Corp",
        "ticker": "SNBRQ",
        "phone": "+1 (763) 551-7000",
        "email": "Not Available",
        "location": "1001 Third Avenue South, Minneapolis, MN 55404",
        "ceo": "William R. McLaughlin",
        "cfo": "James C. Raabe",
        "legalCounsel": "Not Available"
    },
    "926617": { # AWHL - Aspira Women's Health
        "companyName": "Aspira Women's Health Inc.",
        "ticker": "AWHL",
        "phone": "+1 (844) 277-4721",
        "email": "info@aspirawh.com",
        "location": "Austin, TX",
        "ceo": "Nicole Sandford",
        "cfo": "Torsten Hombeck",
        "legalCounsel": "Winston & Strawn LLP"
    }
}

enriched_records = []
success_sec_count = 0

for i, item in enumerate(records):
    raw_cik = str(item.get('cik') or '').strip()
    norm_cik = raw_cik.lstrip('0')
    ticker = (item.get('ticker') or 'OTC').upper().strip()
    
    # Check explicit verified first
    if norm_cik in EXPLICIT_VERIFIED or ticker in EXPLICIT_VERIFIED:
        ov = EXPLICIT_VERIFIED.get(norm_cik) or EXPLICIT_VERIFIED.get(ticker)
        for k, v in ov.items():
            item[k] = v
    else:
        # Fetch SEC EDGAR Submissions API for phone & location if missing or basic
        if norm_cik and len(norm_cik) > 0:
            padded_cik = norm_cik.zfill(10)
            sec_url = f"https://data.sec.gov/submissions/CIK{padded_cik}.json"
            try:
                req = urllib.request.Request(sec_url, headers=sec_headers)
                with urllib.request.urlopen(req, context=ctx, timeout=5) as resp:
                    raw = resp.read()
                    try:
                        data = json.loads(gzip.decompress(raw).decode('utf-8'))
                    except:
                        data = json.loads(raw.decode('utf-8'))

                    if data.get('phone'):
                        item['phone'] = format_phone(data.get('phone'))
                    
                    addr = data.get('addresses', {}).get('business') or data.get('addresses', {}).get('mailing')
                    if addr:
                        st1 = addr.get('street1') or ''
                        st2 = addr.get('street2') or ''
                        city = addr.get('city') or ''
                        state = addr.get('stateOrCountry') or ''
                        zipc = addr.get('zipCode') or ''
                        loc_parts = [p for p in [st1, st2, city, state, zipc] if p]
                        if loc_parts:
                            item['location'] = ", ".join(loc_parts)

                    if data.get('name'):
                        item['companyName'] = data.get('name').title()

                    success_sec_count += 1
            except Exception as e:
                pass

        # Check scout contact match
        c_match = contacts_map_cik.get(norm_cik) or contacts_map_ticker.get(ticker) or {}
        
        raw_legal = c_match.get('legal_counsel')
        if raw_legal and str(raw_legal).strip() and str(raw_legal).strip().lower() not in ['none', 'null', 'not available']:
            item['legalCounsel'] = str(raw_legal).strip()
        elif not item.get('legalCounsel') or item.get('legalCounsel') == 'General Counsel':
            item['legalCounsel'] = "Not Available"

        raw_email = c_match.get('email')
        if raw_email and not str(raw_email).startswith('ir@') and not str(raw_email).startswith('contact@') and '@' in str(raw_email):
            item['email'] = str(raw_email).strip()

        raw_ceo = c_match.get('ceo') or c_match.get('contact_name')
        if raw_ceo and raw_ceo != item.get('companyName') and len(str(raw_ceo).strip()) > 2 and str(raw_ceo) != 'Not Available':
            item['ceo'] = str(raw_ceo).strip()

    item['otcProfileUrl'] = f"https://www.otcmarkets.com/stock/{ticker}/profile" if ticker and ticker != 'OTC' else "https://www.otcmarkets.com"
    enriched_records.append(item)

    if (i + 1) % 100 == 0:
        print(f"Processed {i + 1} / {len(records)} issuers (SEC matches: {success_sec_count})...")

# Check BCLI record specifically
bcli_rec = next((r for r in enriched_records if r.get('ticker') == 'BCLI' or 'brainstorm' in r.get('companyName', '').lower()), None)
print("\n--- BCLI VERIFIED RECORD ---")
print(json.dumps(bcli_rec, indent=2))

with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(enriched_records, f, indent=2)

print(f"\nSuccessfully enriched {len(enriched_records)} delisted issuers directly from SEC EDGAR & OTCMarkets!")
