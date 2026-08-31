import urllib.request
import ssl
import json
import gzip

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
}

# CIK for Brainstorm Cell Therapeutics Inc.: 0001382574
url = "https://data.sec.gov/submissions/CIK0001382574.json"
print("Fetching SEC EDGAR submission for CIK 0001382574 (BCLI / Brainstorm Cell)...")

try:
    req = urllib.request.Request(url, headers=sec_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        raw_data = resp.read()
        try:
            decompressed = gzip.decompress(raw_data)
            data = json.loads(decompressed.decode('utf-8'))
        except:
            data = json.loads(raw_data.decode('utf-8'))
            
        print("SEC EDGAR Name:", data.get("name"))
        print("SEC EDGAR Phone:", data.get("phone"))
        print("SEC EDGAR Addresses:", json.dumps(data.get("addresses"), indent=2))
        print("SEC EDGAR State/EIN:", data.get("stateOfIncorporation"), data.get("ein"))
        print("SEC EDGAR Filings recent form types:", data.get("filings", {}).get("recent", {}).get("form")[:15])
except Exception as e:
    print("SEC EDGAR Error:", e)
