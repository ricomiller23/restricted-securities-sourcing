// 24-Hour SEC Market Freshness Resolver
// Calculates active SEC market trading days, determines 24h compliance, and certifies data freshness.

import fs from 'fs';
import path from 'path';

/**
 * Returns current Eastern Time date components.
 */
export const getEasternTime = () => {
  const now = new Date();
  const estFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = estFormatter.formatToParts(now);
  const map = {};
  parts.forEach(p => map[p.type] = p.value);

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);

  // Day of week in EST
  const estDateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const dayOfWeek = estDateObj.getUTCDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat

  return {
    year,
    month,
    day,
    hour,
    minute,
    dayOfWeek,
    isoDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
};

/**
 * Returns the most recent completed market trading day.
 * - If today is Sat (6) -> Friday
 * - If today is Sun (0) -> Friday
 * - If today is Mon (1) before 6:00 PM EST -> Friday
 * - If today is Mon-Fri after 6:00 PM EST -> Today (if index published) or Yesterday
 */
export const getActiveMarketDate = () => {
  const est = getEasternTime();
  const d = new Date(Date.UTC(est.year, est.month - 1, est.day));

  // If Saturday, move back 1 day to Friday
  if (est.dayOfWeek === 6) {
    d.setUTCDate(d.getUTCDate() - 1);
  }
  // If Sunday, move back 2 days to Friday
  else if (est.dayOfWeek === 0) {
    d.setUTCDate(d.getUTCDate() - 2);
  }
  // If Monday before 6:00 PM EST, previous trading day was Friday
  else if (est.dayOfWeek === 1 && est.hour < 18) {
    d.setUTCDate(d.getUTCDate() - 3);
  }
  // If Tue-Fri before 6:00 PM EST, previous trading day was Yesterday
  else if (est.dayOfWeek >= 2 && est.dayOfWeek <= 5 && est.hour < 18) {
    d.setUTCDate(d.getUTCDate() - 1);
  }
  // After 6:00 PM EST on a weekday, today's trading session has completed
  else {
    // Keep today's date
  }

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
};

/**
 * Validates whether a given date satisfies the strict 24-hour market freshness requirement.
 */
export const validateFreshness = (dateStr, cacheDir) => {
  const activeMarketDate = getActiveMarketDate();
  const est = getEasternTime();

  const isToday = dateStr === est.isoDate;
  const isActiveMarketDate = dateStr === activeMarketDate;

  let isCached = false;
  let filingCount = 0;
  let fileMtime = null;

  if (cacheDir) {
    const filePath = path.join(cacheDir, `${dateStr}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        isCached = true;
        filingCount = data.rawFilings ? data.rawFilings.length : 0;
        fileMtime = fs.statSync(filePath).mtime.toISOString();
      } catch (e) {}
    }
  }

  // Calculate age in hours from filing date to now
  const targetDateObj = new Date(dateStr);
  const nowObj = new Date(est.isoDate);
  const ageDays = Math.max(0, Math.round((nowObj - targetDateObj) / (1000 * 60 * 60 * 24)));

  // Certified fresh if it is today or the active market date (e.g. Friday over weekend)
  const isFresh = isToday || isActiveMarketDate || ageDays <= 1;

  return {
    targetDate: dateStr,
    activeMarketDate,
    isToday,
    isActiveMarketDate,
    isFresh,
    isCached,
    filingCount,
    fileMtime,
    ageDays,
    freshnessLabel: isFresh ? `🟢 Verified Fresh (< 24h market window)` : `⚠️ Stale (${ageDays} days old)`
  };
};
