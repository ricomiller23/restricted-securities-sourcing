// Telemetry & Observability Manager
// Tracks startup lifecycle milestones, route latency distributions, system memory, and cache diagnostics.

import os from 'os';

class TelemetryManager {
  constructor() {
    this.processStartTime = performance.now();
    this.startupMilestones = {
      processStart: new Date().toISOString(),
      serverBindMs: null,
      tickerLoadMs: null,
      indexHydrationMs: null,
      startupCatchupMs: null,
      totalWarmupMs: null
    };

    // Route Latency Metrics Map: key -> { count, totalMs, minMs, maxMs, avgMs, last50 }
    this.routeMetrics = new Map();
    this.totalRequests = 0;
    this.totalRequestTimeMs = 0;
  }

  recordStartupMilestone(name, durationMs) {
    this.startupMilestones[name] = parseFloat(durationMs.toFixed(2));
    if (this.startupMilestones.serverBindMs && this.startupMilestones.indexHydrationMs && !this.startupMilestones.totalWarmupMs) {
      this.startupMilestones.totalWarmupMs = parseFloat((performance.now() - this.processStartTime).toFixed(2));
    }
  }

  recordRequest(method, routePath, durationMs, statusCode) {
    this.totalRequests++;
    this.totalRequestTimeMs += durationMs;

    // Normalize path (strip query strings & IDs)
    const cleanRoute = routePath.split('?')[0].replace(/\/api\/filings\/[^\/]+/, '/api/filings/:id');
    const key = `${method.toUpperCase()} ${cleanRoute}`;

    let stat = this.routeMetrics.get(key);
    if (!stat) {
      stat = {
        method: method.toUpperCase(),
        route: cleanRoute,
        count: 0,
        statusCodes: {},
        totalMs: 0,
        minMs: durationMs,
        maxMs: durationMs,
        avgMs: durationMs,
        recentLatency: []
      };
      this.routeMetrics.set(key, stat);
    }

    stat.count++;
    stat.statusCodes[statusCode] = (stat.statusCodes[statusCode] || 0) + 1;
    stat.totalMs += durationMs;
    stat.minMs = Math.min(stat.minMs, durationMs);
    stat.maxMs = Math.max(stat.maxMs, durationMs);
    stat.avgMs = parseFloat((stat.totalMs / stat.count).toFixed(2));

    stat.recentLatency.push(parseFloat(durationMs.toFixed(2)));
    if (stat.recentLatency.length > 50) {
      stat.recentLatency.shift();
    }
  }

  getMetrics(extraData = {}) {
    const memory = process.memoryUsage();
    const routeStats = Array.from(this.routeMetrics.values()).map(r => ({
      method: r.method,
      route: r.route,
      count: r.count,
      avgMs: r.avgMs,
      minMs: parseFloat(r.minMs.toFixed(2)),
      maxMs: parseFloat(r.maxMs.toFixed(2)),
      recentP95Ms: this.calculateP95(r.recentLatency),
      statusCodes: r.statusCodes
    }));

    // Sort by count descending
    routeStats.sort((a, b) => b.count - a.count);

    return {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuCount: os.cpus().length,
        memoryUsageMb: {
          rss: parseFloat((memory.rss / 1024 / 1024).toFixed(2)),
          heapUsed: parseFloat((memory.heapUsed / 1024 / 1024).toFixed(2)),
          heapTotal: parseFloat((memory.heapTotal / 1024 / 1024).toFixed(2)),
          external: parseFloat((memory.external / 1024 / 1024).toFixed(2))
        }
      },
      startupTimings: this.startupMilestones,
      requestsOverview: {
        totalRequests: this.totalRequests,
        overallAvgLatencyMs: this.totalRequests > 0 ? parseFloat((this.totalRequestTimeMs / this.totalRequests).toFixed(2)) : 0
      },
      routes: routeStats,
      cacheStats: extraData.cacheStats || {}
    };
  }

  calculateP95(values) {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[Math.min(index, sorted.length - 1)];
  }
}

export const telemetry = new TelemetryManager();
