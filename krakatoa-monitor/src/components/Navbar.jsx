import React, { useState, useEffect } from 'react';
import { Flame, Activity, ShieldAlert, Volume2, VolumeX, Download, Clock, Radio, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KRAKATOA_CORE } from '../data/krakatoaData';

export default function Navbar({ isAudioActive, toggleAudio, onExportReport, activeTab, setActiveTab }) {
  const [utcTime, setUtcTime] = useState('');
  const [wibTime, setWibTime] = useState('');

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      
      // WIB is UTC+7
      const wibDate = new Date(now.getTime() + 7 * 3600000);
      setWibTime(wibDate.toUTCString().slice(17, 25) + ' WIB (UTC+7)');
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportClick = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.2 },
      colors: ['#ff4500', '#f97316', '#ef4444', '#06b6d4']
    });
    onExportReport();
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--bg-card-border)',
      background: 'rgba(7, 10, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1720px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand & Volcano ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff4500 0%, #b91c1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 69, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Flame className="lava-flame" style={{ width: '24px', height: '24px', color: '#fff' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
                KRAKATOA
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--magma-glow)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ACTIVE MONITOR
              </span>
              <span className="badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} className="pulse-beacon"></span>
                LEVEL III • SIAGA
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span className="font-mono">ANAK KRAKATAU (-6.102° S, 105.423° E)</span>
              <span>•</span>
              <span>SUNDA STRAIT, INDONESIA</span>
              <span>•</span>
              <span style={{ color: 'var(--alert-amber)' }}>PVMBG / MAGMA INDONESIA</span>
            </div>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Dual Clocks */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.75rem'
          }}>
            <Clock style={{ width: '14px', height: '14px', color: 'var(--seismic-cyan)' }} />
            <span className="font-mono" style={{ color: '#fff' }}>{utcTime}</span>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <span className="font-mono" style={{ color: 'var(--magma-glow)' }}>{wibTime}</span>
          </div>

          {/* Quick Metrics */}
          <div className="badge-warning" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
            <Activity style={{ width: '13px', height: '13px' }} />
            <span>TREMOR: 70mm (OVERSCALE)</span>
          </div>

          <div className="badge-cyan" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
            <Compass style={{ width: '13px', height: '13px' }} />
            <span>VAAC: FL500</span>
          </div>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioActive ? "Mute Volcanic Audio Telemetry" : "Enable Volcanic Audio Telemetry"}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
          >
            {isAudioActive ? (
              <>
                <Volume2 style={{ width: '15px', height: '15px', color: 'var(--magma-glow)' }} />
                <span>SONAR ON</span>
              </>
            ) : (
              <>
                <VolumeX style={{ width: '15px', height: '15px', color: 'var(--text-muted)' }} />
                <span>SONAR OFF</span>
              </>
            )}
          </button>

          {/* Export Report Action */}
          <button
            onClick={handleExportClick}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Download style={{ width: '15px', height: '15px' }} />
            <span>EXPORT DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div style={{
        maxWidth: '1720px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {[
          { id: 'seismic', label: '60Hz Analog Seismograph', icon: Activity },
          { id: 'usgs', label: 'Live USGS Sunda Strait Feed', icon: Radio },
          { id: 'radar', label: 'Caldera Radar & Tsunami Buoys', icon: ShieldAlert },
          { id: 'vaac', label: 'VAAC Darwin Plume (FL500)', icon: Compass },
          { id: 'thermal', label: 'NASA Thermal & Vent Cam', icon: Flame },
          { id: 'history', label: '1883/2018 Historical Analysis', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--magma-primary)' : '2px solid transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon style={{ width: '15px', height: '15px', color: isActive ? 'var(--magma-glow)' : 'inherit' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
