/**
 * generate_adu_catalog_pdf.cjs
 * Generates an executive 4-page full-color ADU marketing catalog for Sierra, Meadow, and Cascade.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const OUTPUT_PDF = path.join(__dirname, '..', 's2a_modular_adu_marketing_catalog.pdf');
const DOWNLOADS_PDF = path.join(os.homedir(), 'Downloads', 's2a_modular_adu_marketing_catalog.pdf');
const ARTIFACT_PDF = '/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c/s2a_modular_adu_marketing_catalog.pdf';
const TEMP_HTML = path.join(__dirname, '..', 'cache', 'adu_catalog_temp.html');

const MEADOW_IMG = '/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c/meadow_rooftop_exterior_1788288596258.jpg';
const SIERRA_IMG = '/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c/sierra_loft_exterior_1788288332303.jpg';
const CASCADE_IMG = '/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c/cascade_adu_render_1788288784073.jpg';
const INTERIOR_IMG = '/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c/luxury_adu_interior_1788288353055.jpg';
const PATIO_IMG = '/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c/sierra_rear_patio_1788288802323.jpg';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>S2A Modular ADU & Tiny Home Collection - Marketing Catalog</title>
<style>
  @page {
    size: letter;
    margin: 14mm 16mm 16mm 16mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.45;
    font-size: 11px;
    margin: 0;
    padding: 0;
  }

  .header {
    border-bottom: 2px solid #0f172a;
    padding-bottom: 8px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .brand {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #2563eb;
  }

  h1 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin: 2px 0 0 0;
    letter-spacing: -0.5px;
  }

  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 8.5px;
  }

  .badge-primary { background: #dbeafe; color: #1e40af; }
  .badge-success { background: #dcfce7; color: #166534; }

  .hero-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    margin-bottom: 10px;
  }

  .spec-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #f8fafc;
    padding: 10px 12px;
  }

  .card-title {
    font-size: 12px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    display: flex;
    justify-content: space-between;
  }

  .kpi-row {
    display: flex;
    gap: 8px;
    margin-top: 6px;
  }

  .kpi-chip {
    flex: 1;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 5px;
    text-align: center;
  }

  .kpi-val {
    font-size: 13px;
    font-weight: 800;
    color: #2563eb;
  }

  .kpi-label {
    font-size: 7.5px;
    text-transform: uppercase;
    font-weight: 600;
    color: #64748b;
  }

  .page-break {
    page-break-after: always;
    break-after: page;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    color: #94a3b8;
    margin-top: 12px;
    padding-top: 6px;
    border-top: 1px solid #e2e8f0;
  }
</style>
</head>
<body>

  <!-- ==================== PAGE 1: MEADOW ==================== -->
  <div class="header">
    <div>
      <div class="brand">S2A Modular &bull; HaaS ADU Collection</div>
      <h1>The Meadow &bull; 435 Sq. Ft. Luxury Terrace ADU</h1>
    </div>
    <span class="badge badge-success">Flagship Entertainer</span>
  </div>

  <img src="file://${MEADOW_IMG}" class="hero-img" alt="Meadow ADU" />

  <div class="spec-grid">
    <div class="card">
      <div class="card-title"><span>Architectural Specifications</span> <span>15' &times; 31'-9"</span></div>
      <div>&bull; <strong>Living Area:</strong> 435 Sq. Ft. living footprint + full rooftop deck</div>
      <div>&bull; <strong>Ceiling & Lofts:</strong> Dual mezzanine lofts (sleeping + storage)</div>
      <div>&bull; <strong>Rooftop Access:</strong> Exterior architectural staircase with slatted privacy railing</div>
      <div>&bull; <strong>Exterior Design:</strong> Symmetrical facade, natural cedar wood, matte black trim</div>
      <div>&bull; <strong>Glazing:</strong> Oversized double-pane low-E black aluminum frame windows</div>
    </div>
    <div class="card">
      <div class="card-title"><span>HaaS Revenue & Yield Model</span> <span class="badge badge-primary">High Yield</span></div>
      <div class="kpi-row">
        <div class="kpi-chip">
          <div class="kpi-val">$2,600&ndash;$3,400</div>
          <div class="kpi-label">Est. Monthly Rent</div>
        </div>
        <div class="kpi-chip">
          <div class="kpi-val">$700&ndash;$1,000</div>
          <div class="kpi-label">Homeowner Net Split</div>
        </div>
        <div class="kpi-chip">
          <div class="kpi-val">100% Turnkey</div>
          <div class="kpi-label">Zero Upfront Cost</div>
        </div>
      </div>
      <div style="font-size: 8.5px; color: #64748b; margin-top: 8px;">
        *Calculated based on standard CA/FL/TX high-demand suburban metros with 92% annual occupancy rate.
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span>Ideal Lot & Homeowner Profile</span></div>
    <div>&bull; <strong>Lot Compatibility:</strong> Standard to wide parcels (50'+ lot width) with at least 5' rear/side setbacks.</div>
    <div>&bull; <strong>Use Cases:</strong> Premium executive mid-term corporate rental, travel nurse luxury suite, or high-ADR boutique Airbnb.</div>
  </div>

  <div class="footer">
    <span>S2A Modular ADU Collection &bull; Housing-as-a-Service (HaaS)</span>
    <span>Page 1 of 3</span>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 2: SIERRA ==================== -->
  <div class="header">
    <div>
      <div class="brand">S2A Modular &bull; HaaS ADU Collection</div>
      <h1>The Sierra &bull; 420 Sq. Ft. Modern Mono-Pitch Loft</h1>
    </div>
    <span class="badge badge-primary">Modern Shed Design</span>
  </div>

  <img src="file://${SIERRA_IMG}" class="hero-img" alt="Sierra ADU" />

  <div class="spec-grid">
    <div class="card">
      <div class="card-title"><span>Architectural Specifications</span> <span>14' &times; 31'-6"</span></div>
      <div>&bull; <strong>Living Area:</strong> 420 Sq. Ft. living area + covered front/rear decks</div>
      <div>&bull; <strong>Roofline:</strong> Modern high mono-pitch shed roof with clerestory transoms</div>
      <div>&bull; <strong>Great Room:</strong> Vaulted open-concept living, dining, and full kitchen</div>
      <div>&bull; <strong>Bedroom:</strong> Private ground-floor bedroom with double wardrobe closet</div>
      <div>&bull; <strong>Loft Space:</strong> Mezzanine sleeping/office loft open to Great Room below</div>
    </div>
    <div class="card">
      <div class="card-title"><span>HaaS Revenue & Yield Model</span> <span class="badge badge-primary">Stable Cash Flow</span></div>
      <div class="kpi-row">
        <div class="kpi-chip">
          <div class="kpi-val">$2,400&ndash;$3,100</div>
          <div class="kpi-label">Est. Monthly Rent</div>
        </div>
        <div class="kpi-chip">
          <div class="kpi-val">$600&ndash;$900</div>
          <div class="kpi-label">Homeowner Net Split</div>
        </div>
        <div class="kpi-chip">
          <div class="kpi-val">18&ndash;24 Mo</div>
          <div class="kpi-label">Operator Payback</div>
        </div>
      </div>
      <div style="font-size: 8.5px; color: #64748b; margin-top: 8px;">
        *Clerestory windows maximize natural light while maintaining complete homeowner backyard privacy.
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span>Ideal Lot & Homeowner Profile</span></div>
    <div>&bull; <strong>Lot Compatibility:</strong> Fits standard 45'+ width suburban yards with minimal 4' setback requirements.</div>
    <div>&bull; <strong>Use Cases:</strong> Long-term remote professional rental, primary residence in-law suite, or high-yield rental.</div>
  </div>

  <div class="footer">
    <span>S2A Modular ADU Collection &bull; Housing-as-a-Service (HaaS)</span>
    <span>Page 2 of 3</span>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 3: CASCADE ==================== -->
  <div class="header">
    <div>
      <div class="brand">S2A Modular &bull; HaaS ADU Collection</div>
      <h1>The Cascade &bull; 300 Sq. Ft. Ultra-Compact High-Yield</h1>
    </div>
    <span class="badge badge-success">Maximum Lot Fit (12' Width)</span>
  </div>

  <img src="file://${CASCADE_IMG}" class="hero-img" alt="Cascade ADU" />

  <div class="spec-grid">
    <div class="card">
      <div class="card-title"><span>Architectural Specifications</span> <span>12' &times; 27'-9"</span></div>
      <div>&bull; <strong>Living Area:</strong> 300 Sq. Ft. ultra-optimized living footprint</div>
      <div>&bull; <strong>Width:</strong> Slim 12-foot exterior profile engineered for narrow yards</div>
      <div>&bull; <strong>Rooftop Observation:</strong> Side steel ship ladder to private observation deck</div>
      <div>&bull; <strong>Interior Layout:</strong> Living/dining, kitchenette, bathroom, private bedroom + loft</div>
      <div>&bull; <strong>Logistics:</strong> Easy single-crane delivery over residential rooflines</div>
    </div>
    <div class="card">
      <div class="card-title"><span>HaaS Revenue & Yield Model</span> <span class="badge badge-success">Max ROI Density</span></div>
      <div class="kpi-row">
        <div class="kpi-chip">
          <div class="kpi-val">$1,650&ndash;$2,100</div>
          <div class="kpi-label">Est. Monthly Rent</div>
        </div>
        <div class="kpi-chip">
          <div class="kpi-val">$500&ndash;$750</div>
          <div class="kpi-label">Homeowner Net Split</div>
        </div>
        <div class="kpi-chip">
          <div class="kpi-val">95% Fit</div>
          <div class="kpi-label">Residential Parcels</div>
        </div>
      </div>
      <div style="font-size: 8.5px; color: #64748b; margin-top: 8px;">
        *Lowest manufacturing and installation cost footprint with highest density ROI.
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span>Interior Living & Seamless Outdoor Patios</span></div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
      <img src="file://${INTERIOR_IMG}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 4px;" alt="Interior" />
      <img src="file://${PATIO_IMG}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 4px;" alt="Patio" />
    </div>
  </div>

  <div class="footer">
    <span>S2A Modular ADU Collection &bull; Housing-as-a-Service (HaaS)</span>
    <span>Page 3 of 3</span>
  </div>

</body>
</html>`;

fs.writeFileSync(TEMP_HTML, htmlContent, 'utf8');

console.log('Rendering 3-page full-color ADU marketing catalog via headless Google Chrome...');

try {
  execSync(`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --print-to-pdf-no-header --print-to-pdf="${OUTPUT_PDF}" "${TEMP_HTML}"`, { stdio: 'inherit' });
  
  // Copy to brain artifact directory and user's Downloads folder
  fs.copyFileSync(OUTPUT_PDF, ARTIFACT_PDF);
  fs.copyFileSync(OUTPUT_PDF, DOWNLOADS_PDF);

  console.log(`Catalog PDF successfully generated:\n- Workspace: ${OUTPUT_PDF}\n- Downloads: ${DOWNLOADS_PDF}\n- Brain Artifact: ${ARTIFACT_PDF}`);
  const stats = fs.statSync(OUTPUT_PDF);
  console.log(`PDF Size: ${(stats.size / 1024).toFixed(1)} KB`);
} catch (err) {
  console.error('Error generating PDF:', err);
  process.exit(1);
}
