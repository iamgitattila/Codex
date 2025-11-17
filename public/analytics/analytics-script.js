// Analytics Dashboard Script
const API_BASE = '/api';
let currentListicleId = 1; // Default to first listicle
let currentPeriod = 'all_time';

// Get listicle ID from URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('listicle')) {
    currentListicleId = parseInt(urlParams.get('listicle'));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTimeFilters();
    loadAnalytics();
});

// Time Filters
function initTimeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            loadAnalytics();
        });
    });
}

// Load Analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics/dashboard/${currentListicleId}`);
        const data = await response.json();

        updateMetrics(data[currentPeriod]?.overview || {});
        updateTopItems(data[currentPeriod]?.topItems || []);
        updateDeviceBreakdown(data[currentPeriod]?.deviceBreakdown || []);
        updateTimeSeriesChart(data[currentPeriod]?.timeSeries || []);

        // Load additional analytics
        loadThumbnailPerformance();
        loadPositionAnalytics();

    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Update Metrics
function updateMetrics(overview) {
    document.getElementById('total-visitors').textContent =
        formatNumber(overview.unique_visitors || 0);
    document.getElementById('total-clicks').textContent =
        formatNumber(overview.total_clicks || 0);
    document.getElementById('ctr').textContent =
        (overview.ctr || 0) + '%';
    document.getElementById('total-revenue').textContent =
        '$' + formatNumber(parseFloat(overview.total_revenue || 0).toFixed(2));
    document.getElementById('revenue-per-click').textContent =
        '$' + (overview.revenuePerClick || 0) + ' per click';
}

// Update Top Items Table
function updateTopItems(items) {
    const tbody = document.getElementById('top-items-body');

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const ctr = item.impressions > 0
            ? ((item.clicks / item.impressions) * 100).toFixed(2)
            : '0.00';

        return `
            <tr>
                <td><strong>#${item.position}</strong></td>
                <td>${item.title}</td>
                <td><strong>${formatNumber(item.clicks)}</strong></td>
                <td>${formatNumber(item.impressions)}</td>
                <td>
                    <span style="color: var(--primary); font-weight: 600;">
                        ${ctr}%
                    </span>
                </td>
                <td><strong>$${formatNumber(parseFloat(item.revenue || 0).toFixed(2))}</strong></td>
            </tr>
        `;
    }).join('');
}

// Update Device Breakdown
function updateDeviceBreakdown(devices) {
    const container = document.getElementById('device-stats');

    if (devices.length === 0) {
        container.innerHTML = '<div class="loading-cell">No device data</div>';
        return;
    }

    const deviceIcons = {
        desktop: '🖥️',
        mobile: '📱',
        tablet: '📊',
        unknown: '❓'
    };

    container.innerHTML = devices.map(device => `
        <div class="device-stat">
            <div class="device-name">
                <span>${deviceIcons[device.device_type] || '📱'}</span>
                <span>${capitalize(device.device_type)}</span>
            </div>
            <div class="device-value">${formatNumber(device.clicks)}</div>
        </div>
    `).join('');
}

// Update Time Series Chart (Simple Bar Visualization)
function updateTimeSeriesChart(timeSeries) {
    const container = document.getElementById('clicks-chart');

    if (timeSeries.length === 0) {
        container.innerHTML = '<div class="simple-chart">No data available</div>';
        return;
    }

    const maxClicks = Math.max(...timeSeries.map(d => d.clicks));

    container.innerHTML = `
        <div class="simple-chart" style="display: flex; align-items: flex-end; gap: 4px; height: 100%; padding: 20px;">
            ${timeSeries.map(data => {
                const height = (data.clicks / maxClicks) * 100;
                return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--primary);">
                            ${data.clicks}
                        </div>
                        <div style="
                            width: 100%;
                            height: ${height}%;
                            background: linear-gradient(180deg, var(--primary), var(--primary-dark));
                            border-radius: 4px 4px 0 0;
                            min-height: 2px;
                            transition: height 0.5s ease;
                        "></div>
                        <div style="font-size: 10px; color: var(--text-secondary); white-space: nowrap;">
                            ${formatDate(data.time_bucket)}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Load Thumbnail Performance
async function loadThumbnailPerformance() {
    try {
        // Get all items first
        const response = await fetch(`${API_BASE}/listicle/top-10-productivity-tools-2024`);
        const data = await response.json();
        const items = data.items || [];

        const container = document.getElementById('thumbnail-tests');

        if (items.length === 0) {
            container.innerHTML = '<div class="loading-cell">No items found</div>';
            return;
        }

        // For each item, get thumbnail performance
        const itemTests = await Promise.all(items.slice(0, 5).map(async (item) => {
            try {
                const thumbResponse = await fetch(`${API_BASE}/analytics/thumbnails/${item.id}`);
                const thumbData = await thumbResponse.json();
                return { item, thumbnails: thumbData.thumbnails || [] };
            } catch {
                return { item, thumbnails: [] };
            }
        }));

        container.innerHTML = itemTests.map(({ item, thumbnails }) => {
            if (thumbnails.length === 0) return '';

            const bestCTR = Math.max(...thumbnails.map(t => parseFloat(t.ctr)));

            return `
                <div class="item-test">
                    <h4>${item.title}</h4>
                    <div class="thumbnail-variants">
                        ${thumbnails.map(thumb => {
                            const isWinner = parseFloat(thumb.ctr) === bestCTR && thumbnails.length > 1;
                            return `
                                <div class="thumbnail-variant ${isWinner ? 'winner' : ''}">
                                    <img src="${thumb.image_url}" alt="Variant ${thumb.variant_name}">
                                    <div class="variant-name">
                                        <span>Variant ${thumb.variant_name}</span>
                                        ${isWinner ? '<span class="winner-badge">Winner</span>' : ''}
                                    </div>
                                    <div class="variant-ctr">${thumb.ctr}%</div>
                                    <div class="variant-stats">
                                        ${thumb.clicks} clicks / ${thumb.impressions} impressions
                                    </div>
                                    <div class="variant-stats">
                                        CI: ${thumb.ctr_lower}% - ${thumb.ctr_upper}%
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).filter(Boolean).join('');

        if (container.innerHTML === '') {
            container.innerHTML = '<div class="loading-cell">No thumbnail test data available</div>';
        }

    } catch (error) {
        console.error('Error loading thumbnail performance:', error);
        document.getElementById('thumbnail-tests').innerHTML =
            '<div class="loading-cell">Error loading thumbnail data</div>';
    }
}

// Load Position Analytics
async function loadPositionAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics/positions/${currentListicleId}`);
        const positions = await response.json();

        const container = document.getElementById('position-chart');

        if (positions.length === 0) {
            container.innerHTML = '<div class="loading-cell">No position data available</div>';
            return;
        }

        const maxClicks = Math.max(...positions.map(p => p.clicks));

        container.innerHTML = positions.map(pos => {
            const percentage = maxClicks > 0 ? (pos.clicks / maxClicks) * 100 : 0;

            return `
                <div class="position-bar">
                    <div class="position-label">Position #${pos.position || '?'}</div>
                    <div class="position-bar-container">
                        <div class="position-bar-fill" style="width: ${percentage}%">
                            ${pos.ctr}% CTR
                        </div>
                    </div>
                    <div class="position-value">${formatNumber(pos.clicks)} clicks</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading position analytics:', error);
        document.getElementById('position-chart').innerHTML =
            '<div class="loading-cell">Error loading position data</div>';
    }
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    if (currentPeriod === 'last_24h') {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}
