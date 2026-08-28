// ============================================================
//  EcoTwin Dashboard — app.js  (v2 — Parts A-E complete)
// ============================================================

let historyChart = null;
let wildlifeChart = null;

// ── Detect current page from URL param ──
function getPage() {
    return new URLSearchParams(window.location.search).get("page") || "home";
}

document.addEventListener('DOMContentLoaded', () => {
    const page = getPage();

    if (page === "home" || page === "live") {
        initDashboard();
        setInterval(updateLiveData, 5000);
    }
    if (page === "twin") {
        loadTwinSnapshot();
    }
    if (page === "predictions") {
        loadSuitabilityML();
    }
    if (page === "alerts") {
        loadAnomalyAlerts();
    }
    if (page === "analytics") {
        loadHabitatAnalytics();
    }
    if (page === "forecast") {
        loadForecast();
    }
    if (page === "hardware") {
        loadHardwareStatus();
    }
    if (page === "system_health") {
        loadSystemHealth();
    }
    if (page === "wildlife_vision") {
        loadCameraTraps();
    }
});

// ── Utility helpers ──
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// ── Severity badge helper ──
function severityBadge(sev) {
    const cls = sev === "HIGH" ? "badge-high" : sev === "MEDIUM" ? "badge-medium" : "badge-low";
    return `<span class="badge ${cls}">${sev}</span>`;
}

// ============================================================
//  HOME / LIVE TELEMETRY
// ============================================================
async function initDashboard() {
    await updateLiveData();
    initHistoryChart();
}

async function updateLiveData() {
    try {
        const [latestRes, habitatRes, anomalyRes] = await Promise.all([
            fetch('/latest').then(r => r.json()),
            fetch('/habitat').then(r => r.json()),
            fetch('/anomaly').then(r => r.json())
        ]);

        if (latestRes.temperature !== undefined) {
            setText('val-temp', `${latestRes.temperature} °C`);
            setText('val-hum', `${latestRes.humidity} %`);
            setText('val-soil', `${latestRes.soil_moisture} %`);
            setText('val-rain', `${latestRes.rainfall} mm`);
        }

        if (habitatRes.suitability_status) {
            const statusEl = document.getElementById('val-habitat-status');
            if (statusEl) {
                statusEl.innerText = habitatRes.suitability_status;
                statusEl.style.color = habitatRes.habitat_suitable ? 'var(--primary)' : 'var(--danger)';
            }
            setText('val-habitat-conf', `${habitatRes.confidence}%`);
            setText('val-animal-prob', `${habitatRes.animal_presence_probability}%`);
        }

        if (anomalyRes.status) {
            const el = document.getElementById('val-anomaly-status');
            if (el) {
                el.innerText = anomalyRes.status;
                el.style.color = anomalyRes.is_anomaly ? 'var(--danger)' : 'var(--primary)';
            }
        }

        updateChartData();
    } catch (err) {
        console.warn('Telemetry update warning:', err);
    }
}

async function initHistoryChart() {
    const ctx = document.getElementById('historyChart');
    if (!ctx) return;

    const historyData = await fetch('/history?limit=30').then(r => r.json()).catch(() => []);
    const labels = historyData.map(d => new Date(d.timestamp).toLocaleTimeString());
    const temps  = historyData.map(d => d.temperature);
    const hums   = historyData.map(d => d.humidity);
    const soils  = historyData.map(d => d.soil_moisture);

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Temperature (°C)', data: temps, borderColor: '#ef4444', tension: 0.4, pointRadius: 2, fill: false },
                { label: 'Humidity (%)',      data: hums,  borderColor: '#38bdf8', tension: 0.4, pointRadius: 2, fill: false },
                { label: 'Soil Moisture (%)', data: soils, borderColor: '#10b981', tension: 0.4, pointRadius: 2, fill: false }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

async function updateChartData() {
    if (!historyChart) return;
    const historyData = await fetch('/history?limit=30').then(r => r.json()).catch(() => []);
    historyChart.data.labels = historyData.map(d => new Date(d.timestamp).toLocaleTimeString());
    historyChart.data.datasets[0].data = historyData.map(d => d.temperature);
    historyChart.data.datasets[1].data = historyData.map(d => d.humidity);
    historyChart.data.datasets[2].data = historyData.map(d => d.soil_moisture);
    historyChart.update('none');
}

// ============================================================
//  TWIN SNAPSHOT
// ============================================================
async function loadTwinSnapshot() {
    try {
        const d = await fetch('/digital-twin').then(r => r.json());
        setText('twin-sync-time', new Date(d.last_synced_at).toLocaleTimeString());
    } catch (e) { console.warn(e); }
}

// ============================================================
//  PART A — SUITABILITY ML
// ============================================================
async function loadSuitabilityML() {
    try {
        const d = await fetch('/suitability-comparison').then(r => r.json());
        if (d.error) { setHTML('predictions-tbody', `<tr><td colspan="9" style="color:var(--danger);text-align:center;">${d.error}</td></tr>`); return; }

        setText('rf-accuracy',    `${d.rf_accuracy}%`);
        setText('xgb-accuracy',   d.xgb_available ? `${d.xgb_accuracy}%` : 'N/A');
        setText('rows-evaluated', `${d.recent_predictions.length}`);

        const agree = d.recent_predictions.filter(p => p.agree).length;
        setText('model-agreement', `${Math.round(agree / d.recent_predictions.length * 100)}%`);

        // Feature Importance Bar Chart
        const fi = d.feature_importance;
        const fiCtx = document.getElementById('featureImportanceChart');
        if (fiCtx && fi) {
            const labels = Object.keys(fi);
            const values = Object.values(fi);
            new Chart(fiCtx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{ label: 'Importance %', data: values,
                        backgroundColor: labels.map(() => 'rgba(16,185,129,0.7)'),
                        borderColor: '#10b981', borderWidth: 1 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
                    }
                }
            });
        }

        // Model Comparison Line Chart
        const mcCtx = document.getElementById('modelCompareChart');
        if (mcCtx) {
            const preds = d.recent_predictions.slice().reverse();
            new Chart(mcCtx, {
                type: 'line',
                data: {
                    labels: preds.map((_, i) => `Row ${i + 1}`),
                    datasets: [
                        { label: 'RF Confidence %', data: preds.map(p => p.rf_confidence), borderColor: '#10b981', tension: 0.4, pointRadius: 3 },
                        { label: 'XGB Confidence %', data: preds.map(p => p.xgb_confidence), borderColor: '#38bdf8', tension: 0.4, pointRadius: 3 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { min: 50, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }

        // Predictions Table
        const tbody = document.getElementById('predictions-tbody');
        if (tbody) {
            tbody.innerHTML = d.recent_predictions.map(p => {
                const rfColor = p.rf_pred === 'Suitable' ? 'var(--primary)' : 'var(--danger)';
                const xgbColor = p.xgb_pred === 'Suitable' ? 'var(--primary)' : 'var(--danger)';
                const agreeIcon = p.agree ? '✅' : '⚠️';
                return `<tr>
                    <td style="font-family:var(--font-mono);font-size:0.8rem;">${p.timestamp}</td>
                    <td>${p.temperature}</td><td>${p.humidity}</td><td>${p.soil_moisture}</td>
                    <td style="color:${rfColor};font-weight:600;">${p.rf_pred}</td><td>${p.rf_confidence}%</td>
                    <td style="color:${xgbColor};font-weight:600;">${p.xgb_pred}</td><td>${p.xgb_confidence}%</td>
                    <td>${agreeIcon}</td>
                </tr>`;
            }).join('');
        }
    } catch (e) {
        console.error('Suitability ML error:', e);
    }
}

// ============================================================
//  PART A — ANOMALY ALERTS
// ============================================================
async function loadAnomalyAlerts() {
    try {
        const d = await fetch('/anomaly-alerts').then(r => r.json());
        if (d.error) { setHTML('anomaly-tbody', `<tr><td colspan="7" style="color:var(--danger);text-align:center;">${d.error}</td></tr>`); return; }

        setText('alert-total', `${d.total_anomalies}`);
        const highCnt   = d.anomaly_events.filter(a => a.severity === 'HIGH').length;
        const medCnt    = d.anomaly_events.filter(a => a.severity === 'MEDIUM').length;
        const lowCnt    = d.anomaly_events.filter(a => a.severity === 'LOW').length;
        setText('alert-high',   `${highCnt}`);
        setText('alert-medium', `${medCnt}`);
        setText('alert-low',    `${lowCnt}`);

        const tbody = document.getElementById('anomaly-tbody');
        if (!tbody) return;

        if (d.anomaly_events.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--primary);">✅ No anomalies detected in the last 100 records.</td></tr>`;
            return;
        }

        tbody.innerHTML = d.anomaly_events.map(a => `<tr>
            <td style="font-family:var(--font-mono);font-size:0.8rem;">${a.timestamp}</td>
            <td>${severityBadge(a.severity)}</td>
            <td>${a.temperature}</td><td>${a.humidity}</td><td>${a.soil_moisture}</td><td>${a.acoustic}</td>
            <td style="font-size:0.82rem;color:var(--text-muted);">${a.trigger_reason}</td>
        </tr>`).join('');
    } catch (e) {
        console.error('Anomaly alerts error:', e);
    }
}

// ============================================================
//  PART A — HABITAT ANALYTICS
// ============================================================
async function loadHabitatAnalytics() {
    try {
        const d = await fetch('/habitat-analytics').then(r => r.json());
        if (d.error) { console.error(d.error); return; }

        // Summary KPI cards
        const container = document.getElementById('analytics-summary-cards');
        if (container) {
            const statsMap = {
                'temperature': { label: 'Temperature', unit: '°C', color: 'kpi-red' },
                'humidity':    { label: 'Humidity',    unit: '%',  color: 'kpi-blue' },
                'soil_moisture':{ label: 'Soil Moisture', unit: '%', color: 'kpi-green' },
                'rainfall':    { label: 'Rainfall',    unit: 'mm', color: 'kpi-yellow' },
                'light':       { label: 'Light',       unit: 'lx', color: '' },
                'acoustic':    { label: 'Acoustic',    unit: 'dB', color: '' }
            };
            container.innerHTML = Object.entries(d.summary_statistics).map(([key, stats]) => {
                const meta = statsMap[key] || { label: key, unit: '', color: '' };
                return `<div class="card kpi-card">
                    <div class="card-title">${meta.label} Mean</div>
                    <div class="card-value ${meta.color}">${stats.mean}<span style="font-size:1rem;font-weight:400;margin-left:4px;">${meta.unit}</span></div>
                    <p style="font-size:0.78rem;color:var(--text-muted);margin-top:8px;">Min: ${stats.min} | Max: ${stats.max} | σ: ${stats.std}</p>
                </div>`;
            }).join('');
        }

        // Daily Trends Chart
        const dtCtx = document.getElementById('dailyTrendsChart');
        if (dtCtx && d.daily_trends.length > 0) {
            const labels = d.daily_trends.map(r => r.date);
            new Chart(dtCtx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        { label: 'Temp (°C)', data: d.daily_trends.map(r => r.temperature), borderColor: '#ef4444', tension: 0.4, fill: false },
                        { label: 'Humidity (%)', data: d.daily_trends.map(r => r.humidity), borderColor: '#38bdf8', tension: 0.4, fill: false },
                        { label: 'Soil (%)', data: d.daily_trends.map(r => r.soil_moisture), borderColor: '#10b981', tension: 0.4, fill: false }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } }
                    }
                }
            });
        }

        // Hourly Heatmap (Temperature + Humidity by hour)
        const hhCtx = document.getElementById('hourlyHeatmapChart');
        if (hhCtx && d.hourly_heatmap.length > 0) {
            const hours = d.hourly_heatmap.map(h => `${h.hour}:00`);
            new Chart(hhCtx, {
                type: 'bar',
                data: {
                    labels: hours,
                    datasets: [
                        { label: 'Avg Temp (°C)', data: d.hourly_heatmap.map(h => h.temperature),
                          backgroundColor: 'rgba(239,68,68,0.65)', borderColor: '#ef4444', borderWidth: 1 },
                        { label: 'Avg Humidity (%)', data: d.hourly_heatmap.map(h => h.humidity),
                          backgroundColor: 'rgba(56,189,248,0.45)', borderColor: '#38bdf8', borderWidth: 1 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } }
                    }
                }
            });
        }

        // Soil Moisture Hourly
        const shCtx = document.getElementById('soilHourlyChart');
        if (shCtx && d.hourly_heatmap.length > 0) {
            new Chart(shCtx, {
                type: 'line',
                data: {
                    labels: d.hourly_heatmap.map(h => `${h.hour}:00`),
                    datasets: [{
                        label: 'Avg Soil Moisture (%)', fill: true,
                        data: d.hourly_heatmap.map(h => h.soil_moisture),
                        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)', tension: 0.4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } }
                    }
                }
            });
        }
    } catch (e) {
        console.error('Analytics error:', e);
    }
}

// ============================================================
//  LSTM FORECAST
// ============================================================
async function loadForecast() {
    try {
        const horizons = [
            { key: '3h',  tempEl: 'fc-temp-3h',  extraEl: 'fc-extra-3h' },
            { key: '12h', tempEl: 'fc-temp-12h', extraEl: 'fc-extra-12h' },
            { key: '24h', tempEl: 'fc-temp-24h', extraEl: 'fc-extra-24h' }
        ];
        const results = {};
        for (const h of horizons) {
            try {
                const d = await fetch(`/forecast/${h.key}`).then(r => r.json());
                if (!d.error) {
                    setText(h.tempEl, `Temp: ${d.predicted_temperature} °C`);
                    setText(h.extraEl, `Humidity: ${d.predicted_humidity}% | Rain: ${d.predicted_rainfall} mm`);
                    results[h.key] = d;
                } else {
                    setText(h.tempEl, 'Model unavailable');
                    setText(h.extraEl, d.error);
                }
            } catch {
                setText(h.tempEl, 'Error'); setText(h.extraEl, '');
            }
        }

        // Forecast comparison chart
        const fcCtx = document.getElementById('forecastChart');
        if (fcCtx && Object.keys(results).length > 0) {
            const labels = Object.keys(results).map(k => `+${k}`);
            new Chart(fcCtx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'Predicted Temp (°C)', data: labels.map((_, i) => Object.values(results)[i]?.predicted_temperature ?? null), backgroundColor: 'rgba(239,68,68,0.6)', borderColor: '#ef4444', borderWidth: 1.5 },
                        { label: 'Predicted Humidity (%)', data: labels.map((_, i) => Object.values(results)[i]?.predicted_humidity ?? null), backgroundColor: 'rgba(56,189,248,0.5)', borderColor: '#38bdf8', borderWidth: 1.5 },
                        { label: 'Predicted Soil (%)', data: labels.map((_, i) => Object.values(results)[i]?.predicted_soil_moisture ?? null), backgroundColor: 'rgba(16,185,129,0.5)', borderColor: '#10b981', borderWidth: 1.5 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }
    } catch (e) { console.error('Forecast error:', e); }
}

// ============================================================
//  WHAT-IF SIMULATION
// ============================================================
async function runSimulation() {
    const rainfallDelta = parseFloat(document.getElementById('sim-rain')?.value || 0) / 100.0;
    const tempDelta     = parseFloat(document.getElementById('sim-temp')?.value || 0) / 100.0;
    const humDelta      = parseFloat(document.getElementById('sim-hum')?.value || 0) / 100.0;

    const payload = { changes: { rainfall: rainfallDelta, temperature: tempDelta, humidity: humDelta } };
    setHTML('sim-result-container', '<p style="color:var(--text-muted);">⚙️ Running simulation…</p>');

    try {
        const res  = await fetch('/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        const statusColor = data.habitat_suitable ? 'var(--primary)' : 'var(--danger)';
        setHTML('sim-result-container', `
            <div style="background:rgba(16,185,129,0.08);border:1px solid var(--border-glow);padding:18px;border-radius:12px;margin-top:12px;">
                <h4 style="color:${statusColor};margin-bottom:12px;">
                    ${data.habitat_suitable ? '✅ Suitable Habitat' : '⚠️ Unsuitable / Stressed'}
                </h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div><span style="color:var(--text-muted);font-size:0.82rem;">Suitability Confidence</span><p style="font-weight:700;font-size:1.1rem;">${data.suitability_confidence}%</p></div>
                    <div><span style="color:var(--text-muted);font-size:0.82rem;">Animal Presence Prob</span><p style="font-weight:700;font-size:1.1rem;">${data.animal_presence_probability}%</p></div>
                    <div><span style="color:var(--text-muted);font-size:0.82rem;">Stress Detected</span><p style="font-weight:700;color:${data.stress_detected ? 'var(--danger)' : 'var(--primary)'};">${data.stress_detected ? 'Yes ⚠️' : 'No ✅'}</p></div>
                </div>
                <p style="margin-top:12px;color:var(--text-muted);font-size:0.85rem;">${data.impact_summary}</p>
            </div>
        `);
    } catch (err) {
        setHTML('sim-result-container', '<p style="color:var(--danger);">Error running simulation.</p>');
    }
}

// ============================================================
//  PART B — HARDWARE STATUS
// ============================================================
async function loadHardwareStatus() {
    try {
        const d = await fetch('/hardware-status').then(r => r.json());
        const container = document.getElementById('hardware-nodes-grid');
        if (!container || !d.sensor_nodes) return;

        container.innerHTML = d.sensor_nodes.map(node => {
            const battColor = node.battery_pct > 70 ? 'var(--primary)' : node.battery_pct > 40 ? 'var(--warning)' : 'var(--danger)';
            return `<div class="hw-node-card">
                <div class="hw-node-title"><i class="fa-solid fa-microchip" style="margin-right:6px;"></i>${node.node_id}</div>
                <div class="hw-node-zone">${node.location}</div>
                <div class="hw-stat"><span class="label">Status</span><span class="value" style="color:var(--primary);">● ${node.status}</span></div>
                <div class="hw-stat"><span class="label">Temp</span><span class="value">${node.latest_temp} °C</span></div>
                <div class="hw-stat"><span class="label">Humidity</span><span class="value">${node.latest_humidity} %</span></div>
                <div class="hw-stat"><span class="label">Signal</span><span class="value">${node.signal_dbm} dBm</span></div>
                <div class="hw-stat"><span class="label">Battery</span><span class="value" style="color:${battColor};">${node.battery_pct}%</span></div>
                <div class="battery-bar"><div class="battery-fill" style="width:${node.battery_pct}%;background:${battColor};"></div></div>
                <div style="margin-top:10px;font-size:0.78rem;color:var(--text-muted);">
                    Sensors: ${node.sensors.join(' · ')}
                </div>
            </div>`;
        }).join('');
    } catch (e) { console.error('Hardware status error:', e); }
}

// ============================================================
//  PART C — CHANGE DETECTION
// ============================================================
async function runChangeDetection(useSample) {
    const resultEl = document.getElementById('change-result');
    if (resultEl) resultEl.innerHTML = '<p style="color:var(--text-muted);">⏳ Running change detection…</p>';

    try {
        let response;
        if (useSample) {
            response = await fetch('/detect-change', { method: 'POST', body: new FormData() });
        } else {
            const beforeFile = document.getElementById('before-img-input')?.files[0];
            const afterFile  = document.getElementById('after-img-input')?.files[0];
            const fd = new FormData();
            if (beforeFile) fd.append('before', beforeFile);
            if (afterFile)  fd.append('after', afterFile);
            response = await fetch('/detect-change', { method: 'POST', body: fd });
        }

        const d = await response.json();
        if (d.error) {
            if (resultEl) resultEl.innerHTML = `<p style="color:var(--danger);">Error: ${d.error}</p>`;
            return;
        }

        const sevColor = d.change_severity === 'High' ? 'var(--danger)' : d.change_severity === 'Medium' ? 'var(--warning)' : 'var(--primary)';
        if (resultEl) {
            resultEl.innerHTML = `
                <div style="padding:4px;">
                    <p style="font-size:0.78rem;color:var(--warning);margin-bottom:12px;">Engine: ${d.engine}</p>
                    <div class="change-stat-grid">
                        <div class="change-stat"><div class="cval" style="color:${sevColor};">${d.change_severity}</div><div class="clabel">Change Severity</div></div>
                        <div class="change-stat"><div class="cval" style="color:${sevColor};">${d.change_percentage}%</div><div class="clabel">Pixels Changed</div></div>
                        <div class="change-stat"><div class="cval">${d.changed_pixels.toLocaleString()}</div><div class="clabel">Changed Pixels</div></div>
                        <div class="change-stat"><div class="cval">${d.total_pixels.toLocaleString()}</div><div class="clabel">Total Pixels</div></div>
                    </div>
                    <p style="margin-top:14px;font-size:0.85rem;color:var(--text-muted);">${d.interpretation}</p>
                </div>
            `;
        }

        if (d.before_image_b64) {
            const beforeCard = document.getElementById('change-before-card');
            const beforeImg  = document.getElementById('change-before-img');
            if (beforeCard && beforeImg) {
                beforeCard.style.display = 'block';
                beforeImg.src = `data:image/png;base64,${d.before_image_b64}`;
            }
        }
        if (d.diff_image_b64) {
            const diffCard = document.getElementById('change-diff-card');
            const diffImg  = document.getElementById('change-diff-img');
            if (diffCard && diffImg) {
                diffCard.style.display = 'block';
                diffImg.src = `data:image/png;base64,${d.diff_image_b64}`;
            }
        }
    } catch (e) {
        if (resultEl) resultEl.innerHTML = `<p style="color:var(--danger);">Error: ${e.message}</p>`;
    }
}

// ============================================================
//  PART D — WILDLIFE VISION
// ============================================================
async function classifyWildlife(useSample) {
    const resultEl = document.getElementById('wildlife-result');
    if (resultEl) resultEl.innerHTML = '<p style="color:var(--text-muted);">⏳ Classifying image…</p>';

    try {
        const fd = new FormData();
        if (useSample) {
            const sampleName = document.getElementById('sample-species-select')?.value || 'bird';
            fd.append('use_sample', 'true');
            fd.append('sample_name', sampleName);
        } else {
            const imgFile = document.getElementById('wildlife-img-input')?.files[0];
            if (imgFile) fd.append('image', imgFile);
        }

        const d = await fetch('/classify-wildlife', { method: 'POST', body: fd }).then(r => r.json());
        if (d.error) {
            if (resultEl) resultEl.innerHTML = `<p style="color:var(--danger);">Error: ${d.error}</p>`;
            return;
        }

        if (resultEl) {
            resultEl.innerHTML = `
                <div class="wl-top">
                    <div class="wl-species">${d.top_prediction}</div>
                    <div class="wl-conf">Confidence: <strong>${d.top_confidence}%</strong></div>
                </div>
                <p style="font-size:0.78rem;color:var(--warning);margin-bottom:8px;">Model: ${d.model}</p>
                <p style="font-size:0.8rem;color:var(--text-muted);">${d.status}</p>
            `;
        }

        // Species probability bar chart
        const wlCtx = document.getElementById('wildlifeChart');
        if (wlCtx && d.all_probabilities) {
            if (wildlifeChart) wildlifeChart.destroy();
            wildlifeChart = new Chart(wlCtx, {
                type: 'bar',
                data: {
                    labels: d.all_probabilities.map(p => p.species),
                    datasets: [{
                        label: 'Probability %',
                        data: d.all_probabilities.map(p => p.probability),
                        backgroundColor: d.all_probabilities.map((_, i) => i === 0 ? 'rgba(168,85,247,0.8)' : 'rgba(168,85,247,0.35)'),
                        borderColor: '#a855f7', borderWidth: 1
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } }
                    }
                }
            });
        }
    } catch (e) {
        if (resultEl) resultEl.innerHTML = `<p style="color:var(--danger);">Error: ${e.message}</p>`;
    }
}

async function loadCameraTraps() {
    try {
        const d = await fetch('/camera-traps').then(r => r.json());
        const tbody = document.getElementById('traps-tbody');
        if (!tbody || !d.sightings) return;

        tbody.innerHTML = d.sightings.map(s => `<tr>
            <td style="font-family:var(--font-mono);font-size:0.8rem;">${s.sighting_id}</td>
            <td>${s.camera_node}</td>
            <td>${s.zone}</td>
            <td style="font-weight:600;text-transform:capitalize;">${s.species}</td>
            <td><span style="color:${s.confidence > 80 ? 'var(--primary)' : 'var(--warning)'};">${s.confidence}%</span></td>
            <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(s.timestamp).toLocaleString()}</td>
        </tr>`).join('');
    } catch (e) { console.error('Camera traps error:', e); }
}

// ============================================================
//  SYSTEM HEALTH
// ============================================================
async function loadSystemHealth() {
    try {
        const d = await fetch('/system-health').then(r => r.json());
        const cards = document.getElementById('health-cards');
        if (cards) {
            cards.innerHTML = `
                <div class="card kpi-card"><div class="card-title">Overall Status</div><div class="card-value kpi-green">${d.status}</div></div>
                <div class="card kpi-card"><div class="card-title">DB Records</div><div class="card-value">${d.database_records.toLocaleString()}</div></div>
                <div class="card kpi-card"><div class="card-title">Anomalies (DB)</div><div class="card-value kpi-red">${d.anomalies_detected}</div></div>
                <div class="card kpi-card"><div class="card-title">Edge Cache (KB)</div><div class="card-value">${d.edge_offline_cache_kb}</div></div>
            `;
        }

        const tbody = document.getElementById('models-tbody');
        if (tbody && d.models_status) {
            tbody.innerHTML = Object.entries(d.models_status).map(([name, status]) =>
                `<tr><td>${name.replace(/_/g, ' ')}</td><td>
                    <span class="badge ${status ? 'badge-ok' : 'badge-high'}">${status ? '✅ Loaded' : '❌ Missing'}</span>
                </td></tr>`
            ).join('');
        }
    } catch (e) { console.error('System health error:', e); }
}
