import urllib.request
import ssl
import re
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

# Cross Country Healthcare CIK 0001141807 / Form 15-12G url
sample_urls = [
    "https://www.sec.gov/Archives/edgar/data/1141807/000119312526011234/d1512g.htm", # Example Form 15
    "https://www.sec.gov/Archives/edgar/data/827187/00095010326011604/dp250753_1512g.htm" # SNBRQ
]

print("Testing SEC filing signature block parser...")

def parse_signature_from_sec_html(html_text):
    # Regex patterns for SEC signature blocks:
    # By: /s/ [Name]
    # Name: [Name]
    # Title: [Title]
    
    officer_info = {}
    
    # 1. Match "Name:\s*([A-Za-z\s\.\,\-]+)" and "Title:\s*([A-Za-z\s\.\,\-\&]+)"
    name_match = re.search(r'Name:\s*</[^>]+>\s*([^<\n]+)', html_text, re.IGNORECASE) or \
                 re.search(r'Name:\s*([A-Za-z\s\.\,\-]+)', html_text, re.IGNORECASE)
                 
    title_match = re.search(r'Title:\s*</[^>]+>\s*([^<\n]+)', html_text, re.IGNORECASE) or \
                  re.search(r'Title:\s*([A-Za-z\s\.\,\-\&]+)', html_text, re.IGNORECASE)

    # Alternative: /s/ [Signature Name]
    sig_match = re.search(r'/s/\s*([A-Za-z\s\.\,\-]+)', html_text, re.IGNORECASE)

    if sig_match:
        officer_info['signatory_name'] = sig_match.group(1).strip()
    elif name_match:
        officer_info['signatory_name'] = name_match.group(1).strip()

    if title_match:
        officer_info['signatory_title'] = title_match.group(1).strip()

    # Look for law firm names (LLP, P.C., Law Offices, etc.)
    firm_match = re.search(r'([A-Z][A-Za-z\s\,\&]+(?:LLP|P\.C\.|L\.L\.P\.|Law Offices|PLC|PLLC))', html_text)
    if firm_match:
        officer_info['legal_firm'] = firm_match.group(1).strip()

    return officer_info

# Let's test with Cross Country Healthcare SEC filing CIK 0001141807
sec_url = "https://www.sec.gov/Archives/edgar/data/1141807/000119312526011234/d1512g.htm"
print(f"Fetching {sec_url}...")
try:
    req = urllib.request.Request(sec_url, headers=sec_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Fetched {len(html)} bytes.")
        parsed = parse_signature_from_sec_html(html)
        print("Parsed Signature Block:", json.dumps(parsed, indent=2))
        
        # Print snippet around /s/ or Susan Ball or Title
        for kw in ['/s/', 'Susan', 'Title:', 'General Counsel']:
            pos = html.find(kw)
            if pos != -1:
                print(f"Snippet near '{kw}':", html[max(0, pos-100):min(len(html), pos+300)])
except Exception as e:
    print("Error fetching SEC filing:", e)
