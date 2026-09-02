import urllib.request
import ssl
import json
import gzip
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sec_headers = {
    'User-Agent': 'DelistedCRM admin@delistedcrm.com',
    'Accept-Encoding': 'gzip, deflate'
}

# CIK for MYCB (MyMD Pharmaceuticals, Inc.): 0001611867
cik_mycb = "0001611867"
url = f"https://data.sec.gov/submissions/CIK{cik_mycb}.json"
print(f"Fetching SEC EDGAR submission for MYCB (CIK {cik_mycb})...")

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

        # Fetch recent 10-K or 8-K or 15 filing text
        for i in range(min(10, len(forms))):
            doc = primary_docs[i]
            acc = acc_nums[i].replace('-', '')
            doc_url = f"https://www.sec.gov/Archives/edgar/data/1611867/{acc}/{doc}"
            print(f"\nFetching doc {i+1}: {doc_url}...")
            try:
                req_d = urllib.request.Request(doc_url, headers=sec_headers)
                with urllib.request.urlopen(req_d, context=ctx, timeout=10) as r_doc:
                    raw_d = r_doc.read()
                    try:
                        h_doc = gzip.decompress(raw_d).decode('utf-8', errors='ignore')
                    except:
                        h_doc = raw_d.decode('utf-8', errors='ignore')
                        
                    # Find law firms (LLP, P.C.) or officers (CEO, CFO, Counsel)
                    firms = re.findall(r'([A-Z][A-Za-z\s\,\&]{2,40}\s(?:LLP|P\.C\.|L\.L\.P\.|Law Offices|PLC|PLLC))', h_doc)
                    if firms:
                        print("  Found Law Firms in filing:", set(firms[:5]))
                        
                    by_names = re.findall(r'By:\s*(?:/s/)?\s*([A-Z][A-Za-z\s\.\,]+)', h_doc)
                    if by_names:
                        print("  Found Signatories in filing:", set(by_names[:5]))
            except Exception as e:
                print("  Error fetching doc:", e)

except Exception as e:
    print("SEC EDGAR Error:", e)
