import urllib.request
import ssl
import json
import gzip
import re
import time

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

print(f"Rate-limited SEC EDGAR filing signature parser for all {len(records)} issuers...")

def clean_html(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    return re.sub(r'\s+', ' ', text).strip()

def fetch_sec_submission(cik):
    if not cik: return None
    padded_cik = cik.lstrip('0').zfill(10)
    url = f"https://data.sec.gov/submissions/CIK{padded_cik}.json"
    try:
        req = urllib.request.Request(url, headers=sec_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            raw = resp.read()
            try:
                return json.loads(gzip.decompress(raw).decode('utf-8'))
            except:
                return json.loads(raw.decode('utf-8'))
    except Exception:
        return None

def fetch_and_parse_filing_doc(cik, acc_num, doc_name):
    clean_acc = acc_num.replace('-', '')
    norm_cik = cik.lstrip('0')
    url = f"https://www.sec.gov/Archives/edgar/data/{norm_cik}/{clean_acc}/{doc_name}"
    try:
        req = urllib.request.Request(url, headers=sec_archive_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            raw = resp.read()
            try:
                html = gzip.decompress(raw).decode('utf-8', errors='ignore')
            except:
                html = raw.decode('utf-8', errors='ignore')

            cleaned = clean_html(html)
            signatures = []
            
            # Extract By / Name / Title signature blocks
            blocks = re.findall(r'(?:By:\s*(?:/s/)?\s*([A-Z][A-Za-z\s\.\,]+?)\s+)?Name:\s*([A-Z][A-Za-z\s\.\,]+?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?=\s{3,}|Date:|By:|Name:|$)', cleaned)
            for b in blocks:
                by_name, name, title = b
                real_name = (name or by_name or '').strip()
                real_title = (title or '').strip()
                if len(real_name) > 2 and len(real_name) < 40 and len(real_title) > 2 and len(real_title) < 60:
                    signatures.append({'name': real_name, 'title': real_title})

            alt_blocks = re.findall(r'/s/\s*([A-Z][A-Za-z\s\.\,]+?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?=\s{3,}|Date:|By:|$)', cleaned)
            for b in alt_blocks:
                name, title = b
                if len(name.strip()) > 2 and len(name.strip()) < 40:
                    signatures.append({'name': name.strip(), 'title': title.strip()})

            return signatures
    except Exception:
        return []

# Batch loop with strict rate limiting (sleep 0.12s between requests)
count_officers_updated = 0
count_legal_updated = 0

for i, item in enumerate(records):
    norm_cik = str(item.get('cik') or '').strip().lstrip('0')
    if not norm_cik: continue

    # If legalCounsel or ceo is still missing
    if item.get('legalCounsel') == 'Not Available' or item.get('ceo') == 'Not Available':
        sub = fetch_sec_submission(norm_cik)
        time.sleep(0.12) # Respect SEC EDGAR 10 req/sec limit

        if sub:
            recent = sub.get('filings', {}).get('recent', {})
            acc_nums = recent.get('accessionNumber', [])
            primary_docs = recent.get('primaryDocument', [])
            forms = recent.get('form', [])

            for idx in range(min(3, len(acc_nums))):
                doc = primary_docs[idx]
                acc = acc_nums[idx]
                if doc and doc.endswith(('.htm', '.html', '.txt')):
                    sigs = fetch_and_parse_filing_doc(norm_cik, acc, doc)
                    time.sleep(0.12) # Respect SEC EDGAR 10 req/sec limit

                    for s in sigs:
                        name = s['name']
                        title = s['title']
                        t_low = title.lower()

                        if 'counsel' in t_low or 'legal' in t_low or 'attorney' in t_low or 'secretary' in t_low:
                            if item.get('legalCounsel') == 'Not Available':
                                item['legalCounsel'] = f"{name} ({title})"
                                count_legal_updated += 1
                        elif 'ceo' in t_low or 'president' in t_low or 'chief executive' in t_low:
                            if item.get('ceo') == 'Not Available':
                                item['ceo'] = f"{name} ({title})"
                                count_officers_updated += 1
                        elif 'cfo' in t_low or 'treasurer' in t_low or 'chief financial' in t_low:
                            if item.get('cfo') == 'Not Available':
                                item['cfo'] = f"{name} ({title})"

    if (i + 1) % 50 == 0:
        print(f"Processed {i + 1} / {len(records)} issuers (Added {count_officers_updated} officers, {count_legal_updated} legal counsel)...")

# Save dataset
with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

print(f"\nCompleted SEC filing signature extraction across all 1,704 issuers!")
print(f"Total Officers Added: {count_officers_updated} | Total Legal Counsel Added: {count_legal_updated}")
