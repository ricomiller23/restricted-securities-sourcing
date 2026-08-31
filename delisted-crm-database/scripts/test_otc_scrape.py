import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

url = "https://www.otcmarkets.com/stock/SNBRQ/profile"
print(f"Fetching {url}...")

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Fetched length: {len(html)}")
        
        # Search for William R. McLaughlin or James C. Raabe or Officers block
        if "McLaughlin" in html:
            print("Found McLaughlin in HTML!")
        if "Raabe" in html:
            print("Found Raabe in HTML!")
            
        # Print snippet around officers if present
        pos = html.find("McLaughlin")
        if pos != -1:
            print("Snippet:", html[max(0, pos-100):min(len(html), pos+200)])
        else:
            print("McLaughlin not in raw HTML, checking for next data or script tags...")
            script_matches = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
            for s in script_matches:
                if "McLaughlin" in s or "Officer" in s or "profile" in s.lower():
                    print("Match script snippet:", s[:300])
except Exception as e:
    print("Error fetching OTCMarkets HTML:", e)
