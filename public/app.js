// State management
let selectedAccount = null;
let selectedCampaigns = [];
let adSets = [];

// DOM elements
const accountSelect = document.getElementById('account-select');
const campaignSection = document.getElementById('campaign-section');
const campaignList = document.getElementById('campaign-list');
const loadAdsetsBtn = document.getElementById('load-adsets');
const adsetSection = document.getElementById('adset-section');
const adsetList = document.getElementById('adset-list');
const updateSection = document.getElementById('update-section');
const bidAmountInput = document.getElementById('bid-amount');
const updateBidsBtn = document.getElementById('update-bids');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    accountSelect.addEventListener('change', handleAccountChange);

    document.getElementById('select-all-campaigns').addEventListener('click', () => {
        document.querySelectorAll('.campaign-checkbox').forEach(cb => cb.checked = true);
        updateLoadAdsetsButton();
    });

    document.getElementById('deselect-all-campaigns').addEventListener('click', () => {
        document.querySelectorAll('.campaign-checkbox').forEach(cb => cb.checked = false);
        updateLoadAdsetsButton();
    });

    loadAdsetsBtn.addEventListener('click', loadAdSets);
    updateBidsBtn.addEventListener('click', updateBids);
}

// Load accounts
async function loadAccounts() {
    showLoading('account-loading', true);
    hideError('account-error');

    try {
        const response = await fetch('/api/accounts');
        const result = await response.json();

        if (result.success && result.data) {
            populateAccounts(result.data);
        } else {
            showError('account-error', result.error || 'Failed to load accounts');
        }
    } catch (error) {
        showError('account-error', 'Network error: ' + error.message);
    } finally {
        showLoading('account-loading', false);
    }
}

// Populate account dropdown
function populateAccounts(accounts) {
    accountSelect.innerHTML = '<option value="">-- Select an Account --</option>';

    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.account_id;
        option.textContent = `${account.name} (${account.account_id})`;
        accountSelect.appendChild(option);
    });
}

// Handle account change
async function handleAccountChange(event) {
    selectedAccount = event.target.value;

    if (!selectedAccount) {
        campaignSection.style.display = 'none';
        adsetSection.style.display = 'none';
        updateSection.style.display = 'none';
        return;
    }

    await loadCampaigns(selectedAccount);
}

// Load campaigns
async function loadCampaigns(accountId) {
    campaignSection.style.display = 'block';
    showLoading('campaign-loading', true);
    hideError('campaign-error');
    campaignList.innerHTML = '';
    adsetSection.style.display = 'none';
    updateSection.style.display = 'none';

    try {
        const response = await fetch(`/api/accounts/${accountId}/campaigns`);
        const result = await response.json();

        if (result.success && result.data) {
            populateCampaigns(result.data);
        } else {
            showError('campaign-error', result.error || 'Failed to load campaigns');
        }
    } catch (error) {
        showError('campaign-error', 'Network error: ' + error.message);
    } finally {
        showLoading('campaign-loading', false);
    }
}

// Populate campaigns
function populateCampaigns(campaigns) {
    if (campaigns.length === 0) {
        campaignList.innerHTML = '<p class="no-data">No campaigns found for this account.</p>';
        return;
    }

    campaignList.innerHTML = '';

    campaigns.forEach(campaign => {
        const campaignDiv = document.createElement('div');
        campaignDiv.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `campaign-${campaign.id}`;
        checkbox.value = campaign.id;
        checkbox.className = 'campaign-checkbox';
        checkbox.addEventListener('change', updateLoadAdsetsButton);

        const label = document.createElement('label');
        label.htmlFor = `campaign-${campaign.id}`;

        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge status-${campaign.status.toLowerCase()}`;
        statusBadge.textContent = campaign.status;

        label.appendChild(document.createTextNode(`${campaign.name} `));
        label.appendChild(statusBadge);
        label.appendChild(document.createTextNode(` (${campaign.id})`));

        campaignDiv.appendChild(checkbox);
        campaignDiv.appendChild(label);

        campaignList.appendChild(campaignDiv);
    });

    updateLoadAdsetsButton();
}

// Update load ad sets button visibility
function updateLoadAdsetsButton() {
    const checkedBoxes = document.querySelectorAll('.campaign-checkbox:checked');
    loadAdsetsBtn.style.display = checkedBoxes.length > 0 ? 'block' : 'none';
}

// Load ad sets
async function loadAdSets() {
    const checkedBoxes = document.querySelectorAll('.campaign-checkbox:checked');
    selectedCampaigns = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedCampaigns.length === 0) {
        return;
    }

    adsetSection.style.display = 'block';
    updateSection.style.display = 'none';
    showLoading('adset-loading', true);
    hideError('adset-error');
    adsetList.innerHTML = '';

    try {
        const response = await fetch('/api/campaigns/adsets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ campaignIds: selectedCampaigns })
        });

        const result = await response.json();

        if (result.success && result.data) {
            adSets = result.data;
            displayAdSets(adSets);
            if (adSets.length > 0) {
                updateSection.style.display = 'block';
            }
        } else {
            showError('adset-error', result.error || 'Failed to load ad sets');
        }
    } catch (error) {
        showError('adset-error', 'Network error: ' + error.message);
    } finally {
        showLoading('adset-loading', false);
    }
}

// Display ad sets
function displayAdSets(adsets) {
    const summary = document.getElementById('adset-summary');
    summary.style.display = 'block';
    summary.innerHTML = `<strong>${adsets.length}</strong> ad sets found in selected campaigns`;

    if (adsets.length === 0) {
        adsetList.innerHTML = '<p class="no-data">No ad sets found in selected campaigns.</p>';
        return;
    }

    adsetList.innerHTML = '';

    adsets.forEach(adset => {
        const adsetCard = document.createElement('div');
        adsetCard.className = 'adset-card';

        const currentBid = adset.bid_amount ? (adset.bid_amount / 100).toFixed(2) : 'N/A';

        adsetCard.innerHTML = `
            <div class="adset-name">${adset.name}</div>
            <div class="adset-info">
                <span class="status-badge status-${adset.status.toLowerCase()}">${adset.status}</span>
                <span class="adset-detail">Strategy: ${adset.bid_strategy || 'N/A'}</span>
                <span class="adset-detail">Current Bid: $${currentBid}</span>
            </div>
            <div class="adset-id">ID: ${adset.id}</div>
        `;

        adsetList.appendChild(adsetCard);
    });
}

// Update bids
async function updateBids() {
    const bidAmount = bidAmountInput.value;

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
        alert('Please enter a valid bid amount');
        return;
    }

    if (!confirm(`Are you sure you want to update ${adSets.length} ad sets with a bid cap of $${bidAmount}?`)) {
        return;
    }

    const adSetIds = adSets.map(adset => adset.id);

    showLoading('update-loading', true);
    document.getElementById('update-result').style.display = 'none';

    try {
        const response = await fetch('/api/adsets/bulk-update-bid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adSetIds: adSetIds,
                bidAmount: parseFloat(bidAmount)
            })
        });

        const result = await response.json();
        displayUpdateResult(result);

        // Reload ad sets to show updated values
        if (result.success) {
            setTimeout(() => loadAdSets(), 2000);
        }
    } catch (error) {
        displayUpdateResult({
            success: false,
            error: 'Network error: ' + error.message
        });
    } finally {
        showLoading('update-loading', false);
    }
}

// Display update result
function displayUpdateResult(result) {
    const resultDiv = document.getElementById('update-result');
    resultDiv.style.display = 'block';

    if (result.success) {
        resultDiv.className = 'result success';
        resultDiv.innerHTML = `
            <h3>✅ Success!</h3>
            <p>Updated ${result.updated} ad sets successfully.</p>
        `;
    } else if (result.updated > 0) {
        resultDiv.className = 'result warning';
        resultDiv.innerHTML = `
            <h3>⚠️ Partial Success</h3>
            <p>Updated ${result.updated} ad sets successfully.</p>
            <p>Failed to update ${result.failed} ad sets.</p>
            <details>
                <summary>Show errors</summary>
                <ul>
                    ${result.errors.map(e => `<li>${e.id}: ${e.error}</li>`).join('')}
                </ul>
            </details>
        `;
    } else {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ Error</h3>
            <p>${result.error || 'Failed to update ad sets'}</p>
        `;
    }
}

// Helper functions
function showLoading(elementId, show) {
    document.getElementById(elementId).style.display = show ? 'block' : 'none';
}

function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError(elementId) {
    document.getElementById(elementId).style.display = 'none';
}
