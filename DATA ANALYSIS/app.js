/* ============================================================
   WILDBERRIES INTELLIGENCE DASHBOARD — app.js
   ============================================================ */

// ─── DATA ────────────────────────────────────────────────────
const DESTROYED_FACILITIES = [
    { name: 'Elektrostal', region: 'Moscow Oblast', lat: 55.784, lng: 38.446, date: 'Jul 18', distFromUkraine: 750, sqm: 85000, injuries: 24 },
    { name: 'Kotovsk (Tambov)', region: 'Tambov Oblast', lat: 52.586, lng: 41.504, date: 'Jul 18', distFromUkraine: 580, sqm: 45000, injuries: 0 },
    { name: 'Koledino/Podolsk', region: 'Moscow Oblast', lat: 55.381, lng: 37.555, date: 'Jul 20', distFromUkraine: 720, sqm: 120000, injuries: 0 },
    { name: 'Krasnodar', region: 'Krasnodar Krai', lat: 45.035, lng: 38.975, date: 'Jul 22', distFromUkraine: 650, sqm: 55000, injuries: 0 },
    { name: 'Nevinnomyssk', region: 'Stavropol Krai', lat: 44.631, lng: 41.946, date: 'Jul 22', distFromUkraine: 720, sqm: 35000, injuries: 0 },
    { name: 'Shushary', region: 'St. Petersburg', lat: 59.784, lng: 30.445, date: 'Jul 24', distFromUkraine: 1050, sqm: 95000, injuries: 3 },
    { name: 'Crimea', region: 'Occupied Crimea', lat: 44.952, lng: 34.102, date: 'Jul 25', distFromUkraine: 250, sqm: 20000, injuries: 0 },
    { name: 'Tyushevo', region: 'Ryazan Oblast', lat: 54.619, lng: 39.741, date: 'Jul 29', distFromUkraine: 680, sqm: 40000, injuries: 0 },
    { name: 'Penza', region: 'Penza Oblast', lat: 53.195, lng: 45.018, date: 'Jul 30', distFromUkraine: 850, sqm: 50000, injuries: 0 },
    { name: 'Sarapul', region: 'Udmurtia', lat: 56.479, lng: 53.797, date: 'Jul 30', distFromUkraine: 1500, sqm: 30000, injuries: 0 },
    { name: 'Volgograd', region: 'Volgograd Oblast', lat: 48.708, lng: 44.513, date: 'Jul 31', distFromUkraine: 500, sqm: 60000, injuries: 0 },
    { name: 'Novosaratovka', region: 'Leningrad Oblast', lat: 59.865, lng: 30.565, date: 'Aug 1', distFromUkraine: 1060, sqm: 40000, injuries: 2 },
    { name: 'Krasny Bor', region: 'Leningrad Oblast', lat: 59.649, lng: 30.691, date: 'Aug 2', distFromUkraine: 1040, sqm: 35000, injuries: 0 },
    { name: 'Chekhov', region: 'Moscow Oblast', lat: 55.147, lng: 37.457, date: 'Aug 3', distFromUkraine: 700, sqm: 30000, injuries: 0 },
    { name: 'Samara', region: 'Samara Oblast', lat: 53.195, lng: 50.100, date: 'Aug 4', distFromUkraine: 1100, sqm: 55000, injuries: 0 },
    { name: 'Aleksin', region: 'Tula Oblast', lat: 54.504, lng: 37.069, date: 'Aug 5', distFromUkraine: 600, sqm: 70000, injuries: 1 },
    { name: 'Emmaus', region: 'Tver Oblast', lat: 56.791, lng: 35.865, date: 'Aug 5', distFromUkraine: 850, sqm: 25000, injuries: 0 },
    { name: 'Voronezh', region: 'Voronezh Oblast', lat: 51.660, lng: 39.200, date: 'Aug 6', distFromUkraine: 350, sqm: 45000, injuries: 0 },
    { name: 'Yekaterinburg', region: 'Sverdlovsk Oblast', lat: 56.838, lng: 60.597, date: 'Aug 7', distFromUkraine: 2095, sqm: 75000, injuries: 0 },
];

const OPERATIONAL_HUBS = [
    { name: 'Novosibirsk Hub', lat: 55.008, lng: 82.935, sqm: 90000 },
    { name: 'Vladivostok Center', lat: 43.115, lng: 131.885, sqm: 35000 },
    { name: 'Omsk Hub', lat: 54.991, lng: 73.365, sqm: 50000 },
    { name: 'Kazan Hub', lat: 55.796, lng: 49.106, sqm: 65000 },
    { name: 'Rostov-on-Don', lat: 47.236, lng: 39.713, sqm: 45000 },
    { name: 'Nizhny Novgorod', lat: 56.296, lng: 44.000, sqm: 55000 },
    { name: 'Krasnoyarsk', lat: 56.010, lng: 92.852, sqm: 40000 },
    { name: 'Chelyabinsk', lat: 55.160, lng: 61.400, sqm: 50000 },
    { name: 'Ufa', lat: 54.735, lng: 55.958, sqm: 45000 },
    { name: 'Irkutsk', lat: 52.297, lng: 104.296, sqm: 30000 },
];

const UKRAINE_CENTER = { lat: 48.379, lng: 31.166 };

const SCENARIO_DATA = {
    moderate:       [100, 78, 70, 65, 60, 55, 52, 50, 48, 46, 44, 43],
    aggressive:     [100, 78, 62, 50, 40, 32, 25, 20, 16, 13, 10, 8],
    'de-escalation': [100, 78, 76, 75, 76, 78, 80, 82, 84, 86, 88, 90]
};

const SCENARIO_SUMMARIES = {
    moderate: 'Continued strikes at current pace. Capacity stabilizes around 43–45% by mid-2027 as Wildberries reroutes and builds new facilities, but recovery is slow due to financial constraints and ongoing vulnerability.',
    aggressive: 'Escalated campaign with expanded drone range. Capacity collapses below 10% by mid-2027, effectively destroying Wildberries as a viable logistics platform. Triggers state bailout or restructuring.',
    'de-escalation': 'Strike frequency decreases due to ceasefire/negotiations. Wildberries begins recovery with new partner facilities. Capacity returns to ~90% by mid-2027 but with geographic redistribution eastward.'
};

const SCENARIO_COLORS = {
    moderate:       { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.3)' },
    aggressive:     { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.3)' },
    'de-escalation': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.3)' }
};

const allCharts = [];

// ─── HELPERS ─────────────────────────────────────────────────
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function makeGradient(ctx, c1, c2, horizontal) {
    const g = horizontal
        ? ctx.createLinearGradient(0, 0, ctx.canvas.width || 400, 0)
        : ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 300);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
}

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // 1 ── Loading screen → reveal app
    const loader = $('#loader');
    const app    = $('#app');
    if (loader && app) {
        setTimeout(() => {
            loader.style.transition = 'opacity 0.4s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                app.classList.remove('hidden');
                // Reveal all animated elements
                runScrollAnimations();
                animateCounters();
            }, 400);
        }, 1200);
    }

    // 2 ── Tab navigation
    $$('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            $$('.nav-tab').forEach(t => t.classList.remove('active'));
            $$('.tab-panel').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const panel = document.getElementById('tab-' + target);
            if (panel) {
                panel.classList.add('active');
                // Ensure all items inside active panel are visible
                panel.querySelectorAll('[data-animate="fade-up"]').forEach(el => {
                    el.classList.add('is-visible');
                    el.classList.add('in-view');
                });
            }

            // Map needs invalidateSize when shown
            if (target === 'map' && window.facilityMap) {
                setTimeout(() => window.facilityMap.invalidateSize(), 100);
            }

            // Trigger chart resize & redraw on tab switch
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                allCharts.forEach(c => {
                    try {
                        c.resize();
                        c.update();
                    } catch(e) {}
                });
            }, 80);
        });
    });

    // 3 ── Counter animation
    function animateCounters() {
        $$('.counter').forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;
            const duration = 1500;
            const t0 = performance.now();

            (function tick(now) {
                const p = Math.min((now - t0) / duration, 1);
                el.textContent = Math.floor(p * target);
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            })(t0);
        });
    }

    // 4 ── Scroll-in animations
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                e.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.01 });

    function runScrollAnimations() {
        $$('[data-animate="fade-up"]').forEach(el => {
            el.classList.add('is-visible');
            el.classList.add('in-view');
            observer.observe(el);
        });
    }

    // ─── CHARTS ──────────────────────────────────────────────
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    // Global defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = 'rgba(255,255,255,0.75)';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15,23,42,0.95)';
    Chart.defaults.plugins.tooltip.titleColor = '#fff';
    Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;

    // Center-text plugin for doughnuts
    Chart.register({
        id: 'centerText',
        beforeDraw(chart) {
            const c = chart.config.options?.plugins?.centerText;
            if (!c) return;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const { left, right, top, bottom } = chartArea;
            ctx.save();
            ctx.font = `bold ${c.size || 32}px 'JetBrains Mono', monospace`;
            ctx.fillStyle = c.color || '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.text, (left + right) / 2, (top + bottom) / 2);
            ctx.restore();
        }
    });

    // a ── Capacity gauge
    buildChart('capacityGauge', {
        type: 'doughnut',
        data: {
            labels: ['Operational', 'Destroyed'],
            datasets: [{ data: [78, 22], backgroundColor: ['#10B981', '#EF4444'], borderWidth: 0 }]
        },
        options: {
            cutout: '75%',
            plugins: {
                legend: { display: false },
                centerText: { text: '78%', color: '#fff', size: 36 },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` }
                }
            }
        }
    });

    // b ── Strikes by region
    buildChart('regionChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: ['Moscow Oblast', 'Leningrad Oblast', 'Krasnodar/Stavropol', 'Tula/Tver', 'Volga Region', 'Urals', 'Southern/Crimea', 'Central'],
            datasets: [{
                label: 'Facilities Hit',
                data: [4, 3, 2, 2, 3, 2, 2, 2],
                backgroundColor: makeGradient(ctx, '#8b5cf6', '#ec4899', true),
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { grid: { display: false } }
            }
        }
    }));

    // c ── Strike frequency
    buildChart('strikeFrequencyChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: ['Week 1 (Jul 18–24)', 'Week 2 (Jul 25–31)', 'Week 3 (Aug 1–7)'],
            datasets: [
                {
                    type: 'line', label: 'Trend', order: 0,
                    data: [6, 5, 9],
                    borderColor: '#fbbf24', borderWidth: 2,
                    pointBackgroundColor: '#fbbf24', pointRadius: 5,
                    tension: 0.3, fill: false
                },
                {
                    type: 'bar', label: 'Strikes', order: 1,
                    data: [6, 5, 9],
                    backgroundColor: makeGradient(ctx, '#ef4444', '#f97316'),
                    borderRadius: 6
                }
            ]
        },
        options: {
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, ticks: { stepSize: 2 }, grid: { color: 'rgba(255,255,255,0.04)' } }
            }
        }
    }));

    // d ── Market share
    buildChart('marketShareChart', {
        type: 'bar',
        data: {
            labels: ['Pre-Strike', 'Current (Aug 2026)', 'Projected Q4 2026'],
            datasets: [
                { label: 'Wildberries', data: [46, 38, 32], backgroundColor: '#8b5cf6' },
                { label: 'Ozon',        data: [31, 36, 40], backgroundColor: '#3b82f6' },
                { label: 'Others',      data: [23, 26, 28], backgroundColor: '#475569' }
            ]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { stacked: true, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { stacked: true, grid: { display: false } }
            },
            plugins: {
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}%` } }
            }
        }
    });

    // e ── Cumulative strikes
    {
        const uniqueDates = [...new Set(DESTROYED_FACILITIES.map(f => f.date))];
        let hitCount = 0, sqmCount = 0;
        const cumHits = [], cumSqm = [];
        uniqueDates.forEach(d => {
            const day = DESTROYED_FACILITIES.filter(f => f.date === d);
            hitCount += day.length;
            sqmCount += day.reduce((s, f) => s + f.sqm, 0);
            cumHits.push(hitCount);
            cumSqm.push(+(sqmCount / 100000).toFixed(1));
        });

        buildChart('cumulativeChart', (ctx) => ({
            type: 'line',
            data: {
                labels: uniqueDates,
                datasets: [
                    {
                        label: 'Cumulative Facilities Hit',
                        data: cumHits,
                        borderColor: '#ef4444', borderWidth: 3,
                        backgroundColor: makeGradient(ctx, 'rgba(239,68,68,0.35)', 'rgba(239,68,68,0)'),
                        fill: true, tension: 0.3, yAxisID: 'y',
                        pointBackgroundColor: '#ef4444', pointRadius: 4
                    },
                    {
                        label: 'Sq/m Destroyed (×100k)',
                        data: cumSqm,
                        borderColor: '#f97316', borderWidth: 2, borderDash: [6, 4],
                        fill: false, tension: 0.3, yAxisID: 'y1',
                        pointBackgroundColor: '#f97316', pointRadius: 3
                    }
                ]
            },
            options: {
                scales: {
                    y:  { position: 'left',  title: { display: true, text: 'Facilities', color: '#ef4444' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    y1: { position: 'right', title: { display: true, text: '×100k sq/m', color: '#f97316' }, grid: { drawOnChartArea: false } },
                    x:  { grid: { display: false } }
                }
            }
        }));
    }

    // f ── Strike distance over time
    {
        const labels = DESTROYED_FACILITIES.map(f => f.date);
        const dists  = DESTROYED_FACILITIES.map(f => f.distFromUkraine);
        const colors = dists.map(d => d > 1500 ? '#ef4444' : d > 900 ? '#f97316' : '#eab308');

        buildChart('distanceOverTimeChart', {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Distance from Ukraine (km)',
                    data: dists,
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                scales: {
                    y: { title: { display: true, text: 'km' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    x: { grid: { display: false }, ticks: { maxRotation: 45 } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: (ctx) => {
                                const f = DESTROYED_FACILITIES[ctx.dataIndex];
                                return f ? `${f.name} (${f.region})` : '';
                            }
                        }
                    }
                }
            }
        });
    }

    // g ── Capacity erosion
    buildChart('capacityErosionChart', (ctx) => ({
        type: 'line',
        data: {
            labels: ['Jul 18', 'Jul 22', 'Jul 25', 'Jul 31', 'Aug 3', 'Aug 7', 'Sep 1 (proj)', 'Oct 1 (proj)'],
            datasets: [{
                label: 'Remaining Capacity %',
                data: [100, 95, 91, 85, 81, 78, 72, 65],
                borderColor: '#ef4444', borderWidth: 3,
                backgroundColor: makeGradient(ctx, 'rgba(239,68,68,0.3)', 'rgba(239,68,68,0)'),
                fill: true, tension: 0.35,
                pointBackgroundColor: '#ef4444', pointRadius: 5,
                segment: { borderDash: ctx2 => ctx2.p0DataIndex >= 5 ? [6, 4] : undefined }
            }]
        },
        options: {
            scales: {
                y: { min: 50, max: 105, title: { display: true, text: '%' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    }));

    // h ── Financial breakdown
    buildChart('financialBreakdownChart', {
        type: 'doughnut',
        data: {
            labels: ['Warehouse Damage ₽80B', 'Inventory Losses ₽60B', 'Seller Losses ₽40B', 'Supply Chain ₽20B'],
            datasets: [{
                data: [80, 60, 40, 20],
                backgroundColor: ['#ef4444', '#f97316', '#a855f7', '#3b82f6'],
                borderWidth: 0, hoverOffset: 8
            }]
        },
        options: {
            cutout: '55%',
            plugins: {
                centerText: { text: '₽200B', color: '#fff', size: 28 },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ₽${ctx.raw}B` } }
            }
        }
    });

    // i ── Ripple effect
    buildChart('rippleEffectChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: ['Delivery Delays', 'Consumer Impact', 'Banking Exposure', 'Seller Exodus', 'State Budget Strain', 'Inflation Pressure'],
            datasets: [{
                label: 'Impact Score',
                data: [85, 80, 75, 70, 65, 60],
                backgroundColor: makeGradient(ctx, '#f97316', '#ef4444', true),
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { max: 100, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    }));

    // j ── Projections (switchable scenarios)
    {
        const months = ['Jul 26','Aug 26','Sep 26','Oct 26','Nov 26','Dec 26','Jan 27','Feb 27','Mar 27','Apr 27','May 27','Jun 27'];

        const projChart = buildChart('projectionChart', (ctx) => ({
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Remaining Capacity %',
                    data: SCENARIO_DATA.moderate,
                    borderColor: SCENARIO_COLORS.moderate.border,
                    backgroundColor: SCENARIO_COLORS.moderate.bg,
                    fill: true, tension: 0.4, borderWidth: 3,
                    pointBackgroundColor: SCENARIO_COLORS.moderate.border,
                    pointRadius: 4
                }]
            },
            options: {
                scales: {
                    y: { min: 0, max: 105, title: { display: true, text: 'Capacity %' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    x: { grid: { display: false } }
                }
            }
        }));

        const summaryEl = $('#projectionSummary');
        if (summaryEl) summaryEl.textContent = SCENARIO_SUMMARIES.moderate;

        // Scenario buttons interactivity
        $$('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.scenario-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const s = btn.dataset.scenario;
                if (projChart) {
                    const ds = projChart.data.datasets[0];
                    ds.data = SCENARIO_DATA[s];
                    ds.borderColor = SCENARIO_COLORS[s].border;
                    ds.backgroundColor = SCENARIO_COLORS[s].bg;
                    ds.pointBackgroundColor = SCENARIO_COLORS[s].border;
                    projChart.update();
                }

                if (summaryEl) summaryEl.textContent = SCENARIO_SUMMARIES[s];
            });
        });
    }

    // k ── Drone range expansion
    buildChart('droneRangeChart', (ctx) => ({
        type: 'line',
        data: {
            labels: ['2022', '2023', '2024', '2025', 'Mid 2026', 'Late 2026', '2027 (proj)'],
            datasets: [{
                label: 'Max Drone Range (km)',
                data: [300, 700, 1000, 1500, 3000, 4000, 7500],
                borderColor: '#10b981', borderWidth: 3,
                backgroundColor: makeGradient(ctx, 'rgba(16,185,129,0.3)', 'rgba(16,185,129,0)'),
                fill: true, tension: 0.35,
                pointBackgroundColor: '#10b981', pointRadius: 5
            },
            { label: 'Moscow (750km)', data: Array(7).fill(750), borderColor: 'rgba(255,255,255,0.25)', borderDash: [4, 4], borderWidth: 1, pointRadius: 0, fill: false },
            { label: 'St. Petersburg (1050km)', data: Array(7).fill(1050), borderColor: 'rgba(255,255,255,0.2)', borderDash: [4, 4], borderWidth: 1, pointRadius: 0, fill: false },
            { label: 'Yekaterinburg (2095km)', data: Array(7).fill(2095), borderColor: 'rgba(255,255,255,0.15)', borderDash: [4, 4], borderWidth: 1, pointRadius: 0, fill: false },
            { label: 'Novosibirsk (3200km)', data: Array(7).fill(3200), borderColor: 'rgba(255,255,255,0.1)', borderDash: [4, 4], borderWidth: 1, pointRadius: 0, fill: false }
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: 'Range (km)' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { labels: { filter: item => item.datasetIndex === 0 } }
            }
        }
    }));

    // l ── GDP impact
    buildChart('gdpImpactChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: ['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'],
            datasets: [
                {
                    type: 'line', label: 'Systemic Risk Multiplier', order: 0,
                    data: [0.15, 0.25, 0.20, 0.12],
                    borderColor: '#fbbf24', borderWidth: 2,
                    pointBackgroundColor: '#fbbf24', pointRadius: 5,
                    yAxisID: 'y1', fill: false
                },
                {
                    type: 'bar', label: 'Direct Losses (% of GDP)', order: 1,
                    data: [0.05, 0.08, 0.06, 0.04],
                    backgroundColor: makeGradient(ctx, '#f43f5e', '#8b5cf6'),
                    borderRadius: 6, yAxisID: 'y'
                }
            ]
        },
        options: {
            scales: {
                y:  { position: 'left',  title: { display: true, text: '% of GDP' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y1: { position: 'right', title: { display: true, text: 'Risk Multiplier' }, grid: { drawOnChartArea: false } },
                x:  { grid: { display: false } }
            }
        }
    }));

    // ─── LEAFLET MAP ─────────────────────────────────────────
    initMap();

    // ─── TIMELINE ────────────────────────────────────────────
    buildTimeline();

    // ─── VULNERABILITY MATRIX ────────────────────────────────
    buildVulnerabilityMatrix();

}); // end DOMContentLoaded

// ═══════════════════════════════════════════════════════════════
// HELPER: build a chart with null-safety and tracking
// ═══════════════════════════════════════════════════════════════
function buildChart(id, configOrFn) {
    const el = document.getElementById(id);
    if (!el) return null;
    const ctx = el.getContext('2d');
    const cfg = typeof configOrFn === 'function' ? configOrFn(ctx) : configOrFn;
    cfg.options = cfg.options || {};
    cfg.options.responsive = true;
    cfg.options.maintainAspectRatio = false;
    const chart = new Chart(ctx, cfg);
    allCharts.push(chart);
    return chart;
}

// ═══════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════
function initMap() {
    const el = document.getElementById('facilityMap');
    if (!el || typeof L === 'undefined') return;

    const map = L.map('facilityMap', {
        center: [55, 50],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true
    });
    window.facilityMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18
    }).addTo(map);

    // Destroyed facilities — red markers
    DESTROYED_FACILITIES.forEach(f => {
        const popup = `
            <div style="font-family:Inter,sans-serif; color:#1e293b; min-width:180px;">
                <div style="font-weight:700; font-size:14px; margin-bottom:4px;">${f.name}</div>
                <div style="color:#64748b; font-size:12px; margin-bottom:6px;">${f.region}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:12px;">
                    <span><b>Date:</b> ${f.date}</span>
                    <span><b>Injuries:</b> ${f.injuries}</span>
                    <span><b>Sq/m:</b> ${f.sqm.toLocaleString()}</span>
                    <span><b>Dist:</b> ${f.distFromUkraine} km</span>
                </div>
            </div>`;
        L.circleMarker([f.lat, f.lng], {
            radius: 7, fillColor: '#ef4444', color: '#fff',
            weight: 1.5, opacity: 1, fillOpacity: 0.85
        }).addTo(map).bindPopup(popup);
    });

    // Operational hubs — green
    OPERATIONAL_HUBS.forEach(h => {
        L.circleMarker([h.lat, h.lng], {
            radius: 6, fillColor: '#10b981', color: '#fff',
            weight: 1.5, opacity: 1, fillOpacity: 0.8
        }).addTo(map).bindPopup(`
            <div style="font-family:Inter,sans-serif; color:#1e293b;">
                <div style="font-weight:700;">${h.name}</div>
                <div style="font-size:12px;">Sq/m: ${h.sqm.toLocaleString()}</div>
                <div style="font-size:12px; color:#10b981; font-weight:600;">✓ Operational</div>
            </div>
        `);
    });

    // Ukraine origin
    L.circleMarker([UKRAINE_CENTER.lat, UKRAINE_CENTER.lng], {
        radius: 9, fillColor: '#3b82f6', color: '#fff',
        weight: 2, fillOpacity: 1
    }).addTo(map).bindPopup('<div style="font-family:Inter;color:#1e293b;font-weight:700;">🇺🇦 Ukraine — Est. Launch Area</div>');

    // Drone range circles
    L.circle([UKRAINE_CENTER.lat, UKRAINE_CENTER.lng], {
        radius: 3000000, color: '#3b82f6', dashArray: '10, 8',
        fill: true, fillColor: '#3b82f6', fillOpacity: 0.04,
        weight: 2, opacity: 0.5
    }).addTo(map).bindPopup('Current drone range: 3,000 km');

    L.circle([UKRAINE_CENTER.lat, UKRAINE_CENTER.lng], {
        radius: 4000000, color: '#eab308', dashArray: '6, 10',
        fill: true, fillColor: '#eab308', fillOpacity: 0.02,
        weight: 1.5, opacity: 0.35
    }).addTo(map).bindPopup('Projected range (late 2026): 4,000 km');
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════════
function buildTimeline() {
    const container = document.getElementById('timelineEvents');
    if (!container) return;

    container.innerHTML = DESTROYED_FACILITIES.map(f => `
        <div class="timeline-event">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${f.date}, 2026</div>
            <div class="timeline-title">${f.name} — ${f.region}</div>
            <div class="timeline-detail">
                ${f.sqm.toLocaleString()} sq/m destroyed
                ${f.injuries > 0 ? ` · <span style="color:#ef4444;">${f.injuries} injuries</span>` : ''}
                 · ${f.distFromUkraine.toLocaleString()} km from Ukraine
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════
// VULNERABILITY MATRIX
// ═══════════════════════════════════════════════════════════════
function buildVulnerabilityMatrix() {
    const container = document.getElementById('vulnerabilityMatrix');
    if (!container) return;

    const factors = [
        { name: 'Strategic Importance', score: 90, note: 'Controls 46% of Russian e-commerce' },
        { name: 'Geographic Exposure', score: 85, note: '85% of facilities within drone range' },
        { name: 'Consumer Dependency', score: 80, note: 'Substitute for physical retail in many regions' },
        { name: 'Operational Adaptability', score: 55, note: 'Rerouting capacity but constrained' },
        { name: 'Infrastructure Redundancy', score: 40, note: 'Limited backup capacity' },
        { name: 'Air Defense Coverage', score: 35, note: 'Civilian infrastructure largely unprotected' },
        { name: 'Financial Resilience', score: 25, note: '₽1.3T debt, potential insolvency' },
    ];

    container.innerHTML = factors.map(f => {
        const inverted = ['Air Defense Coverage', 'Infrastructure Redundancy', 'Financial Resilience'].includes(f.name);
        const riskScore = inverted ? (100 - f.score) : f.score;
        const color = riskScore > 70 ? '#ef4444' : riskScore > 50 ? '#f97316' : riskScore > 30 ? '#eab308' : '#10b981';

        return `
            <div style="margin-bottom: 16px;">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                    <span style="color:#e2e8f0; font-size:0.9rem; font-weight:500;">${f.name}</span>
                    <span style="font-family:'JetBrains Mono',monospace; color:${color}; font-weight:700; font-size:0.95rem;">${f.score}/100</span>
                </div>
                <div style="width:100%; background:rgba(255,255,255,0.08); border-radius:6px; height:10px; overflow:hidden;">
                    <div style="width:${f.score}%; background:${color}; height:100%; border-radius:6px; transition:width 1s ease;"></div>
                </div>
                <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">${f.note}</div>
            </div>
        `;
    }).join('');
}
