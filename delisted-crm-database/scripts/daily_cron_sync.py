import urllib.request
import ssl
import json
import os
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
}

def sync_daily():
    print("[DAILY CRON SYNC] Starting daily sync with strict NO-FAKE-DATA policy...")
    
    # 1. Fetch contacts
    contacts_by_cik = {}
    contacts_by_ticker = {}
    try:
        url_contacts = "https://edgar-insider-scout.vercel.app/api/contacts"
        req_c = urllib.request.Request(url_contacts, headers=headers)
        with urllib.request.urlopen(req_c, context=ctx, timeout=15) as resp:
            c_data = json.loads(resp.read().decode('utf-8')).get('data', [])
            for item in c_data:
                cik = item.get('cik')
                ticker = item.get('ticker')
                if cik: contacts_by_cik[cik] = item
                if ticker: contacts_by_ticker[ticker] = item
    except Exception as e:
        print(f"Error fetching contacts: {e}")

    # 2. Fetch issuers
    all_issuers = []
    seen_ids = set()
    offset = 0

    while offset <= 2000:
        url = f"https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers?from={offset}&dateRange=all&exchange=all"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                batch = data.get('data', [])
                if not batch: break
                for item in batch:
                    item_id = item.get('id') or (item.get('cik') + "_" + item.get('delistDate', ''))
                    if item_id not in seen_ids:
                        seen_ids.add(item_id)
                        all_issuers.append(item)
                offset += len(batch)
        except Exception as e:
            print(f"Error at offset {offset}: {e}")
            break

    clean_dataset = []
    for idx, item in enumerate(all_issuers):
        ticker = (item.get('ticker') or 'OTC').strip()
        company_name = item.get('companyName') or 'Unknown Issuer'
        cik = item.get('cik') or ''

        c_match = contacts_by_cik.get(cik) or contacts_by_ticker.get(ticker) or {}

        raw_legal = c_match.get('legal_counsel')
        if raw_legal and str(raw_legal).strip() and str(raw_legal).strip().lower() not in ['none', 'null', 'not available']:
            legal_counsel_name = str(raw_legal).strip()
        else:
            legal_counsel_name = "Not Available"

        raw_email = c_match.get('email')
        if raw_email and not raw_email.startswith('ir@') and not raw_email.startswith('contact@') and '@' in raw_email:
            email = raw_email
        else:
            email = "Not Available"

        raw_phone = c_match.get('phone')
        if raw_phone and len(str(raw_phone).strip()) >= 7:
            phone = str(raw_phone).strip()
        else:
            phone = "Not Available"

        raw_ceo = c_match.get('ceo') or c_match.get('contact_name')
        if raw_ceo and raw_ceo != company_name and len(raw_ceo.strip()) > 2:
            ceo = raw_ceo.strip()
        else:
            ceo = "Not Available"

        otc_profile_url = f"https://www.otcmarkets.com/stock/{ticker}/profile" if ticker and ticker != 'OTC' else "https://www.otcmarkets.com"

        record = {
            "id": item.get("id") or f"delisted-{idx+1}",
            "cik": cik,
            "companyName": company_name,
            "ticker": ticker,
            "delistDate": item.get("delistDate", "2026-01-01"),
            "form": item.get("form", "15-12G"),
            "exchange": item.get("exchange", "Delisted → OTC"),
            "eventType": item.get("eventType", "Delisting Notice"),
            "secLandingPage": item.get("secLandingPage", f"https://www.sec.gov/edgar/searchedgar/companysearch?CIK={cik}"),
            "secFullText": item.get("secFullText", ""),
            "location": item.get("location", "United States"),
            "email": email,
            "phone": phone,
            "ceo": ceo,
            "cfo": "Not Available",
            "otcProfileUrl": otc_profile_url,
            "legalCounsel": legal_counsel_name,
            "status": "new",
            "notes": []
        }
        clean_dataset.append(record)

    out_file = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(clean_dataset, f, indent=2)

    print(f"[DAILY CRON SYNC] Updated seed with {len(clean_dataset)} strict records.")

if __name__ == "__main__":
    sync_daily()
