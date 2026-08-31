import urllib.request
import ssl
import json
import gzip
import re
import time
import os
import threading
import concurrent.futures

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

class RateLimiter:
    def __init__(self, rate_limit=9): # Target 9 requests/second (below the SEC limit of 10)
        self.rate_limit = rate_limit
        self.last_request_time = 0
        self.lock = threading.Lock()

    def wait(self):
        with self.lock:
            current_time = time.time()
            elapsed = current_time - self.last_request_time
            sleep_time = (1.0 / self.rate_limit) - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
            self.last_request_time = time.time()

limiter = RateLimiter(rate_limit=9.0)

def clean_html(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    return re.sub(r'\s+', ' ', text).strip()

def determine_fallback(form, event_type):
    form_upper = str(form).upper()
    if "15-12G" in form_upper:
        return "Voluntary de-registration of securities under Section 12(g) of the Exchange Act."
    elif "15-15D" in form_upper:
        return "Voluntary suspension of reporting duties under Section 15(d) of the Exchange Act."
    elif "15F" in form_upper:
        return "Voluntary de-registration and suspension of reporting duties by a foreign private issuer."
    elif "15" in form_upper:
        return "Voluntary de-registration of securities (Form 15)."
    elif "25" in form_upper:
        return "Delisting of securities from exchange listing (Form 25)."
    return "Delisted issuer filing."

def parse_filing(html, form, event_type):
    form_upper = str(form).upper()
    
    # Checkbox patterns: checked (X, checkmark, box with check)
    checked_chars = [r'&#9746;', r'&#9745;', r'☑', r'☒', r'\[\s*[xX]\s*\]', r'checked']
    
    # 1. Parse Form 25
    if "25" in form_upper:
        rules = {
            "12d2-2(a)(1)": "Delisted because the security has been fully redeemed, paid at maturity, or retired.",
            "12d2-2(a)(2)": "Delisted because the security has been redeemed or paid in full (typically debt securities/notes).",
            "12d2-2(a)(3)": "Delisted because the securities have been surrendered in exchange for other securities (typically due to a merger, acquisition, or reorganization).",
            "12d2-2(a)(4)": "Delisted because all rights in the security have been extinguished (typically due to liquidation or bankruptcy).",
            "12d2-2(b)": "Involuntary delisting initiated by the national securities exchange due to failure to meet listing or compliance standards.",
            "12d2-2(c)": "Voluntary delisting initiated by the issuer."
        }
        
        # Check rule references
        matched_rules = []
        rules_found_in_doc = []
        for code, desc in rules.items():
            escaped_code = re.escape(code)
            if re.search(escaped_code, html, re.IGNORECASE):
                rules_found_in_doc.append((code, desc))
                
        if len(rules_found_in_doc) == 1:
            # If only one rule code is ever mentioned in the document, it is the matched one
            return rules_found_in_doc[0][1]
        elif len(rules_found_in_doc) > 1:
            # Multiple rules present (boilerplate form). Find the checked one.
            for code, desc in rules_found_in_doc:
                escaped_code = re.escape(code)
                matches = list(re.finditer(escaped_code, html, re.IGNORECASE))
                is_checked = False
                for m in matches:
                    pos = m.start()
                    # Check window around the match
                    window_before = html[max(0, pos-350):pos]
                    window_after = html[pos:pos+350]
                    for cc in checked_chars:
                        if re.search(cc, window_before) or re.search(cc, window_after):
                            is_checked = True
                            break
                    if is_checked:
                        break
                if is_checked:
                    matched_rules.append(desc)
                    
            if matched_rules:
                return " ".join(matched_rules)
                
        # If no rule was explicitly checked or only boilerplate matched, fall back to first found in clean text
        cleaned = clean_html(html)
        for code, desc in rules.items():
            if code in cleaned:
                return desc
                
        return determine_fallback(form, event_type)
        
    # 2. Parse Form 15
    elif "15" in form_upper:
        rules_map = {
            "12g-4(a)(1)": "Rule 12g-4(a)(1) (held by less than 300 holders)",
            "12g-4(a)(2)": "Rule 12g-4(a)(2) (held by less than 500 holders, or 1,200 for banks)",
            "12h-3(b)(1)(i)": "Rule 12h-3(b)(1)(i) (held by less than 300 holders)",
            "12h-3(b)(1)(ii)": "Rule 12h-3(b)(1)(ii) (held by less than 500 holders, or 1,200 for banks)",
            "15d-6": "Rule 15d-6 (fewer than 300 holders at fiscal year start)",
            "15d-22": "Rule 15d-22 (suspension of reporting)",
            "15d-21": "Rule 15d-21"
        }
        
        checked_rules = []
        for code, name in rules_map.items():
            escaped_code = re.escape(code)
            matches = list(re.finditer(escaped_code, html, re.IGNORECASE))
            is_checked = False
            for m in matches:
                pos = m.start()
                window_before = html[max(0, pos-300):pos]
                window_after = html[pos:pos+300]
                for cc in checked_chars:
                    if re.search(cc, window_before) or re.search(cc, window_after):
                        is_checked = True
                        break
                if is_checked:
                    break
            if is_checked:
                checked_rules.append(name)
                
        # Look for merger context in HTML
        cleaned = clean_html(html)
        is_merger = False
        if re.search(r'(merger|merged|successor by merger|consolidation|acquired|acquisition)', cleaned, re.IGNORECASE):
            is_merger = True
            
        # Extract number of holders
        # We search inside HTML using tags-tolerant matching or cleaned text
        holders_match = re.search(r'Approximate number of holders of record as of the certification or notice date:\s*([^\n\r<]+)', html, re.IGNORECASE)
        holders_str = ""
        if holders_match:
            val = clean_html(holders_match.group(1)).strip()
            val = re.split(r'(Pursuant|Rule|By:|Please|Date:)', val, flags=re.IGNORECASE)[0].strip()
            if len(val) > 40:
                val = val[:40]
            holders_str = val
            
        # Synthesize details string
        details = ""
        if checked_rules:
            details += f"Voluntary de-registration/suspension of reporting under {', '.join(checked_rules)}."
        else:
            if "15-12G" in form_upper:
                details += "Voluntary de-registration of securities under Section 12(g)."
            elif "15-15D" in form_upper:
                details += "Voluntary suspension of reporting duties under Section 15(d)."
            else:
                details += "Voluntary de-registration of securities (Form 15)."
                
        if holders_str and holders_str.lower() not in ["none", "not available", "0"]:
            details += f" Approximate number of holders of record: {holders_str}."
            
        if is_merger:
            details += " Filed following a corporate merger, acquisition, or reorganization."
            
        return details
        
    return determine_fallback(form, event_type)

def process_item(item):
    url = item.get('secFullText')
    form = item.get('form')
    event_type = item.get('eventType')
    
    # Skip if details already exists and is not a default fallback string
    existing_details = item.get('details')
    fallback_details = determine_fallback(form, event_type)
    if existing_details and existing_details != fallback_details and len(existing_details) > 30:
        return item, False # Already parsed
        
    if not url:
        item['details'] = fallback_details
        return item, True
        
    # Compliance with SEC rate limiting
    limiter.wait()
    
    try:
        req = urllib.request.Request(url, headers=sec_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            raw = resp.read()
            try:
                html = gzip.decompress(raw).decode('utf-8', errors='ignore')
            except:
                html = raw.decode('utf-8', errors='ignore')
            
            item['details'] = parse_filing(html, form, event_type)
            return item, True
    except Exception as e:
        # Fallback in case of fetch failure
        item['details'] = fallback_details
        return item, True

def main():
    if not os.path.exists(seed_path):
        print(f"Error: seed file not found at {seed_path}")
        return
        
    with open(seed_path, "r", encoding="utf-8") as f:
        records = json.load(f)
        
    print(f"Loaded {len(records)} records from {seed_path}")
    
    # Process in parallel using thread pool
    print("Enriching records. Please wait...", flush=True)
    
    updated_records = []
    total = len(records)
    count_processed = 0
    count_saved = 0
    
    # We will process in chunks of 50 to easily update the seed file and keep progress safe
    chunk_size = 50
    for i in range(0, total, chunk_size):
        chunk = records[i:i+chunk_size]
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(process_item, chunk))
            
        for r, was_fetched in results:
            updated_records.append(r)
            if was_fetched:
                count_processed += 1
                
        count_saved += len(chunk)
        
        # Save state
        with open(seed_path, "w", encoding="utf-8") as f:
            json.dump(updated_records + records[count_saved:], f, indent=2)
            
        print(f"Progress: {count_saved}/{total} records processed. (Fetched/updated this run: {count_processed})", flush=True)
        
    print("\nEnrichment completed successfully!", flush=True)

if __name__ == "__main__":
    main()
