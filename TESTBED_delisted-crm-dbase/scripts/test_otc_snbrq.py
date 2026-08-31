import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

otc_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.otcmarkets.com',
    'Referer': 'https://www.otcmarkets.com/stock/SNBRQ/profile'
}

url = "https://backend.otcmarkets.com/otcapi/company/profile/SNBRQ"
print("Testing OTCMarkets backend API for SNBRQ...")

try:
    req = urllib.request.Request(url, headers=otc_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("OTCMarkets Name:", data.get("companyName"))
        print("OTCMarkets Phone:", data.get("phone"))
        print("OTCMarkets Email:", data.get("email"))
        print("OTCMarkets Website:", data.get("website"))
        print("OTCMarkets Officers:", json.dumps(data.get("officers"), indent=2))
        print("OTCMarkets Service Providers:", json.dumps(data.get("serviceProviders"), indent=2))
except Exception as e:
    print("OTCMarkets API Error:", e)
