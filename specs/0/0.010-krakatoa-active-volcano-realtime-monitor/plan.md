# Implementation Plan: 0.010 Krakatoa Real-Time Active Monitor

## Architecture & Technology Stack
- **Framework:** React 18 + Vite (fast HMR, lightweight bundle).
- **Icons:** `lucide-react`.
- **Effects:** `canvas-confetti` for completed export actions.
- **Styling:** Custom CSS design system with CSS custom properties, glassmorphism, responsive CSS grid/flexbox, high-contrast dark volcanic palette.
- **Real-Time Data Layer:**
  - Live USGS Earthquake API client fetch with auto-refresh every 60 seconds and manual refresh.
  - 60 FPS HTML5 Canvas seismograph engine with continuous tremor synthesis, variable amplitude spikes for volcanic earthquakes (VA/VB), and configurable gain.
  - Multi-station selector (Pasauran Post Banten, Sertung Island, Rakata Island).
  - Web Audio API acoustic rumble & alert tone generator.
- **Reporting:** Client-side automated Markdown/Text volcanological bulletin compilation with instant download to `~/Downloads/`.

## Phased Implementation
1. **Scaffolding:** `krakatoa-monitor` Vite app, install dependencies.
2. **Data & State Engine:** `src/data/krakatoaData.js` with comprehensive metadata, coordinates, station specs, alert thresholds, and USGS endpoints.
3. **Components:**
   - `Header / Navbar`: Live Siaga Level III badge, real-time clock (UTC and WIB Western Indonesia Time), alert status, Audio FX toggle, Export Dossier button.
   - `Hero Alert & Exclusion Zone Banner`: Real-time status banner with 3.0 km exclusion warning, lava fountaining advisory.
   - `SeismographCanvas`: Canvas-based real-time 60fps seismogram with adjustable gain, speed, station switching, RSAM meter, tremor event log.
   - `UsgsSeismicFeed`: Sunda Strait live earthquake feed with distance calculation, magnitude styling, interactive event drilldown.
   - `GeohazardRadar`: Interactive SVG/Canvas map of Sunda Strait showing Anak Krakatau caldera, Sertung, Rakata, Panjang, 3km exclusion ring, coastal tide gauge status (Anyer, Carita, Kalianda), and flank displacement sensor data.
   - `AviationVaac`: VAAC Darwin flight level tracking (FL500), wind direction, ash dispersion radar, and color-coded VONA notices.
   - `ThermalSatellite`: NASA FIRMS thermal anomaly metrics, radiative power graph, optical camera status.
   - `HistoricalContext`: 1883 VEI-6 comparison, 2018 flank collapse analysis, bathymetric profile.
4. **Verification & Testing:**
   - Unit/Build validation: `npm run build`.
   - Browser Subagent: Visual validation on desktop (1440x900) and mobile (390x844).
5. **Deployment:** Vercel deployment with live URL confirmation.
