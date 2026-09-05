import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, MapPin, Zap, Navigation, Waves } from 'lucide-react';
import { KRAKATOA_CORE } from '../data/krakatoaData';

export default function StatusBanner() {
  const [testLocation, setTestLocation] = useState('Sebesi');
  const [calculatedDistance, setCalculatedDistance] = useState(18.2);

  const locations = [
    { name: 'Pulau Sebesi (Inhabited)', lat: -5.952, lon: 105.485, dist: 18.2, status: 'CAUTION (Ashfall Zone)' },
    { name: 'Marina Carita Beach (Banten)', lat: -6.299, lon: 105.839, dist: 46.1, status: 'CLEAR (Tide Gauge Active)' },
    { name: 'Anyer Port (Banten)', lat: -6.046, lon: 105.918, dist: 43.8, status: 'CLEAR (Monitoring)' },
    { name: 'Kalianda Coast (Lampung)', lat: -5.733, lon: 105.589, dist: 52.0, status: 'CLEAR (Monitoring)' },
    { name: 'Vessel in Exclusion Zone', lat: -6.110, lon: 105.435, dist: 2.1, status: 'PROHIBITED DANGER ZONE (<3km)' }
  ];

  const handleSelectLocation = (loc) => {
    setTestLocation(loc.name);
    setCalculatedDistance(loc.dist);
  };

  const isWithinExclusion = calculatedDistance <= 3.0;
  const isWithinMaritime = calculatedDistance <= 5.0;

  return (
    <div style={{
      margin: '20px 24px 0 24px',
      background: 'linear-gradient(90deg, rgba(185, 28, 28, 0.25) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(245, 158, 11, 0.15) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="pulse-beacon">
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="font-display" style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>
                ACTIVE ERUPTIVE PHASE • CONTINUOUS SEISMIC TREMOR
              </span>
              <span className="badge-danger">
                70 mm OVER-SCALE AMPLITUDE
              </span>
              <span className="badge-warning">
                3.0 KM EXCLUSION RADIUS ENFORCED
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Continuous Strombolian lava fountaining (*air mancur lava*) active. Acoustic booming and rumbling reverberating across Sunda Strait. Public, tourists, and mariners are strictly prohibited from approaching within 3 km of the active crater and 5 km by sea.
            </p>
          </div>
        </div>

        {/* Quick Hazard Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RSAM SEISMIC ENERGY</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--magma-bright)' }}>
              {KRAKATOA_CORE.seismicity.rsamValue} <span style={{ fontSize: '0.75rem', color: 'var(--alert-red)' }}>CRITICAL</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>VENT THERMAL FLUX</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--seismic-cyan)' }}>
              {KRAKATOA_CORE.thermal.radiantFluxMW} MW <span style={{ fontSize: '0.75rem', color: 'var(--alert-amber)' }}>1,024°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusion Zone Distance Screener Bar */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation style={{ width: '15px', height: '15px', color: 'var(--seismic-cyan)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Distance from Crater:</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {locations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleSelectLocation(loc)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  border: testLocation === loc.name ? '1px solid var(--magma-glow)' : '1px solid rgba(255,255,255,0.08)',
                  background: testLocation === loc.name ? 'rgba(255, 69, 0, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: testLocation === loc.name ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {loc.name.split(' ')[0]} ({loc.dist}km)
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="font-mono" style={{ color: '#fff' }}>
            Selected: <strong>{testLocation}</strong> • {calculatedDistance} km
          </span>
          {isWithinExclusion ? (
            <span className="badge-danger" style={{ animation: 'pulse 1s infinite' }}>
              <AlertTriangle style={{ width: '12px', height: '12px' }} />
              DANGER: INSIDE 3KM EXCLUSION ZONE
            </span>
          ) : isWithinMaritime ? (
            <span className="badge-warning">
              <Waves style={{ width: '12px', height: '12px' }} />
              MARITIME BUFFER ZONE (&lt;5KM)
            </span>
          ) : (
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <ShieldCheck style={{ width: '14px', height: '14px' }} />
              OUTSIDE EXCLUSION RADIUS
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
