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
      if (host.includes('mart')) {
        return {
          brandName: 'THE ADU MART',
          tagline: 'Premier ADU Marketplace & HaaS Solutions',
          collectionTitle: 'The ADU Mart Collection & Plans',
          blueprintTitle: 'Official ADU Mart CAD Blueprint Sheet',
          copyright: '© 2026 THE ADU MART • Housing-as-a-Service (HaaS) Infrastructure',
          pageTitle: 'THE ADU MART',
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
      
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 12, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 16px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="app-header-container">
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--gradient-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                  flexShrink: 0
                }}>
                  <Home size={18} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.2 }}>
                    {brand.brandName} <span style={{ color: '#3b82f6' }}>•</span> HaaS
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {brand.tagline}
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-emerald"
                onClick={() => {
                  setActiveTab('audit');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ padding: '6px 12px', fontSize: '11.5px', minHeight: '34px' }}
              >
                <Sparkles size={13} /> Free Audit
              </button>
            </div>

            {/* Nav Tabs */}
            <nav className="nav-tabs-container">
              <button 
                className="btn" 
                onClick={() => setActiveTab('configurator')}
                style={{
                  background: activeTab === 'configurator' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: activeTab === 'configurator' ? '#60a5fa' : 'var(--text-secondary)',
                  border: activeTab === 'configurator' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent'
                }}
              >
                <Sliders size={13} /> Configurator & ROI
              </button>
              <button 
                className="btn" 
                onClick={() => setActiveTab('audit')}
                style={{
                  background: activeTab === 'audit' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: activeTab === 'audit' ? '#60a5fa' : 'var(--text-secondary)',
                  border: activeTab === 'audit' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent'
                }}
              >
                <Compass size={13} /> Site Audit
              </button>
              <button 
                className="btn" 
                onClick={() => setActiveTab('gallery')}
                style={{
                  background: activeTab === 'gallery' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: activeTab === 'gallery' ? '#60a5fa' : 'var(--text-secondary)',
                  border: activeTab === 'gallery' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent'
                }}
              >
                <Layers size={13} /> 9 Models & Plans
              </button>
              <button 
                className="btn" 
                onClick={() => setActiveTab('downloads')}
                style={{
                  background: activeTab === 'downloads' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                  color: activeTab === 'downloads' ? '#34d399' : 'var(--text-secondary)',
                  border: activeTab === 'downloads' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
                }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Address Lot Feasibility Bar */}
              <div className="glass-panel" style={{ padding: '14px 16px' }}>
                <form onSubmit={handleSimulateLotAudit} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 240px' }}>
                    <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input 
                      type="text" 
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Enter address to audit lot..."
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: '12.5px' }} disabled={isAuditingLot}>
                    {isAuditingLot ? 'Scanning...' : 'Scan Parcel'}
                  </button>
                </form>

                {/* Lot Audit Metrics */}
                <div className="lot-audit-grid" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
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

              {/* 3D Visualizer Viewport */}
              <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
                
                <div 
                  className="visualizer-viewport-box"
                  style={{ 
                    height: '440px', 
                    position: 'relative',
                    background: activeView === 'floorplan' || activeView === 'blueprint' ? '#ffffff' : '#080c14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: activeView === 'floorplan' || activeView === 'blueprint' ? '12px' : '0'
                  }}
                >
                  <img 
                    src={
                      activeView === 'exterior' ? selectedModel.heroImage :
                      activeView === 'interior' ? selectedModel.interiorImage :
                      activeView === 'patio' ? selectedModel.patioImage :
                      activeView === 'floorplan' ? selectedModel.floorplanImage :
                      selectedModel.blueprintImage
                    } 
                    alt={selectedModel.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: activeView === 'floorplan' || activeView === 'blueprint' ? 'contain' : 'cover'
                    }}
                  />

                  {/* Gradient Overlay for Renders */}
                  {(activeView === 'exterior' || activeView === 'interior' || activeView === 'patio') && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(8,12,20,0.2) 0%, rgba(8,12,20,0.85) 100%)',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {/* Responsive View Switcher */}
                  <div className="view-switcher-container">
                    <button 
                      className="btn"
                      onClick={() => setActiveView('exterior')}
                      style={{
                        background: activeView === 'exterior' ? '#2563eb' : 'transparent',
                        color: '#ffffff'
                      }}
                    >
                      Exterior
                    </button>
                    <button 
                      className="btn"
                      onClick={() => setActiveView('interior')}
                      style={{
                        background: activeView === 'interior' ? '#2563eb' : 'transparent',
                        color: '#ffffff'
                      }}
                    >
                      Interior
                    </button>
                    <button 
                      className="btn"
                      onClick={() => setActiveView('patio')}
                      style={{
                        background: activeView === 'patio' ? '#2563eb' : 'transparent',
                        color: '#ffffff'
                      }}
                    >
                      Patio/Deck
                    </button>
                    <button 
                      className="btn"
                      onClick={() => setActiveView('floorplan')}
                      style={{
                        background: activeView === 'floorplan' ? '#10b981' : 'transparent',
                        color: '#ffffff',
                        fontWeight: 700
                      }}
                    >
                      📐 Plan
                    </button>
                    <button 
                      className="btn"
                      onClick={() => setActiveView('blueprint')}
                      style={{
                        background: activeView === 'blueprint' ? '#8b5cf6' : 'transparent',
                        color: '#ffffff'
                      }}
                    >
                      Blueprint
                    </button>
                  </div>

                  {/* Model Floating Badge */}
                  <div 
                    className="model-badge-overlay"
                    style={{ 
                      position: 'absolute', 
                      bottom: '16px', 
                      left: '16px', 
                      right: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end',
                      background: activeView === 'floorplan' || activeView === 'blueprint' ? 'rgba(15, 23, 42, 0.92)' : 'transparent',
                      padding: activeView === 'floorplan' || activeView === 'blueprint' ? '8px 12px' : '0',
                      borderRadius: '8px',
                      border: activeView === 'floorplan' || activeView === 'blueprint' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{selectedModel.dimensions}</span>
                        <span className="badge badge-green">{selectedModel.sqft} SQ FT</span>
                        {selectedModel.category === 'estate' ? (
                          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                            🚗 2-Car Garage &bull; 2 Bed / 2 Bath
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                            🏡 Backyard ADU
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '2px' }}>{selectedModel.name}</h2>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px' }}>{selectedModel.tagline}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passive Split</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>${calculations.homeownerMonthly}/mo</div>
                    </div>
                  </div>
                </div>

                {/* Footprint Category Filter */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  borderTop: '1px solid var(--border-subtle)',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Footprint:
                    </span>
                    <button
                      className="btn"
                      onClick={() => setModelCategoryFilter('all')}
                      style={{
                        padding: '3px 9px',
                        fontSize: '11px',
                        borderRadius: '20px',
                        background: modelCategoryFilter === 'all' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: modelCategoryFilter === 'all' ? '1px solid #3b82f6' : '1px solid transparent'
                      }}
                    >
                      All (9)
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        setModelCategoryFilter('compact');
                        if (selectedModel.category !== 'compact') setSelectedModelId('haven');
                      }}
                      style={{
                        padding: '3px 9px',
                        fontSize: '11px',
                        borderRadius: '20px',
                        background: modelCategoryFilter === 'compact' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: modelCategoryFilter === 'compact' ? '1px solid #3b82f6' : '1px solid transparent'
                      }}
                    >
                      🏡 Compact ADUs (5)
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        setModelCategoryFilter('estate');
                        if (selectedModel.category !== 'estate') setSelectedModelId('magnolia');
                      }}
                      style={{
                        padding: '3px 9px',
                        fontSize: '11px',
                        borderRadius: '20px',
                        background: modelCategoryFilter === 'estate' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: modelCategoryFilter === 'estate' ? '1px solid #10b981' : '1px solid transparent'
                      }}
                    >
                      🏰 Estate Homes & 2-Car Garage (4)
                    </button>
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {filteredModels.length} models
                  </span>
                </div>

                {/* Model Selector Strip */}
                <div className="model-selector-strip">
                  {filteredModels.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '6px',
                        background: selectedModelId === m.id ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: selectedModelId === m.id ? '1.5px solid #3b82f6' : '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: selectedModelId === m.id ? '#60a5fa' : '#ffffff' }}>{m.name}</div>
                      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>{m.sqft} sq ft</div>
                      {m.category === 'estate' && (
                        <div style={{ fontSize: '8px', color: '#34d399', fontWeight: 700, marginTop: '2px', letterSpacing: '-0.02em' }}>
                          🚗 2-CAR GARAGE
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrades & Architecture Highlights */}
              <div className="upgrades-grid">
                
                {/* Blueprint Highlights */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={15} color="#3b82f6" /> Blueprint Architectural Specs
                  </h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {selectedModel.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px', fontSize: '10.5px', color: '#93c5fd' }}>
                    <strong>Lot Minimum:</strong> Requires {selectedModel.minLotWidth}' parcel width for standard setback compliance.
                  </div>
                </div>

                {/* Interactive Upgrade Toggles */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={15} color="#f59e0b" /> Premium HaaS Upgrades
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                      <span>{selectedModel.category === 'estate' ? 'Dual Level-2 EV Garage Charger' : 'Rooftop Sky Lounge & Stairs'}</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.rooftopLounge}
                        onChange={(e) => setUpgrades(u => ({ ...u, rooftopLounge: e.target.checked }))}
                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                      <span>Solar PV + Tesla Powerwall</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.solarPowerwall}
                        onChange={(e) => setUpgrades(u => ({ ...u, solarPowerwall: e.target.checked }))}
                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                      <span>Scandinavian Luxury Finishes</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.scandinavianInterior}
                        onChange={(e) => setUpgrades(u => ({ ...u, scandinavianInterior: e.target.checked }))}
                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                      <span>Smart Keyless Security</span>
                      <input 
                        type="checkbox" 
                        checked={upgrades.smartAccess}
                        onChange={(e) => setUpgrades(u => ({ ...u, smartAccess: e.target.checked }))}
                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                      />
                    </label>

                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Financial ROI Engine */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="glass-panel" style={{ padding: '18px 16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-green">Zero-CapEx HaaS</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>30-Day Turnkey</span>
                </div>

                <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '12px' }}>Monthly Cash Flow Engine</h3>

                {/* Metro Selector */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Target Rental Metro</label>
                  <select 
                    value={selectedMetro.name}
                    onChange={(e) => {
                      const m = METROS.find(item => item.name === e.target.value);
                      if (m) setSelectedMetro(m);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0f172a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  >
                    {METROS.map(m => (
                      <option key={m.name} value={m.name} style={{ background: '#0f172a' }}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Big Metric Display */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '10.5px', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Homeowner Guaranteed Passive Split
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', margin: '2px 0' }}>
                    ${calculations.homeownerMonthly} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>/ mo</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ${(calculations.homeownerMonthly * 12).toLocaleString()} annual passive net revenue
                  </div>
                </div>

                {/* Breakdown List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Projected Gross Rent:</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>${calculations.monthlyGross} / mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Operator Net Cash Flow:</span>
                    <span style={{ fontWeight: 700, color: '#60a5fa' }}>${calculations.operatorMonthly} / mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>10-Year Cumulative Cash:</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>${calculations.tenYearHomeowner.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Est. Property Equity Boost:</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>+${calculations.propertyAppreciation.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Homeowner Upfront CapEx:</span>
                    <span style={{ fontWeight: 800, color: '#34d399' }}>$0.00 (Zero Out-of-Pocket)</span>
                  </div>
                </div>

                <button 
                  className="btn btn-emerald" 
                  style={{ width: '100%', padding: '11px', fontSize: '13px' }}
                  onClick={() => {
                    setLeadForm(l => ({ ...l, targetModel: selectedModel.id }));
                    setActiveTab('audit');
                  }}
                >
                  Reserve Model & Audit Yard <ArrowRight size={14} />
                </button>

              </div>

              {/* Quick Downloads Card */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '12.5px', color: '#ffffff', marginBottom: '8px' }}>Executive Marketing Assets</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <a href="/downloads/ADU_HaaS_Portfolio.pptx" download className="btn btn-secondary" style={{ fontSize: '11.5px', justifyContent: 'flex-start' }}>
                    <Download size={13} color="#3b82f6" /> Pitch Deck (.pptx)
                  </a>
                  <a href="/downloads/adu_marketing_catalog.pdf" download className="btn btn-secondary" style={{ fontSize: '11.5px', justifyContent: 'flex-start' }}>
                    <FileText size={13} color="#10b981" /> Color Brochure (.pdf)
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

                  <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div className="form-two-col">
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={leadForm.fullName}
                          onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                          placeholder="Jane Doe"
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="jane@example.com"
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-two-col">
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          placeholder="(310) 555-0199"
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Preferred Model</label>
                        <select 
                          value={leadForm.targetModel}
                          onChange={(e) => setLeadForm({ ...leadForm, targetModel: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            background: '#0f172a',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            outline: 'none'
                          }}
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
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Property Address</label>
                      <input 
                        type="text" 
                        required
                        value={leadForm.address}
                        onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div className="form-three-col">
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Side Yard Access</label>
                        <select 
                          value={leadForm.drivewayAccess}
                          onChange={(e) => setLeadForm({ ...leadForm, drivewayAccess: e.target.value })}
                          style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '11.5px' }}
                        >
                          <option>Wide Driveway (10ft+)</option>
                          <option>Standard Gate (5-9ft)</option>
                          <option>Overhead Crane Lift</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Electrical Panel</label>
                        <select 
                          value={leadForm.electricalPanel}
                          onChange={(e) => setLeadForm({ ...leadForm, electricalPanel: e.target.value })}
                          style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '11.5px' }}
                        >
                          <option>200 Amp (Modern)</option>
                          <option>100-150 Amp (Subpanel)</option>
                          <option>Unsure / Check</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Sewer / Water Distance</label>
                        <select 
                          value={leadForm.sewerDistance}
                          onChange={(e) => setLeadForm({ ...leadForm, sewerDistance: e.target.value })}
                          style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '11.5px' }}
                        >
                          <option>Under 50 ft</option>
                          <option>50 – 100 ft</option>
                          <option>100+ ft</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-emerald" style={{ padding: '12px', fontSize: '13.5px', marginTop: '6px' }}>
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '4px 0 16px 0', flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => setGalleryCategoryFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: galleryCategoryFilter === 'all' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: galleryCategoryFilter === 'all' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)'
                }}
              >
                🌟 All Models (9)
              </button>
              <button
                className="btn"
                onClick={() => setGalleryCategoryFilter('compact')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: galleryCategoryFilter === 'compact' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: galleryCategoryFilter === 'compact' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)'
                }}
              >
                🏡 Compact ADUs (300–435 sq ft)
              </button>
              <button
                className="btn"
                onClick={() => setGalleryCategoryFilter('estate')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: galleryCategoryFilter === 'estate' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: galleryCategoryFilter === 'estate' ? '1px solid #10b981' : '1px solid var(--border-subtle)'
                }}
              >
                🏰 Estate Homes & 2-Car Garage (1,000–1,013 sq ft)
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
