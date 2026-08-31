import urllib.request
import ssl
import gzip
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

url = "https://www.sec.gov/Archives/edgar/data/0001141103/000095010326011569/dp250987_1512ga.htm"
print(f"Fetching Cross Country Healthcare SEC filing with gzip decompression from: {url}...")

try:
    req = urllib.request.Request(url, headers=sec_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        raw_data = resp.read()
        try:
            html = gzip.decompress(raw_data).decode('utf-8', errors='ignore')
        except:
            html = raw_data.decode('utf-8', errors='ignore')

        print(f"Decompressed HTML length: {len(html)} characters.")
        print("\nDECOMPRESSED FILING TEXT:\n", html)
except Exception as e:
    print("Error fetching filing:", e)
