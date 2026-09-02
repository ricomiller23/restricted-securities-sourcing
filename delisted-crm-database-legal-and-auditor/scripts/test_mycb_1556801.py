import urllib.request
import ssl
import json
import gzip

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
}

url = "https://data.sec.gov/submissions/CIK0001556801.json"
print("Fetching SEC EDGAR submission for MYCB CIK 0001556801...")

try:
    req = urllib.request.Request(url, headers=sec_headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        raw_data = resp.read()
        try:
            data = json.loads(gzip.decompress(raw_data).decode('utf-8'))
        except:
            data = json.loads(raw_data.decode('utf-8'))
            
        print("SEC Name:", data.get("name"))
        print("SEC Phone:", data.get("phone"))
        print("SEC Addresses:", json.dumps(data.get("addresses"), indent=2))
        
        recent = data.get("filings", {}).get("recent", {})
        forms = recent.get("form", [])
        acc_nums = recent.get("accessionNumber", [])
        primary_docs = recent.get("primaryDocument", [])
        
        print("\nRecent Filings for MYCB:")
        for i in range(min(10, len(forms))):
            print(f"  [{i+1}] Form {forms[i]} | Acc: {acc_nums[i]} | Doc: {primary_docs[i]}")

except Exception as e:
    print("SEC EDGAR Error:", e)
