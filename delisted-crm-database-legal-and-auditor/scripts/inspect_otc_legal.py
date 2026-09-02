import urllib.request
import ssl
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.otcmarkets.com',
    'Referer': 'https://www.otcmarkets.com/'
}

sample_tickers = ["VASO", "AWHL", "CPRX", "KDDIF", "NFBK", "DEFI"]

for ticker in sample_tickers:
    print(f"\n=================== TICKER: {ticker} ===================")
    
    # 1. Company profile endpoint
    url_prof = f"https://backend.otcmarkets.com/otcapi/company/profile/{ticker}"
    try:
        req = urllib.request.Request(url_prof, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("Profile Keys:", list(data.keys()))
            if 'serviceProviders' in data:
                print("Service Providers:", json.dumps(data.get('serviceProviders'), indent=2))
            if 'officers' in data:
                print("Officers count:", len(data.get('officers', [])))
            for k, v in data.items():
                if 'counsel' in k.lower() or 'legal' in k.lower() or 'attorney' in k.lower():
                    print(f"Match key {k}:", v)
    except Exception as e:
        print("Profile Error:", e)

    # 2. Service providers endpoint
    url_prov = f"https://backend.otcmarkets.com/otcapi/company/service-providers/{ticker}"
    try:
        req = urllib.request.Request(url_prov, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            prov_data = json.loads(resp.read().decode('utf-8'))
            print("Service Providers endpoint response:", json.dumps(prov_data, indent=2)[:500])
    except Exception as e:
        print("Service Providers Error:", e)
