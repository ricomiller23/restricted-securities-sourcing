"""
Cleanup pass: validates all CEO/CFO/legalCounsel fields.
Any field that doesn't look like a real person name or law firm gets reset to "Not Available".
Then does a targeted re-extraction with stricter patterns for records that were just cleaned.
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

SEC_HEADERS = {'User-Agent': 'DelistedCRM admin@delistedcrm.com', 'Accept-Encoding': 'gzip, deflate'}
SEED_PATH = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

with open(SEED_PATH) as f:
    records = json.load(f)

# ─── STEP 1: Validate & clean bad name extractions ──────────────────────────
BAD_NAME_TOKENS = {
    'and','or','of','the','to','from','a','an','its','in','is','as','at',
    'by','for','with','on','not','this','that','these','those','each','all',
    'any','our','their','his','her','pursuant','under','above','below',
    'registrant','company','issuer','director','officer','person','individual',
    'acting','serving','principal','board','compensation','committee',
    'shareholders','holders','filing','form','annual','report','period',
    'transition','between','following','preceding','during','including',
    'management','executive','chairman','vice','president','pay','ratio',
    'cfo','ceo','coo','svp','evp','vp','mr','ms','dr','jr','sr',
}

# A real person name: 2–4 words, each word starts Capital then lowercase
# Like "John Smith", "Mary Jane Watson", "Samuel R. Hellfeld"
PERSON_NAME_RE = re.compile(
    r'^[A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z\']+){1,3}$'
)

# A real law firm: ends with LLP, P.C., PLLC etc.
LAW_FIRM_RE = re.compile(
    r'(?:LLP|P\.C\.|PLLC|PLC|APC|APLC|Law\s+Offices|L\.L\.P\.)\s*$',
    re.IGNORECASE
)

def is_valid_person_name(s: str) -> bool:
    """Returns True if s looks like a real person name."""
    if not s: return False
    # Strip any parenthetical title e.g. "John Smith (CEO)" -> test "John Smith"
    core = re.sub(r'\s*\(.*?\)\s*$', '', s).strip()
    if not core: return False
    words = core.split()
    if len(words) < 2 or len(words) > 5: return False
    # First word must start with capital
    if not words[0][0].isupper(): return False
    # Must not start with a bad connector token
    if words[0].lower() in BAD_NAME_TOKENS: return False
    if words[-1].lower() in BAD_NAME_TOKENS: return False
    # Must not be all-caps abbreviation e.g. "CEO CFO"
    if all(w.isupper() for w in words if len(w) > 1): return False
    # Each word should be either a proper name fragment or an initial
    for w in words:
        clean_w = w.rstrip('.,')
        if len(clean_w) == 1 and clean_w.isupper(): continue  # initial like "R."
        if not PERSON_NAME_RE.match(clean_w) and not clean_w[0].isupper(): return False
    return True

def is_valid_law_firm(s: str) -> bool:
    if not s: return False
    core = re.sub(r'\s*\(.*?\)\s*$', '', s).strip()
    return bool(LAW_FIRM_RE.search(core))

def is_valid_legal_entry(s: str) -> bool:
    """Legal counsel can be a person name OR a law firm."""
    return is_valid_person_name(s) or is_valid_law_firm(s)

cleaned = 0
for r in records:
    for field, validator in [('ceo', is_valid_person_name), ('cfo', is_valid_person_name), ('legalCounsel', is_valid_legal_entry)]:
        val = r.get(field, 'Not Available')
        if val and val != 'Not Available':
            if not validator(val):
                r[field] = 'Not Available'
                cleaned += 1

print(f"Cleaned {cleaned} invalid name extractions.")

# ─── STEP 2: Stats after cleanup ────────────────────────────────────────────
total = len(records)
has_ceo   = sum(1 for r in records if r.get('ceo','Not Available') != 'Not Available')
has_cfo   = sum(1 for r in records if r.get('cfo','Not Available') != 'Not Available')
has_legal = sum(1 for r in records if r.get('legalCounsel','Not Available') != 'Not Available')
print(f"\nAfter cleanup ({total} total):")
print(f"  CEO    : {has_ceo} ({100*has_ceo//total}%)")
print(f"  CFO    : {has_cfo} ({100*has_cfo//total}%)")
print(f"  Legal  : {has_legal} ({100*has_legal//total}%)")

# ─── STEP 3: Targeted strict re-extraction for newly-cleared records ─────────

# Strict person-name extractor from HTML
def extract_strict(html, item):
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'&[a-z#0-9]+;', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()

    TITLE_KEYS = {
        'ceo': ['chief executive officer', 'principal executive officer',
                'president and chief executive', 'interim chief executive',
                'co-chief executive officer', 'president, chief executive'],
        'cfo': ['chief financial officer', 'principal financial officer',
                'interim chief financial', 'chief financial and accounting'],
        'legalCounsel': ['general counsel', 'chief legal officer',
                         'vp and general counsel', 'svp and general counsel',
                         'evp and general counsel', 'senior vice president, general counsel',
                         'executive vice president, general counsel',
                         'vice president and general counsel']
    }

    def try_assign(name_candidate, title_str):
        n = re.sub(r'\s*\(.*?\)', '', name_candidate).strip()
        if not is_valid_person_name(n): return
        t = title_str.strip().lower()
        for cat, kws in TITLE_KEYS.items():
            if any(kw in t for kw in kws):
                if item.get(cat, 'Not Available') == 'Not Available':
                    item[cat] = f"{n} ({title_str.strip()})"
                break

    # Pattern A: "Name: John Smith\nTitle: Chief Executive Officer"
    for m in re.finditer(
        r'Name:\s*([A-Z][A-Za-z][A-Za-z\s\.\,]{1,43}?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]{3,80}?)(?=\s{2,}|Date:|By:|Name:|$)',
        text
    ):
        try_assign(m.group(1), m.group(2))

    # Pattern B: /s/ block
    for m in re.finditer(
        r'/s/\s*\n?\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\n\s*Name:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\n\s*Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]{3,80}?)(?=\s*\n)',
        text, re.IGNORECASE
    ):
        try_assign(m.group(2) or m.group(1), m.group(3))

    # Pattern C: Officer table "John Smith  Chief Executive Officer  Age"
    for m in re.finditer(
        r'([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s{2,}'
        r'((?:President|Chief\s+Executive|Chief\s+Financial|General\s+Counsel|Chief\s+Legal)[A-Za-z0-9\s\.\,\-\&\;/]{2,70}?)(?=\s{3,}|\d{2}|\n|$)',
        text
    ):
        try_assign(m.group(1), m.group(2))

    # Pattern D: Law firms
    if item.get('legalCounsel', 'Not Available') == 'Not Available':
        cw = set((item.get('companyName','') or '').lower().split())
        for m in re.finditer(r'([A-Z][A-Za-z\s\,\&]{2,50}\s(?:LLP|P\.C\.|L\.L\.P\.|PLLC|PLC|APC))', html):
            firm = m.group(1).strip()
            fw = set(firm.lower().split())
            if len(fw & cw) / max(1, len(fw)) < 0.5:
                item['legalCounsel'] = firm
                break

def format_phone(raw):
    d = re.sub(r'\D', '', str(raw or ''))
    if len(d) == 10: return f"+1 ({d[:3]}) {d[3:6]}-{d[6:]}"
    if len(d) == 11 and d[0] == '1': return f"+1 ({d[1:4]}) {d[4:7]}-{d[7:]}"
    if len(d) >= 7: return str(raw).strip()
    return None

def re_enrich(item):
    cik = str(item.get('cik', '')).strip().lstrip('0')
    if not cik: return item
    if item.get('ceo','Not Available') != 'Not Available' and \
       item.get('legalCounsel','Not Available') != 'Not Available':
        return item  # Already good

    try:
        time.sleep(0.04)
        padded = cik.zfill(10)
        req = urllib.request.Request(
            f"https://data.sec.gov/submissions/CIK{padded}.json",
            headers={**SEC_HEADERS, 'Host': 'data.sec.gov'}
        )
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            raw = r.read()
            try: sub = json.loads(gzip.decompress(raw).decode('utf-8'))
            except: sub = json.loads(raw.decode('utf-8'))

        # Phone / address
        if sub.get('phone') and item.get('phone','Not Available') == 'Not Available':
            p = format_phone(sub['phone'])
            if p: item['phone'] = p
        if item.get('location') in [None,'','United States','Not Available']:
            addr = sub.get('addresses',{}).get('business') or sub.get('addresses',{}).get('mailing') or {}
            parts = [p for p in [addr.get('street1'),addr.get('street2'),addr.get('city'),addr.get('stateOrCountry'),addr.get('zipCode')] if p]
            if parts: item['location'] = ', '.join(parts)

        # Best filing
        recent = sub.get('filings',{}).get('recent',{})
        forms  = recent.get('form',[])
        accs   = recent.get('accessionNumber',[])
        docs   = recent.get('primaryDocument',[])

        scored = []
        for i, frm in enumerate(forms):
            d = (docs[i] or '').lower()
            if not d.endswith(('.htm','.html','.txt')): continue
            fl = frm.lower()
            s = 0
            if 'def 14a' in fl: s = 100
            elif '10-k' in fl: s = 90
            elif '10-q' in fl: s = 70
            elif '8-k' in fl: s = 50
            elif '15' in fl: s = 40
            if s: scored.append((s, i))
        scored.sort(reverse=True)

        for _, idx in scored[:2]:
            acc = accs[idx].replace('-','')
            url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/{docs[idx]}"
            try:
                time.sleep(0.04)
                req2 = urllib.request.Request(url, headers=SEC_HEADERS)
                with urllib.request.urlopen(req2, context=ctx, timeout=8) as r2:
                    raw2 = r2.read()
                    try: html = gzip.decompress(raw2).decode('utf-8', errors='ignore')
                    except: html = raw2.decode('utf-8', errors='ignore')
                extract_strict(html, item)
                if item.get('ceo','Not Available') != 'Not Available' and \
                   item.get('legalCounsel','Not Available') != 'Not Available':
                    break
            except Exception:
                pass
    except Exception:
        pass

    ticker = (item.get('ticker') or '').upper().strip()
    if ticker and ticker not in ('N/A','OTC',''):
        item['otcProfileUrl'] = f"https://www.otcmarkets.com/stock/{ticker}/profile"
    return item

# Only re-enrich records that still have gaps
need_reenrich = [r for r in records
                 if r.get('ceo','Not Available') == 'Not Available'
                 or r.get('legalCounsel','Not Available') == 'Not Available']
print(f"\nRe-enriching {len(need_reenrich)} records with strict patterns...")

start = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    enriched = list(ex.map(re_enrich, need_reenrich))

# Merge back
enriched_map = {r.get('id', str(r.get('cik',''))): r for r in enriched}
final = []
for r in records:
    key = r.get('id', str(r.get('cik','')))
    final.append(enriched_map.get(key, r))

elapsed = time.time() - start
print(f"Re-enrichment done in {elapsed:.1f}s")

# Final stats
total = len(final)
has_ceo   = sum(1 for r in final if r.get('ceo','Not Available') != 'Not Available')
has_cfo   = sum(1 for r in final if r.get('cfo','Not Available') != 'Not Available')
has_legal = sum(1 for r in final if r.get('legalCounsel','Not Available') != 'Not Available')
has_phone = sum(1 for r in final if r.get('phone','Not Available') != 'Not Available')
ir_emails = sum(1 for r in final if r.get('email','').startswith('ir@'))

print(f"\n=== FINAL STATS ({total} records) ===")
print(f"  CEO    : {has_ceo} ({100*has_ceo//total}%)")
print(f"  CFO    : {has_cfo} ({100*has_cfo//total}%)")
print(f"  Legal  : {has_legal} ({100*has_legal//total}%)")
print(f"  Phone  : {has_phone} ({100*has_phone//total}%)")
print(f"  IR@    : {ir_emails} (must be 0)")

print("\n=== SPOT CHECKS ===")
for t in ['MYCB','CCRN','BCLI','SNBRQ','PG','PM','APO','ELSE','SKYT','LPRO','NFBK']:
    r = next((x for x in final if x.get('ticker','').upper().strip().split(',')[0].strip() == t), None)
    if r:
        print(f"  [{t}] {r.get('companyName','')[:40]}")
        print(f"    CEO  : {r.get('ceo','N/A')}")
        print(f"    CFO  : {r.get('cfo','N/A')}")
        print(f"    Legal: {r.get('legalCounsel','N/A')}")
    else:
        print(f"  [{t}] NOT FOUND")

with open(SEED_PATH, 'w') as f:
    json.dump(final, f, indent=2)
print(f"\nSaved {len(final)} records.")
