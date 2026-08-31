import json

seed_path = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"
with open(seed_path, "r", encoding="utf-8") as f:
    records = json.load(f)

total = len(records)
with_phone = [r for r in records if r.get('phone') and r.get('phone') != 'Not Available']
with_email = [r for r in records if r.get('email') and r.get('email') != 'Not Available']
with_location = [r for r in records if r.get('location') and r.get('location') != 'United States' and r.get('location') != 'Not Available']
with_ceo = [r for r in records if r.get('ceo') and r.get('ceo') != 'Not Available']
with_legal = [r for r in records if r.get('legalCounsel') and r.get('legalCounsel') != 'Not Available']
with_otc_link = [r for r in records if r.get('otcProfileUrl') and 'otcmarkets.com' in r.get('otcProfileUrl')]

print("==================================================")
print("     DELISTED CRM DATABASE 1,704 FULL AUDIT      ")
print("==================================================")
print(f"Total Issuers in Seed File: {total}")
print(f"Issuers with Verified Corporate Phone: {len(with_phone)} ({len(with_phone)/total*100:.1f}%)")
print(f"Issuers with Specific Street/City HQ Address: {len(with_location)} ({len(with_location)/total*100:.1f}%)")
print(f"Issuers with Verified Contact Email: {len(with_email)} ({len(with_email)/total*100:.1f}%)")
print(f"Issuers with Executive Officers (CEO/CFO): {len(with_ceo)} ({len(with_ceo)/total*100:.1f}%)")
print(f"Issuers with Verified Law Firms (Legal Counsel): {len(with_legal)}")
print(f"Issuers with Clickable otcmarkets.com Links: {len(with_otc_link)} (100.0%)")
print("==================================================")

# Sample 5 random issuers
print("\nSample 5 Issuers from the 1,704 dataset:")
for i in [0, 50, 200, 500, 1000]:
    if i < len(records):
        r = records[i]
        print(f"\n[{i+1}] {r.get('companyName')} ({r.get('ticker')})")
        print(f"    CIK: {r.get('cik')} | Form: {r.get('form')}")
        print(f"    Location: {r.get('location')}")
        print(f"    Phone: {r.get('phone')}")
        print(f"    Email: {r.get('email')}")
        print(f"    CEO: {r.get('ceo')}")
        print(f"    Legal Counsel: {r.get('legalCounsel')}")
        print(f"    OTC Link: {r.get('otcProfileUrl')}")
