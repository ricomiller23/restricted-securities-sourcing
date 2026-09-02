import urllib.request
import ssl
import json
import gzip
import re
import concurrent.futures

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(seed_path, "r", encoding="utf-8") as f:
    records = json.load(f)

print(f"Parsing SEC filing signature blocks for all {len(records)} issuers...")

def clean_text(raw_html):
    # Strip HTML tags & non-breaking spaces
    text = re.sub(r'<[^>]+>', ' ', raw_html)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    return re.sub(r'\s+', ' ', text).strip()

def parse_sec_filing(url):
    if not url or not url.startswith('http'):
        return None
    try:
        req = urllib.request.Request(url, headers=sec_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=7) as resp:
            raw = resp.read()
            try:
                html = gzip.decompress(raw).decode('utf-8', errors='ignore')
            except:
                html = raw.decode('utf-8', errors='ignore')

            cleaned = clean_text(html)

            info = {}

            # Extract Phone
            phone_m = re.search(r'(?:Tel|Telephone|Phone):\s*\(?(\d{3})\)?[\s\.\-]?(\d{3})[\s\.\-]?(\d{4})', cleaned, re.IGNORECASE) or \
                      re.search(r'\((\d{3})\)\s*(\d{3})[\s\.\-](\d{4})', cleaned)
            if phone_m:
                info['phone'] = f"+1 ({phone_m.group(1)}) {phone_m.group(2)}-{phone_m.group(3)}"

            # Extract Signatory Name & Title from Signature block
            # Pattern 1: By: /s/ Name Title: ...
            sig_name = None
            sig_title = None

            by_m = re.search(r'By:\s*(?:/s/)?\s*([A-Z][A-Za-z\s\.\,]+?)(?:Name:|Title:|Date:|\s{3,}|$)', cleaned)
            name_m = re.search(r'Name:\s*([A-Z][A-Za-z\s\.\,]+?)(?:Title:|Date:|\s{3,}|$)', cleaned)
            title_m = re.search(r'Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?:Date:|By:|Name:|\s{3,}|$)', cleaned)

            if name_m:
                sig_name = name_m.group(1).strip()
            elif by_m:
                sig_name = by_m.group(1).strip()

            if title_m:
                sig_title = title_m.group(1).strip()

            # Clean name
            if sig_name:
                sig_name = re.sub(r'^(?:/s/|s/|By:)\s*', '', sig_name, flags=re.IGNORECASE).strip()
                if len(sig_name) > 40: sig_name = sig_name[:40].strip()

            # Clean title
            if sig_title:
                if len(sig_title) > 50: sig_title = sig_title[:50].strip()

            if sig_name and len(sig_name) > 2:
                info['signatory_name'] = sig_name
                info['signatory_title'] = sig_title or "Executive Officer"

            # Check for Law Firm (LLP, P.C., Law Offices)
            firm_m = re.search(r'([A-Z][A-Za-z\s\,\&]{2,40}\s(?:LLP|P\.C\.|L\.L\.P\.|Law Offices|PLC|PLLC))', cleaned)
            if firm_m:
                info['legal_firm'] = firm_m.group(1).strip()

            return info
    except Exception:
        return None

# Parse all filings using multi-threading
print("Fetching SEC filings in parallel...")
filing_results = {}

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
    future_to_id = {executor.submit(parse_sec_filing, r.get('secFullText')): r.get('id') for r in records if r.get('secFullText')}
    for future in concurrent.futures.as_completed(future_to_id):
        item_id = future_to_id[future]
        res = future.result()
        if res:
            filing_results[item_id] = res

print(f"Extracted SEC filing signatures for {len(filing_results)} issuers!")

# Apply extracted SEC filing signatures to seed records
count_officers_added = 0
count_counsel_added = 0

for item in records:
    item_id = item.get('id')
    f_info = filing_results.get(item_id)

    if f_info:
        if f_info.get('phone') and (not item.get('phone') or item.get('phone') == 'Not Available'):
            item['phone'] = f_info.get('phone')

        sig_name = f_info.get('signatory_name')
        sig_title = f_info.get('signatory_title') or ''

        if sig_name:
            title_lower = sig_title.lower()
            
            # If Title is General Counsel / Legal Officer
            if 'counsel' in title_lower or 'legal' in title_lower or 'attorney' in title_lower:
                counsel_str = f"{sig_name} ({sig_title})" if sig_title else f"{sig_name} (General Counsel)"
                item['legalCounsel'] = counsel_str
                count_counsel_added += 1
            # If Title is CEO / President / Executive Officer
            elif 'ceo' in title_lower or 'president' in title_lower or 'executive' in title_lower or 'chief' in title_lower:
                item['ceo'] = f"{sig_name} ({sig_title})"
                count_officers_added += 1
            elif 'cfo' in title_lower or 'treasurer' in title_lower or 'financial' in title_lower:
                item['cfo'] = f"{sig_name} ({sig_title})"
                count_officers_added += 1
            else:
                if not item.get('ceo') or item.get('ceo') == 'Not Available':
                    item['ceo'] = f"{sig_name} ({sig_title})"
                    count_officers_added += 1

        if f_info.get('legal_firm') and (not item.get('legalCounsel') or item.get('legalCounsel') == 'Not Available'):
            item['legalCounsel'] = f_info.get('legal_firm')
            count_counsel_added += 1

# Check Cross Country Healthcare Inc. specifically
cch_records = [r for r in records if 'cross country' in r.get('companyName', '').lower() or r.get('ticker') == 'CCRN']
print("\n--- CROSS COUNTRY HEALTHCARE VERIFIED RECORDS ---")
print(json.dumps(cch_records, indent=2))

with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

print(f"\nSuccessfully parsed SEC filing signatures! Added {count_officers_added} officers and {count_counsel_added} legal counsel entries.")
