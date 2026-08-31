import json, re, time, os, urllib.request, ssl, concurrent.futures

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SEED_PATH = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
API_KEY   = os.environ.get("MOONSHOT_API_KEY", "sk-wxWKYVDyrkuG3mF1fAzj5rvLLUjnG4uwtM0Q45NYjMnlqiL3")
API_URL   = "https://api.moonshot.ai/v1/chat/completions"

with open(SEED_PATH) as f:
    records = json.load(f)

to_enrich = [
    r for r in records
    if r.get('ticker') and r.get('ticker') not in ('N/A', '', None)
    and r.get('form', '') != '15-15D'
    and (r.get('ceo', 'Not Available') == 'Not Available'
         or r.get('legalCounsel', 'Not Available') == 'Not Available')
]
print(f"Kimi enrichment target: {len(to_enrich)} records")

BAD = {'and','or','of','the','to','from','a','an','its','in','is','as','at','by',
       'for','with','on','not','this','that','these','those','each','all','any',
       'our','their','his','her','registrant','company','issuer','director',
       'officer','person','cfo','ceo','coo','mr','ms','dr','jr','sr'}

def valid_name(s):
    if not s: return False
    core = re.sub(r'\s*\(.*?\)\s*$', '', s).strip()
    words = core.split()
    if len(words) < 2 or len(words) > 5: return False
    if words[0].lower() in BAD or words[-1].lower() in BAD: return False
    if not words[0][0].isupper(): return False
    if all(w.isupper() for w in words if len(w) > 2): return False
    return True

def valid_firm(s):
    return bool(re.search(r'(?:LLP|P\.C\.|PLLC|PLC|APC|Law\s+Offices|L\.L\.P\.)\s*$', s or '', re.I))

def valid_legal(s):
    return valid_name(s) or valid_firm(s)

def kimi_ask(company, ticker):
    prompt = (
        f"Who is the current CEO, CFO, and General Counsel of {company} (ticker {ticker})? "
        "Provide full names. Format exactly as: "
        "CEO: [Full Name] | CFO: [Full Name] | General Counsel: [Full Name] | Law Firm: [Firm Name LLP]"
    )
    payload = json.dumps({
        "model": "moonshot-v1-8k",
        "messages": [
            {"role": "system", "content":
             "You are a financial research assistant. Only provide names you are confident about from "
             "SEC filings, proxy statements, or company websites. If unknown, write Not Available."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 250
    }).encode()
    req = urllib.request.Request(API_URL, data=payload, method='POST',
                                  headers={'Content-Type': 'application/json',
                                           'Authorization': f'Bearer {API_KEY}'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
            return json.loads(r.read())['choices'][0]['message']['content'].strip()
    except Exception:
        return None

def extract(label, text):
    pat = label + r':\s*([A-Z][A-Za-z][A-Za-z\s\.\,\&\-]{1,50})(?:\s*\||\s*$|\n)'
    m = re.search(pat, text, re.I)
    if m:
        v = m.group(1).strip().rstrip('|').strip()
        if v.lower() not in ('not available', 'n/a', 'unknown', 'none', ''):
            return v
    return None

def parse_and_apply(text, item):
    if not text: return
    ceo  = extract('CEO',             text)
    cfo  = extract('CFO',             text)
    gc   = extract('General Counsel', text) or extract('Chief Legal Officer', text)
    firm = extract('Law Firm',        text) or extract('Outside Counsel',     text)

    if ceo  and valid_name(ceo)  and item.get('ceo',  'Not Available') == 'Not Available':
        item['ceo'] = ceo
    if cfo  and valid_name(cfo)  and item.get('cfo',  'Not Available') == 'Not Available':
        item['cfo'] = cfo
    if gc   and valid_legal(gc)  and item.get('legalCounsel', 'Not Available') == 'Not Available':
        item['legalCounsel'] = gc
    elif firm and valid_firm(firm) and item.get('legalCounsel', 'Not Available') == 'Not Available':
        item['legalCounsel'] = firm

def enrich(item):
    company = item.get('companyName', '')
    ticker  = item.get('ticker', '')
    if not company or not ticker: return item
    time.sleep(0.25)   # 4 req/sec — well within Moonshot limits
    resp = kimi_ask(company, ticker)
    parse_and_apply(resp, item)
    return item

print(f"\nRunning Kimi enrichment (5 workers, ~4 req/sec)...")
start = time.time()

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    enriched = list(ex.map(enrich, to_enrich))

enriched_map = {r.get('id', str(r.get('cik',''))): r for r in enriched}
final = [enriched_map.get(r.get('id', str(r.get('cik',''))), r) for r in records]

elapsed = time.time() - start
total = len(final)
has_ceo   = sum(1 for r in final if r.get('ceo',  'Not Available') != 'Not Available')
has_cfo   = sum(1 for r in final if r.get('cfo',  'Not Available') != 'Not Available')
has_legal = sum(1 for r in final if r.get('legalCounsel', 'Not Available') != 'Not Available')

print(f"Done in {elapsed:.1f}s\n")
print(f"=== KIMI ENRICHMENT STATS ({total} records) ===")
print(f"  CEO         : {has_ceo} ({100*has_ceo//total}%)")
print(f"  CFO         : {has_cfo} ({100*has_cfo//total}%)")
print(f"  Legal Counsel: {has_legal} ({100*has_legal//total}%)")

print("\n=== SPOT CHECKS ===")
for t in ['BCLI','ELSE','NFBK','LPRO','SKYT','CCRN']:
    r = next((x for x in final if x.get('ticker','').split(',')[0].strip() == t), None)
    if r:
        print(f"\n  [{t}] {r.get('companyName','')[:45]}")
        print(f"    CEO  : {r.get('ceo','N/A')}")
        print(f"    CFO  : {r.get('cfo','N/A')}")
        print(f"    Legal: {r.get('legalCounsel','N/A')}")

with open(SEED_PATH, 'w') as f:
    json.dump(final, f, indent=2)
print(f"\nSaved {len(final)} records.")
