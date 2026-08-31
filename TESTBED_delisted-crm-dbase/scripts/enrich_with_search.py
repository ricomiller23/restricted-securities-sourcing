import urllib.request
import urllib.parse
import ssl
import json
import gzip
import re
import time
import os
import random

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

# Common search engine user agents to rotate and look natural
USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
]

def clean_html(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    return re.sub(r'\s+', ' ', text).strip()

def extract_yahoo_synopsis(ticker, company_name, html):
    snippets = re.findall(r'<div class=\"compText[^\"]*\">(.*?)</div>', html, re.DOTALL)
    best_snippet = None
    best_score = -1
    
    clean_company = re.sub(r'[^\w\s]', '', company_name).lower()
    company_words = [w for w in clean_company.split() if w not in {'inc', 'corp', 'co', 'ltd', 'company', 'corporation', 'incorporated', 'limited', 'trust', 'group', 'holdings'}]
    
    for s in snippets:
        cleaned = re.sub(r'<[^>]+>', ' ', s).strip()
        cleaned = cleaned.replace('&rsquo;', "'").replace('&lsquo;', "'").replace('&ldquo;', '"').replace('&rdquo;', '"').replace('&amp;', '&')
        cleaned = re.sub(r'\s+', ' ', cleaned)
        
        # Filter out generic Yahoo/AI search messages or search suggestions
        if cleaned.startswith(('AI-generated', 'Something went wrong', 'Yahoo Scout', 'Loading', 'Search only for', 'Search instead for')):
            continue
            
        lower_cleaned = cleaned.lower()
        score = 0
        
        has_ticker = ticker.lower() in lower_cleaned
        matching_words_count = sum(1 for w in company_words if w in lower_cleaned)
        
        # Must match either ticker or at least one word from the company name to be relevant
        if not has_ticker and matching_words_count == 0:
            continue
            
        if 'delist' in lower_cleaned:
            score += 10
        if 'merg' in lower_cleaned or 'acquir' in lower_cleaned or 'acquisit' in lower_cleaned:
            score += 8
        if 'bankrupt' in lower_cleaned or 'chapter 11' in lower_cleaned or 'chapter 7' in lower_cleaned or 'insolvent' in lower_cleaned:
            score += 8
        if 'liquidat' in lower_cleaned or 'dissol' in lower_cleaned:
            score += 5
        if 'private' in lower_cleaned or 'buyout' in lower_cleaned or 'bought' in lower_cleaned:
            score += 5
        if 'compliance' in lower_cleaned or 'standards' in lower_cleaned or 'requirements' in lower_cleaned or 'bid price' in lower_cleaned:
            score += 4
            
        if has_ticker:
            score += 8
        score += matching_words_count * 3
        
        # Penalties for unrelated popular examples
        if 'luckin' in lower_cleaned and ticker.lower() != 'lkncy':
            score -= 20
        if 'discover the rules' in lower_cleaned or 'rules that can lead' in lower_cleaned:
            score -= 15
            
        if score > best_score and score > 5:
            best_score = score
            best_snippet = cleaned
            
    return best_snippet

def fetch_search_results(query):
    # Rotate User-Agents
    ua = random.choice(USER_AGENTS)
    headers = {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.yahoo.com/'
    }
    
    url = f"https://search.yahoo.com/search?p=" + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers=headers)
    
    # Try fetching up to 2 times
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
                if "compText" in html or "class=\"title" in html:
                    return html
                elif "captcha" in html.lower() or "suspicious activity" in html.lower():
                    print("Captcha/block detected in Yahoo Search response.")
                    return "BLOCKED"
        except Exception as e:
            print(f"Error fetching search results (attempt {attempt+1}): {e}")
            time.sleep(2)
            
    return None

def main():
    if not os.path.exists(seed_path):
        print(f"Error: seed file not found at {seed_path}")
        return
        
    with open(seed_path, "r", encoding="utf-8") as f:
        records = json.load(f)
        
    print(f"Loaded {len(records)} records from {seed_path}")
    
    # Filter records that need search enrichment:
    # 1. Has a valid ticker (not N/A, not OTC)
    # 2. Doesn't already contain search information ("According to market sources:")
    # 3. Has a generic fallback reason (we target these first to enrich them)
    target_records = []
    for r in records:
        ticker = r.get('ticker', '')
        details = r.get('details', '')
        
        # Valid ticker check
        if not ticker or ticker in ['N/A', 'OTC']:
            continue
            
        # Already enriched check
        if "According to market sources:" in details or "According to search results:" in details:
            continue
            
        # Generic check: matches standard fallbacks
        is_fallback = (
            "Voluntary de-registration of securities under Section 12(g)" in details or
            "Voluntary suspension of reporting duties under Section 15(d)" in details or
            "Voluntary de-registration and suspension of reporting duties by a foreign private issuer" in details or
            "Voluntary de-registration of securities (Form 15)" in details or
            "Delisting of securities from exchange listing (Form 25)" in details
        )
        
        if is_fallback:
            target_records.append(r)
            
    total_targets = len(target_records)
    print(f"Found {total_targets} target records for Yahoo Search synopsis enrichment.")
    
    if total_targets == 0:
        print("No targets left to enrich. Database is fully up-to-date!")
        return
        
    # Process target records sequentially to avoid rate limits
    print("Beginning rate-limited Yahoo Search query batch...")
    
    count_enriched = 0
    count_checked = 0
    is_blocked = False
    
    for r in target_records:
        if is_blocked:
            break
            
        ticker = r.get('ticker')
        company_name = r.get('companyName')
        # Use first part of ticker if it has multiple separated by comma
        clean_ticker = ticker.split(',')[0].strip()
        
        # Formulate a natural search query
        query = f"why did {company_name} {clean_ticker} get delisted"
        count_checked += 1
        
        print(f"[{count_checked}/{total_targets}] Querying: '{query}'...", end="", flush=True)
        
        # Fetch search results
        html = fetch_search_results(query)
        
        if html == "BLOCKED":
            print(" Yahoo search rate limit reached (blocked). Saving progress and exiting.")
            is_blocked = True
            break
            
        if not html:
            print(" Failed to fetch.")
            time.sleep(1 + random.random() * 2)
            continue
            
        # Extract best snippet
        snippet = extract_yahoo_synopsis(clean_ticker, company_name, html)
        
        if snippet:
            # Append search results to existing details
            r['details'] = r['details'].rstrip('.') + f". According to market sources: {snippet}"
            count_enriched += 1
            print(" Enriched!")
        else:
            print(" No relevant snippet found.")
            
        # Sleep for a random interval between 1.5 and 3.5 seconds to bypass bot detection
        time.sleep(1.5 + random.random() * 2.0)
        
        # Save every 10 records
        if count_checked % 10 == 0:
            with open(seed_path, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2)
            print(f"--> Saved progress after {count_checked} checks.")
            
    # Final save
    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
        
    print(f"\nBatch completed! Enriched {count_enriched} records out of {count_checked} checked.")

if __name__ == "__main__":
    main()
