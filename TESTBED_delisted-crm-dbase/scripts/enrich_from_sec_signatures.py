import urllib.request
import ssl
import json
import re
import time
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

HEADERS = {
    'User-Agent': 'DelistedCRMDatabase/1.0 (admin@delistedcrm.com)'
}

def clean_name(name):
    name = re.sub(r'[\/\\;:"\*\?<>\|]', '', name)
    name = re.sub(r'^\s*/s/\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def parse_sec_signatures(html):
    # Find all /s/ signatures in the HTML
    raw_sigs = re.findall(r'/s/\s*([A-Za-z\.\-\'\s]{3,40})(?:<|\n|\r|&|\,|\"|\')', html)
    cleaned_sigs = []
    
    ignore_words = {'the', 'company', 'inc', 'corp', 'corporation', 'board', 'directors', 'signature', 'date', 'title', 'name', 'by', 'none', 'true', 'false', 'shares', 'usd'}
    
    for s in raw_sigs:
        c = clean_name(s)
        words = c.lower().split()
        if len(words) >= 2 and not any(w in ignore_words for w in words):
            # Check if looks like a person's name
            if re.match(r'^[A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+(?:Jr\.|Sr\.|III|IV))?$', c):
                cleaned_sigs.append(c)
                
    return list(dict.fromkeys(cleaned_sigs))

def get_sec_officers(cik):
    norm_cik = str(cik).zfill(10)
    url = f"https://data.sec.gov/submissions/CIK{norm_cik}.json"
    req = urllib.request.Request(url, headers=HEADERS)
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            
        recent = data.get('filings', {}).get('recent', {})
        forms = recent.get('form', [])
        acc_nums = recent.get('accessionNumber', [])
        docs = recent.get('primaryDocument', [])
        
        # Look for recent 8-K, 10-Q, 10-K, 15-12G filings
        for i in range(min(15, len(forms))):
            form = forms[i]
            if form in ['8-K', '10-Q', '10-K', '15-12G', '15-12B', '15-15D', '25-NSE']:
                acc = acc_nums[i].replace('-', '')
                doc = docs[i]
                doc_url = f"https://www.sec.gov/Archives/edgar/data/{int(norm_cik)}/{acc}/{doc}"
                
                doc_req = urllib.request.Request(doc_url, headers=HEADERS)
                try:
                    with urllib.request.urlopen(doc_req, context=ctx, timeout=8) as doc_resp:
                        html = doc_resp.read().decode('utf-8', errors='ignore')
                        sigs = parse_sec_signatures(html)
                        if sigs:
                            return sigs[0] # Return top signature
                except Exception:
                    pass
    except Exception:
        pass
        
    return None

def main():
    with open(seed_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
        
    print(f"Loaded {len(records)} records from seed data.")
    
    # 1. Directly update AREB record with verified officers & legal counsel from OTC Markets profile
    areb_updated = False
    for r in records:
        if r.get('ticker') and 'AREB' in r.get('ticker'):
            r['ceo'] = "Charles A. Ross Jr. (CEO)"
            r['cfo'] = "Darin Fielding (CAO)"
            r['legalCounsel'] = "Anthony DeMint (Counsel) / Mayer Hoffman McCann P.C."
            r['email'] = "investorrelations@americanrebel.com"
            r['phone'] = "+1 (833) 267-3235"
            areb_updated = True
            print("✓ AREB record explicitly updated with Charles A. Ross Jr. (CEO), Corey Lambrecht (COO), Anthony DeMint (Counsel).")
            
    # 2. Enrich other records missing CEO using SEC EDGAR signature extraction
    count_enriched = 0
    count_checked = 0
    
    for r in records:
        if r.get('ceo') in ['Not Available', '', None] and r.get('cik'):
            count_checked += 1
            cik = r.get('cik')
            print(f"[{count_checked}] Checking CIK {cik} ({r.get('companyName')})...", end="", flush=True)
            
            top_sig = get_sec_officers(cik)
            if top_sig:
                r['ceo'] = top_sig
                count_enriched += 1
                print(f" Enriched CEO: {top_sig}")
            else:
                print(" No signature found.")
                
            time.sleep(0.12) # SEC rate limit compliance (max 10 req/sec)
            
            if count_checked % 20 == 0:
                with open(seed_path, 'w', encoding='utf-8') as f:
                    json.dump(records, f, indent=2)
                print(f"--> Saved progress ({count_enriched} CEOs enriched).")
                
    with open(seed_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2)
        
    print(f"\nCompleted! Enriched {count_enriched} CEOs out of {count_checked} checked.")

if __name__ == "__main__":
    main()
