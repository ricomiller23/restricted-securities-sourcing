import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

scout_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
}

url_c = "https://edgar-insider-scout.vercel.app/api/contacts"
req_c = urllib.request.Request(url_c, headers=scout_headers)
with urllib.request.urlopen(req_c, context=ctx, timeout=15) as resp:
    c_data = json.loads(resp.read().decode('utf-8')).get('data', [])
    print(f"Total contacts returned from scout: {len(c_data)}")
    if c_data:
        print("Sample contact keys:", c_data[0].keys())
        print("Sample contact 0:", json.dumps(c_data[0], indent=2))
        
        # Check non-empty legal counsel
        with_lc = [c for c in c_data if c.get('legal_counsel')]
        print(f"Contacts with legal_counsel: {len(with_lc)}")
        if with_lc:
            print("Sample legal counsel contact:", json.dumps(with_lc[0], indent=2))
            
        with_ceo = [c for c in c_data if c.get('ceo') or c.get('contact_name')]
        print(f"Contacts with ceo/contact_name: {len(with_ceo)}")
        if with_ceo:
            print("Sample ceo contact:", json.dumps(with_ceo[0], indent=2))
