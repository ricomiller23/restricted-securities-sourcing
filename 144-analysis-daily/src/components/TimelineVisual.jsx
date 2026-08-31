import React from 'react';

export default function TimelineVisual({ acquiredDate, eligibleDate, approxSaleDate, status, isConvertible }) {
  const getDaysDiff = (d1, d2) => {
    const t1 = new Date(d1);
    const t2 = new Date(d2);
    if (isNaN(t1) || isNaN(t2)) return null;
    return Math.ceil((t2 - t1) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  let percentComplete = 100;
  let daysRemaining = 0;
  let timelineLabel = "Holding Period Completed";

  if (acquiredDate && eligibleDate) {
    const acqTime = new Date(acquiredDate).getTime();
    const eligTime = new Date(eligibleDate).getTime();
    const nowTime = today.getTime();

    const totalDuration = eligTime - acqTime;
    const elapsed = nowTime - acqTime;

    if (totalDuration > 0) {
      percentComplete = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
      daysRemaining = getDaysDiff(todayStr, eligibleDate);
      if (daysRemaining > 0) {
        timelineLabel = `${daysRemaining} days remaining in holding period`;
      } else {
        timelineLabel = `6-month holding period met (Unrestricted)`;
      }
    }
  }

  // Calculate Sale Window progress
  let saleWindowActive = false;
  let saleWindowLabel = "Unavailable";
  let saleWindowPercent = 0;

  if (approxSaleDate) {
    const saleStart = new Date(approxSaleDate);
    const saleEnd = new Date(approxSaleDate);
    saleEnd.setMonth(saleEnd.getMonth() + 3);

    const totalSaleWindow = saleEnd.getTime() - saleStart.getTime();
    const elapsedSale = today.getTime() - saleStart.getTime();

    if (today >= saleStart && today <= saleEnd) {
      saleWindowActive = true;
      saleWindowPercent = Math.max(0, Math.min(100, (elapsedSale / totalSaleWindow) * 100));
      const daysLeft = getDaysDiff(todayStr, saleEnd.toISOString().split('T')[0]);
      saleWindowLabel = `Active (${daysLeft} days left to sell)`;
    } else if (today < saleStart) {
      const daysToStart = getDaysDiff(todayStr, approxSaleDate);
      saleWindowLabel = `Starts in ${daysToStart} days`;
    } else {
      saleWindowLabel = "Expired (3-mo window passed)";
    }
  } else {
    saleWindowLabel = "Filing Date + 3 Months (Immediate)";
  }

  return (
    <div className="timeline-visual-card">
      <div className="timeline-section-header">
        <h4 className="timeline-title">
          {isConvertible ? "⛓️ Convertible Holding Timeline" : "📋 Rule 144 Sale Eligibility"}
        </h4>
        <span className={`status-badge-timeline ${percentComplete >= 100 ? 'status-eligible' : 'status-pending'}`}>
          {status}
        </span>
      </div>

      {acquiredDate ? (
        <div className="timeline-tracker">
          {/* Holding Period Bar */}
          <div className="tracker-row">
            <div className="tracker-labels">
              <span>Acquisition Date: <strong>{formatDate(acquiredDate)}</strong></span>
              <span>Eligibility Date: <strong>{formatDate(eligibleDate)}</strong></span>
            </div>
            <div className="progress-container-timeline">
              <div 
                className="progress-bar-timeline" 
                style={{ 
                  width: `${percentComplete}%`,
                  background: percentComplete >= 100 
                    ? 'linear-gradient(90deg, var(--emerald-glow-start), var(--emerald-glow-end))'
                    : 'linear-gradient(90deg, var(--accent-gold-start), var(--accent-gold-end))'
                }}
              />
              <span className="progress-percentage-label">{Math.round(percentComplete)}%</span>
            </div>
            <div className="tracker-meta">
              <span>{timelineLabel}</span>
            </div>
          </div>

          {/* Sale Window Bar */}
          {approxSaleDate && (
            <div className="tracker-row" style={{ marginTop: '16px' }}>
              <div className="tracker-labels">
                <span>Sale Window Opens: <strong>{formatDate(approxSaleDate)}</strong></span>
                <span>Sale Window Closes: <strong>{formatDate(new Date(new Date(approxSaleDate).setMonth(new Date(approxSaleDate).getMonth() + 3)).toISOString().split('T')[0])}</strong></span>
              </div>
              <div className="progress-container-timeline">
                <div 
                  className="progress-bar-timeline" 
                  style={{ 
                    width: `${saleWindowPercent || (saleWindowActive ? 100 : 0)}%`,
                    background: saleWindowActive 
                      ? 'linear-gradient(90deg, var(--accent-cyan-start), var(--accent-cyan-end))'
                      : 'rgba(255,255,255,0.06)'
                  }}
                />
                {saleWindowActive && <span className="progress-percentage-label">{Math.round(saleWindowPercent)}%</span>}
              </div>
              <div className="tracker-meta">
                <span className={saleWindowActive ? 'text-cyan' : 'text-muted'}>
                  📅 Sale Status: <strong>{saleWindowLabel}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="timeline-empty-state">
          <p>⚠️ No acquisition date reported. Rule 144 sale window is active for 3 months from filing or approximate sale date.</p>
          <div className="tracker-row">
            <div className="tracker-labels">
              <span>Approx Sale Date: <strong>{formatDate(approxSaleDate)}</strong></span>
            </div>
            <div className="tracker-meta" style={{ marginTop: '8px' }}>
              <span>🕒 Sale Window: <strong>{saleWindowLabel}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
