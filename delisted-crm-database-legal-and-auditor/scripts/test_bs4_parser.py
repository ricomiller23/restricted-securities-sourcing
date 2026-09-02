import urllib.request
import ssl
import gzip
import re
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_archive_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

def parse_filing_html(url):
    req = urllib.request.Request(url, headers=sec_archive_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        raw = resp.read()
        try: html = gzip.decompress(raw).decode('utf-8', errors='ignore')
        except: html = raw.decode('utf-8', errors='ignore')

        # Clean tags but keep structure
        names = re.findall(r'Name:\s*</[^>]+>\s*<td[^>]*>(?:<[^>]+>)*\s*([A-Za-z\s\.\,]+?)\s*<', html, re.IGNORECASE) or \
                re.findall(r'>\s*Name:\s*<[^>]+>\s*<[^>]+>\s*([A-Za-z\s\.\,]+?)\s*<', html, re.IGNORECASE) or \
                re.findall(r'Name:\s*([A-Z][A-Za-z\s\.\,]+?)(?:\s{2,}|Title:|</)', html, re.IGNORECASE)

        titles = re.findall(r'Title:\s*</[^>]+>\s*<td[^>]*>(?:<[^>]+>)*\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)\s*<', html, re.IGNORECASE) or \
                 re.findall(r'>\s*Title:\s*<[^>]+>\s*<[^>]+>\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)\s*<', html, re.IGNORECASE) or \
                 re.findall(r'Title:\s*([A-Za-z0-9\s\.\,\-\&\;/]+?)(?:\s{2,}|Date:|</)', html, re.IGNORECASE)

        # Executive sentence extraction: "CEO [Name]", "CFO [Name]"
        exec_matches = re.findall(r'(CEO|CFO|Interim CEO|Interim CFO|General Counsel|President|Treasurer)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)', html)

        return {
            'names': list(set(names)),
            'titles': list(set(titles)),
            'exec_matches': list(set(exec_matches))
        }

print("Parsing MYCB 10-K filing HTML...")
res = parse_filing_html("https://www.sec.gov/Archives/edgar/data/1556801/000164033425002067/jrvs_10k.htm")
print(json.dumps(res, indent=2))
