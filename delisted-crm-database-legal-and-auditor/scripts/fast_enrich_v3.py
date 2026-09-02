"""
Fast enrichment - uses ONLY the SEC EDGAR submissions JSON (no filing HTML downloads).
The submissions JSON contains officer_name in some forms, and we extract from:
  - sub['name'] for company name
  - sub['phone'] for phone  
  - sub['addresses'] for location
  - For DEF 14A / proxy / 10-K filing index pages (SGML headers), not full HTML docs

Strategy for speed:
- 12 workers
- Only 1 network call per issuer (submissions JSON)
- Only fetch the primary doc for issuers where submissions JSON gives us form type 10-K or DEF 14A
- Strict 1-doc-only limit per issuer
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

SEC_HEADERS = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate',
}

SEED_PATH = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

with open(SEED_PATH, "r", encoding="utf-8") as f:
    records = json.load(f)

# Only process those still missing CEO or Legal Counsel and have a CIK
to_enrich = [
    r for r in records
    if r.get('cik') and str(r.get('cik', '')).strip()
    and (r.get('ceo', 'Not Available') == 'Not Available' or r.get('legalCounsel', 'Not Available') == 'Not Available')
]
print(f"Fast-enriching {len(to_enrich)} / {len(records)} records...")

def format_phone(raw):
    if not raw: return None
    d = re.sub(r'\D', '', str(raw))
    if len(d) == 10: return f"+1 ({d[:3]}) {d[3:6]}-{d[6:]}"
    if len(d) == 11 and d[0] == '1': return f"+1 ({d[1:4]}) {d[4:7]}-{d[7:]}"
    if len(d) >= 7: return str(raw).strip()
    return None

TITLE_KEYS = {
    'ceo': ['chief executive officer', 'principal executive officer', 'president and ceo', 
            'interim ceo', 'co-chief executive', 'president, chief executive'],
    'cfo': ['chief financial officer', 'principal financial officer', 'interim cfo',
            'chief financial and accounting officer', 'vp finance'],
    'legalCounsel': ['general counsel', 'chief legal officer', 'vp and general counsel',
                     'svp and general counsel', 'evp and general counsel', 'deputy general counsel',
                     'senior vice president, general counsel', 'executive vice president, general counsel']
}

def assign(item, name, title):
    n = name.strip()
    t = title.strip()
    if len(n) < 3 or len(n) > 55 or len(t) < 3: return
    # Skip generic filler words
    if n.lower() in {'the company', 'registrant', 'each director', 'authorized', 'the registrant',
                     'issuer', 'above', 'below', 'its', 'each', 'all'}:
        return
    tl = t.lower()
    for cat, kws in TITLE_KEYS.items():
        if any(kw in tl for kw in kws):
            if item.get(cat, 'Not Available') == 'Not Available':
                item[cat] = f"{n} ({t})"
            break

def clean(html):
    txt = re.sub(r'<[^>]+>', ' ', html)
    txt = re.sub(r'&[a-z#0-9]+;', ' ', txt)
    return re.sub(r'\s+', ' ', txt).strip()

def fetch(url, host=None):
    h = dict(SEC_HEADERS)
    if host: h['Host'] = host
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
        raw = r.read()
        try: return gzip.decompress(raw).decode('utf-8', errors='ignore')
        except: return raw.decode('utf-8', errors='ignore')

def extract_officers(html, item):
    text = clean(html)

    # Pattern A: "Name: John Smith Title: Chief Executive Officer"
    for m in re.finditer(
        r'Name:\s*([A-Z][A-Za-z\s\.\,]{2,45}?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]{3,80}?)(?=\s{2,}|Date:|By:|Name:|$)',
        text
    ):
        assign(item, m.group(1), m.group(2))

    # Pattern B: /s/ signatory + Name + Title
    for m in re.finditer(
        r'/s/\s*([A-Z][A-Za-z\s\.\,]{2,45}?)[\s\n]+Name:\s*([A-Z][A-Za-z\s\.\,]{2,45}?)[\s\n]+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]{3,80}?)(?=\s{2,}|\n|Date:|By:|$)',
        text, re.IGNORECASE
    ):
        name = m.group(2).strip() or m.group(1).strip()
        assign(item, name, m.group(3))

    # Pattern C: Officer table row "John Smith  President and CEO  Age 55"
    for m in re.finditer(
        r'([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)\s{2,}'
        r'((?:President|Chief\s+Executive|Chief\s+Financial|General\s+Counsel|Chief\s+Legal)[A-Za-z0-9\s\.\,\-\&\;/]{2,70}?)(?=\s{3,}|\d{2}|\n|$)',
        text
    ):
        assign(item, m.group(1), m.group(2))

    # Pattern D: Inline sentence "CEO John Smith" or "General Counsel Jane Doe"
    for m in re.finditer(
        r'(?:Interim\s+)?(?:CEO|CFO|President|General\s+Counsel|Chief\s+Executive\s+Officer|Chief\s+Financial\s+Officer)\s+'
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        html, re.IGNORECASE
    ):
        # Determine which title was matched
        prefix = m.group(0).replace(m.group(1), '').strip().lower()
        title_map = {
            'ceo': 'Chief Executive Officer', 'cfoe': 'Chief Financial Officer',
            'president': 'President', 'general counsel': 'General Counsel',
            'chief executive officer': 'Chief Executive Officer',
            'chief financial officer': 'Chief Financial Officer',
            'interim ceo': 'Interim CEO', 'interim cfo': 'Interim CFO'
        }
        title = next((v for k, v in title_map.items() if k in prefix), prefix.title())
        assign(item, m.group(1), title)

    # Pattern E: Law firms
    if item.get('legalCounsel', 'Not Available') == 'Not Available':
        company_words = set((item.get('companyName', '') or '').lower().split())
        for m in re.finditer(
            r'([A-Z][A-Za-z\s\,\&]{2,50}\s(?:LLP|P\.C\.|L\.L\.P\.|PLLC|PLC|APC|Law\s+Offices))',
            html
        ):
            firm = m.group(1).strip()
            fw = set(firm.lower().split())
            # Skip if too similar to the company name itself
            if len(fw & company_words) / max(1, len(fw)) < 0.5:
                item['legalCounsel'] = firm
                break

def enrich(item):
    cik = str(item.get('cik', '')).strip().lstrip('0')
    if not cik:
        return item

    padded = cik.zfill(10)
    try:
        time.sleep(0.05)
        sub_text = fetch(f"https://data.sec.gov/submissions/CIK{padded}.json", host='data.sec.gov')
        sub = json.loads(sub_text)

        # Phone
        if sub.get('phone') and item.get('phone', 'Not Available') == 'Not Available':
            p = format_phone(sub['phone'])
            if p: item['phone'] = p

        # Address
        if item.get('location') in [None, '', 'United States', 'Not Available']:
            addr = sub.get('addresses', {}).get('business') or sub.get('addresses', {}).get('mailing') or {}
            parts = [p for p in [addr.get('street1'), addr.get('street2'),
                                  addr.get('city'), addr.get('stateOrCountry'), addr.get('zipCode')] if p]
            if parts: item['location'] = ', '.join(parts)

        # Pick best single filing to parse
        if item.get('ceo', 'Not Available') == 'Not Available' or item.get('legalCounsel', 'Not Available') == 'Not Available':
            recent = sub.get('filings', {}).get('recent', {})
            forms = recent.get('form', [])
            accs = recent.get('accessionNumber', [])
            docs = recent.get('primaryDocument', [])

            best_idx = None
            best_score = -1
            for i, frm in enumerate(forms):
                fl = frm.lower()
                doc = (docs[i] or '').lower()
                if not doc.endswith(('.htm', '.html', '.txt')): continue
                score = 0
                if 'def 14a' in fl: score = 100     # Proxy — full officer table
                elif '10-k' in fl: score = 90
                elif '10-q' in fl: score = 70
                elif '8-k' in fl: score = 50
                elif '15' in fl: score = 40
                if score > best_score:
                    best_score = score
                    best_idx = i

            if best_idx is not None:
                acc_clean = accs[best_idx].replace('-', '')
                doc_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc_clean}/{docs[best_idx]}"
                try:
                    time.sleep(0.05)
                    html = fetch(doc_url)
                    extract_officers(html, item)
                except Exception:
                    pass

    except Exception:
        pass

    # Always ensure OTC URL
    ticker = (item.get('ticker') or '').upper().strip()
    if ticker and ticker not in ('N/A', 'OTC', ''):
        item['otcProfileUrl'] = f"https://www.otcmarkets.com/stock/{ticker}/profile"
    elif not item.get('otcProfileUrl'):
        item['otcProfileUrl'] = "https://www.otcmarkets.com"

    return item

print("Running 12-worker parallel enrichment...")
start = time.time()

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    enriched = list(ex.map(enrich, to_enrich))

# Merge back into full records list
enriched_by_id = {r.get('id', str(r.get('cik',''))): r for r in enriched}
final = []
for r in records:
    key = r.get('id', str(r.get('cik', '')))
    final.append(enriched_by_id.get(key, r))

elapsed = time.time() - start
print(f"Completed in {elapsed:.1f}s")

# Stats
total = len(final)
has_ceo   = sum(1 for r in final if r.get('ceo','Not Available') != 'Not Available')
has_cfo   = sum(1 for r in final if r.get('cfo','Not Available') != 'Not Available')
has_legal = sum(1 for r in final if r.get('legalCounsel','Not Available') != 'Not Available')
has_phone = sum(1 for r in final if r.get('phone','Not Available') != 'Not Available')
ir_emails = sum(1 for r in final if r.get('email','').startswith('ir@'))
print(f"\n=== FINAL STATS ({total} records) ===")
print(f"  CEO Populated  : {has_ceo} ({100*has_ceo//total}%)")
print(f"  CFO Populated  : {has_cfo} ({100*has_cfo//total}%)")
print(f"  Legal Counsel  : {has_legal} ({100*has_legal//total}%)")
print(f"  Phone          : {has_phone} ({100*has_phone//total}%)")
print(f"  IR@ Emails     : {ir_emails} (must be 0)")

print("\n=== SPOT CHECKS ===")
for t in ['MYCB','CCRN','BCLI','SNBRQ','PG','PM','APO','ELSE','SKYT','LPRO']:
    r = next((x for x in final if x.get('ticker','').upper().strip().split(',')[0].strip() == t), None)
    if r:
        print(f"  [{t}] {r.get('companyName','')[:40]}")
        print(f"    CEO: {r.get('ceo','N/A')}")
        print(f"    CFO: {r.get('cfo','N/A')}")
        print(f"    Legal: {r.get('legalCounsel','N/A')}")
    else:
        print(f"  [{t}] NOT FOUND")

with open(SEED_PATH, "w", encoding="utf-8") as f:
    json.dump(final, f, indent=2)
print(f"\nSaved {len(final)} records.")
