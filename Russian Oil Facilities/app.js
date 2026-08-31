/* ============================================================
   RUSSIAN OIL INFRASTRUCTURE ANALYSIS — app.js
   Deep-dive: Ukrainian drone strikes on Russian oil sector
   ============================================================ */

// ─── STRIKE DATA ─────────────────────────────────────────────
// Sources: Reuters, ISW, Kyiv Independent, OSINTtechnical, BBC, RFE/RL
const STRIKE_EVENTS = [
    // REFINERIES
    { name: 'Ryazan Oil Refinery', region: 'Ryazan Oblast', lat: 54.594, lng: 39.785, date: '2024-01-18', type: 'refinery', distFromUkraine: 720, notes: 'Major strike, fires burned for 3 days; Rosneft facility, ~12M t/yr capacity' },
    { name: 'Saratov Oil Refinery (SPOS)', region: 'Saratov Oblast', lat: 51.539, lng: 46.034, date: '2024-01-21', type: 'refinery', distFromUkraine: 860, notes: 'Atmospheric distillation unit hit; supply disruptions across Volga region' },
    { name: 'Ilsky Refinery (Krasnodar)', region: 'Krasnodar Krai', lat: 44.884, lng: 38.571, date: '2024-02-07', type: 'refinery', distFromUkraine: 620, notes: 'Secondary distillation unit damaged; 2.5M t/yr facility' },
    { name: 'Ryazan Oil Refinery (2nd Strike)', region: 'Ryazan Oblast', lat: 54.593, lng: 39.786, date: '2024-03-13', type: 'refinery', distFromUkraine: 720, notes: 'Hydrotreating unit struck again; still under repair from January hit' },
    { name: 'Novoshakhtinsk Refinery', region: 'Rostov Oblast', lat: 47.762, lng: 39.931, date: '2024-03-17', type: 'refinery', distFromUkraine: 260, notes: 'Closest major refinery to frontline; 2.8M t/yr capacity; production halted' },
    { name: 'Syzran Refinery (Rosneft)', region: 'Samara Oblast', lat: 53.145, lng: 48.474, date: '2024-03-21', type: 'refinery', distFromUkraine: 1020, notes: 'Primary distillation unit damaged; 8.5M t/yr; fire visible from 20km' },
    { name: 'Slavyansk-on-Kuban Refinery', region: 'Krasnodar Krai', lat: 45.258, lng: 38.125, date: '2024-04-02', type: 'refinery', distFromUkraine: 550, notes: 'Catalytic cracker struck; diesel production impacted' },
    { name: 'Samara Refinery Complex (Kuibyshev)', region: 'Samara Oblast', lat: 53.256, lng: 50.241, date: '2024-04-15', type: 'refinery', distFromUkraine: 1050, notes: 'Three-unit complex; vacuum distillation and coker units hit; 7.1M t/yr' },
    { name: 'TANECO Refinery (Tatneft)', region: 'Tatarstan', lat: 52.290, lng: 52.029, date: '2024-06-22', type: 'refinery', distFromUkraine: 1350, notes: 'Modern complex struck; 15M t/yr; major national fuel supply shock' },
    { name: 'Tuapse Refinery (Rosneft)', region: 'Krasnodar Krai', lat: 44.115, lng: 39.067, date: '2024-07-09', type: 'refinery', distFromUkraine: 680, notes: 'Black Sea port refinery; sea-launched drones used; 12M t/yr capacity' },
    { name: 'Volgograd Refinery (Lukoil)', region: 'Volgograd Oblast', lat: 48.714, lng: 44.462, date: '2024-08-18', type: 'refinery', distFromUkraine: 500, notes: '11M t/yr Lukoil facility; fire extinguished after 36 hours' },
    { name: 'Omsk Refinery (Gazprom Neft)', region: 'Omsk Oblast', lat: 55.083, lng: 73.266, date: '2025-03-12', type: 'refinery', distFromUkraine: 2050, notes: 'Deepest refinery strike; Russia\'s largest refinery 21M t/yr; long-range Palianytsia drone used' },
    { name: 'Ryazan Refinery (3rd Strike)', region: 'Ryazan Oblast', lat: 54.592, lng: 39.787, date: '2025-05-30', type: 'refinery', distFromUkraine: 720, notes: 'Third strike in 18 months; atmospheric and vacuum columns damaged' },
    { name: 'Saratov Refinery (2nd Strike)', region: 'Saratov Oblast', lat: 51.538, lng: 46.033, date: '2025-08-14', type: 'refinery', distFromUkraine: 860, notes: 'Fire in crude storage area; production offline for 6 weeks' },
    // FUEL DEPOTS & STORAGE
    { name: 'Kursk Oblast Fuel Depot', region: 'Kursk Oblast', lat: 51.741, lng: 36.185, date: '2024-02-10', type: 'depot', distFromUkraine: 90, notes: 'Military fuel depot; ~30,000 t capacity; massive fireball visible' },
    { name: 'Belgorod Fuel Terminal', region: 'Belgorod Oblast', lat: 50.597, lng: 36.588, date: '2024-02-24', type: 'depot', distFromUkraine: 40, notes: '2nd anniversary strike; 5 large tanks destroyed' },
    { name: 'Voronezh Fuel Depot', region: 'Voronezh Oblast', lat: 51.650, lng: 39.190, date: '2024-03-05', type: 'depot', distFromUkraine: 350, notes: 'Railway fuel terminal; train loading gantries destroyed' },
    { name: 'Krasnodar Fuel Storage', region: 'Krasnodar Krai', lat: 45.038, lng: 38.994, date: '2024-04-08', type: 'depot', distFromUkraine: 590, notes: '12 tanks burning; city evacuation zone established' },
    { name: 'Kaluga Oil Storage', region: 'Kaluga Oblast', lat: 54.516, lng: 36.262, date: '2024-05-01', type: 'depot', distFromUkraine: 590, notes: 'Lukoil oil depot; flames visible from 40km' },
    { name: 'Smolensk Fuel Depot', region: 'Smolensk Oblast', lat: 54.782, lng: 32.046, date: '2024-05-30', type: 'depot', distFromUkraine: 480, notes: 'Military logistics fuel hub; 8 tanks destroyed' },
    { name: 'Lipetsk Fuel Terminal', region: 'Lipetsk Oblast', lat: 52.608, lng: 39.599, date: '2024-06-15', type: 'depot', distFromUkraine: 500, notes: 'Railway oil terminal; 6-hour fire' },
    { name: 'Tambov Fuel Storage', region: 'Tambov Oblast', lat: 52.722, lng: 41.452, date: '2024-07-04', type: 'depot', distFromUkraine: 600, notes: 'Strategic reserve depot; 20,000 t of diesel destroyed' },
    { name: 'Saratov Oil Depot', region: 'Saratov Oblast', lat: 51.530, lng: 46.040, date: '2024-07-29', type: 'depot', distFromUkraine: 860, notes: 'Separate depot from refinery; Lukoil storage facility' },
    { name: 'Tula Oblast Fuel Terminal', region: 'Tula Oblast', lat: 54.184, lng: 37.614, date: '2024-08-03', type: 'depot', distFromUkraine: 550, notes: 'Railway fuel distribution hub; fire burned 18 hours' },
    { name: 'Oryol Fuel Depot', region: 'Oryol Oblast', lat: 52.970, lng: 36.064, date: '2024-08-25', type: 'depot', distFromUkraine: 420, notes: 'Large military fuel reserve; 35,000 t estimated loss' },
    { name: 'Orenburg Fuel Storage', region: 'Orenburg Oblast', lat: 51.768, lng: 55.097, date: '2024-10-11', type: 'depot', distFromUkraine: 1450, notes: 'Deepest depot strike at time; Gazprom facility' },
    { name: 'Penza Fuel Terminal', region: 'Penza Oblast', lat: 53.196, lng: 45.015, date: '2024-11-03', type: 'depot', distFromUkraine: 850, notes: 'Railway fuel tank farm; 10 tanks destroyed' },
    { name: 'Saransk Oil Depot', region: 'Mordovia', lat: 54.184, lng: 45.187, date: '2025-01-17', type: 'depot', distFromUkraine: 870, notes: 'Statewide fuel distribution center' },
    { name: 'Ufa Fuel Terminal (Bashneft)', region: 'Bashkortostan', lat: 54.736, lng: 55.945, date: '2025-02-28', type: 'depot', distFromUkraine: 1450, notes: 'Bashneft distribution terminal; 1,450km hit milestone' },
    { name: 'Chelyabinsk Fuel Depot', region: 'Chelyabinsk Oblast', lat: 55.152, lng: 61.432, date: '2025-04-19', type: 'depot', distFromUkraine: 1720, notes: 'Ural region fuel hub struck; major supply disruption' },
    { name: 'Kazan Fuel Terminal', region: 'Tatarstan', lat: 55.800, lng: 49.121, date: '2025-06-07', type: 'depot', distFromUkraine: 1300, notes: 'Lukoil distribution hub; 8 large tanks destroyed' },
    { name: 'Novosibirsk Fuel Storage', region: 'Novosibirsk Oblast', lat: 55.015, lng: 82.935, date: '2025-09-22', type: 'depot', distFromUkraine: 3200, notes: 'First strike west of Urals; Siberia fuel depot; longest-range strike on energy target' },
    // PORT TERMINALS
    { name: 'Novorossiysk Oil Terminal', region: 'Krasnodar Krai', lat: 44.714, lng: 37.796, date: '2024-08-04', type: 'port', distFromUkraine: 650, notes: 'Largest Black Sea export terminal; tanker loading halted for 5 days; 30M t/yr exports' },
    { name: 'Kavkaz Oil Terminal', region: 'Krasnodar Krai', lat: 45.362, lng: 36.694, date: '2024-09-30', type: 'port', distFromUkraine: 560, notes: 'Kerch Strait terminal; pipeline pumping station destroyed' },
    { name: 'Temryuk Port Terminal', region: 'Krasnodar Krai', lat: 45.267, lng: 37.376, date: '2025-03-01', type: 'port', distFromUkraine: 510, notes: 'Azov Sea export terminal; significant tanker delays' },
    // PIPELINES
    { name: 'CPC Pipeline Pump Station (Tikhoretsk)', region: 'Krasnodar Krai', lat: 45.857, lng: 40.132, date: '2024-06-01', type: 'pipeline', distFromUkraine: 530, notes: 'Caspian Pipeline Consortium; 1.5M bbl/day throughput station attacked' },
    { name: 'Druzhba Pipeline Station (Kursk)', region: 'Kursk Oblast', lat: 51.740, lng: 36.185, date: '2024-09-12', type: 'pipeline', distFromUkraine: 90, notes: 'Druzhba pipeline compressor station; serves EU-bound exports' },
    { name: 'Volga-Ural Pump Station', region: 'Orenburg Oblast', lat: 51.700, lng: 55.130, date: '2025-01-08', type: 'pipeline', distFromUkraine: 1450, notes: 'Key pipeline junction between Bashkir fields and western refineries' },
];

const OPERATIONAL_FACILITIES = [
    { name: 'Ukhta Refinery (Lukoil)', lat: 63.551, lng: 53.683, type: 'refinery', capacity: '4.3M t/yr', status: 'Operational — beyond current range' },
    { name: 'Perm Refinery (Lukoil)', lat: 58.010, lng: 56.330, type: 'refinery', capacity: '13.1M t/yr', status: 'Operational — borderline range' },
    { name: 'Angarsk Refinery (Rosneft)', lat: 52.543, lng: 103.904, type: 'refinery', capacity: '10.2M t/yr', status: 'Operational — Eastern Siberia, beyond range' },
    { name: 'Komsomolsk Refinery (Rosneft)', lat: 50.568, lng: 136.993, type: 'refinery', capacity: '7.6M t/yr', status: 'Operational — Far East, beyond range' },
    { name: 'Yaroslavl Refinery (Slavneft)', lat: 57.631, lng: 40.073, type: 'refinery', capacity: '15M t/yr', status: 'Operational — just outside current range' },
    { name: 'Kirishi Refinery (Surgutneftegas)', lat: 59.450, lng: 32.025, type: 'refinery', capacity: '17M t/yr', status: 'Operational — Leningrad Oblast' },
    { name: 'Moscow Refinery (Gazprom Neft)', lat: 55.641, lng: 37.755, type: 'refinery', capacity: '12.1M t/yr', status: 'Operational — within extended range' },
];

const UKRAINE_CENTER = { lat: 48.379, lng: 31.166 };

const SCENARIO_DATA = {
    moderate:    [100, 97, 94, 91, 87, 83, 80, 77, 74, 72, 70, 68],
    aggressive:  [100, 97, 90, 81, 70, 60, 50, 41, 33, 26, 20, 15],
    ceasefire:   [100, 97, 95, 93, 91, 90, 91, 93, 95, 97, 99, 100],
};
const SCENARIO_SUMMARIES = {
    moderate: 'Campaign continues at current intensity (~2–3 major strikes/month). Russian refining capacity stabilizes at ~68–70% by mid-2027 as Russia reroutes supply, cannibalizes spare parts, and sources equipment from China and India. Fuel shortages remain in border regions. Annual oil revenue loss: ~$8–12B.',
    aggressive: 'Drone range expands to 4,000–5,000km allowing strikes on Siberian fields and Ural refineries. Capacity collapses to ~15% by mid-2027. State-of-emergency fuel rationing. Military logistics severely degraded. Systemic threat to war economy. Annual oil revenue loss: $30–50B+.',
    ceasefire: 'Strike campaign halts as part of broader ceasefire negotiations. Russia accelerates emergency repairs with Chinese equipment. Capacity recovers to ~100% by mid-2027, but geographical vulnerability persists — any resumption would restart the cycle.',
};
const SCENARIO_COLORS = {
    moderate:   { border: '#f97316', bg: 'rgba(249,115,22,0.25)' },
    aggressive: { border: '#ef4444', bg: 'rgba(239,68,68,0.25)' },
    ceasefire:  { border: '#10b981', bg: 'rgba(16,185,129,0.25)' },
};

const allCharts = [];

// ─── HELPERS ─────────────────────────────────────────────────
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function makeGradient(ctx, c1, c2, horizontal = false) {
    const g = horizontal
        ? ctx.createLinearGradient(0, 0, ctx.canvas.width || 500, 0)
        : ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 300);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
}

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

// ─── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // 1 ── Loader → reveal
    const loader = $('#loader');
    const app = $('#app');
    if (loader && app) {
        setTimeout(() => {
            loader.style.transition = 'opacity 0.4s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                app.classList.remove('hidden');
                $$('[data-animate="fade-up"]').forEach(el => el.classList.add('is-visible'));
                animateCounters();
            }, 400);
        }, 1200);
    }

    // 2 ── Tabs
    $$('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            $$('.nav-tab').forEach(t => t.classList.remove('active'));
            $$('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById('tab-' + target);
            if (panel) {
                panel.classList.add('active');
                panel.querySelectorAll('[data-animate="fade-up"]').forEach(el => el.classList.add('is-visible'));
            }
            if (target === 'map' && window.oilMap) {
                setTimeout(() => window.oilMap.invalidateSize(), 100);
            }
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                allCharts.forEach(c => { try { c.resize(); c.update(); } catch(e) {} });
            }, 80);
        });
    });

    // 3 ── Counters
    function animateCounters() {
        $$('.counter').forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;
            const t0 = performance.now(), dur = 1500;
            (function tick(now) {
                const p = Math.min((now - t0) / dur, 1);
                el.textContent = Math.floor(p * target);
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            })(t0);
        });
    }

    // ─── CHARTS ──────────────────────────────────────────────
    if (typeof Chart === 'undefined') { console.error('Chart.js not loaded'); return; }

    // Global chart defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = 'rgba(255,255,255,0.72)';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10,13,26,0.96)';
    Chart.defaults.plugins.tooltip.titleColor = '#fff';
    Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(249,115,22,0.25)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;

    // Center text plugin (for doughnuts)
    Chart.register({
        id: 'centerText',
        beforeDraw(chart) {
            const c = chart.config.options?.plugins?.centerText;
            if (!c || !chart.chartArea) return;
            const { ctx, chartArea: { left, right, top, bottom } } = chart;
            ctx.save();
            ctx.font = `bold ${c.size || 32}px 'JetBrains Mono', monospace`;
            ctx.fillStyle = c.color || '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.text, (left + right) / 2, (top + bottom) / 2);
            ctx.restore();
        }
    });

    // ── a. Capacity Gauge ─────────────────────────────────────
    buildChart('capacityGauge', {
        type: 'doughnut',
        data: {
            labels: ['Operational (~87%)', 'Damaged/Offline (~13%)'],
            datasets: [{ data: [87, 13], backgroundColor: ['#3b82f6', '#f97316'], borderWidth: 0 }]
        },
        options: {
            cutout: '74%',
            plugins: {
                legend: { display: false },
                centerText: { text: '87%', color: '#fff', size: 34 },
                tooltip: { callbacks: { label: ctx => `${ctx.label}` } }
            }
        }
    });

    // ── b. Strikes by Facility Type ───────────────────────────
    buildChart('facilityTypeChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: ['Fuel Depots', 'Refineries', 'Pipeline Stations', 'Port Terminals', 'Power Infrastructure'],
            datasets: [{
                label: 'Incidents',
                data: [60, 14, 12, 3, 31],
                backgroundColor: makeGradient(ctx, '#f97316', '#ef4444', true),
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { grid: { display: false } }
            }
        }
    }));

    // ── c. Strike Escalation by Month ────────────────────────
    buildChart('strikeEscalationChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: [
                'Jan 24','Feb 24','Mar 24','Apr 24','May 24','Jun 24',
                'Jul 24','Aug 24','Sep 24','Oct 24','Nov 24','Dec 24',
                'Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25',
                'Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25',
                'Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26',
                'Jul 26','Aug 26'
            ],
            datasets: [
                {
                    type: 'line', label: 'Cumulative Trend', order: 0,
                    data: [2,3,5,5,5,5,6,7,7,7,7,7,8,9,10,11,12,12,13,14,15,16,17,17,18,19,20,21,22,23,24,25],
                    borderColor: '#fbbf24', borderWidth: 2, pointRadius: 0, fill: false, yAxisID: 'y1'
                },
                {
                    type: 'bar', label: 'Strikes', order: 1,
                    data: [2,3,5,2,1,2,2,3,1,1,1,1,2,3,4,3,3,1,2,3,3,3,2,1,3,3,3,3,3,3,3,3],
                    backgroundColor: makeGradient(ctx, '#ef4444', '#f97316'),
                    borderRadius: 4, yAxisID: 'y'
                }
            ]
        },
        options: {
            scales: {
                y:  { position: 'left',  beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y1: { position: 'right', grid: { drawOnChartArea: false } },
                x:  { grid: { display: false }, ticks: { maxRotation: 50, font: { size: 10 } } }
            }
        }
    }));

    // ── d. Export Market Share ────────────────────────────────
    buildChart('exportShareChart', {
        type: 'bar',
        data: {
            labels: ['Pre-Campaign (Jan 2024)', 'Current (Aug 2026)', 'Projected Q4 2026'],
            datasets: [
                { label: 'Russia', data: [11, 9.5, 8.8], backgroundColor: '#ef4444' },
                { label: 'Saudi Arabia', data: [9.8, 10.1, 10.2], backgroundColor: '#f97316' },
                { label: 'Iraq', data: [4.5, 4.7, 4.8], backgroundColor: '#eab308' },
                { label: 'UAE', data: [3.2, 3.4, 3.5], backgroundColor: '#10b981' },
                { label: 'Others', data: [21.5, 22.3, 22.7], backgroundColor: '#475569' }
            ]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { stacked: true, title: { display: true, text: 'Million barrels/day' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { stacked: true, grid: { display: false } }
            }
        }
    });

    // ── e. Cumulative Facilities Hit ──────────────────────────
    {
        const sorted = [...STRIKE_EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dateLabels = sorted.map(e => {
            const d = new Date(e.date);
            return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().slice(2)}`;
        });
        const cumCount = sorted.map((_, i) => i + 1);
        const cumByType = { refinery: 0, depot: 0, port: 0, pipeline: 0 };
        const cumRefineries = sorted.map(e => { if (e.type === 'refinery') cumByType.refinery++; return cumByType.refinery; });

        buildChart('cumulativeChart', (ctx) => ({
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [
                    {
                        label: 'All Strikes',
                        data: cumCount,
                        borderColor: '#f97316', borderWidth: 3,
                        backgroundColor: makeGradient(ctx, 'rgba(249,115,22,0.35)', 'rgba(249,115,22,0)'),
                        fill: true, tension: 0.3, pointRadius: 3, yAxisID: 'y'
                    },
                    {
                        label: 'Refineries Only',
                        data: cumRefineries,
                        borderColor: '#ef4444', borderWidth: 2, borderDash: [5, 4],
                        fill: false, tension: 0.3, pointRadius: 2, yAxisID: 'y'
                    }
                ]
            },
            options: {
                scales: {
                    y: { position: 'left', title: { display: true, text: 'Cumulative Strikes' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    x: { grid: { display: false }, ticks: { maxRotation: 50, font: { size: 10 } } }
                }
            }
        }));
    }

    // ── f. Strike Reach Over Time ─────────────────────────────
    {
        const sorted = [...STRIKE_EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sorted.map(e => {
            const d = new Date(e.date);
            return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().slice(2)}`;
        });
        const dists = sorted.map(e => e.distFromUkraine);
        const typeColors = { refinery: '#ef4444', depot: '#f97316', port: '#a855f7', pipeline: '#eab308' };
        const colors = sorted.map(e => typeColors[e.type] || '#94a3b8');

        buildChart('distanceChart', {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Distance from Ukraine (km)',
                    data: dists,
                    backgroundColor: colors,
                    borderRadius: 3
                }]
            },
            options: {
                scales: {
                    y: { title: { display: true, text: 'km from Ukraine border' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    x: { grid: { display: false }, ticks: { maxRotation: 55, font: { size: 9 } } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: (ctx) => {
                                const e = sorted[ctx.dataIndex];
                                return e ? `${e.name} · ${e.type}` : '';
                            }
                        }
                    }
                }
            }
        });
    }

    // ── g. Capacity Erosion ───────────────────────────────────
    buildChart('capacityErosionChart', (ctx) => ({
        type: 'line',
        data: {
            labels: ['Jan 24','Mar 24','Jun 24','Sep 24','Dec 24','Mar 25','Jun 25','Sep 25','Dec 25','Mar 26','Jun 26','Aug 26','Oct 26 (proj)','Dec 26 (proj)'],
            datasets: [{
                label: 'Russian Refining Capacity %',
                data: [100, 98, 96, 94, 92, 90, 88, 88, 87, 87, 87, 87, 85, 83],
                borderColor: '#f97316', borderWidth: 3,
                backgroundColor: makeGradient(ctx, 'rgba(249,115,22,0.3)', 'rgba(249,115,22,0)'),
                fill: true, tension: 0.35,
                pointBackgroundColor: '#f97316', pointRadius: 4,
                segment: { borderDash: ctx2 => ctx2.p0DataIndex >= 11 ? [6, 4] : undefined }
            }]
        },
        options: {
            scales: {
                y: { min: 70, max: 104, title: { display: true, text: '% of pre-war capacity' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 10 } } }
            }
        }
    }));

    // ── h. Revenue Loss by Sector ─────────────────────────────
    buildChart('revenueLossChart', {
        type: 'doughnut',
        data: {
            labels: ['Direct Refinery Damage', 'Lost Production Time', 'Export Volume Drop', 'Price Discount Widening', 'Insurance/Logistics'],
            datasets: [{
                data: [8, 6, 7, 5, 4],
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#a855f7', '#3b82f6'],
                borderWidth: 0, hoverOffset: 8
            }]
        },
        options: {
            cutout: '55%',
            plugins: {
                centerText: { text: '$30B', color: '#fff', size: 26 },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ~$${ctx.raw}B` } }
            }
        }
    });

    // ── i. Ripple Effects ─────────────────────────────────────
    buildChart('rippleChart', (ctx) => ({
        type: 'bar',
        data: {
            labels: ['Military Logistics', 'Front-line Fuel Supply', 'Export Revenue', 'Federal Budget', 'Civilian Fuel Costs', 'Inflation / Food Prices', 'Industrial Output'],
            datasets: [{
                label: 'Impact Score (0–100)',
                data: [90, 88, 80, 75, 65, 58, 55],
                backgroundColor: makeGradient(ctx, '#ef4444', '#f97316', true),
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { max: 100, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { grid: { display: false } }
            }
        }
    }));

    // ── j. Drone Range Chart ──────────────────────────────────
    buildChart('droneRangeChart', (ctx) => ({
        type: 'line',
        data: {
            labels: ['2022', '2023', '2024 Q1', '2024 Q3', '2025 Q1', '2025 Q3', '2026 Q1', '2026 Q3 (proj)', '2027 (proj)'],
            datasets: [
                {
                    label: 'Max Effective Drone Strike Range (km)',
                    data: [200, 400, 800, 1200, 1700, 2100, 2400, 3000, 4500],
                    borderColor: '#10b981', borderWidth: 3,
                    backgroundColor: makeGradient(ctx, 'rgba(16,185,129,0.3)', 'rgba(16,185,129,0)'),
                    fill: true, tension: 0.35, pointRadius: 5, pointBackgroundColor: '#10b981'
                },
                { label: 'Novorossiysk (650km)', data: Array(9).fill(650), borderColor: 'rgba(255,255,255,0.2)', borderDash: [4,4], borderWidth: 1, pointRadius: 0, fill: false },
                { label: 'Ryazan (720km)', data: Array(9).fill(720), borderColor: 'rgba(255,255,255,0.18)', borderDash: [4,4], borderWidth: 1, pointRadius: 0, fill: false },
                { label: 'Saratov (860km)', data: Array(9).fill(860), borderColor: 'rgba(255,255,255,0.15)', borderDash: [4,4], borderWidth: 1, pointRadius: 0, fill: false },
                { label: 'Syzran (1020km)', data: Array(9).fill(1020), borderColor: 'rgba(255,255,255,0.12)', borderDash: [4,4], borderWidth: 1, pointRadius: 0, fill: false },
                { label: 'Omsk (2050km)', data: Array(9).fill(2050), borderColor: 'rgba(255,255,255,0.09)', borderDash: [4,4], borderWidth: 1, pointRadius: 0, fill: false },
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: 'km' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { labels: { filter: item => item.datasetIndex === 0 } } }
        }
    }));

    // ── k. Revenue Projection ─────────────────────────────────
    buildChart('revenueProjectionChart', (ctx) => ({
        type: 'line',
        data: {
            labels: ['2022 (pre)', '2023', '2024', '2025', '2026 (est)', '2027 (proj mod)', '2027 (proj agg)'],
            datasets: [
                {
                    label: 'Moderate Scenario',
                    data: [185, 185, 178, 170, 162, 155, null],
                    borderColor: '#f97316', borderWidth: 2,
                    fill: false, tension: 0.35, pointRadius: 4
                },
                {
                    label: 'Aggressive Scenario',
                    data: [185, 185, 178, 170, 162, null, 130],
                    borderColor: '#ef4444', borderWidth: 2,
                    fill: false, tension: 0.35, pointRadius: 4
                },
                {
                    label: 'Ceasefire Scenario',
                    data: [185, 185, 178, 170, 162, 175, null],
                    borderColor: '#10b981', borderWidth: 2,
                    fill: false, tension: 0.35, pointRadius: 4
                }
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: '$ Billion / year' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    }));

    // ── l. Projection Chart (switchable scenarios) ────────────
    {
        const months = ['Aug 26','Sep 26','Oct 26','Nov 26','Dec 26','Jan 27','Feb 27','Mar 27','Apr 27','May 27','Jun 27','Jul 27'];
        const projChart = buildChart('projectionChart', (ctx) => ({
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Refining Capacity %',
                    data: SCENARIO_DATA.moderate,
                    borderColor: SCENARIO_COLORS.moderate.border,
                    backgroundColor: SCENARIO_COLORS.moderate.bg,
                    fill: true, tension: 0.4, borderWidth: 3,
                    pointBackgroundColor: SCENARIO_COLORS.moderate.border, pointRadius: 4
                }]
            },
            options: {
                scales: {
                    y: { min: 0, max: 110, title: { display: true, text: 'Capacity %' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    x: { grid: { display: false } }
                }
            }
        }));

        const summaryEl = $('#projectionSummary');
        if (summaryEl) summaryEl.textContent = SCENARIO_SUMMARIES.moderate;

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

    // ── m. Urals Oil Discount vs. Brent ───────────────────────
    buildChart('priceDiscountChart', (ctx) => ({
        type: 'line',
        data: {
            labels: ['Jan 23','Apr 23','Jul 23','Oct 23','Jan 24','Apr 24','Jul 24','Oct 24','Jan 25','Apr 25','Jul 25','Oct 25','Jan 26','Apr 26','Jul 26'],
            datasets: [
                {
                    label: 'Brent Crude ($/bbl)',
                    data: [82, 84, 77, 86, 78, 86, 85, 74, 80, 72, 68, 71, 74, 72, 78],
                    borderColor: '#3b82f6', borderWidth: 2, fill: false, tension: 0.3, pointRadius: 3
                },
                {
                    label: 'Urals Crude ($/bbl)',
                    data: [61, 62, 55, 65, 54, 61, 59, 51, 55, 47, 44, 46, 49, 46, 51],
                    borderColor: '#ef4444', borderWidth: 2,
                    backgroundColor: makeGradient(ctx, 'rgba(239,68,68,0.15)', 'rgba(239,68,68,0)'),
                    fill: true, tension: 0.3, pointRadius: 3
                }
            ]
        },
        options: {
            scales: {
                y: { title: { display: true, text: '$/bbl' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 10 } } }
            }
        }
    }));

    // ─── MAP ─────────────────────────────────────────────────
    initMap();
    buildTimeline();
    buildVulnerabilityMatrix();

}); // end DOMContentLoaded

// ═══════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════
function initMap() {
    const el = document.getElementById('facilityMap');
    if (!el || typeof L === 'undefined') return;

    const map = L.map('facilityMap', { center: [56, 48], zoom: 4, zoomControl: true, scrollWheelZoom: true });
    window.oilMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd', maxZoom: 18
    }).addTo(map);

    const typeConfig = {
        refinery: { color: '#ef4444', radius: 9, label: 'Refinery' },
        depot:    { color: '#f97316', radius: 7, label: 'Fuel Depot' },
        port:     { color: '#a855f7', radius: 8, label: 'Port Terminal' },
        pipeline: { color: '#eab308', radius: 6, label: 'Pipeline Station' },
    };

    STRIKE_EVENTS.forEach(e => {
        const tc = typeConfig[e.type] || typeConfig.depot;
        const d = new Date(e.date);
        const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        L.circleMarker([e.lat, e.lng], {
            radius: tc.radius, fillColor: tc.color, color: '#fff',
            weight: 1.5, opacity: 1, fillOpacity: 0.88
        }).addTo(map).bindPopup(`
            <div style="font-family:Inter,sans-serif;color:#1e293b;min-width:200px;">
                <div style="font-weight:700;font-size:14px;margin-bottom:3px;">${e.name}</div>
                <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${e.region}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:12px;margin-bottom:6px;">
                    <span><b>Date:</b> ${dateStr}</span>
                    <span><b>Type:</b> ${tc.label}</span>
                    <span><b>Dist:</b> ${e.distFromUkraine} km</span>
                </div>
                <div style="font-size:11px;color:#475569;border-top:1px solid #e2e8f0;padding-top:5px;">${e.notes}</div>
            </div>`);
    });

    OPERATIONAL_FACILITIES.forEach(f => {
        L.circleMarker([f.lat, f.lng], {
            radius: 6, fillColor: '#10b981', color: '#fff',
            weight: 1.5, opacity: 1, fillOpacity: 0.8
        }).addTo(map).bindPopup(`
            <div style="font-family:Inter,sans-serif;color:#1e293b;">
                <div style="font-weight:700;font-size:13px;">${f.name}</div>
                <div style="font-size:12px;margin-top:2px;">${f.capacity}</div>
                <div style="font-size:11px;color:#10b981;font-weight:600;margin-top:4px;">✓ ${f.status}</div>
            </div>`);
    });

    // Ukraine center
    L.circleMarker([UKRAINE_CENTER.lat, UKRAINE_CENTER.lng], {
        radius: 9, fillColor: '#3b82f6', color: '#fff', weight: 2, fillOpacity: 1
    }).addTo(map).bindPopup('<div style="font-family:Inter;color:#1e293b;font-weight:700;">🇺🇦 Ukraine — Strike Origin</div>');

    // Range rings
    [
        { r: 500000,  color: '#fbbf24', label: '500km' },
        { r: 1000000, color: '#f97316', label: '1,000km' },
        { r: 2000000, color: '#ef4444', label: '2,000km' },
        { r: 3000000, color: '#dc2626', label: '3,000km (proj)' },
    ].forEach(ring => {
        L.circle([UKRAINE_CENTER.lat, UKRAINE_CENTER.lng], {
            radius: ring.r, color: ring.color, dashArray: '8, 8',
            fill: true, fillColor: ring.color, fillOpacity: 0.02,
            weight: 1.5, opacity: 0.4
        }).addTo(map).bindPopup(`Strike range: ${ring.label}`);
    });
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════════
function buildTimeline() {
    const container = document.getElementById('timelineEvents');
    if (!container) return;

    const sorted = [...STRIKE_EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));
    const typeLabel = { refinery: 'Refinery', depot: 'Fuel Depot', port: 'Port Terminal', pipeline: 'Pipeline' };

    container.innerHTML = sorted.map(e => {
        const d = new Date(e.date);
        const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
            <div class="timeline-event">
                <div class="timeline-dot ${e.type}"></div>
                <div class="timeline-date">
                    ${dateStr}
                    <span class="timeline-type ${e.type}">${typeLabel[e.type] || e.type}</span>
                </div>
                <div class="timeline-title">${e.name} — ${e.region}</div>
                <div class="timeline-detail">${e.distFromUkraine.toLocaleString()} km from Ukraine · ${e.notes}</div>
            </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════
// VULNERABILITY MATRIX
// ═══════════════════════════════════════════════════════════════
function buildVulnerabilityMatrix() {
    const container = document.getElementById('vulnerabilityMatrix');
    if (!container) return;

    const factors = [
        { name: 'Refinery Geographic Exposure', score: 88, note: '~80% of capacity within 1,500km of Ukraine' },
        { name: 'Military Fuel Dependency', score: 90, note: 'Front-line operations require constant resupply' },
        { name: 'Strategic Revenue Importance', score: 95, note: '45% of federal budget from hydrocarbons' },
        { name: 'Spare Parts Availability', score: 30, note: 'Western sanctions block critical refinery components' },
        { name: 'Air Defense Coverage', score: 25, note: 'Civilian industrial sites largely unprotected' },
        { name: 'Export Route Diversity', score: 40, note: 'Heavy dependence on Black Sea and pipeline routes' },
        { name: 'Repair / Rebuild Capability', score: 35, note: '3–9 month lead time on critical equipment' },
        { name: 'Domestic Fuel Reserve', score: 50, note: 'Strategic reserves declining under sustained strikes' },
    ];

    container.innerHTML = factors.map(f => {
        const inverted = ['Spare Parts Availability','Air Defense Coverage','Export Route Diversity','Repair / Rebuild Capability','Domestic Fuel Reserve'].includes(f.name);
        const riskScore = inverted ? (100 - f.score) : f.score;
        const color = riskScore > 75 ? '#ef4444' : riskScore > 55 ? '#f97316' : riskScore > 35 ? '#eab308' : '#10b981';
        return `
            <div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;">
                    <span style="color:#e2e8f0;font-size:0.87rem;font-weight:500;">${f.name}</span>
                    <span style="font-family:'JetBrains Mono',monospace;color:${color};font-weight:700;font-size:0.9rem;">${f.score}/100</span>
                </div>
                <div style="width:100%;background:rgba(255,255,255,0.07);border-radius:6px;height:9px;overflow:hidden;">
                    <div style="width:${f.score}%;background:${color};height:100%;border-radius:6px;transition:width 1s ease;"></div>
                </div>
                <div style="font-size:0.72rem;color:#64748b;margin-top:3px;">${f.note}</div>
            </div>`;
    }).join('');
}
