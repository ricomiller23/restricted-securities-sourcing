import urllib.request
import ssl
import gzip
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_archive_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

for url in [
    "https://www.sec.gov/Archives/edgar/data/1556801/000164033426001259/jrvs_1512g.htm",
    "https://www.sec.gov/Archives/edgar/data/1556801/000164033425002067/jrvs_10k.htm"
]:
    req = urllib.request.Request(url, headers=sec_archive_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        raw = resp.read()
        try: html = gzip.decompress(raw).decode('utf-8', errors='ignore')
        except: html = raw.decode('utf-8', errors='ignore')

        print(f"\n==================== FILING: {url.split('/')[-1]} ====================")
        for kw in ['/s/', 'Title:', 'Name:', 'President', 'CEO', 'Director', 'Counsel']:
            pos = html.find(kw)
            if pos != -1:
                print(f"\nSnippet for '{kw}':")
                print(html[max(0, pos-100):min(len(html), pos+300)])
