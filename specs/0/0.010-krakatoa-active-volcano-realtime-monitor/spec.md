# Feature Spec: 0.010 Krakatoa Volcano Real-Time Active Monitor

## 1. Problem Statement
The Krakatoa volcanic complex (specifically Anak Krakatau in the Sunda Strait, Indonesia, coordinates -6.102° S, 105.423° E) is currently experiencing active eruptive activity, continuous seismic tremor, and high alert status (Level III - Siaga) with ash plumes up to FL500 and exclusion zone enforcement. 
Users need a mission-control grade, real-time volcanological monitoring dashboard providing live seismic telemetry, real-time USGS earthquake detection, aviation VONA/VAAC plume tracking, tsunami buoy & flank collapse monitoring, thermal satellite analysis, and emergency protocol reporting.

## 2. Requirements & Capabilities
1. **Real-Time Seismograph (60Hz Canvas):**
   - High-fidelity live analog seismograph waveform tracing at 60 FPS simulating active 70mm continuous volcanic tremor.
   - Real-time RSAM (Real-time Seismic Amplitude Measurement) and frequency spectrum analysis.
   - Live station toggle (KAKI Pasauran Observatory Post, Pulau Sertung, Pulau Rakata).

2. **Live USGS Seismic Feed Integration:**
   - Real-time client-side fetch from USGS Earthquake Hazards API (`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=-6.102&longitude=105.423&maxradiuskm=300&minmagnitude=2.5`).
   - Visual epicenter radar and tremor timeline with magnitude, depth, and distance from Anak Krakatau caldera.

3. **Aviation Hazard & VAAC Darwin VONA Monitor:**
   - Current ash plume dispersion modeling (FL500 / 50,000 ft).
   - Volcano Observatory Notice for Aviation (VONA) alert status (RED / ORANGE).
   - Prevailing wind vector and atmospheric drift calculation towards western/southern corridors.

4. **Geohazard & Flank Stability / Tsunami Radar:**
   - 2018 Flank Collapse & Tsunami recurrence monitoring.
   - Marine exclusion zone (3.0 km / 5.0 km radius) live alert perimeter.
   - Coastal tide gauge telemetry (Anyer, Marina Carita, Ciwandan, Kota Agung).

5. **Thermal Anomaly & Satellite Remote Sensing:**
   - NASA FIRMS / MODIS thermal radiative power (MW) tracking.
   - Active vent lava fountaining and incandescence metrics.

6. **Interactive Mission Control UI:**
   - Dark volcanic aesthetic (`#050811`), magma neon accents (`#f97316`, `#ef4444`, `#06b6d4`), responsive across desktop and mobile viewports.
   - Sound FX synthesis for seismic alerts (Web Audio API).
   - One-click Emergency Volcanological Dossier generation & export to `~/Downloads`.

## 3. Success Metrics
- Local build cleanly passes `npm run build`.
- Deployed live on Vercel production.
- Verified in browser with full responsiveness and zero console errors.
