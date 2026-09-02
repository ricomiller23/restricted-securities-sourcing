import urllib.request
import ssl
import gzip

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_archive_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

url = "https://www.sec.gov/Archives/edgar/data/1556801/000164033426001259/jrvs_1512g.htm"
req = urllib.request.Request(url, headers=sec_archive_headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    raw = resp.read()
    try:
        html = gzip.decompress(raw).decode('utf-8', errors='ignore')
    except:
        html = raw.decode('utf-8', errors='ignore')

    print("MYCB 15-12G Raw HTML:\n")
    print(html)
