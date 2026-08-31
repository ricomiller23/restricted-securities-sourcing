import urllib.request
import ssl
import json
import gzip
import re
import time
import concurrent.futures
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
}

sec_archive_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(seed_path, "r", encoding="utf-8") as f:
    records = json.load(f)

print(f"Starting optimized SEC filing signature extraction for {len(records)} issuers...", flush=True)

def clean_html(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    return re.sub(r'\s+', ' ', text).strip()

def process_issuer(item):
    norm_cik = str(item.get('cik') or '').strip().lstrip('0')
    if not norm_cik: return item

    # If legalCounsel or ceo is still missing
    need_legal = item.get('legalCounsel') == 'Not Available'
    need_ceo = item.get('ceo') == 'Not Available'

    if not need_legal and not need_ceo:
        return item

    padded_cik = norm_cik.zfill(10)
    sec_url = f"https://data.sec.gov/submissions/CIK{padded_cik}.json"
    
    try:
        time.sleep(0.1) # SEC rate limit compliance
        req = urllib.request.Request(sec_url, headers=sec_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            raw = resp.read()
            try:
                sub = json.loads(gzip.decompress(raw).decode('utf-8'))
            except:
                sub = json.loads(raw.decode('utf-8'))

            recent = sub.get('filings', {}).get('recent', {})
            acc_nums = recent.get('accessionNumber', [])
            primary_docs = recent.get('primaryDocument', [])

            for idx in range(min(2, len(acc_nums))):
                doc = primary_docs[idx]
                acc = acc_nums[idx]
                if doc and doc.endswith(('.htm', '.html', '.txt')):
                    clean_acc = acc.replace('-', '')
                    doc_url = f"https://www.sec.gov/Archives/edgar/data/{norm_cik}/{clean_acc}/{doc}"
                    
                    time.sleep(0.1)
                    req_doc = urllib.request.Request(doc_url, headers=sec_archive_headers)
                    with urllib.request.urlopen(req_doc, context=ctx, timeout=6) as resp_doc:
                        raw_doc = resp_doc.read()
                        try:
                            html = gzip.decompress(raw_doc).decode('utf-8', errors='ignore')
                        except:
                            html = raw_doc.decode('utf-8', errors='ignore')

                        cleaned = clean_html(html)

                        # Extract signature block: By: /s/ Name Title: ...
                        blocks = re.findall(r'(?:By:\s*(?:/s/)?\s*([A-Z][A-Za-z\s\.\,]+?)\s+)?Name:\s*([A-Z][A-Za-z\s\.\,]+?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?=\s{3,}|Date:|By:|Name:|$)', cleaned)
                        
                        for b in blocks:
                            by_name, name, title = b
                            real_name = (name or by_name or '').strip()
                            real_title = (title or '').strip()

                            if len(real_name) > 2 and len(real_name) < 40 and len(real_title) > 2 and len(real_title) < 60:
                                t_low = real_title.lower()

                                if ('counsel' in t_low or 'legal' in t_low or 'attorney' in t_low or 'secretary' in t_low) and item.get('legalCounsel') == 'Not Available':
                                    item['legalCounsel'] = f"{real_name} ({real_title})"
                                elif ('ceo' in t_low or 'president' in t_low or 'chief executive' in t_low) and item.get('ceo') == 'Not Available':
                                    item['ceo'] = f"{real_name} ({real_title})"
                                elif ('cfo' in t_low or 'treasurer' in t_low or 'chief financial' in t_low) and item.get('cfo') == 'Not Available':
                                    item['cfo'] = f"{real_name} ({real_title})"
    except Exception:
        pass

    return item

print("Executing parallel rate-limited worker pool...", flush=True)

updated_records = []
count_updated_legal = 0
count_updated_ceo = 0

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(process_issuer, records))

for r in results:
    if r.get('legalCounsel') != 'Not Available': count_updated_legal += 1
    if r.get('ceo') != 'Not Available': count_updated_ceo += 1
    updated_records.append(r)

# Verify Cross Country Healthcare
cch = next((r for r in updated_records if r.get('ticker') == 'CCRN' or 'cross country' in r.get('companyName', '').lower()), None)
print("\n--- CROSS COUNTRY HEALTHCARE VERIFIED RECORD ---", flush=True)
print(json.dumps(cch, indent=2), flush=True)

with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(updated_records, f, indent=2)

print(f"\nExtracted signatures! Total Legal Counsel Listed: {count_updated_legal} | Total Officers Listed: {count_updated_ceo}", flush=True)
