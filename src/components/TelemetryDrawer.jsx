import React, { useState, useEffect } from 'react';

export default function TelemetryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastPing, setLastPing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    const t0 = performance.now();
    try {
      setLoading(true);
      const [resMetrics, resSync] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/sync/status')
      ]);

      const roundTrip = Math.round(performance.now() - t0);
      setLastPing(roundTrip);

      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setMetrics(data);
      }
      if (resSync.ok) {
        const syncData = await resSync.json();
        setSyncStatus(syncData);
      }
    } catch (err) {
      console.error("Failed to load telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Telemetry Badge in Header */}
      <button
        className="system-status"
        onClick={() => {
          fetchTelemetry();
          setIsOpen(true);
        }}
        title="View System Timing & Observability Metrics"
        style={{
          cursor: 'pointer',
          border: '1px solid rgba(0, 230, 118, 0.4)',
          background: 'rgba(0, 230, 118, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          color: '#e0e0e0',
          fontSize: '12px',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease'
        }}
      >
        <span
          className="status-dot"
          style={{
            backgroundColor: '#00e676',
            boxShadow: '0 0 8px #00e676',
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%'
          }}
        />
        <span style={{ fontWeight: 600, color: '#00e676' }}>
          ⚡ {lastPing !== null ? `${lastPing}ms` : 'Metrics'}
        </span>
      </button>

      {/* Telemetry Drawer Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: '560px',
              maxWidth: '92vw',
              height: '100%',
              backgroundColor: '#12141a',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.5)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#161922'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>⚡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    System Telemetry & Observability
                  </h3>
                  <div style={{ fontSize: '11px', color: '#90a4ae' }}>
                    Live Request Timings, Memory & Pipeline Telemetry
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={fetchTelemetry}
                  disabled={loading}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '6px',
                    color: '#e0e0e0',
                    padding: '5px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#90a4ae',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Quick KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#90a4ae', textTransform: 'uppercase' }}>
                    API Round-Trip
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#00e676', marginTop: '4px' }}>
                    {lastPing !== null ? `${lastPing}ms` : '--'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#90a4ae', textTransform: 'uppercase' }}>
                    Indexed Filings
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#00b0ff', marginTop: '4px' }}>
                    {metrics?.cacheStats?.totalFilingsIndexed?.toLocaleString() || '--'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#90a4ae', textTransform: 'uppercase' }}>
                    Heap Memory
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ffd54f', marginTop: '4px' }}>
                    {metrics?.system?.memoryUsageMb?.heapUsed ? `${metrics.system.memoryUsageMb.heapUsed} MB` : '--'}
                  </div>
                </div>
              </div>

              {/* 2. Startup Lifecycle Breakdown */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#b0bec5', textTransform: 'uppercase' }}>
                  🚀 Startup Lifecycle Milestones
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cfd8dc' }}>
                    <span>Express Port Bind (Port 5005):</span>
                    <strong style={{ color: '#00e676' }}>{metrics?.startupTimings?.serverBindMs ?? '--'} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cfd8dc' }}>
                    <span>Compact Index Hydration:</span>
                    <strong style={{ color: '#00b0ff' }}>{metrics?.startupTimings?.indexHydrationMs ?? '--'} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cfd8dc' }}>
                    <span>Company Tickers Load:</span>
                    <strong style={{ color: '#ffd54f' }}>{metrics?.startupTimings?.tickerLoadMs ?? 'Cached'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cfd8dc', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <span>Total Startup Warmup Time:</span>
                    <strong style={{ color: '#7c4dff' }}>{metrics?.startupTimings?.totalWarmupMs ?? '--'} ms</strong>
                  </div>
                </div>
              </div>

              {/* 3. API Route Performance Histogram */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#b0bec5', textTransform: 'uppercase' }}>
                    📊 API Route Performance ({metrics?.requestsOverview?.totalRequests || 0} calls)
                  </h4>
                  <span style={{ fontSize: '11px', color: '#78909c' }}>
                    Avg: {metrics?.requestsOverview?.overallAvgLatencyMs || 0}ms
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#78909c', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '6px 4px' }}>Route</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>Calls</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>Avg</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>P95</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics?.routes && metrics.routes.length > 0 ? (
                        metrics.routes.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#cfd8dc' }}>
                            <td style={{ padding: '6px 4px', fontFamily: 'monospace', fontSize: '11px' }}>
                              <span style={{ color: r.method === 'GET' ? '#00e676' : '#ffd54f', marginRight: '4px' }}>
                                {r.method}
                              </span>
                              {r.route}
                            </td>
                            <td style={{ padding: '6px 4px', textAlign: 'right', color: '#90a4ae' }}>{r.count}</td>
                            <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, color: r.avgMs < 50 ? '#00e676' : '#ffab40' }}>
                              {r.avgMs}ms
                            </td>
                            <td style={{ padding: '6px 4px', textAlign: 'right', color: '#00b0ff' }}>
                              {r.recentP95Ms}ms
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ padding: '12px 4px', textAlign: 'center', color: '#78909c' }}>
                            Collecting live route traffic...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Morning Update Engine Telemetry */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#b0bec5', textTransform: 'uppercase' }}>
                  🌅 Morning Pipeline Telemetry
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#cfd8dc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pipeline Status:</span>
                    <strong style={{ color: syncStatus?.isSyncRunning ? '#7c4dff' : '#00e676' }}>
                      {syncStatus?.isSyncRunning ? '⚡ Running Sync...' : 'Idle (Scheduled 8:00 AM EST)'}
                    </strong>
                  </div>
                  {syncStatus?.lastSync && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last Completed Sync:</span>
                        <span>{new Date(syncStatus.lastSync.completedAt || syncStatus.lastSync.startedAt).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Duration:</span>
                        <strong style={{ color: '#00b0ff' }}>{syncStatus.lastSync.totalDurationMs || '--'} ms</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Filings Ingested:</span>
                        <span>{syncStatus.lastSync.totalFilingsIngested || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
