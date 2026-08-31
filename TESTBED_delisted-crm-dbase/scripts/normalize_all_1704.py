import urllib.request
import ssl
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

scout_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
}

# 1. Fetch scout contacts
url_c = "https://edgar-insider-scout.vercel.app/api/contacts"
req_c = urllib.request.Request(url_c, headers=scout_headers)
c_data = []
with urllib.request.urlopen(req_c, context=ctx, timeout=15) as resp:
    c_data = json.loads(resp.read().decode('utf-8')).get('data', [])

# Build maps with normalized keys (stripped CIKs and uppercase Tickers)
legal_by_cik = {}
legal_by_ticker = {}
contacts_by_cik = {}
contacts_by_ticker = {}

for c in c_data:
    raw_cik = c.get('cik')
    raw_ticker = c.get('ticker')
    lc = c.get('legal_counsel')
    
    if raw_cik:
        norm_cik = str(raw_cik).lstrip('0')
        contacts_by_cik[norm_cik] = c
        if lc and str(lc).strip() and str(lc).strip().lower() not in ['none', 'null', 'not available']:
            legal_by_cik[norm_cik] = str(lc).strip()
            
    if raw_ticker:
        norm_ticker = str(raw_ticker).upper().strip()
        contacts_by_ticker[norm_ticker] = c
        if lc and str(lc).strip() and str(lc).strip().lower() not in ['none', 'null', 'not available']:
            legal_by_ticker[norm_ticker] = str(lc).strip()

print(f"Normalized Legal Counsel Map: {len(legal_by_cik)} by CIK, {len(legal_by_ticker)} by Ticker.")

# Load seed data
seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(seed_path, "r", encoding="utf-8") as f:
    records = json.load(f)

matched_legal = 0
updated_records = []

for item in records:
    ticker = (item.get('ticker') or 'OTC').upper().strip()
    cik = str(item.get('cik') or '').lstrip('0')

    lc = legal_by_cik.get(cik) or legal_by_ticker.get(ticker)

    if lc:
        item['legalCounsel'] = lc
        matched_legal += 1
    elif not item.get('legalCounsel') or item.get('legalCounsel') == 'General Counsel':
        item['legalCounsel'] = "Not Available"

    otc_url = f"https://www.otcmarkets.com/stock/{item.get('ticker')}/profile" if item.get('ticker') and item.get('ticker') != 'OTC' else "https://www.otcmarkets.com"
    item['otcProfileUrl'] = otc_url

    updated_records.append(item)

print(f"Total Delisted Issuers with Exact Sourced Legal Counsel: {matched_legal} / {len(updated_records)}")

# Check SNBRQ and AWHL
for t in ['SNBRQ', 'AWHL', 'VASO', 'CRTD']:
    rec = next((r for r in updated_records if r.get('ticker') == t), None)
    if rec:
        print(f"\n{t} Record:")
        print(f"  Company: {rec.get('companyName')}")
        print(f"  CEO: {rec.get('ceo')}")
        print(f"  CFO: {rec.get('cfo')}")
        print(f"  Phone: {rec.get('phone')}")
        print(f"  Legal Counsel: {rec.get('legalCounsel')}")
        print(f"  Profile URL: {rec.get('otcProfileUrl')}")

# Save updated dataset
with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(updated_records, f, indent=2)

print(f"\nSuccessfully saved updated seed data with normalized CIK/Ticker matches!")
