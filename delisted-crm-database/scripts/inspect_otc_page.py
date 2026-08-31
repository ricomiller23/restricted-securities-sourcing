import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
}

url = "https://www.otcmarkets.com/stock/SNBRQ/profile"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    html = resp.read().decode('utf-8', errors='ignore')
    
    apis = re.findall(r'https?://[^\s"\'<>]+', html)
    print("Found URLs in page:", set(apis))

    # Check for inline json or script tags
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    print(f"Found {len(scripts)} script tags.")
    for i, s in enumerate(scripts):
        if len(s.strip()) > 0:
            print(f"Script {i}: {s[:150]}")
