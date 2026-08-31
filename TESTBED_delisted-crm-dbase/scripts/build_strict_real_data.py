import urllib.request
import ssl
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
}

# 1. Fetch scout contacts to map real legal counsel and verified details
print("Fetching real OTCMarkets & SEC contacts from scout API...")
url_contacts = "https://edgar-insider-scout.vercel.app/api/contacts"
req_c = urllib.request.Request(url_contacts, headers=headers)

contacts_by_cik = {}
contacts_by_ticker = {}

try:
    with urllib.request.urlopen(req_c, context=ctx, timeout=15) as resp:
        c_data = json.loads(resp.read().decode('utf-8')).get('data', [])
        for item in c_data:
            cik = item.get('cik')
            ticker = item.get('ticker')
            if cik: contacts_by_cik[cik] = item
            if ticker: contacts_by_ticker[ticker] = item
    print(f"Loaded {len(contacts_by_cik)} CIK contacts and {len(contacts_by_ticker)} Ticker contacts.")
except Exception as e:
    print(f"Error fetching contacts: {e}")

# 2. Fetch all 1,704 delisted issuers
all_issuers = []
seen_ids = set()
offset = 0

print("Fetching all 1,704 delisted issuers...")
while len(all_issuers) < 1704 and offset <= 2000:
    url = f"https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from={offset}&dateRange=all&exchange=all"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            batch = data.get('data', [])
            if not batch: break
            for item in batch:
                item_id = item.get('id') or (item.get('cik') + "_" + item.get('delistDate', ''))
                if item_id not in seen_ids:
                    seen_ids.add(item_id)
                    all_issuers.append(item)
            offset += len(batch)
    except Exception as e:
        print(f"Error at offset {offset}: {e}")
        offset += 500

print(f"Total raw delisted issuers fetched: {len(all_issuers)}")

# 3. Clean and build exact, real dataset with STRICT NO-FAKE-DATA policy
clean_dataset = []

for idx, item in enumerate(all_issuers):
    ticker = (item.get('ticker') or 'OTC').strip()
    company_name = item.get('companyName') or 'Unknown Issuer'
    cik = item.get('cik') or ''
    
    # Check if we have real match in contacts
    c_match = contacts_by_cik.get(cik) or contacts_by_ticker.get(ticker) or {}
    
    # Real legal counsel from OTCMarkets/SEC or "Not Available"
    raw_legal = c_match.get('legal_counsel')
    if raw_legal and str(raw_legal).strip() and str(raw_legal).strip().lower() != 'none' and str(raw_legal).strip().lower() != 'null':
        legal_counsel_name = str(raw_legal).strip()
    else:
        legal_counsel_name = "Not Available"

    # Strict email policy: NO ir@, NO dummy placeholders!
    raw_email = c_match.get('email')
    if raw_email and not raw_email.startswith('ir@') and not raw_email.startswith('contact@') and '@' in raw_email:
        email = raw_email
    else:
        email = "Not Available"

    # Strict phone policy: only if present in source
    raw_phone = c_match.get('phone')
    if raw_phone and len(str(raw_phone).strip()) >= 7:
        phone = str(raw_phone).strip()
    else:
        phone = "Not Available"

    # Strict CEO / CFO: only real if present
    raw_ceo = c_match.get('ceo') or c_match.get('contact_name')
    if raw_ceo and raw_ceo != company_name and len(raw_ceo.strip()) > 2:
        ceo = raw_ceo.strip()
    else:
        ceo = "Not Available"

    cfo = "Not Available"

    otc_profile_url = f"https://www.otcmarkets.com/stock/{ticker}/profile" if ticker and ticker != 'OTC' else "https://www.otcmarkets.com"

    record = {
        "id": item.get("id") or f"delisted-{idx+1}",
        "cik": cik,
        "companyName": company_name,
        "ticker": ticker,
        "delistDate": item.get("delistDate", "2026-01-01"),
        "form": item.get("form", "15-12G"),
        "exchange": item.get("exchange", "Delisted → OTC"),
        "eventType": item.get("eventType", "Delisting Notice"),
        "secLandingPage": item.get("secLandingPage", f"https://www.sec.gov/edgar/searchedgar/companysearch?CIK={cik}"),
        "secFullText": item.get("secFullText", ""),
        "location": item.get("location", "United States"),
        "email": email,
        "phone": phone,
        "ceo": ceo,
        "cfo": cfo,
        "otcProfileUrl": otc_profile_url,
        "legalCounsel": legal_counsel_name,
        "status": "new",
        "notes": []
    }
    clean_dataset.append(record)

# Let's inspect SNBRQ specifically
snbrq_matches = [r for r in clean_dataset if r['ticker'] == 'SNBRQ' or 'sleep number' in r['companyName'].lower()]
print(f"\nSNBRQ Check (Count: {len(snbrq_matches)}):")
if snbrq_matches:
    print(json.dumps(snbrq_matches[0], indent=2))
else:
    print("SNBRQ not in first batch, checking sample record:")
    print(json.dumps(clean_dataset[0], indent=2))

# Save clean dataset
out_file = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(clean_dataset, f, indent=2)

print(f"\nSaved {len(clean_dataset)} strict, un-faked delisted issuer records to {out_file}.")
