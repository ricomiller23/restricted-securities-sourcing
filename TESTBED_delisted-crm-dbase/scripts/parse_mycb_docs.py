import urllib.request
import ssl
import gzip
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_archive_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

docs = [
    "https://www.sec.gov/Archives/edgar/data/1556801/000164033426001259/jrvs_1512g.htm",
    "https://www.sec.gov/Archives/edgar/data/1556801/000164033425002067/jrvs_10k.htm"
]

print("Fetching SEC filings for MYCB...")

def clean_html(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = text.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&rsquo;', "'")
    return re.sub(r'\s+', ' ', text).strip()

for doc_url in docs:
    print(f"\nFetching {doc_url}...")
    try:
        req = urllib.request.Request(doc_url, headers=sec_archive_headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            raw = resp.read()
            try:
                html = gzip.decompress(raw).decode('utf-8', errors='ignore')
            except:
                html = raw.decode('utf-8', errors='ignore')

            cleaned = clean_html(html)
            print(f"Fetched {len(cleaned)} characters.")

            # Find Signatories & Titles
            blocks = re.findall(r'(?:By:\s*(?:/s/)?\s*([A-Z][A-Za-z\s\.\,]+?)\s+)?Name:\s*([A-Z][A-Za-z\s\.\,]+?)\s+Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?=\s{3,}|Date:|By:|Name:|$)', cleaned)
            print("  Found signature blocks:", blocks)

            # Find Law Firms
            firms = re.findall(r'([A-Z][A-Za-z\s\,\&]{2,40}\s(?:LLP|P\.C\.|L\.L\.P\.|Law Offices|PLC|PLLC))', cleaned)
            if firms:
                print("  Found Law Firms:", set(firms[:5]))
    except Exception as e:
        print("Error:", e)
