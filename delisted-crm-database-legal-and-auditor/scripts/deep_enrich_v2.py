"""
Deep enrichment pass for Form 25-NSE and all remaining records missing CEO/Legal Counsel.
Fetches SEC EDGAR submissions for phone/address, then parses 10-K/10-Q/8-K/15 filing
signature blocks and executive sentences to extract real officer names.
"""
import urllib.request
import ssl
import json
import gzip
import re
import time
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

# Only process records that still have CEO or Legal missing AND have a real CIK
to_enrich = [
    r for r in records
    if r.get('cik') and str(r.get('cik', '')).strip() not in ['', 'N/A', '0']
    and (r.get('ceo', 'Not Available') == 'Not Available' or r.get('legalCounsel', 'Not Available') == 'Not Available')
    # Skip ABS/structured finance trusts (15-15D form and no real ticker)
    and not (r.get('form', '') == '15-15D' and r.get('ticker', 'N/A') in ['N/A', '', None])
]

print(f"Records needing enrichment: {len(to_enrich)} / {len(records)}")

def clean_html(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    text = re.sub(r'&[a-z]+;', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def format_phone(raw_p):
    if not raw_p: return None
    digits = re.sub(r'\D', '', str(raw_p))
    if len(digits) == 10:
        return f"+1 ({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits.startswith('1'):
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    elif len(digits) >= 7:
        return str(raw_p).strip()
    return None

KNOWN_TITLE_KEYWORDS = {
    'ceo': ['chief executive officer', 'president and chief executive', 'interim chief executive', 'co-chief executive'],
    'cfo': ['chief financial officer', 'principal financial officer', 'interim chief financial', 'chief financial and accounting'],
    'coo': ['chief operating officer'],
    'general_counsel': ['general counsel', 'chief legal officer', 'executive vice president, general counsel',
                        'senior vice president, general counsel', 'vice president, general counsel', 'deputy general counsel']
}

def extract_from_html(html_text, item):
    cleaned = clean_html(html_text)
    updated = False

    # Pattern 1: Sentence-style executive disclosures
    # "Interim CEO Yolanda Goodell", "CEO John Smith"
    exec_sentence = re.findall(
        r'(?:Interim\s+)?(?:CEO|CFO|President|General\s+Counsel|Chief\s+Executive\s+Officer|Chief\s+Financial\s+Officer)\s+'
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        html_text, re.IGNORECASE
    )
    # Pattern 2: Table-style: Name: [Name] ... Title: [Title]  (in cleaned text)
    # We'll find all Name:/Title: pairs
    name_title_pairs = re.findall(
        r'Name:\s*([A-Z][A-Za-z\s\.\,]{2,45}?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]{3,80}?)(?=\s{2,}|Date:|By:|Name:|$)',
        cleaned
    )
    # Pattern 3: /s/ signatory block: By: /s/ Name\nName: Name\nTitle: Title
    sig_blocks = re.findall(
        r'/s/\s+([A-Z][A-Za-z\s\.\,]{2,40}?)[\s\n]+Name:\s*([A-Z][A-Za-z\s\.\,]{2,40}?)[\s\n]+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]{3,80}?)(?=\s{2,}|\n|Date:|By:|$)',
        cleaned, re.IGNORECASE
    )
    # Pattern 4: Named officers table (10-K style):
    # "John Smith  President and CEO  2021"
    officer_table = re.findall(
        r'([A-Z][a-z]+\s+(?:[A-Z]\.?\s+)?[A-Z][a-z]+)\s{2,}((?:President|Chief\s+Executive|Chief\s+Financial|General\s+Counsel|Chief\s+Legal)[A-Za-z0-9\s\.\,\-\&\;/]{2,60}?)(?=\s{3,}|\d{4}|$)',
        cleaned
    )
    # Pattern 5: Law firms
    law_firms = re.findall(
        r'([A-Z][A-Za-z\s\,\&]{2,50}\s(?:LLP|P\.C\.|L\.L\.P\.|Law\s+Offices|PLC|PLLC|APC|APLC))',
        html_text
    )

    def assign_officer(name, title):
        nonlocal updated
        t = title.lower().strip()
        n = name.strip()
        if len(n) < 4 or len(n) > 50 or len(t) < 3: return
        # Skip generic words
        if n.lower() in ['the registrant', 'the company', 'issuer', 'registrant', 'each director', 'authorized']:
            return
        for cat, keywords in KNOWN_TITLE_KEYWORDS.items():
            if any(kw in t for kw in keywords):
                if cat in ['ceo'] and item.get('ceo', 'Not Available') == 'Not Available':
                    item['ceo'] = f"{n} ({title.strip()})"
                    updated = True
                elif cat in ['cfo'] and item.get('cfo', 'Not Available') == 'Not Available':
                    item['cfo'] = f"{n} ({title.strip()})"
                    updated = True
                elif cat in ['general_counsel'] and item.get('legalCounsel', 'Not Available') == 'Not Available':
                    item['legalCounsel'] = f"{n} ({title.strip()})"
                    updated = True

    for pair in name_title_pairs:
        assign_officer(pair[0], pair[1])
    for sig in sig_blocks:
        name = sig[1].strip() or sig[0].strip()
        assign_officer(name, sig[2])
    for row in officer_table:
        assign_officer(row[0], row[1])

    # Assign law firm if found and legal counsel still missing
    if law_firms and item.get('legalCounsel', 'Not Available') == 'Not Available':
        # Filter out self-referential mentions (company's own name)
        company_words = set((item.get('companyName', '') or '').lower().split())
        for firm in law_firms:
            firm_words = set(firm.lower().split())
            overlap = len(firm_words & company_words) / max(1, len(firm_words))
            if overlap < 0.5:  # Less than 50% word overlap with company name
                item['legalCounsel'] = firm.strip()
                updated = True
                break

    return updated

def enrich_single(item):
    raw_cik = str(item.get('cik') or '').strip()
    norm_cik = raw_cik.lstrip('0')
    if not norm_cik:
        return item

    padded_cik = norm_cik.zfill(10)
    sec_url = f"https://data.sec.gov/submissions/CIK{padded_cik}.json"

    try:
        time.sleep(0.1)
        req = urllib.request.Request(sec_url, headers=sec_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            raw = resp.read()
            try: sub = json.loads(gzip.decompress(raw).decode('utf-8'))
            except: sub = json.loads(raw.decode('utf-8'))

            # Phone
            if sub.get('phone') and (not item.get('phone') or item.get('phone') == 'Not Available'):
                fmt = format_phone(sub.get('phone'))
                if fmt: item['phone'] = fmt

            # Address
            if item.get('location') in [None, '', 'United States', 'Not Available']:
                addr = sub.get('addresses', {}).get('business') or sub.get('addresses', {}).get('mailing') or {}
                parts = [p for p in [
                    addr.get('street1'), addr.get('street2'),
                    addr.get('city'), addr.get('stateOrCountry'), addr.get('zipCode')
                ] if p]
                if parts:
                    item['location'] = ", ".join(parts)

            # Parse filings for CEO/Legal Counsel
            if item.get('ceo', 'Not Available') == 'Not Available' or item.get('legalCounsel', 'Not Available') == 'Not Available':
                recent = sub.get('filings', {}).get('recent', {})
                forms = recent.get('form', [])
                acc_nums = recent.get('accessionNumber', [])
                primary_docs = recent.get('primaryDocument', [])

                # Prioritize 10-K, then 10-Q, then 8-K, then 15-12G/15
                priority_order = []
                for i, form in enumerate(forms):
                    score = 0
                    fl = form.lower()
                    if '10-k' in fl: score = 100
                    elif '10-q' in fl: score = 80
                    elif '8-k' in fl: score = 60
                    elif '15' in fl: score = 40
                    elif 'def 14a' in fl or 'proxy' in fl: score = 90  # Proxies have full officer tables
                    priority_order.append((score, i))
                priority_order.sort(reverse=True, key=lambda x: x[0])

                for _, idx in priority_order[:4]:  # Top 4 most useful filings
                    doc = primary_docs[idx]
                    acc = acc_nums[idx]
                    if not doc or not doc.lower().endswith(('.htm', '.html', '.txt')):
                        continue
                    clean_acc = acc.replace('-', '')
                    doc_url = f"https://www.sec.gov/Archives/edgar/data/{norm_cik}/{clean_acc}/{doc}"
                    try:
                        time.sleep(0.1)
                        req_doc = urllib.request.Request(doc_url, headers=sec_archive_headers)
                        with urllib.request.urlopen(req_doc, context=ctx, timeout=8) as r_doc:
                            raw_doc = r_doc.read()
                            try: html_doc = gzip.decompress(raw_doc).decode('utf-8', errors='ignore')
                            except: html_doc = raw_doc.decode('utf-8', errors='ignore')

                            extract_from_html(html_doc, item)

                            # Early exit if both are filled
                            if item.get('ceo', 'Not Available') != 'Not Available' and item.get('legalCounsel', 'Not Available') != 'Not Available':
                                break
                    except Exception:
                        pass

    except Exception:
        pass

    # Ensure OTC URL is always set
    ticker = (item.get('ticker') or 'OTC').upper().strip()
    if ticker and ticker != 'N/A' and ticker != 'OTC':
        item['otcProfileUrl'] = f"https://www.otcmarkets.com/stock/{ticker}/profile"
    elif not item.get('otcProfileUrl'):
        item['otcProfileUrl'] = "https://www.otcmarkets.com"

    return item

print(f"\nRunning parallel enrichment on {len(to_enrich)} records (6 workers)...")
start = time.time()

enriched_map = {r.get('id', r.get('cik', i)): r for i, r in enumerate(records)}

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
    results = list(executor.map(enrich_single, to_enrich))

# Merge results back
for enriched in results:
    key = enriched.get('id', enriched.get('cik'))
    enriched_map[key] = enriched

final_records = list(enriched_map.values())

elapsed = time.time() - start
print(f"Enrichment completed in {elapsed:.1f}s")

# Final stats
has_ceo = sum(1 for r in final_records if r.get('ceo') and r['ceo'] != 'Not Available')
has_legal = sum(1 for r in final_records if r.get('legalCounsel') and r['legalCounsel'] != 'Not Available')
print(f"\nFinal Stats ({len(final_records)} total records):")
print(f"  CEO Populated: {has_ceo} ({100*has_ceo//len(final_records)}%)")
print(f"  Legal Counsel Populated: {has_legal} ({100*has_legal//len(final_records)}%)")

# Spot checks
for ticker in ['MYCB', 'CCRN', 'BCLI', 'SNBRQ', 'PG', 'PM', 'ELSE', 'APO']:
    r = next((x for x in final_records if x.get('ticker', '').upper().strip() == ticker), None)
    if r:
        print(f"\n  [{ticker}] {r.get('companyName','')}")
        print(f"    CEO: {r.get('ceo', 'N/A')}")
        print(f"    CFO: {r.get('cfo', 'N/A')}")
        print(f"    Legal: {r.get('legalCounsel', 'N/A')}")
        print(f"    Phone: {r.get('phone', 'N/A')}")
        print(f"    OTC URL: {r.get('otcProfileUrl','N/A')}")

with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(final_records, f, indent=2)

print(f"\nSaved {len(final_records)} records to seed database.")
