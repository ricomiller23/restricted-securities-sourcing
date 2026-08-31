import urllib.request
import ssl
import json
import gzip
import re
import time
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

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
    
    # 1. Parse Form 25 details
    if "25" in form_upper:
        # Check rule references
        rules = {
            r"12d2-2\(a\)\(1\)": "Delisted because the security has been fully redeemed, paid at maturity, or retired.",
            r"12d2-2\(a\)\(2\)": "Delisted because the security has been redeemed or paid in full (typically debt securities/notes).",
            r"12d2-2\(a\)\(3\)": "Delisted because the securities have been surrendered in exchange for other securities (typically due to a merger, acquisition, or reorganization).",
            r"12d2-2\(a\)\(4\)": "Delisted because all rights in the security have been extinguished (typically due to liquidation or bankruptcy).",
            r"12d2-2\(b\)": "Involuntary delisting initiated by the national securities exchange due to failure to meet listing or compliance standards.",
            r"12d2-2\(c\)": "Voluntary delisting initiated by the issuer."
        }
        matched_rules = []
        for regex, desc in rules.items():
            if re.search(regex, html, re.IGNORECASE):
                matched_rules.append(desc)
        
        if matched_rules:
            return " ".join(matched_rules)
        return determine_fallback(form, event_type)
        
    # 2. Parse Form 15 details
    elif "15" in form_upper:
        # Checked checkbox patterns
        checked_chars = [r'&#9746;', r'&#9745;', r'☑', r'☒']
        unchecked_chars = [r'&#9744;', r'☐']
        
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
        
        # Check checked rules by scanning nearby strings of checkmarks
        # Let's search for rules and see if the nearest checkbox is checked
        # Standard rules are listed in tables, usually: Rule Name | Unchecked/Checked box
        # We can find the rule string position, and find the nearest checkbox character
        for rule_code, rule_name in rules_map.items():
            # Escape regex characters
            escaped_code = re.escape(rule_code)
            matches = list(re.finditer(escaped_code, html, re.IGNORECASE))
            for m in matches:
                pos = m.start()
                # Search in window of 150 chars after the rule name
                window = html[pos:pos+250]
                is_checked = False
                for cc in checked_chars:
                    if re.search(cc, window):
                        is_checked = True
                        break
                # Also check window of 150 chars before rule name (just in case)
                window_prev = html[max(0, pos-250):pos]
                for cc in checked_chars:
                    if re.search(cc, window_prev):
                        is_checked = True
                        break
                
                if is_checked:
                    checked_rules.append(rule_name)
                    break
        
        # Look for merger context in HTML
        cleaned = clean_html(html)
        is_merger = False
        if re.search(r'(merger|merged|successor by merger|consolidation|acquired|acquisition)', cleaned, re.IGNORECASE):
            is_merger = True
            
        # Extract number of holders
        holders_match = re.search(r'Approximate number of holders of record as of the certification or notice date:\s*([\d\.\,\w\s]+?)(?=\s{2,}|Rule|Please|$|\.)', cleaned, re.IGNORECASE)
        holders_str = ""
        if holders_match:
            holders_str = holders_match.group(1).strip()
            
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
                
        if holders_str and holders_str.lower() != "none" and holders_str.lower() != "not available":
            details += f" Approximate number of holders of record: {holders_str}."
            
        if is_merger:
            details += " Filed following a corporate merger, acquisition, or reorganization."
            
        return details
        
    return determine_fallback(form, event_type)

def main():
    if not os.path.exists(seed_path):
        print(f"Seed file not found: {seed_path}")
        return
        
    with open(seed_path, "r", encoding="utf-8") as f:
        records = json.load(f)
        
    print(f"Loaded {len(records)} records from {seed_path}")
    print("Testing parser on first 30 records...")
    
    test_records = records[:30]
    for idx, r in enumerate(test_records):
        url = r.get('secFullText')
        form = r.get('form')
        event_type = r.get('eventType')
        ticker = r.get('ticker')
        company = r.get('companyName')
        
        print(f"\n{idx+1}. {company} ({ticker}) | Form: {form}")
        
        if not url:
            details = determine_fallback(form, event_type)
            print(f" -> Fallback Details (No URL): {details}")
            continue
            
        try:
            req = urllib.request.Request(url, headers=sec_headers)
            with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                raw = resp.read()
                try:
                    html = gzip.decompress(raw).decode('utf-8', errors='ignore')
                except:
                    html = raw.decode('utf-8', errors='ignore')
                
                details = parse_filing(html, form, event_type)
                print(f" -> Parsed Details: {details}")
        except Exception as e:
            details = determine_fallback(form, event_type)
            print(f" -> Error fetching URL ({e}), fallback: {details}")
            
        time.sleep(0.1)

if __name__ == "__main__":
    main()
