# Manual Tester Guide: 0.010 Krakatoa Real-Time Active Monitor

## Test Scenarios
1. **Live Seismograph Simulation & RSAM:**
   - Verify waveform renders smoothly on canvas at 60 FPS.
   - Switch stations (KAKI Pasauran Post, SERT Sertung Island, RAKA Rakata). Verify gain changes and waveform characteristics update.
   - Check RSAM gauge dynamically calculates amplitude in real-time.

2. **Live USGS Earthquake Feed:**
   - Fetch real-time seismic events within 300km of Krakatoa (-6.102, 105.423).
   - Verify fallback mechanism handles network interruptions gracefully with realistic Sunda Strait data.
   - Test event filtering by minimum magnitude (M2.5+ / M4.0+).

3. **Exclusion Zone & Geohazard Radar:**
   - Check interactive map showing Anak Krakatau, Rakata, Sertung, Panjang, and 3.0 km red exclusion zone.
   - Verify coastal tide gauge stations (Marina Carita, Anyer, Kalianda) display live status and baseline water level.

4. **Aviation & VAAC Darwin Alerts:**
   - Verify FL500 plume altitude and VONA color code (RED / ORANGE).
   - Test wind vector indicator and flight corridor impact warnings.

5. **Audio Telemetry & Export:**
   - Toggle audio to hear simulated low-frequency volcanic rumbling/beeps.
   - Click "Export Volcanological Report" and verify file downloads to `~/Downloads`.

6. **Mobile Responsiveness:**
   - Inspect layout on 390px mobile viewport: tabs, cards, seismograph, and map wrap seamlessly.
