// Executive PDF & Deal Sheet Export Utility for Delisted CRM
// Formats corporate shell intelligence into a clean executive dossier for printing or PDF export.

export function generateExecutiveDossierHtml(issuer) {
  if (!issuer) return "";

  const shellBadgeColor = issuer.cleanShellScore >= 80 ? "#10b981" : "#f59e0b";
  const legalCounsel = typeof issuer.legalCounsel === "string" ? issuer.legalCounsel : (issuer.legalCounsel?.firmName || "Not Available");
  const auditor = typeof issuer.auditor === "string" ? issuer.auditor : (issuer.auditor?.firmName || "Not Available");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Executive Dossier - ${issuer.companyName} (${issuer.ticker || "OTC"})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; background: #fff; margin: 0; padding: 40px; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
    .subtitle { font-size: 14px; color: #64748b; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 13px; color: #fff; background: ${shellBadgeColor}; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
    .card h3 { font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 14px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 600; text-align: right; }
    .details-box { background: #f1f5f9; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 30px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${issuer.companyName}</h1>
      <p class="subtitle">Ticker: ${issuer.ticker || "OTC"} | CIK: ${issuer.cik || "N/A"} | Region: ${issuer.region || "US"}</p>
    </div>
    <div style="text-align: right;">
      <div class="badge">${issuer.shellRating || "Clean Shell"} (${issuer.cleanShellScore || 75}/100)</div>
      <p style="font-size: 12px; color: #64748b; margin-top: 6px;">Delisted: ${issuer.delistDate || "N/A"}</p>
    </div>
  </div>

  <div class="details-box">
    <strong>Filing Event & Overview:</strong><br>
    ${issuer.details || issuer.eventType || "SEC deregistration / exchange delisting event registered under federal securities statutes."}
  </div>

  <div class="grid">
    <div class="card">
      <h3>Corporate Identity & Securities</h3>
      <div class="row"><span class="label">Legal Entity:</span><span class="value">${issuer.companyName}</span></div>
      <div class="row"><span class="label">SEC CIK:</span><span class="value">${issuer.cik || "Not Disclosed"}</span></div>
      <div class="row"><span class="label">Trading Symbol:</span><span class="value">${issuer.ticker || "OTC"}</span></div>
      <div class="row"><span class="label">Exchange Transition:</span><span class="value">${issuer.exchange || "Delisted → OTC"}</span></div>
      <div class="row"><span class="label">Filing Form:</span><span class="value">${issuer.form || "15-12G"}</span></div>
      <div class="row"><span class="label">Jurisdiction:</span><span class="value">${issuer.location || "United States"}</span></div>
    </div>

    <div class="card">
      <h3>Executive & Legal Counsel</h3>
      <div class="row"><span class="label">Legal Counsel Firm:</span><span class="value">${legalCounsel}</span></div>
      <div class="row"><span class="label">Independent Auditor:</span><span class="value">${auditor}</span></div>
      <div class="row"><span class="label">Chief Executive:</span><span class="value">${issuer.ceo || "Not Available"}</span></div>
      <div class="row"><span class="label">Direct Contact Phone:</span><span class="value">${issuer.phone || "Not Available"}</span></div>
      <div class="row"><span class="label">Direct Contact Email:</span><span class="value">${issuer.email || "Not Available"}</span></div>
      <div class="row"><span class="label">CRM Lifecycle Status:</span><span class="value" style="text-transform: capitalize;">${issuer.status || "New"}</span></div>
      <div class="row"><span class="label">Clean Shell Score:</span><span class="value">${issuer.cleanShellScore || 75}/100</span></div>
    </div>
  </div>

  <div class="footer">
    <span>CONFIDENTIAL & PROPRIETARY — SOURCING INTELLIGENCE</span>
    <span>Generated: ${new Date().toLocaleDateString()} | Delisted CRM Database</span>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
}

export function exportExecutiveDossierPdf(issuer) {
  if (!issuer) return;
  const html = generateExecutiveDossierHtml(issuer);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
