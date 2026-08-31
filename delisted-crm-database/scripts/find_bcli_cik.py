import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Query SEC company tickers JSON
url = "https://www.sec.gov/files/company_tickers.json"
headers = {'User-Agent': 'DelistedCRM admin@delistedcrm.com'}

print("Querying SEC official ticker index...")
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        tickers_data = json.loads(resp.read().decode('utf-8'))
        
        bcli_items = [v for k, v in tickers_data.items() if v.get('ticker') == 'BCLI' or 'brainstorm' in v.get('title', '').lower()]
        print(f"SEC Ticker index BCLI results ({len(bcli_items)}):")
        print(json.dumps(bcli_items, indent=2))
except Exception as e:
    print("Error querying SEC tickers:", e)
