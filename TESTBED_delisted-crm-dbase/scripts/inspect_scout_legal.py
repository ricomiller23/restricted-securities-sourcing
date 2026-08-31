import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Accept': 'application/json',
}

url = "https://edgar-insider-scout.vercel.app/api/contacts"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    contacts = data.get('data', [])
    print(f"Total contacts from scout API: {len(contacts)}")
    
    with_legal = [c for c in contacts if c.get('legal_counsel')]
    print(f"Contacts with populated legal counsel: {len(with_legal)}")
    
    if len(with_legal) > 0:
        print("\nSample legal counsel entries from OTCMarkets / EDGAR:")
        for c in with_legal[:10]:
            print(f"  Ticker: {c.get('ticker')}, Company: {c.get('issuer_name')}, Legal Counsel: {c.get('legal_counsel')}")
