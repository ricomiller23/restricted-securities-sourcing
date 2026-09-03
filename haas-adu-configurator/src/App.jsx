import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Layers, 
  DollarSign, 
  MapPin, 
  CheckCircle, 
  Download, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Zap, 
  ShieldCheck, 
  Maximize2,
  Calendar,
  Building,
  TrendingUp,
  FileText,
  Sliders,
  Grid,
  Eye,
  Menu,
  X
} from 'lucide-react';

const MODELS = [
  {
    id: 'haven',
    category: 'compact',
    name: 'The Haven',
    tagline: 'Modern Luxury with Rooftop Sky Lounge',
    dimensions: "14' × 29'-0\"",
    sqft: 350,
    width: 14,
    length: 29,
    baseRent: 2450,
    homeownerSplit: 750,
    heroImage: '/images/haven.jpg',
    interiorImage: '/images/haven_interior.jpg',
    patioImage: '/images/haven_patio.jpg',
    floorplanImage: '/images/floorplan_haven.png',
    blueprintImage: '/images/blueprint_haven.png',
    features: [
      'Full rooftop sky lounge deck with spiral staircase access',
      "4'-0\" integrated covered front porch with recessed downlights",
      'Open kitchenette & living room with roof skylight access',
      'Private bedroom with double wardrobe closet & full bath',
      'Panoramic sliding glass patio doors for indoor-outdoor living'
    ],
    idealFor: 'Upscale suburban backyards, premium view lots, executive mid-term rentals.',
    minLotWidth: 45
  },
  {
    id: 'harmony',
    category: 'compact',
    name: 'The Harmony',
    tagline: 'Charming Modern Craftsman Cottage',
    dimensions: "14' × 24'-0\"",
    sqft: 348,
    width: 14,
    length: 24,
    baseRent: 2100,
    homeownerSplit: 650,
    heroImage: '/images/harmony.jpg',
    interiorImage: '/images/harmony_interior.jpg',
    patioImage: '/images/harmony_patio.jpg',
    floorplanImage: '/images/floorplan_harmony.png',
    blueprintImage: '/images/blueprint_harmony.png',
    features: [
      'Classic pitched gabled roofline with architectural shingles',
      'Welcoming covered front portico with artisan coach lighting',
      'Smart-lap horizontal white siding with black mullions',
      'Spacious open studio layout with full kitchen & dining',
      'Complete bathroom with 3-3060 shower and stack W/D'
    ],
    idealFor: 'Traditional HOA communities, multi-gen in-law suites, historic districts.',
    minLotWidth: 45
  },
  {
    id: 'sierra',
    category: 'compact',
    name: 'The Sierra',
    tagline: 'Modern Mono-Pitch Shed with Loft',
    dimensions: "14' × 31'-6\"",
    sqft: 420,
    width: 14,
    length: 31.5,
    baseRent: 2750,
    homeownerSplit: 850,
    heroImage: '/images/sierra.jpg',
    interiorImage: '/images/sierra_interior.jpg',
    patioImage: '/images/sierra_patio.jpg',
    floorplanImage: '/images/floorplan_sierra.png',
    blueprintImage: '/images/blueprint_sierra.png',
    features: [
      'Modern mono-pitch shed roofline with clerestory transoms',
      'Vaulted Great Room with mezzanine sleeping loft above',
      'Ground floor private bedroom with large closet & egress',
      'Board-and-batten charcoal siding with natural oak inlays',
      'Front and rear entry decks with step lighting'
    ],
    idealFor: 'Medium-to-large suburban parcels, remote tech professionals, stable cash flow.',
    minLotWidth: 45
  },
  {
    id: 'meadow',
    category: 'compact',
    name: 'The Meadow',
    tagline: 'Flagship Rooftop Terrace Entertainer',
    dimensions: "15' × 31'-9\"",
    sqft: 435,
    width: 15,
    length: 31.75,
    baseRent: 2950,
    homeownerSplit: 950,
    heroImage: '/images/meadow.jpg',
    interiorImage: '/images/meadow_interior.jpg',
    patioImage: '/images/meadow_patio.jpg',
    floorplanImage: '/images/floorplan_meadow.png',
    blueprintImage: '/images/blueprint_meadow.png',
    features: [
      'Full-footprint rooftop sun terrace with slatted privacy railings',
      'Exterior open staircase connecting yard directly to rooftop',
      'Symmetrical front facade with flanked oversized black windows',
      'Dual lofts (sleeping + storage/lounge) and plant ledge top',
      'Full gourmet kitchen with dining peninsula and rear patio door'
    ],
    idealFor: 'Wide suburban parcels (50\'+ width), high-ADR luxury travel nurse or Airbnb suites.',
    minLotWidth: 50
  },
  {
    id: 'cascade',
    category: 'compact',
    name: 'The Cascade',
    tagline: 'Ultra-Compact 12-Foot Slimline Infill',
    dimensions: "12' × 27'-9\"",
    sqft: 300,
    width: 12,
    length: 27.75,
    baseRent: 1950,
    homeownerSplit: 600,
    heroImage: '/images/cascade.jpg',
    interiorImage: '/images/cascade_interior.jpg',
    patioImage: '/images/cascade_patio.jpg',
    floorplanImage: '/images/floorplan_cascade.png',
    blueprintImage: '/images/blueprint_cascade.png',
    features: [
      'Slimline 12-foot exterior profile engineered for narrow lots',
      "Industrial steel ship's ladder ascending to observation deck",
      'Efficient open Living/Dining, Kitchenette, and Bath',
      'Ground floor bedroom with upper loft overhead',
      'Fits 95% of standard residential parcels without setback variance'
    ],
    idealFor: 'Narrow side yards, urban infill parcels, highest density ROI per sq ft.',
    minLotWidth: 35
  },
  {
    id: 'magnolia',
    category: 'estate',
    name: 'The Magnolia',
    tagline: 'Classic Charm with Attached 2-Car Garage',
    specs: '2 Bed | 2 Bath | 2-Car Garage | 1,013 Sq. Ft.',
    dimensions: "36' × 42'-0\"",
    sqft: 1013,
    width: 36,
    length: 42,
    baseRent: 3850,
    homeownerSplit: 1250,
    heroImage: '/images/magnolia.jpg',
    interiorImage: '/images/floorplan_magnolia.png',
    patioImage: '/images/magnolia_patio.jpg',
    floorplanImage: '/images/floorplan_magnolia.png',
    blueprintImage: '/images/magnolia_sheet.jpg',
    features: [
      'Attached 2-car garage with direct secure interior home access',
      'Warm, welcoming covered front porch with classic architectural charm',
      'Spacious open-concept living and dining spaces with abundant natural light',
      'Two full bedrooms and two bathrooms including private primary suite',
      'Dedicated laundry utility room, walk-in closets, and generous storage'
    ],
    description: 'Warm, welcoming, and designed for everyday comfort, the Magnolia pairs classic charm with a smart, efficient layout. An open living space, two bedrooms, two bathrooms, ample storage, and an attached two-car garage make this a comfortable and versatile place to call home.',
    idealFor: 'Full-size residential lots, multi-gen primary living, high-yield executive long-term rental.',
    minLotWidth: 55
  },
  {
    id: 'zinnia',
    category: 'estate',
    name: 'The Zinnia',
    tagline: 'Contemporary Living with High Clerestory Windows',
    specs: '2 Bed | 2 Bath | 2-Car Garage | 1,000 Sq. Ft.',
    dimensions: "35' × 42'-0\"",
    sqft: 1000,
    width: 35,
    length: 42,
    baseRent: 3800,
    homeownerSplit: 1200,
    heroImage: '/images/zinnia.jpg',
    interiorImage: '/images/floorplan_zinnia.png',
    patioImage: '/images/zinnia_patio.jpg',
    floorplanImage: '/images/floorplan_zinnia.png',
    blueprintImage: '/images/zinnia_sheet.jpg',
    features: [
      'High-ceiling modern clerestory roofline with upper transom windows',
      'Attached 2-car garage with oversized paver driveway apron',
      'Open-concept Great Room with dedicated dining & chef peninsula kitchen',
      'Primary bedroom retreat with luxury private bath & walk-in wardrobe',
      'Private rear patio sliding door for seamless indoor-outdoor living'
    ],
    description: 'A thoughtfully designed home that blends comfort, function, and modern style. The Zinnia features an open-concept living space, two bedrooms, two bathrooms, generous storage, and an attached two-car garage—all within an efficient, easy-living floorplan.',
    idealFor: 'Contemporary suburban estates, design-forward homeowners, high-ADR luxury rentals.',
    minLotWidth: 55
  },
  {
    id: 'iris',
    category: 'estate',
    name: 'The Iris',
    tagline: 'Craftsman Porch Living with Gourmet Kitchen Island',
    specs: '2 Bed | 2 Bath | 2-Car Garage | 1,013 Sq. Ft.',
    dimensions: "36' × 42'-0\"",
    sqft: 1013,
    width: 36,
    length: 42,
    baseRent: 3850,
    homeownerSplit: 1250,
    heroImage: '/images/iris.jpg',
    interiorImage: '/images/floorplan_iris.png',
    patioImage: '/images/iris_patio.jpg',
    floorplanImage: '/images/floorplan_iris.png',
    blueprintImage: '/images/iris_sheet.jpg',
    features: [
      'Full-width craftsman covered front porch with stone masonry piers',
      'Gourmet chef kitchen with expansive 8-foot island and bar seating',
      'Attached 2-car garage with side utility passage door',
      'Two spacious bedrooms, including primary suite with backyard patio walkout',
      'Dedicated laundry utility room & abundant integrated storage'
    ],
    description: 'Designed with everyday living in mind, the Iris combines an inviting covered porch with a spacious, open-concept interior. Two bedrooms, two bathrooms, a generous kitchen island, dedicated laundry, and an attached two-car garage create a practical home with plenty of room to live comfortably.',
    idealFor: 'Traditional suburban neighborhoods, family in-laws, premium extended-stay tenants.',
    minLotWidth: 55
  },
  {
    id: 'dahlia',
    category: 'estate',
    name: 'The Dahlia',
    tagline: 'Sleek Contemporary Lines with Split Bedroom Privacy',
    specs: '2 Bed | 2 Bath | 2-Car Garage | 1,006 Sq. Ft.',
    dimensions: "35' × 42'-0\"",
    sqft: 1006,
    width: 35,
    length: 42,
    baseRent: 3820,
    homeownerSplit: 1220,
    heroImage: '/images/dahlia.jpg',
    interiorImage: '/images/floorplan_dahlia.png',
    patioImage: '/images/dahlia_patio.jpg',
    floorplanImage: '/images/floorplan_dahlia.png',
    blueprintImage: '/images/dahlia_sheet.jpg',
    features: [
      'Sleek contemporary mono-pitch slant roofline with natural stone pillars',
      'Attached 2-car garage with modern dark flush-panel garage doors',
      'Split bedroom layout maximizing acoustic privacy between suites',
      'Dedicated laundry room and abundant hallway linen storage',
      'Dual sliding patio glass doors connecting to rear garden terrace'
    ],
    description: 'Clean lines and contemporary style define the Dahlia, with a thoughtfully arranged interior designed for both comfort and privacy. Two bedrooms, two bathrooms, open living and dining spaces, dedicated laundry, and an attached two-car garage make modern living feel effortless.',
    idealFor: 'Design-forward properties, high-density residential lots, luxury corporate housing.',
    minLotWidth: 55
  }
];

const METROS = [
  { name: 'Los Angeles / SoCal', rentMult: 1.15, appreciation: 220000 },
  { name: 'San Francisco / Bay Area', rentMult: 1.35, appreciation: 280000 },
  { name: 'Austin, TX', rentMult: 0.95, appreciation: 160000 },
  { name: 'Miami / South Florida', rentMult: 1.10, appreciation: 195000 },
  { name: 'Seattle / Puget Sound', rentMult: 1.20, appreciation: 240000 },
  { name: 'Denver / Boulder, CO', rentMult: 1.05, appreciation: 180000 },
  { name: 'Phoenix / Scottsdale, AZ', rentMult: 0.90, appreciation: 150000 },
  { name: 'San Diego, CA', rentMult: 1.25, appreciation: 250000 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('configurator');
  const [selectedModelId, setSelectedModelId] = useState('haven');
  const [activeView, setActiveView] = useState('exterior'); // 'exterior' | 'interior' | 'patio' | 'floorplan' | 'blueprint'
  const [selectedMetro, setSelectedMetro] = useState(METROS[0]);
  const [modelCategoryFilter, setModelCategoryFilter] = useState('all'); // 'all' | 'compact' | 'estate'
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all'); // 'all' | 'compact' | 'estate'
  const [addressInput, setAddressInput] = useState('1428 Elmwood Ave, Los Angeles, CA 90038');
  const [isAuditingLot, setIsAuditingLot] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [lotData, setLotData] = useState({
    lotSqFt: 6450,
    backyardDepth: 42,
    backyardWidth: 54,
    sideSetback: 5,
    rearSetback: 4,
    zoning: 'Eligible (CA SB 9 / Statewide ADU Pre-Approved)',
    trenchDistance: 46
  });

  // Upgrades
  const [upgrades, setUpgrades] = useState({
    rooftopLounge: true,
    solarPowerwall: true,
    scandinavianInterior: true,
    smartAccess: true
  });

  // Site Audit Lead Form
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '1428 Elmwood Ave, Los Angeles, CA 90038',
    drivewayAccess: 'Wide (10ft+ unobstructed)',
    electricalPanel: '200 Amp (Modernized)',
    sewerDistance: 'Under 50 ft',
    targetModel: 'haven',
    submitted: false
  });

  // Dynamic brand configuration based on domain (theadumart.com vs theadusupply.com)
  const brand = useMemo(() => {
    if (typeof window !== 'undefined') {
      const host = (window.location.hostname || '').toLowerCase();
      if (host.includes('store')) {
        return {
          brandName: 'THE ADU STORE',
          tagline: 'Premier ADU Marketplace & HaaS Solutions',
          collectionTitle: 'The ADU Store Collection & Plans',
          blueprintTitle: 'Official ADU Store CAD Blueprint Sheet',
          copyright: '© 2026 THE ADU STORE • Housing-as-a-Service (HaaS) Infrastructure',
          pageTitle: 'THE ADU STORE',
          isStore: true,
          isMart: false
        };
      }
      if (host.includes('mart')) {
        return {
          brandName: 'THE ADU MART',
          tagline: 'Premier ADU Marketplace & HaaS Solutions',
          collectionTitle: 'The ADU Mart Collection & Plans',
          blueprintTitle: 'Official ADU Mart CAD Blueprint Sheet',
          copyright: '© 2026 THE ADU MART • Housing-as-a-Service (HaaS) Infrastructure',
          pageTitle: 'THE ADU MART',
          isStore: false,
          isMart: true
        };
      }
    }
    return {
      brandName: 'THE ADU SUPPLY',
      tagline: 'Housing-as-a-Service ADU Suite',
      collectionTitle: 'The ADU Supply Collection & Plans',
      blueprintTitle: 'Official ADU Supply CAD Blueprint Sheet',
      copyright: '© 2026 THE ADU SUPPLY • Housing-as-a-Service (HaaS) Infrastructure',
      pageTitle: 'THE ADU SUPPLY',
      isStore: false,
      isMart: false
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = brand.pageTitle;
    }
  }, [brand]);

  const selectedModel = useMemo(() => {
    return MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  }, [selectedModelId]);

  const filteredModels = useMemo(() => {
    if (modelCategoryFilter === 'all') return MODELS;
    return MODELS.filter(m => m.category === modelCategoryFilter);
  }, [modelCategoryFilter]);

  const galleryModels = useMemo(() => {
    if (galleryCategoryFilter === 'all') return MODELS;
    return MODELS.filter(m => m.category === galleryCategoryFilter);
  }, [galleryCategoryFilter]);

  // Financial Calculations
  const calculations = useMemo(() => {
    let base = selectedModel.baseRent * selectedMetro.rentMult;
    if (upgrades.rooftopLounge) base += (selectedModel.category === 'estate' ? 180 : 150);
    if (upgrades.solarPowerwall) base += (selectedModel.category === 'estate' ? 160 : 100);
    if (upgrades.scandinavianInterior) base += (selectedModel.category === 'estate' ? 180 : 120);
    if (upgrades.smartAccess) base += 50;

    const monthlyGross = Math.round(base);
    const homeownerMonthly = Math.round(
      selectedModel.homeownerSplit * selectedMetro.rentMult + 
      (upgrades.rooftopLounge ? (selectedModel.category === 'estate' ? 60 : 50) : 0) + 
      (upgrades.solarPowerwall ? (selectedModel.category === 'estate' ? 50 : 30) : 0)
    );
    const operatorMonthly = monthlyGross - homeownerMonthly;
    const tenYearHomeowner = homeownerMonthly * 12 * 10;
    const propertyAppreciation = Math.round(selectedMetro.appreciation * (selectedModel.sqft / 400));

    return {
      monthlyGross,
      homeownerMonthly,
      operatorMonthly,
      tenYearHomeowner,
      propertyAppreciation
    };
  }, [selectedModel, selectedMetro, upgrades]);

  const handleSimulateLotAudit = (e) => {
    e.preventDefault();
    setIsAuditingLot(true);
    setTimeout(() => {
      setIsAuditingLot(false);
      setLotData({
        lotSqFt: Math.floor(5800 + Math.random() * 2500),
        backyardDepth: Math.floor(38 + Math.random() * 18),
        backyardWidth: Math.floor(48 + Math.random() * 16),
        sideSetback: 4,
        rearSetback: 4,
        zoning: '100% Feasible & Pre-Approved',
        trenchDistance: Math.floor(35 + Math.random() * 30)
      });
    }, 600);
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadForm(prev => ({ ...prev, submitted: true }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8, 12, 20, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)', padding: '10px 16px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="app-header-container">
            
            {/* Header Top Row (Brand + CTA) */}
            <div className="header-top-row">
              <div className="brand-badge-group">
                <div className="brand-icon">
                  <Home size={18} color="#ffffff" />
                </div>
                <div className="brand-title">
                  {brand.brandName}
                </div>
              </div>

              <button 
                className="btn btn-emerald" 
                onClick={() => { setActiveTab('audit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '7px 14px', fontSize: '12px', minHeight: '34px' }}
              >
                <Sparkles size={13} /> Free Audit
              </button>
            </div>

            {/* Navigation Tabs Bar */}
            <nav className="nav-tabs-container">
              <button 
                className={`btn tab-btn ${activeTab === 'configurator' ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab('configurator')}
              >
                <Sliders size={13} /> Configurator & ROI
              </button>
              <button 
                className={`btn tab-btn ${activeTab === 'audit' ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                <Compass size={13} /> Site Audit
              </button>
              <button 
                className={`btn tab-btn ${activeTab === 'gallery' ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <Layers size={13} /> 9 Models & Plans
              </button>
              <button 
                className={`btn tab-btn ${activeTab === 'downloads' ? 'tab-btn-active-green' : ''}`}
                onClick={() => setActiveTab('downloads')}
              >
                <Download size={13} /> Downloads
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '16px 14px' }}>
        
        {/* ==================================================== */}
        {/* TAB 1: CONFIGURATOR & ROI ENGINE                     */}
        {/* ==================================================== */}
        {activeTab === 'configurator' && (
          <div className="configurator-grid">
            
            {/* Left Column: Visualizer & Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
              
              {/* Address Lot Feasibility Bar */}
              <div className="glass-panel" style={{ padding: '14px 16px' }}>
                <form onSubmit={handleSimulateLotAudit} className="lot-search-form">
                  <div className="lot-input-wrapper">
                    <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input 
                      type="text" 
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Enter address to audit lot..."
                      className="form-input"
                      style={{ paddingLeft: '34px' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', minHeight: '42px' }} disabled={isAuditingLot}>
                    {isAuditingLot ? 'Scanning...' : 'Scan Parcel'}
                  </button>
                </form>

                {/* Lot Audit Metrics */}
                <div className="lot-audit-grid">
                  <div style={{ fontSize: '10.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>LOT AREA</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '12.5px' }}>{lotData.lotSqFt.toLocaleString()} sq ft</div>
                  </div>
                  <div style={{ fontSize: '10.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>BACKYARD</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '12.5px' }}>{lotData.backyardDepth}' × {lotData.backyardWidth}'</div>
                  </div>
                  <div style={{ fontSize: '10.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>SETBACK REQ</div>
                    <div style={{ fontWeight: 700, color: '#34d399', fontSize: '12.5px' }}>{lotData.rearSetback}' Rear / {lotData.sideSetback}' Side</div>
                  </div>
                  <div style={{ fontSize: '10.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>ZONING STATUS</div>
                    <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '12.5px' }}>Pre-Approved</div>
                  </div>
                </div>
              </div>

              {/* 3D Visualizer Viewport Card */}
              <div className="glass-panel visualizer-card">
                
                <div className="visualizer-viewport-box">
                  <img 
                    src={
                      activeView === 'exterior' ? selectedModel.heroImage :
                      activeView === 'interior' ? selectedModel.interiorImage :
                      activeView === 'patio' ? selectedModel.patioImage :
                      activeView === 'floorplan' ? selectedModel.floorplanImage :
                      selectedModel.blueprintImage
                    } 
                    alt={selectedModel.name}
                    className={`visualizer-main-img ${activeView === 'floorplan' || activeView === 'blueprint' ? 'img-contain' : 'img-cover'}`}
                  />

                  {/* Gradient Overlay for Renders */}
                  {(activeView === 'exterior' || activeView === 'interior' || activeView === 'patio') && (
                    <div className="render-gradient-overlay" />
                  )}

                  {/* Responsive View Switcher */}
                  <div className="view-switcher-container">
                    <button 
                      className={`btn view-btn ${activeView === 'exterior' ? 'active-view' : ''}`}
                      onClick={() => setActiveView('exterior')}
                    >
                      Exterior
                    </button>
                    <button 
                      className={`btn view-btn ${activeView === 'interior' ? 'active-view' : ''}`}
                      onClick={() => setActiveView('interior')}
                    >
                      Interior
                    </button>
                    <button 
                      className={`btn view-btn ${activeView === 'patio' ? 'active-view' : ''}`}
                      onClick={() => setActiveView('patio')}
                    >
                      Patio
                    </button>
                    <button 
                      className={`btn view-btn plan-btn ${activeView === 'floorplan' ? 'active-view-plan' : ''}`}
                      onClick={() => setActiveView('floorplan')}
                    >
                      📐 Plan
                    </button>
                    <button 
                      className={`btn view-btn blueprint-btn ${activeView === 'blueprint' ? 'active-view-blueprint' : ''}`}
                      onClick={() => setActiveView('blueprint')}
                    >
                      Blueprint
                    </button>
                  </div>
                </div>

                {/* Model Floating Info Banner (Decoupled & Always 100% Legible) */}
                <div className="model-info-banner">
                  <div className="model-info-left">
                    <div className="model-badge-row">
                      <span className="badge badge-blue">{selectedModel.dimensions}</span>
                      <span className="badge badge-green">{selectedModel.sqft} SQ FT</span>
                      {selectedModel.category === 'estate' ? (
                        <span className="badge badge-purple">
                          🚗 2-Car Garage &bull; 2 Bed / 2 Bath
                        </span>
                      ) : (
                        <span className="badge badge-subtle">
                          🏡 Backyard ADU
                        </span>
                      )}
                    </div>
                    <h2 className="model-name-title">{selectedModel.name}</h2>
                    <div className="model-tagline-text">{selectedModel.tagline}</div>
                  </div>
                  <div className="model-info-right">
                    <div className="passive-split-subtitle">Passive Split</div>
                    <div className="passive-split-value">${calculations.homeownerMonthly}<span>/mo</span></div>
                  </div>
                </div>

                {/* Footprint Category Filter */}
                <div className="footprint-filter-wrapper">
                  <div className="footprint-buttons-scroll">
                    <span className="footprint-label">Footprint:</span>
                    <button
                      className={`btn filter-pill ${modelCategoryFilter === 'all' ? 'pill-active-blue' : ''}`}
                      onClick={() => setModelCategoryFilter('all')}
                    >
                      All (9)
                    </button>
                    <button
                      className={`btn filter-pill ${modelCategoryFilter === 'compact' ? 'pill-active-blue' : ''}`}
                      onClick={() => {
                        setModelCategoryFilter('compact');
                        if (selectedModel.category !== 'compact') setSelectedModelId('haven');
                      }}
                    >
                      🏡 Compact (5)
                    </button>
                    <button
                      className={`btn filter-pill ${modelCategoryFilter === 'estate' ? 'pill-active-green' : ''}`}
                      onClick={() => {
                        setModelCategoryFilter('estate');
                        if (selectedModel.category !== 'estate') setSelectedModelId('magnolia');
                      }}
                    >
                      🏰 2-Car Garage (4)
                    </button>
                  </div>
                  <span className="models-count-text">
                    {filteredModels.length} models
                  </span>
                </div>

                {/* Model Selector Strip */}
                <div className="model-selector-strip">
                  {filteredModels.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      className={`model-select-btn ${selectedModelId === m.id ? 'model-btn-selected' : ''}`}
                    >
                      <div className="m-btn-name">{m.name}</div>
                      <div className="m-btn-sqft">{m.sqft} sq ft</div>
                      {m.category === 'estate' && (
                        <div className="m-btn-garage">
                          🚗 2-CAR
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrades & Architecture Highlights */}
              <div className="upgrades-grid">
                
                {/* Blueprint Highlights */}
                <div className="glass-panel card-padding">
                  <h3 className="section-subheading">
                    <Layers size={15} color="#3b82f6" /> Blueprint Architectural Specs
                  </h3>
                  <ul className="features-list">
                    {selectedModel.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <div className="lot-min-banner">
                    <strong>Lot Minimum:</strong> Requires {selectedModel.minLotWidth}' parcel width for standard setback compliance.
                  </div>
                </div>

                {/* Interactive Upgrade Toggles */}
                <div className="glass-panel card-padding">
                  <h3 className="section-subheading">
                    <Zap size={15} color="#f59e0b" /> Premium HaaS Upgrades
                  </h3>
                  <div className="upgrades-checklist">
                    
                    <label className="upgrade-toggle-row">
                      <span>{selectedModel.category === 'estate' ? 'Dual Level-2 EV Garage Charger' : 'Rooftop Sky Lounge & Stairs'}</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.rooftopLounge}
                        onChange={(e) => setUpgrades(u => ({ ...u, rooftopLounge: e.target.checked }))}
                      />
                    </label>

                    <label className="upgrade-toggle-row">
                      <span>Solar PV + Tesla Powerwall</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.solarPowerwall}
                        onChange={(e) => setUpgrades(u => ({ ...u, solarPowerwall: e.target.checked }))}
                      />
                    </label>

                    <label className="upgrade-toggle-row">
                      <span>Scandinavian Luxury Finishes</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.scandinavianInterior}
                        onChange={(e) => setUpgrades(u => ({ ...u, scandinavianInterior: e.target.checked }))}
                      />
                    </label>

                    <label className="upgrade-toggle-row">
                      <span>Smart Keyless Security</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.smartAccess}
                        onChange={(e) => setUpgrades(u => ({ ...u, smartAccess: e.target.checked }))}
                      />
                    </label>

                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Financial ROI Engine */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
              
              <div className="glass-panel cashflow-panel">
                
                <div className="cashflow-header-row">
                  <span className="badge badge-green">Zero-CapEx HaaS</span>
                  <span className="turnkey-label">30-Day Turnkey</span>
                </div>

                <h3 className="cashflow-title">Monthly Cash Flow Engine</h3>

                {/* Metro Selector */}
                <div className="metro-select-group">
                  <label className="field-label">Target Rental Metro</label>
                  <select 
                    value={selectedMetro.name}
                    onChange={(e) => {
                      const m = METROS.find(item => item.name === e.target.value);
                      if (m) setSelectedMetro(m);
                    }}
                    className="styled-select"
                  >
                    {METROS.map(m => (
                      <option key={m.name} value={m.name} style={{ background: '#0f172a' }}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Big Metric Display */}
                <div className="passive-split-banner">
                  <div className="split-headline">
                    Homeowner Guaranteed Passive Split
                  </div>
                  <div className="split-amount">
                    ${calculations.homeownerMonthly} <span className="split-per-mo">/ mo</span>
                  </div>
                  <div className="split-annual">
                    ${(calculations.homeownerMonthly * 12).toLocaleString()} annual passive net revenue
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="breakdown-list">
                  <div className="breakdown-row">
                    <span className="row-label">Projected Gross Rent:</span>
                    <span className="row-val val-white">${calculations.monthlyGross} / mo</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="row-label">Operator Net Cash Flow:</span>
                    <span className="row-val val-blue">${calculations.operatorMonthly} / mo</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="row-label">10-Year Cumulative Cash:</span>
                    <span className="row-val val-green">${calculations.tenYearHomeowner.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="row-label">Est. Property Equity Boost:</span>
                    <span className="row-val val-amber">+${calculations.propertyAppreciation.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row no-border">
                    <span className="row-label">Homeowner Upfront CapEx:</span>
                    <span className="row-val val-green-bold">$0.00 (Zero Out-of-Pocket)</span>
                  </div>
                </div>

                <button 
                  className="btn btn-emerald reserve-cta-btn" 
                  onClick={() => {
                    setLeadForm(l => ({ ...l, targetModel: selectedModel.id }));
                    setActiveTab('audit');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Reserve Model & Audit Yard <ArrowRight size={14} />
                </button>

              </div>

              {/* Quick Downloads Card */}
              <div className="glass-panel card-padding">
                <h4 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '8px' }}>Executive Marketing Assets</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <a href="/downloads/ADU_HaaS_Portfolio.pptx" download className="btn btn-secondary" style={{ fontSize: '12px', justifyContent: 'flex-start', minHeight: '38px' }}>
                    <Download size={14} color="#3b82f6" /> Pitch Deck (.pptx)
                  </a>
                  <a href="/downloads/adu_marketing_catalog.pdf" download className="btn btn-secondary" style={{ fontSize: '12px', justifyContent: 'flex-start', minHeight: '38px' }}>
                    <FileText size={14} color="#10b981" /> Color Brochure (.pdf)
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: VIRTUAL SITE AUDIT & LEAD INTAKE             */}
        {/* ==================================================== */}
        {activeTab === 'audit' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '20px 18px' }}>
              
              {!leadForm.submitted ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <span className="badge badge-blue" style={{ marginBottom: '6px' }}>Turnkey Site Feasibility</span>
                    <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '4px' }}>48-Hour Backyard Feasibility Audit</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Submit your property details to verify crane access, setback clearances, and lock in your passive monthly revenue guarantee.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    <div className="form-two-col">
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={leadForm.fullName}
                          onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                          placeholder="Jane Doe"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="jane@example.com"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-two-col">
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          placeholder="(310) 555-0199"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Preferred Model</label>
                        <select 
                          value={leadForm.targetModel}
                          onChange={(e) => setLeadForm({ ...leadForm, targetModel: e.target.value })}
                          className="styled-select"
                        >
                          <optgroup label="🏡 Compact Backyard ADUs (300 - 435 sq ft)">
                            {MODELS.filter(m => m.category === 'compact').map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.sqft} sq ft &bull; {m.dimensions})</option>
                            ))}
                          </optgroup>
                          <optgroup label="🏰 Estate Homes with 2-Car Garage (1,000 - 1,013 sq ft)">
                            {MODELS.filter(m => m.category === 'estate').map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.sqft} sq ft &bull; 2 Bed/2 Bath + 2-Car Garage)</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Property Address</label>
                      <input 
                        type="text" 
                        required
                        value={leadForm.address}
                        onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                        placeholder="123 Palm Canyon Rd, Los Angeles, CA"
                        className="form-input"
                      />
                    </div>

                    <div className="form-three-col">
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Side Yard Access</label>
                        <select 
                          value={leadForm.drivewayAccess}
                          onChange={(e) => setLeadForm({ ...leadForm, drivewayAccess: e.target.value })}
                          className="styled-select"
                        >
                          <option>Wide Driveway (10ft+)</option>
                          <option>Standard Gate (5-9ft)</option>
                          <option>Overhead Crane Lift</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Electrical Panel</label>
                        <select 
                          value={leadForm.electricalPanel}
                          onChange={(e) => setLeadForm({ ...leadForm, electricalPanel: e.target.value })}
                          className="styled-select"
                        >
                          <option>200 Amp (Modern)</option>
                          <option>100-150 Amp (Subpanel)</option>
                          <option>Unsure / Check</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Sewer / Water Distance</label>
                        <select 
                          value={leadForm.sewerDistance}
                          onChange={(e) => setLeadForm({ ...leadForm, sewerDistance: e.target.value })}
                          className="styled-select"
                        >
                          <option>Under 50 ft</option>
                          <option>50 – 100 ft</option>
                          <option>100+ ft</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-emerald" style={{ padding: '12px', fontSize: '13.5px', marginTop: '6px', minHeight: '44px' }}>
                      Submit Audit & Lock In Passive Split <ArrowRight size={15} />
                    </button>

                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <CheckCircle size={28} color="#10b981" />
                  </div>
                  <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '6px' }}>Site Audit Pre-Approved!</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', maxWidth: '480px', margin: '0 auto 16px auto' }}>
                    Thank you, <strong>{leadForm.fullName || 'Homeowner'}</strong>. Your parcel details for <strong>{leadForm.address}</strong> have been submitted. Estimated monthly passive revenue: <strong>${calculations.homeownerMonthly}/mo</strong>.
                  </p>
                  
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '12px', maxWidth: '420px', margin: '0 auto 18px auto', textAlign: 'left', fontSize: '11.5px' }}>
                    <div>&bull; <strong>Assigned Model:</strong> {MODELS.find(m => m.id === leadForm.targetModel)?.name}</div>
                    <div>&bull; <strong>Crane Feasibility:</strong> {leadForm.drivewayAccess}</div>
                    <div>&bull; <strong>Turnkey Operator:</strong> 100% Zero-CapEx Guarantee</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setLeadForm({ ...leadForm, submitted: false })} style={{ fontSize: '12px' }}>
                      Submit Another Lot
                    </button>
                    <a href="/downloads/ADU_HaaS_Portfolio.pdf" download className="btn btn-primary" style={{ fontSize: '12px' }}>
                      <Download size={13} /> Pitch Deck (.pdf)
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: 5-MODEL PORTFOLIO GALLERY                    */}
        {/* ==================================================== */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4px auto' }}>
              <span className="badge badge-blue">Architectural CAD Blueprint Suite</span>
              <h2 style={{ fontSize: '22px', color: '#ffffff', margin: '4px 0 6px 0' }}>{brand.collectionTitle}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Factory-built, precision-engineered modular ADUs and tiny homes built for zero-disruption residential deployment.
              </p>
            </div>

            {/* Gallery Category Filter */}
            <div className="gallery-filter-bar">
              <button
                className={`btn filter-pill ${galleryCategoryFilter === 'all' ? 'pill-active-blue' : ''}`}
                onClick={() => setGalleryCategoryFilter('all')}
              >
                🌟 All Models (9)
              </button>
              <button
                className={`btn filter-pill ${galleryCategoryFilter === 'compact' ? 'pill-active-blue' : ''}`}
                onClick={() => setGalleryCategoryFilter('compact')}
              >
                🏡 Compact ADUs (5)
              </button>
              <button
                className={`btn filter-pill ${galleryCategoryFilter === 'estate' ? 'pill-active-green' : ''}`}
                onClick={() => setGalleryCategoryFilter('estate')}
              >
                🏰 2-Car Garage (4)
              </button>
            </div>

            <div className="gallery-grid">
              {galleryModels.map(m => (
                <div key={m.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Image Grid: 3D Render + CAD Floorplan */}
                  <div className="gallery-card-preview">
                    <div style={{ position: 'relative', height: '100%', background: '#080c14' }}>
                      <img src={m.heroImage} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.75)', padding: '2px 6px', borderRadius: '4px', fontSize: '9.5px', color: '#ffffff' }}>
                        3D Render
                      </div>
                    </div>
                    
                    <div 
                      style={{ height: '100%', background: '#ffffff', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
                      onClick={() => setModalImage(m.blueprintImage)}
                      title="Click to zoom blueprint"
                    >
                      <img src={m.floorplanImage} alt={`${m.name} Floorplan`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(15, 23, 42, 0.9)', padding: '2px 6px', borderRadius: '4px', fontSize: '9.5px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Eye size={9} /> CAD Plan
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <span className="badge badge-blue">{m.dimensions}</span>
                      <span className="badge badge-green">{m.sqft} SQ FT</span>
                      {m.category === 'estate' && (
                        <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.9)', color: '#ffffff' }}>
                          🚗 2-Car Garage
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                        <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '2px' }}>{m.name}</h3>
                        {m.specs && (
                          <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 600 }}>{m.specs}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>{m.tagline}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>EST. RENT</div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>${m.baseRent}/mo</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>HOMEOWNER SPLIT</div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>${m.homeownerSplit}/mo</div>
                        </div>
                      </div>

                      <ul style={{ paddingLeft: '14px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
                        {m.features.slice(0, 3).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, fontSize: '11.5px', padding: '8px 10px' }}
                        onClick={() => {
                          setSelectedModelId(m.id);
                          setActiveView('floorplan');
                          setActiveTab('configurator');
                        }}
                      >
                        📐 Plan & ROI <ArrowRight size={13} />
                      </button>
                      <button 
                        className="btn btn-secondary"
                        style={{ fontSize: '11.5px', padding: '8px 10px' }}
                        onClick={() => setModalImage(m.blueprintImage)}
                        title="View Full Blueprint"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: DOWNLOADS & MARKETING SUITE                   */}
        {/* ==================================================== */}
        {activeTab === 'downloads' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span className="badge badge-green">Downloads Hub</span>
              <h2 style={{ fontSize: '22px', color: '#ffffff', margin: '4px 0 6px 0' }}>Executive Marketing & Investment Decks</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                High-resolution brochures, financial models, and full-color presentations ready to print or email to homeowners and capital partners.
              </p>
            </div>

            <div className="downloads-grid">
              
              {/* Card 1: Pitch Deck */}
              <div className="glass-panel" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <FileText size={18} color="#3b82f6" />
                  </div>
                  <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '4px' }}>17-Slide Executive Pitch Deck</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', marginBottom: '10px' }}>
                    Complete 16:9 presentation deck with 3D color renders, official CAD floorplans, HaaS unit economics, and delivery timeline.
                  </p>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    &bull; Formats: PowerPoint (.pptx) & Landscape PDF (.pdf)
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <a href="/downloads/ADU_HaaS_Portfolio.pptx" download className="btn btn-primary" style={{ flex: '1 1 120px', fontSize: '11.5px' }}>
                    <Download size={13} /> PPTX Deck
                  </a>
                  <a href="/downloads/ADU_HaaS_Portfolio.pdf" download className="btn btn-secondary" style={{ flex: '1 1 120px', fontSize: '11.5px' }}>
                    <Download size={13} /> PDF Deck
                  </a>
                </div>
              </div>

              {/* Card 2: Marketing Brochure */}
              <div className="glass-panel" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <Building size={18} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '4px' }}>Full-Color Product Catalog</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', marginBottom: '10px' }}>
                    3-page executive marketing brochure detailing the Meadow, Sierra, and Cascade models with architectural specs and revenue splits.
                  </p>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    &bull; High-resolution PDF formatted for print & digital distribution.
                  </div>
                </div>
                <a href="/downloads/adu_marketing_catalog.pdf" download className="btn btn-emerald" style={{ width: '100%', fontSize: '11.5px' }}>
                  <Download size={13} /> Download Color Catalog (.pdf)
                </a>
              </div>

              {/* Card 3: Estate & 2-Car Garage Portfolio */}
              <div className="glass-panel" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <Home size={18} color="#8b5cf6" />
                  </div>
                  <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '4px' }}>Estate Homes & 2-Car Garage Portfolio</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', marginBottom: '10px' }}>
                    Executive 5-page dossier featuring The Magnolia, Zinnia, Iris, and Dahlia models with 3D cutaway floorplans, exterior elevations, and HaaS yield models.
                  </p>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    &bull; High-resolution landscape PDF formatted for capital partners & clients.
                  </div>
                </div>
                <a href="/downloads/Estate_Homes_2Car_Garage_Portfolio.pdf" download className="btn" style={{ width: '100%', fontSize: '11.5px', background: '#8b5cf6', color: '#ffffff', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                  <Download size={13} /> Download Estate Dossier (.pdf)
                </a>
              </div>

            </div>

            {/* Note on Downloads folder */}
            <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: '#93c5fd' }}>
              <CheckCircle size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <strong>Local Machine Sync:</strong> All generated PDF brochures and PowerPoint decks have also been saved to your <code>~/Downloads</code> folder!
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Full Blueprint Modal */}
      {modalImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px'
          }}
          onClick={() => setModalImage(null)}
        >
          <div style={{ maxWidth: '1200px', width: '100%', background: '#ffffff', borderRadius: '8px', padding: '12px', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{brand.blueprintTitle}</span>
              <button className="btn btn-secondary" onClick={() => setModalImage(null)} style={{ padding: '3px 8px', fontSize: '11px', color: '#0f172a', minHeight: '28px' }}>
                ✕ Close
              </button>
            </div>
            <div style={{ maxHeight: '75vh', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <img src={modalImage} alt="CAD Blueprint" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(8, 12, 20, 0.95)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center', fontSize: '10.5px', color: 'var(--text-muted)' }}>
          <div>{brand.copyright}</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>Pre-Approved Modular Architecture</span>
            <span>Zero-CapEx Homeowner Model</span>
            <span>Turnkey Delivery</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
