import json

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(seed_path, "r", encoding="utf-8") as f:
    records = json.load(f)

cch_records = [r for r in records if "cross country" in r.get('companyName', '').lower() or r.get('ticker') == 'CCRN' or r.get('cik') == '0001141807' or r.get('cik') == '1141807']

print(f"Found {len(cch_records)} records for Cross Country Healthcare Inc.:")
for r in cch_records:
    print(json.dumps(r, indent=2))
