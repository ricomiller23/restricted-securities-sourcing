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

print(f"Deep parsing SEC filing signatures for all {len(records)} issuers...")

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
            
            # Find all Name / Title / Signature blocks
            # e.g., By: /s/ Name Title: Executive Vice President, General Counsel
            blocks = re.findall(r'(?:By:\s*(?:/s/)?\s*([A-Z][A-Za-z\s\.\,]+?)\s+)?Name:\s*([A-Z][A-Za-z\s\.\,]+?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?=\s{3,}|Date:|By:|Name:|$)', cleaned)
            
            for b in blocks:
                by_name, name, title = b
                real_name = (name or by_name or '').strip()
                real_title = (title or '').strip()
                if len(real_name) > 2 and len(real_name) < 40 and len(real_title) > 2 and len(real_title) < 60:
                    signatures.append({'name': real_name, 'title': real_title})

            # Alternative pattern: /s/ Name Title: ...
            alt_blocks = re.findall(r'/s/\s*([A-Z][A-Za-z\s\.\,]+?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?=\s{3,}|Date:|By:|$)', cleaned)
            for b in alt_blocks:
                name, title = b
                if len(name.strip()) > 2 and len(name.strip()) < 40:
                    signatures.append({'name': name.strip(), 'title': title.strip()})

            return signatures
    except Exception:
        return []

# Step 1: Query SEC Submissions in parallel
ciks = list(set([str(r.get('cik') or '').strip().lstrip('0') for r in records if r.get('cik')]))
print(f"Querying SEC submissions for {len(ciks)} unique CIKs...")

sec_submissions = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    future_to_cik = {executor.submit(fetch_sec_submission, cik): cik for cik in ciks}
    for future in concurrent.futures.as_completed(future_to_cik):
        cik = future_to_cik[future]
        res = future.result()
        if res:
            sec_submissions[cik] = res

print(f"Retrieved SEC submissions for {len(sec_submissions)} CIKs!")

# Step 2: For each issuer, find top 3 recent filings (Form 15, Form 25, 10-K, 10-Q, 8-K) and parse signature blocks
filing_tasks = []

for r in records:
    norm_cik = str(r.get('cik') or '').strip().lstrip('0')
    sub = sec_submissions.get(norm_cik)
    if sub:
        recent = sub.get('filings', {}).get('recent', {})
        acc_nums = recent.get('accessionNumber', [])
        primary_docs = recent.get('primaryDocument', [])
        forms = recent.get('form', [])

        count_added = 0
        for idx in range(min(5, len(acc_nums))):
            doc = primary_docs[idx]
            acc = acc_nums[idx]
            form = forms[idx]
            if doc and doc.endswith(('.htm', '.html', '.txt')):
                filing_tasks.append((r.get('id'), norm_cik, acc, doc))
                count_added += 1

print(f"Queued {len(filing_tasks)} SEC filing documents for deep signature extraction...")

parsed_doc_signatures = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
    future_to_task = {executor.submit(fetch_and_parse_filing_doc, task[1], task[2], task[3]): task[0] for task in filing_tasks}
    for future in concurrent.futures.as_completed(future_to_task):
        rec_id = future_to_task[future]
        sigs = future.result()
        if sigs:
            if rec_id not in parsed_doc_signatures:
                parsed_doc_signatures[rec_id] = []
            parsed_doc_signatures[rec_id].extend(sigs)

print(f"Extracted deep filing signatures for {len(parsed_doc_signatures)} issuers!")

# Apply deep signature extraction results to seed records
count_ceo_updated = 0
count_legal_updated = 0

for item in records:
    rec_id = item.get('id')
    sigs = parsed_doc_signatures.get(rec_id, [])

    for s in sigs:
        name = s['name']
        title = s['title']
        t_low = title.lower()

        if 'counsel' in t_low or 'legal' in t_low or 'attorney' in t_low or 'secretary' in t_low:
            if not item.get('legalCounsel') or item.get('legalCounsel') == 'Not Available':
                item['legalCounsel'] = f"{name} ({title})"
                count_legal_updated += 1
        elif 'ceo' in t_low or 'president' in t_low or 'chief executive' in t_low:
            if not item.get('ceo') or item.get('ceo') == 'Not Available':
                item['ceo'] = f"{name} ({title})"
                count_ceo_updated += 1
        elif 'cfo' in t_low or 'treasurer' in t_low or 'chief financial' in t_low:
            if not item.get('cfo') or item.get('cfo') == 'Not Available':
                item['cfo'] = f"{name} ({title})"

# Save dataset
with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

print(f"\nSaved deep SEC filing signature extraction! Updated {count_ceo_updated} CEOs and {count_legal_updated} Legal Counsel entries.")
