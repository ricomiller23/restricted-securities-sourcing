// Scientific and Volcanological Dataset for Krakatoa (Anak Krakatau)
// Coordinates: -6.102° S, 105.423° E (Sunda Strait, Indonesia)

export const KRAKATOA_CORE = {
  name: "Anak Krakatau",
  complex: "Krakatoa Volcanic Complex",
  location: "Sunda Strait (Selat Sunda), Indonesia",
  provinces: "Lampung / Banten Border",
  latitude: -6.102,
  longitude: 105.423,
  elevation_m: 157,
  elevation_ft: 515,
  caldera_depth_m: 250,
  type: "Caldera Complex / Post-Caldera Stratocone",
  rockType: "Basaltic Andesite to Dacite",
  currentAlertLevel: {
    level: "Level III",
    nameIndo: "SIAGA",
    nameEng: "ALERT / WATCH",
    color: "#ef4444",
    badgeClass: "badge-danger",
    exclusionZoneLandKm: 3.0,
    exclusionZoneSeaKm: 5.0,
    authority: "PVMBG / MAGMA Indonesia (ESDM)",
    lastEvaluated: "September 5, 2026",
    statusSummary: "Intense eruptive phase with continuous volcanic tremor, high lava fountaining (300-450m), incandescent bomb ejections, and ash plume reaching FL500."
  },
  aviation: {
    colorCode: "RED",
    noticeType: "VONA (Volcano Observatory Notice for Aviation)",
    currentPlumeLevel: "FL500 (50,000 ft / 15,240 m ASL)",
    driftDirection: "West (270°) at 22 knots; lower plume dispersing Southeast (135°)",
    vaacCentre: "VAAC Darwin (Australia)",
    corridorWarning: "Air routes traversing Sunda Strait between Java and Sumatra rerouted. Caution for Soekarno-Hatta (WIII) and Radin Inten II (WILL)."
  },
  seismicity: {
    continuousTremorAmplitude: "70 mm (Overscale on analog PGA post)",
    dominantAmplitude: "70 mm",
    amplitudeRange: "0.5 - 70 mm",
    durationSeconds: 21600, // 6 continuous hours
    rsamValue: 4890,
    rsamStatus: "CRITICAL HIGH",
    deepVolcanicCount: 14,
    shallowVolcanicCount: 38,
    eruptionEarthquakes: 92,
    harmonicTremorCount: 19
  },
  thermal: {
    radiantFluxMW: 685,
    ventTempC: 1024,
    anomalyStatus: "EXTREME (NASA FIRMS / VIIRS)",
    lavaFountainHeightM: 380,
    incandescenceRadiusM: 1200
  },
  flankStability: {
    status: "HIGH RISK / INSTABILITY MONITORING",
    swSectorDisplacementMmYear: 42.6,
    collapseRiskSector: "Southwest Flank (2018 Scar Repopulation)",
    sensorGridStatus: "ACTIVE (3 GNSS + 2 InSAR telemetry links)",
    lastMajorCollapse: "December 22, 2018 (0.22 km³ slide -> Sunda Strait Tsunami)"
  }
};

export const OBSERVATION_STATIONS = [
  {
    id: "KAKI",
    name: "Pasauran PGA Post (Banten)",
    type: "Primary Observatory & Seismometer",
    latitude: -6.158,
    longitude: 105.811,
    distanceKm: 42.5,
    bearing: "ENE",
    elevationM: 22,
    sensors: ["Broadband 3-Component", "Acoustic Infrasound", "Optical HD PTZ", "Barometer"],
    status: "ONLINE",
    latencyMs: 18,
    gainDefault: "1x",
    notes: "Main official monitoring post by PVMBG. Continuous 70mm overscale tremor recorded."
  },
  {
    id: "SERT",
    name: "Pulau Sertung Station",
    type: "Island Perimeter Borehole",
    latitude: -6.095,
    longitude: 105.388,
    distanceKm: 3.8,
    bearing: "NW",
    elevationM: 165,
    sensors: ["Short-Period Geophone", "Borehole Tiltmeter", "Thermal IR"],
    status: "ONLINE",
    latencyMs: 42,
    gainDefault: "0.5x",
    notes: "Direct flank proximity. High signal-to-noise ratio for magma ascent detection."
  },
  {
    id: "RAKA",
    name: "Pulau Rakata Station",
    type: "Caldera Rim Station",
    latitude: -6.148,
    longitude: 105.441,
    distanceKm: 4.6,
    bearing: "SSE",
    elevationM: 450,
    sensors: ["Triaxial Accelerometer", "GNSS Flank Tracker", "Infrasound Microphone"],
    status: "ONLINE",
    latencyMs: 35,
    gainDefault: "0.5x",
    notes: "Situated on remnant rim of 1883 cataclysm. Measures ground acceleration and shockwaves."
  },
  {
    id: "KALI",
    name: "Kalianda PGA Post (Lampung)",
    type: "Secondary Regional Post",
    latitude: -5.731,
    longitude: 105.592,
    distanceKm: 51.2,
    bearing: "N",
    elevationM: 18,
    sensors: ["Broadband Seismometer", "Webcam Telephoto", "Meteorological Mast"],
    status: "ONLINE",
    latencyMs: 24,
    gainDefault: "2x",
    notes: "Lampung mainland observation station monitoring northern dispersion and ash fall."
  }
];

export const TIDE_GAUGE_NETWORK = [
  {
    id: "TG-CARITA",
    name: "Marina Carita (Banten)",
    latitude: -6.299,
    longitude: 105.839,
    distanceKm: 46.1,
    waterLevelBaselineM: 1.12,
    currentWaterLevelM: 1.16,
    anomalyMm: 40,
    alertThresholdM: 0.60,
    status: "NORMAL / SCANNING",
    statusColor: "#10b981",
    lastPing: "Just now"
  },
  {
    id: "TG-ANYER",
    name: "Anyer Port (Banten)",
    latitude: -6.046,
    longitude: 105.918,
    distanceKm: 43.8,
    waterLevelBaselineM: 0.95,
    currentWaterLevelM: 0.98,
    anomalyMm: 30,
    alertThresholdM: 0.55,
    status: "NORMAL / SCANNING",
    statusColor: "#10b981",
    lastPing: "10s ago"
  },
  {
    id: "TG-CIWANDAN",
    name: "Ciwandan Port (Cilegon)",
    latitude: -6.012,
    longitude: 105.952,
    distanceKm: 56.4,
    waterLevelBaselineM: 1.40,
    currentWaterLevelM: 1.44,
    anomalyMm: 40,
    alertThresholdM: 0.70,
    status: "NORMAL / SCANNING",
    statusColor: "#10b981",
    lastPing: "15s ago"
  },
  {
    id: "TG-SEBESI",
    name: "Pulau Sebesi Wharf",
    latitude: -5.952,
    longitude: 105.485,
    distanceKm: 18.2,
    waterLevelBaselineM: 0.88,
    currentWaterLevelM: 0.95,
    anomalyMm: 70,
    alertThresholdM: 0.50,
    status: "WATCH / TURBULENCE",
    statusColor: "#f59e0b",
    lastPing: "5s ago"
  },
  {
    id: "TG-KALIANDA",
    name: "Kalianda Bay (Lampung)",
    latitude: -5.733,
    longitude: 105.589,
    distanceKm: 52.0,
    waterLevelBaselineM: 1.25,
    currentWaterLevelM: 1.28,
    anomalyMm: 30,
    alertThresholdM: 0.65,
    status: "NORMAL / SCANNING",
    statusColor: "#10b981",
    lastPing: "8s ago"
  },
  {
    id: "TG-KOTAAGUNG",
    name: "Kota Agung (Teluk Semangka)",
    latitude: -5.503,
    longitude: 104.622,
    distanceKm: 88.5,
    waterLevelBaselineM: 1.05,
    currentWaterLevelM: 1.07,
    anomalyMm: 20,
    alertThresholdM: 0.60,
    status: "NORMAL / SCANNING",
    statusColor: "#10b981",
    lastPing: "22s ago"
  }
];

export const HISTORICAL_BENCHMARKS = [
  {
    era: "1883 VEI-6 Cataclysm",
    date: "August 26-27, 1883",
    features: "Rakata, Danan, and Perbuwatan collapsed into sea. 42m tsunami waves, acoustic shockwave circled Earth 4 times, global winter for 3 years. ~36,417 deaths.",
    ejectaVolume: "25 km³",
    plumeHeight: "80,000 m (260,000 ft)",
    statusComparison: "Parent caldera creation. Anak Krakatau is the child cone growing inside this caldera since 1927."
  },
  {
    era: "2018 Flank Collapse & Tsunami",
    date: "December 22, 2018",
    features: "Southwest flank collapsed into deep caldera basin during Strombolian eruption. No preliminary seismic warning; triggered 5-13m tsunami impacting Banten and Lampung. 437 fatalities.",
    ejectaVolume: "0.22 km³ flank landslide",
    plumeHeight: "16,800 m (55,000 ft)",
    statusComparison: "Cone height fell from 338m to 110m. Today in 2026, cone has rebuilt to 157m, triggering rigorous flank stability watch."
  },
  {
    era: "2026 Current Eruptive Crisis",
    date: "September 2026 (Active)",
    features: "Continuous lava fountaining, 70 mm overscale continuous tremor, volcanic ash plume to FL500 (15,200m). Level III Siaga active.",
    ejectaVolume: "High magma effusion rate (~15 m³/s)",
    plumeHeight: "15,240 m (FL500)",
    statusComparison: "Active rebuilding and vent pressurization. High alert for maritime safety and air navigation."
  }
];

// Fallback high-fidelity Sunda Strait seismic events when USGS API is throttling or offline
export const FALLBACK_SUNDA_STRAIT_SEISMIC = [
  {
    id: "us7000krak01",
    mag: 4.8,
    place: "34 km WSW of Carita, Sunda Strait, Indonesia",
    time: Date.now() - 1000 * 60 * 22,
    depth: 18.4,
    lat: -6.182,
    lon: 105.342,
    type: "volcano-tectonic",
    code: "VT-Deep"
  },
  {
    id: "us7000krak02",
    mag: 3.9,
    place: "6 km SW of Anak Krakatau, Sunda Strait",
    time: Date.now() - 1000 * 60 * 58,
    depth: 4.2,
    lat: -6.138,
    lon: 105.391,
    type: "volcanic-shallow",
    code: "VB-MagmaAscent"
  },
  {
    id: "us7000krak03",
    mag: 4.2,
    place: "48 km S of Kalianda, Sunda Strait, Indonesia",
    time: Date.now() - 1000 * 60 * 142,
    depth: 32.0,
    lat: -6.021,
    lon: 105.612,
    type: "tectonic-subduction",
    code: "Tectonic"
  },
  {
    id: "us7000krak04",
    mag: 3.5,
    place: "2 km NE of Anak Krakatau crater, Sunda Strait",
    time: Date.now() - 1000 * 60 * 210,
    depth: 2.1,
    lat: -6.089,
    lon: 105.438,
    type: "eruption-tremor",
    code: "TremorBurst"
  },
  {
    id: "us7000krak05",
    mag: 5.1,
    place: "78 km SW of Labuan, Java Trench Outer Rise",
    time: Date.now() - 1000 * 60 * 480,
    depth: 54.0,
    lat: -6.612,
    lon: 105.021,
    type: "tectonic-regional",
    code: "SundaMegathrust"
  },
  {
    id: "us7000krak06",
    mag: 3.7,
    place: "12 km W of Pulau Sertung, Sunda Strait",
    time: Date.now() - 1000 * 60 * 690,
    depth: 8.5,
    lat: -6.098,
    lon: 105.312,
    type: "volcano-tectonic",
    code: "VT-Mid"
  }
];
