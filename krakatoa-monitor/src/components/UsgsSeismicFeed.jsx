import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, AlertCircle, ExternalLink, Filter, MapPin, Compass, ShieldAlert } from 'lucide-react';
import { FALLBACK_SUNDA_STRAIT_SEISMIC, KRAKATOA_CORE } from '../data/krakatoaData';

// Haversine distance formula to calculate distance in km from Krakatoa
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Calculate compass bearing from Krakatoa
function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(brng / 45) % 8];
}

export default function UsgsSeismicFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [minMagFilter, setMinMagFilter] = useState(2.5);

  const fetchUsgsData = async () => {
    setLoading(true);
    const kLat = KRAKATOA_CORE.latitude;
    const kLon = KRAKATOA_CORE.longitude;
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${kLat}&longitude=${kLon}&maxradiuskm=300&minmagnitude=${minMagFilter}&orderby=time&limit=25`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`USGS HTTP ${response.status}`);
      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const parsed = data.features.map(f => {
          const coords = f.geometry.coordinates; // [lon, lat, depth]
          const dist = calculateDistance(kLat, kLon, coords[1], coords[0]);
          const bearing = calculateBearing(kLat, kLon, coords[1], coords[0]);
          return {
            id: f.id,
            mag: f.properties.mag,
            place: f.properties.place,
            time: f.properties.time,
            url: f.properties.url,
            depth: coords[2],
            lat: coords[1],
            lon: coords[0],
            distFromKrakatoa: dist,
            bearingFromKrakatoa: bearing,
            isVolcanicProximal: dist <= 15
          };
        });
        setEvents(parsed);
        setIsUsingFallback(false);
        if (!selectedEvent && parsed.length > 0) setSelectedEvent(parsed[0]);
      } else {
        // Use fallback if no events returned in radius
        loadFallback();
      }
    } catch (err) {
      console.warn("USGS API fetch failed or blocked; activating cached Sunda Strait telemetry:", err);
      loadFallback();
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  const loadFallback = () => {
    const kLat = KRAKATOA_CORE.latitude;
    const kLon = KRAKATOA_CORE.longitude;
    const parsed = FALLBACK_SUNDA_STRAIT_SEISMIC.map(f => {
      const dist = calculateDistance(kLat, kLon, f.lat, f.lon);
      const bearing = calculateBearing(kLat, kLon, f.lat, f.lon);
      return {
        ...f,
        distFromKrakatoa: dist,
        bearingFromKrakatoa: bearing,
        isVolcanicProximal: dist <= 15
      };
    });
    setEvents(parsed);
    setIsUsingFallback(true);
    if (!selectedEvent && parsed.length > 0) setSelectedEvent(parsed[0]);
  };

  useEffect(() => {
    fetchUsgsData();
    const interval = setInterval(fetchUsgsData, 60000); // 60s auto refresh
    return () => clearInterval(interval);
  }, [minMagFilter]);

  return (
    <div className="glass-panel" style={{ padding: '20px', gridColumn: 'span 12' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio style={{ width: '20px', height: '20px', color: 'var(--seismic-cyan)' }} />
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
              USGS REAL-TIME SUNDA STRAIT SEISMIC SENSOR FEED
            </h2>
            {isUsingFallback ? (
              <span className="badge-warning" style={{ fontSize: '0.7rem' }}>
                LOCAL TELEMETRY CACHE
              </span>
            ) : (
              <span className="badge-cyan" style={{ fontSize: '0.7rem' }}>
                <span className="pulse-beacon" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }}></span>
                LIVE USGS API CONNECTED
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Radius: 300 km from Anak Krakatau Summit (-6.102° S, 105.423° E) • Min Magnitude: M{minMagFilter}+ • Last refreshed: {lastRefreshed || 'Fetching...'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Magnitude Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'rgba(15,23,42,0.6)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Filter style={{ width: '13px', height: '13px', color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Min:</span>
            {[2.5, 3.5, 4.5].map((m) => (
              <button
                key={m}
                onClick={() => setMinMagFilter(m)}
                style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: 'none',
                  fontSize: '0.72rem',
                  background: minMagFilter === m ? 'var(--seismic-cyan)' : 'transparent',
                  color: minMagFilter === m ? '#000' : 'var(--text-secondary)',
                  fontWeight: minMagFilter === m ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                M{m}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchUsgsData}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <RefreshCw style={{ width: '13px', height: '13px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'Polling...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Feed List + Selected Detail View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
        {/* Left List of Events */}
        <div style={{ gridColumn: 'span 7', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {events.length === 0 && !loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No earthquakes &gt; M{minMagFilter} recorded in the last 30 days within 300km of Krakatoa.
            </div>
          )}

          {events.map((evt) => {
            const isSelected = selectedEvent && selectedEvent.id === evt.id;
            const magColor = evt.mag >= 5.0 ? '#ef4444' : evt.mag >= 4.0 ? '#f97316' : '#06b6d4';
            const timeAgo = Math.round((Date.now() - evt.time) / (1000 * 60)); // minutes ago
            const timeStr = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(255, 69, 0, 0.12)' : 'rgba(15, 23, 42, 0.7)',
                  border: isSelected ? '1px solid var(--magma-primary)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Magnitude Pill */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: `${magColor}20`,
                    border: `1px solid ${magColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>MAG</span>
                    <span className="font-mono" style={{ fontSize: '1rem', fontWeight: '800', color: magColor }}>
                      {evt.mag ? evt.mag.toFixed(1) : 'N/A'}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                        {evt.place}
                      </span>
                      {evt.isVolcanicProximal && (
                        <span className="badge-danger" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          PROXIMAL VENT
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Depth: {evt.depth} km</span>
                      <span>•</span>
                      <span className="font-mono">Range: {evt.distFromKrakatoa} km {evt.bearingFromKrakatoa}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {timeStr}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--seismic-cyan)' }}>
                    {evt.depth < 10 ? 'Shallow Crust' : evt.depth < 50 ? 'Intermediate' : 'Deep Slab'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Event Inspector Details Panel */}
        <div style={{ gridColumn: 'span 5' }}>
          {selectedEvent ? (
            <div style={{
              background: 'rgba(10, 15, 28, 0.85)',
              border: '1px solid rgba(255, 87, 34, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: 'var(--magma-glow)' }} />
                  <span className="font-display" style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                    SEISMIC EVENT DOSSIER
                  </span>
                </div>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ID: {selectedEvent.id}
                </span>
              </div>

              {/* Magnitude & Depth Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(18, 25, 45, 0.6)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAGNITUDE</div>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--magma-bright)' }}>
                    M{selectedEvent.mag.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Moment Magnitude (Mw)</div>
                </div>

                <div style={{ background: 'rgba(18, 25, 45, 0.6)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>HYPOCENTER DEPTH</div>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--seismic-cyan)' }}>
                    {selectedEvent.depth} km
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Focal Horizon</div>
                </div>
              </div>

              {/* Proximity to Anak Krakatau */}
              <div style={{ background: 'rgba(18, 25, 45, 0.6)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CALDERA PROXIMITY VECTOR</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: '700', color: selectedEvent.isVolcanicProximal ? '#ef4444' : '#fff' }}>
                    {selectedEvent.distFromKrakatoa} km ({selectedEvent.bearingFromKrakatoa})
                  </span>
                  {selectedEvent.isVolcanicProximal ? (
                    <span className="badge-danger">MAGMATIC PROXIMAL</span>
                  ) : (
                    <span className="badge-cyan">REGIONAL TECTONIC</span>
                  )}
                </div>
              </div>

              {/* Geographic Coordinates */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Location:</strong> {selectedEvent.place}</div>
                <div><strong>Coordinates:</strong> {selectedEvent.lat.toFixed(4)}° N, {selectedEvent.lon.toFixed(4)}° E</div>
                <div><strong>Recorded Timestamp:</strong> {new Date(selectedEvent.time).toUTCString()}</div>
              </div>

              {/* Official USGS Link if available */}
              {selectedEvent.url && (
                <a
                  href={selectedEvent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.75rem', marginTop: '4px' }}
                >
                  <span>View Official USGS Event Page</span>
                  <ExternalLink style={{ width: '12px', height: '12px' }} />
                </a>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select an earthquake event from the feed to inspect hypocenter telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
