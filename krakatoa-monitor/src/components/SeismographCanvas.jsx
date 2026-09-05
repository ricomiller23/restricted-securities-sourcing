import React, { useRef, useEffect, useState } from 'react';
import { Activity, Sliders, Play, Pause, Zap, Disc, Volume2, ShieldAlert, Layers } from 'lucide-react';
import { OBSERVATION_STATIONS, KRAKATOA_CORE } from '../data/krakatoaData';

export default function SeismographCanvas({ isAudioActive }) {
  const canvasRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(OBSERVATION_STATIONS[0]);
  const [gain, setGain] = useState(1);
  const [sweepSpeed, setSweepSpeed] = useState(1.5);
  const [displayMode, setDisplayMode] = useState('drum'); // 'drum' or 'oscilloscope'
  const [isPaused, setIsPaused] = useState(false);
  const [currentRsam, setCurrentRsam] = useState(4890);
  const [recentEvents, setRecentEvents] = useState([
    { id: 1, time: '06:14:12 WIB', type: 'Continuous Tremor', amp: '70 mm (Overscale)', duration: 'Active' },
    { id: 2, time: '06:11:04 WIB', type: 'Eruptive Explosion', amp: '58 mm', duration: '142s' },
    { id: 3, time: '06:05:40 WIB', type: 'Deep Volcanic (VA)', amp: '34 mm', duration: '38s' },
    { id: 4, time: '05:58:19 WIB', type: 'Shallow Volcanic (VB)', amp: '46 mm', duration: '62s' }
  ]);

  // Audio synthesis reference
  const audioCtxRef = useRef(null);

  // Buffer state for waveform rendering
  const dataPointsRef = useRef([]);
  const phaseRef = useRef(0);
  const blastImpulseRef = useRef(0);

  // Initialize data buffer
  useEffect(() => {
    const initialPoints = [];
    for (let i = 0; i < 600; i++) {
      initialPoints.push(0);
    }
    dataPointsRef.current = initialPoints;
  }, []);

  // Web Audio trigger when blast happens or audio is enabled
  const triggerAudioClick = (freq, duration) => {
    if (!isAudioActive) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // 60FPS Canvas Animation Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!isPaused) {
        // Physical volcanic tremor simulation parameters:
        // Base tremor: 1.2Hz - 2.8Hz harmonic continuous vibration
        phaseRef.current += 0.08 * sweepSpeed;
        const p = phaseRef.current;

        // Station distance attenuation modifier
        // Sertung (3.8km) is much more violent than Pasauran (42.5km)
        const stationFactor = selectedStation.id === 'SERT' ? 1.4 : selectedStation.id === 'RAKA' ? 1.2 : 1.0;

        // Harmonic continuous tremor math
        const harmonic1 = Math.sin(p * 2.4) * 0.45;
        const harmonic2 = Math.sin(p * 5.1 + 0.3) * 0.28;
        const harmonic3 = Math.cos(p * 8.7 + 1.2) * 0.18;
        const turbulence = (Math.random() - 0.5) * 0.35;

        // Decaying blast impulse if triggered
        let impulse = 0;
        if (blastImpulseRef.current > 0.01) {
          impulse = Math.sin(p * 14.0) * blastImpulseRef.current;
          blastImpulseRef.current *= 0.982; // exponential decay
        }

        // Compute instantaneous seismic voltage amplitude (70mm overscale simulation)
        const sample = (harmonic1 + harmonic2 + harmonic3 + turbulence + impulse) * gain * stationFactor;

        dataPointsRef.current.push(sample);
        if (dataPointsRef.current.length > 600) {
          dataPointsRef.current.shift();
        }

        // Dynamic RSAM Calculation based on window average
        const rsamCalc = Math.round(
          3800 + Math.abs(sample) * 1400 * gain + (blastImpulseRef.current > 0 ? 3200 : 0)
        );
        setCurrentRsam(rsamCalc);
      }

      // Draw Seismogram on Canvas
      const width = canvas.width;
      const height = canvas.height;

      // Background obsidian fill
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, width, height);

      // Draw analog grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      const gridSpacingX = 40;
      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (displayMode === 'drum') {
        // Multi-line Analog Drum Seismograph
        const lines = 6;
        const lineSpacing = height / (lines + 1);

        // Draw horizontal channel guides
        for (let l = 1; l <= lines; l++) {
          const cy = l * lineSpacing;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(width, cy);
          ctx.stroke();

          // Channel timestamp labels
          ctx.font = '9px JetBrains Mono';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.fillText(`CH-0${l} [T-${(lines - l) * 10}m]`, 8, cy - 6);
        }

        // Active drum trace on the bottom active channel
        const activeY = lines * lineSpacing;
        const pts = dataPointsRef.current;
        const stepX = width / pts.length;

        // Draw overscale red clipping boundaries
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, activeY - 45);
        ctx.lineTo(width, activeY - 45);
        ctx.moveTo(0, activeY + 45);
        ctx.lineTo(width, activeY + 45);
        ctx.stroke();
        ctx.setLineDash([]);

        // Continuous Tremor Needle Trace
        ctx.beginPath();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#ff4500';

        for (let i = 0; i < pts.length; i++) {
          const x = i * stepX;
          const y = activeY + pts[i] * 38;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glowing needle head indicator at the leading edge
        const lastX = (pts.length - 1) * stepX;
        const lastY = activeY + pts[pts.length - 1] * 38;

        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

      } else {
        // High-Speed Oscilloscope Waveform Mode
        const centerY = height / 2;
        const pts = dataPointsRef.current;
        const stepX = width / pts.length;

        // Center zero axis
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Waveform
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = '#06b6d4';

        for (let i = 0; i < pts.length; i++) {
          const x = i * stepX;
          const y = centerY + pts[i] * 65;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Gradient glow under waveform
        ctx.lineTo(width, centerY);
        ctx.lineTo(0, centerY);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, centerY - 60, 0, centerY + 60);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedStation, gain, sweepSpeed, displayMode, isPaused]);

  // Inject Simulated Volcanic Blast
  const handleTriggerBlast = () => {
    blastImpulseRef.current = 2.8;
    triggerAudioClick(85, 1.8);
    
    const now = new Date();
    const wibStr = new Date(now.getTime() + 7 * 3600000).toUTCString().slice(17, 25) + ' WIB';
    
    setRecentEvents(prev => [
      {
        id: Date.now(),
        time: wibStr,
        type: 'Simulated Strombolian Burst',
        amp: '70 mm (MAX OVER-SCALE)',
        duration: '60s'
      },
      ...prev.slice(0, 5)
    ]);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', gridColumn: 'span 12' }}>
      {/* Header & Station Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '20px', height: '20px', color: 'var(--magma-glow)' }} />
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
              60Hz REAL-TIME ANALOG VOLCANIC SEISMOGRAPH
            </h2>
            <span className="badge-danger" style={{ fontSize: '0.7rem' }}>
              <span className="pulse-beacon" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
              CONTINUOUS 70mm TREMOR ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Station: <strong>{selectedStation.name}</strong> • Range: {selectedStation.distanceKm} km {selectedStation.bearing} • Elevation: {selectedStation.elevationM}m • Sensors: {selectedStation.sensors.join(', ')}
          </p>
        </div>

        {/* Station Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {OBSERVATION_STATIONS.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st)}
              className={`btn-secondary ${selectedStation.id === st.id ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: selectedStation.id === st.id ? 'var(--magma-glow)' : 'var(--text-muted)'
              }}></span>
              <span>{st.id} • {st.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Seismogram Display Screen */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 87, 34, 0.25)',
        boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.9)'
      }} className="scanline">
        <canvas
          ref={canvasRef}
          width={1280}
          height={320}
          style={{ width: '100%', height: '320px', display: 'block' }}
        />

        {/* Real-time Overlay HUD */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          display: 'flex',
          gap: '12px',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(6, 8, 15, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>LIVE RSAM (AMPLITUDE)</div>
            <div className="font-mono" style={{ fontSize: '1rem', fontWeight: '700', color: currentRsam > 4500 ? 'var(--alert-red)' : 'var(--magma-bright)' }}>
              {currentRsam} <span style={{ fontSize: '0.7rem' }}>cts</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(6, 8, 15, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DOMINANT BAND</div>
            <div className="font-mono" style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--seismic-cyan)' }}>
              1.8 - 2.6 Hz
            </div>
          </div>
        </div>

        {/* Clipping warning label */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}>
          <span style={{ color: 'var(--alert-red)', fontWeight: '600' }}>[OVER-SCALE THRESHOLD 70mm]</span>
          <span>•</span>
          <span>Sampling: 100 sps</span>
          <span>•</span>
          <span>Buffer: 600 frames</span>
        </div>
      </div>

      {/* Control Bar & Inject Blast Tool */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Display Mode Toggle */}
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setDisplayMode('drum')}
              style={{
                padding: '5px 10px',
                border: 'none',
                borderRadius: '4px',
                background: displayMode === 'drum' ? 'var(--magma-primary)' : 'transparent',
                color: '#fff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Analog Drum
            </button>
            <button
              onClick={() => setDisplayMode('oscilloscope')}
              style={{
                padding: '5px 10px',
                border: 'none',
                borderRadius: '4px',
                background: displayMode === 'oscilloscope' ? 'var(--seismic-cyan)' : 'transparent',
                color: displayMode === 'oscilloscope' ? '#000' : '#fff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Oscilloscope
            </button>
          </div>

          {/* Gain Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Gain:</span>
            {[0.5, 1, 2, 5].map((g) => (
              <button
                key={g}
                onClick={() => setGain(g)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  border: gain === g ? '1px solid var(--magma-glow)' : '1px solid rgba(255,255,255,0.08)',
                  background: gain === g ? 'rgba(255,69,0,0.2)' : 'rgba(15,23,42,0.6)',
                  color: gain === g ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {g}x
              </button>
            ))}
          </div>

          {/* Sweep Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Speed:</span>
            {[
              { label: 'Slow', val: 0.8 },
              { label: '1x', val: 1.5 },
              { label: 'Fast', val: 3.0 }
            ].map((sp) => (
              <button
                key={sp.label}
                onClick={() => setSweepSpeed(sp.val)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  border: sweepSpeed === sp.val ? '1px solid var(--seismic-cyan)' : '1px solid rgba(255,255,255,0.08)',
                  background: sweepSpeed === sp.val ? 'rgba(6,182,212,0.2)' : 'rgba(15,23,42,0.6)',
                  color: sweepSpeed === sp.val ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            {isPaused ? <Play style={{ width: '13px', height: '13px' }} /> : <Pause style={{ width: '13px', height: '13px' }} />}
            <span>{isPaused ? 'Resume Sweep' : 'Freeze Trace'}</span>
          </button>
        </div>

        {/* Test Injection Action */}
        <button
          onClick={handleTriggerBlast}
          className="btn-secondary"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            padding: '6px 14px'
          }}
        >
          <Zap style={{ width: '14px', height: '14px', color: '#ef4444' }} />
          <span>INJECT STROMBOLIAN BURST</span>
        </button>
      </div>

      {/* Real-time Event Ticker */}
      <div style={{
        marginTop: '16px',
        background: 'rgba(10, 14, 25, 0.6)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>RECENT SEISMIC BURST CATALOG (LAST 24 HOURS)</span>
          <span style={{ color: 'var(--text-muted)' }}>PASARUAN PGA TELEMETRY ARCHIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {recentEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                background: 'rgba(18, 24, 40, 0.7)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                borderLeft: evt.amp.includes('Overscale') || evt.amp.includes('MAX') ? '3px solid #ef4444' : '3px solid #f97316',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>{evt.type}</span>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{evt.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--magma-glow)' }}>Amplitude: {evt.amp}</span>
                <span style={{ color: 'var(--seismic-cyan)' }}>Dur: {evt.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
