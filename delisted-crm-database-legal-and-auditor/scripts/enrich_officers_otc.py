#!/usr/bin/env python3
"""
OTC Markets Officer & Contact Enrichment Script v2
Scrapes the OTC Markets API for every ticker in the database to pull:
  - Officers (CEO, COO, CFO, etc.)
  - Legal Counsel (from officers list)
  - Company email & phone
Overwrites 'Not Available' fields only - preserves existing data.
"""

import urllib.request
import urllib.parse
import urllib.error
import ssl
import json
import time
import random
import re
import os
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SEED_PATH = "/Users/ericmiller/NEW JUNE 26/delisted-crm-database/src/data/delisted_issuers_seed.json"

USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
]


def fetch_otc_profile(ticker):
    """Fetch OTC Markets profile JSON for a given ticker.
    Returns:
      dict: parsed profile data
      'NOT_FOUND': ticker doesn't exist on OTC Markets
      'BLOCKED': rate limited or blocked  
      None: other error
    """
    url = f'https://backend.otcmarkets.com/otcapi/company/profile/full/{ticker}?responseCap=250'
    
    for attempt in range(3):
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'application/json',
            'Referer': f'https://www.otcmarkets.com/stock/{ticker}/profile',
            'Origin': 'https://www.otcmarkets.com',
        }
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
                raw = resp.read().decode('utf-8', errors='ignore')
                if raw.strip().startswith('{'):
                    return json.loads(raw)
                elif 'temporarily unavailable' in raw.lower() or 'maintenance' in raw.lower():
                    # OTC site is in maintenance mode - wait and retry
                    if attempt < 2:
                        wait = 5 * (attempt + 1) + random.random() * 3
                        print(f" [maintenance, retry in {wait:.0f}s]", end="", flush=True)
                        time.sleep(wait)
                        continue
                    return 'BLOCKED'
                elif '<!doctype' in raw.lower() or '<html' in raw.lower():
                    # Got HTML instead of JSON - probably rate limited
                    if attempt < 2:
                        wait = 3 * (attempt + 1) + random.random() * 2
                        time.sleep(wait)
                        continue
                    return 'BLOCKED'
                else:
                    return None
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return 'NOT_FOUND'
            elif e.code == 403:
                if attempt < 2:
                    wait = 5 * (attempt + 1) + random.random() * 5
                    print(f" [403, retry in {wait:.0f}s]", end="", flush=True)
                    time.sleep(wait)
                    continue
                return 'BLOCKED'
            elif e.code == 429:
                if attempt < 2:
                    wait = 10 * (attempt + 1) + random.random() * 5
                    print(f" [429, retry in {wait:.0f}s]", end="", flush=True)
                    time.sleep(wait)
                    continue
                return 'BLOCKED'
            else:
                return None
        except Exception as e:
            if attempt < 2:
                time.sleep(3)
                continue
            return None
    return None


def extract_officers_data(profile):
    """Extract CEO, CFO, legal counsel, and all officer names from OTC profile."""
    officers = profile.get('officers') or []
    
    ceo = None
    cfo = None
    legal_counsel = None
    all_officers = []
    
    for o in officers:
        name = (o.get('name') or '').strip()
        title = (o.get('title') or '').strip()
        
        if not name:
            continue
        
        all_officers.append(f"{name} ({title})" if title else name)
        title_lower = title.lower()
        
        # CEO detection
        if not ceo and ('ceo' in title_lower or 'chief executive' in title_lower):
            ceo = name
        
        # CFO detection
        if not cfo and ('cfo' in title_lower or 'chief financial' in title_lower):
            cfo = name
        
        # Legal counsel detection - check multiple patterns
        if not legal_counsel and any(kw in title_lower for kw in [
            'counsel', 'legal', 'general counsel', 'chief legal', 
            'attorney', 'corporate secretary'
        ]):
            legal_counsel = f"{name} ({title})"
    
    # If no CEO found, try President or Chairman
    if not ceo:
        for o in officers:
            name = (o.get('name') or '').strip()
            title = (o.get('title') or '').strip()
            title_lower = title.lower()
            if 'president' in title_lower and 'vice' not in title_lower:
                ceo = name
                break
        if not ceo:
            for o in officers:
                name = (o.get('name') or '').strip()
                title = (o.get('title') or '').strip()
                if 'chairman' in title.lower():
                    ceo = name
                    break
    
    return {
        'ceo': ceo,
        'cfo': cfo,
        'legalCounsel': legal_counsel,
        'allOfficers': all_officers,
    }


def main():
    with open(SEED_PATH, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    print(f"Loaded {len(records)} records.")
    
    # Get all unique tickers to query
    ticker_to_records = {}
    for r in records:
        raw_ticker = r.get('ticker', '')
        if not raw_ticker or raw_ticker in ['N/A', 'OTC']:
            continue
        # Take first ticker if comma-separated
        primary_ticker = raw_ticker.split(',')[0].strip()
        # Skip weird tickers
        if not re.match(r'^[A-Z0-9\-]+$', primary_ticker):
            continue
        if primary_ticker not in ticker_to_records:
            ticker_to_records[primary_ticker] = []
        ticker_to_records[primary_ticker].append(r)
    
    unique_tickers = list(ticker_to_records.keys())
    print(f"Found {len(unique_tickers)} unique tickers to query.")
    
    count_updated = 0
    count_checked = 0
    count_not_found = 0
    count_blocked = 0
    consecutive_blocks = 0
    
    for ticker in unique_tickers:
        count_checked += 1
        
        if consecutive_blocks >= 5:
            print(f"\n*** Too many consecutive blocks ({consecutive_blocks}). Saving and exiting. ***")
            break
        
        print(f"[{count_checked}/{len(unique_tickers)}] {ticker}...", end="", flush=True)
        
        profile = fetch_otc_profile(ticker)
        
        if profile == 'BLOCKED':
            count_blocked += 1
            consecutive_blocks += 1
            print(f" BLOCKED (consecutive: {consecutive_blocks})")
            time.sleep(8 + random.random() * 5)
            continue
        
        if profile == 'NOT_FOUND':
            count_not_found += 1
            consecutive_blocks = 0
            print(" 404 (not on OTC)")
            time.sleep(0.3 + random.random() * 0.3)
            continue
        
        consecutive_blocks = 0  # Reset on success
        
        if not profile or not isinstance(profile, dict):
            print(" Empty response.")
            time.sleep(1)
            continue
        
        # Extract officers
        extracted = extract_officers_data(profile)
        
        # Also extract company-level email/phone from profile
        profile_email = (profile.get('email') or '').strip()
        profile_phone = (profile.get('phone') or '').strip()
        
        # Update all records that share this ticker
        updated_this = False
        for r in ticker_to_records[ticker]:
            changed = False
            
            # Update CEO if currently Not Available
            if r.get('ceo') in ['Not Available', '', None] and extracted['ceo']:
                r['ceo'] = extracted['ceo']
                changed = True
            
            # Update CFO if currently Not Available
            if r.get('cfo') in ['Not Available', '', None] and extracted['cfo']:
                r['cfo'] = extracted['cfo']
                changed = True
            
            # Update Legal Counsel if currently Not Available
            if r.get('legalCounsel') in ['Not Available', '', None] and extracted['legalCounsel']:
                r['legalCounsel'] = extracted['legalCounsel']
                changed = True
            
            # Update email if currently Not Available
            if r.get('email') in ['Not Available', '', None] and profile_email and '@' in profile_email:
                r['email'] = profile_email
                changed = True
            
            # Update phone if currently Not Available  
            if r.get('phone') in ['Not Available', '', None] and profile_phone and len(profile_phone) >= 7:
                r['phone'] = profile_phone
                changed = True
            
            if changed:
                updated_this = True
        
        if updated_this:
            count_updated += 1
            officers_str = ', '.join(extracted['allOfficers'][:3]) or 'none'
            print(f" ✓ Updated! Officers: {officers_str}")
        else:
            name = profile.get('name', '?')
            n_officers = len(profile.get('officers') or [])
            print(f" OK ({name}, {n_officers} officers, no changes needed)")
        
        # Rate limiting: 1.2-2.2 seconds between requests
        time.sleep(1.2 + random.random() * 1.0)
        
        # Save progress every 25 tickers
        if count_checked % 25 == 0:
            with open(SEED_PATH, 'w', encoding='utf-8') as f:
                json.dump(records, f, indent=2)
            print(f"  --> Saved progress after {count_checked} tickers.")
    
    # Final save
    with open(SEED_PATH, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2)
    
    print(f"\n=== COMPLETE ===")
    print(f"Tickers checked: {count_checked}")
    print(f"Records updated: {count_updated}")
    print(f"Not found (404): {count_not_found}")
    print(f"Blocked: {count_blocked}")


if __name__ == "__main__":
    main()
