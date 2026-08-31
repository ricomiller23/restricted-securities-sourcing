import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://backend.otcmarkets.com/otcapi/company/profile/BCLI"

req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.otcmarkets.com',
    'Referer': 'https://www.otcmarkets.com/'
})

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        print("Status code:", resp.status)
        print("Headers:", dict(resp.headers))
        content = resp.read().decode('utf-8', errors='ignore')
        print("Content snippet:", content[:500])
except urllib.error.HTTPError as e:
    print("HTTP Error status:", e.code)
    print("HTTP Error headers:", dict(e.headers))
    content = e.read().decode('utf-8', errors='ignore')
    print("HTTP Error content snippet:", content[:500])
except Exception as e:
    print("General Error:", e)
