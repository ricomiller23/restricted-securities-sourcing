import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

otc_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://www.otcmarkets.com',
    'Referer': 'https://www.otcmarkets.com/stock/BCLI/profile',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site'
}

ticker = "BCLI"
url = f"https://backend.otcmarkets.com/otcapi/company/profile/{ticker}"
print(f"Fetching OTCMarkets API for {ticker}: {url}...")

try:
    req = urllib.request.Request(url, headers=otc_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("SUCCESS! Data keys:", data.keys())
        print("Company Name:", data.get("companyName"))
        print("Phone:", data.get("phone"))
        print("Email:", data.get("email"))
        print("Website:", data.get("website"))
        print("Address:", data.get("address1"), data.get("address2"), data.get("city"), data.get("state"), data.get("zip"))
        print("Officers:", json.dumps(data.get("officers"), indent=2))
        print("Service Providers:", json.dumps(data.get("serviceProviders"), indent=2))
except Exception as e:
    print("Error fetching OTCMarkets API:", e)
