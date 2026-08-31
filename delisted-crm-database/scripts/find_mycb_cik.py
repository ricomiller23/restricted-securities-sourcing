import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.sec.gov/files/company_tickers.json"
headers = {'User-Agent': 'DelistedCRM admin@delistedcrm.com'}

print("Querying SEC official ticker index for MYCB...")
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        tickers_data = json.loads(resp.read().decode('utf-8'))
        
        mycb_items = [v for k, v in tickers_data.items() if v.get('ticker') == 'MYCB' or 'mymd' in v.get('title', '').lower()]
        print(f"SEC Ticker index MYCB results ({len(mycb_items)}):")
        print(json.dumps(mycb_items, indent=2))
except Exception as e:
    print("Error querying SEC tickers:", e)
