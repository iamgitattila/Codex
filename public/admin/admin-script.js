// Admin Dashboard Script
const API_BASE = '/api';
let currentListicleId = null;
let currentItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForms();
    loadListicles();
});

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            switchView(viewName);

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Create new button
    document.getElementById('create-new-btn').addEventListener('click', () => {
        switchView('create');
        resetListicleForm();
    });

    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        switchView('listicles');
    });
}

function switchView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');

        // Update page title
        const titles = {
            listicles: 'My Listicles',
            create: 'Create New Listicle'
        };
        document.getElementById('page-title').textContent = titles[viewName] || 'Listicle Optimizer';
    }
}

// Load Listicles
async function loadListicles() {
    const grid = document.getElementById('listicles-grid');
    grid.innerHTML = '<div class="loading">Loading listicles...</div>';

    try {
        const response = await fetch(`${API_BASE}/admin/listicles`);
        const listicles = await response.json();

        if (listicles.length === 0) {
            grid.innerHTML = `
                <div class="loading">
                    <p>No listicles yet. Create your first one!</p>
                    <button class="btn btn-primary" onclick="switchView('create')">
                        ➕ Create Listicle
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = listicles.map(listicle => `
            <div class="listicle-card" onclick="editListicle(${listicle.id})">
                <div class="status-badge ${listicle.status}">${listicle.status}</div>
                <h3>${listicle.title}</h3>
                <div class="slug">/listicle/${listicle.slug}</div>

                <div class="stats">
                    <div class="stat">
                        <div class="stat-label">Mode</div>
                        <div class="stat-value" style="font-size: 12px; text-transform: uppercase;">
                            ${listicle.optimization_mode}
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Auto-Sort</div>
                        <div class="stat-value" style="font-size: 16px;">
                            ${listicle.auto_reorder ? '✓' : '✗'}
                        </div>
                    </div>
                </div>

                <div class="actions" onclick="event.stopPropagation()">
                    <a href="/listicle/${listicle.slug}" target="_blank" class="btn btn-sm btn-secondary">
                        View Live
                    </a>
                    <a href="/analytics?listicle=${listicle.id}" target="_blank" class="btn btn-sm btn-primary">
                        Analytics
                    </a>
                    <button class="btn btn-sm btn-danger" onclick="deleteListicle(${listicle.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading listicles:', error);
        grid.innerHTML = '<div class="loading">Error loading listicles. Please refresh.</div>';
    }
}

// Forms
function initForms() {
    // Listicle form
    document.getElementById('listicle-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveListicle();
    });

    // Auto-generate slug from title
    document.getElementById('title').addEventListener('input', (e) => {
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        document.getElementById('slug').value = slug;
    });

    // Item modal
    const itemModal = document.getElementById('item-modal');
    const modalCloseButtons = itemModal.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            itemModal.classList.remove('active');
        });
    });

    // Item form
    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveItem();
    });

    // Add item button
    document.getElementById('add-item-btn').addEventListener('click', () => {
        openItemModal();
    });

    // Add thumbnail button
    document.getElementById('add-thumbnail-btn').addEventListener('click', () => {
        addThumbnailInput();
    });
}

function resetListicleForm() {
    document.getElementById('listicle-form').reset();
    document.getElementById('listicle-id').value = '';
    document.getElementById('form-title').textContent = 'Create New Listicle';
    document.getElementById('items-section').style.display = 'none';
    currentListicleId = null;
    currentItems = [];
}

async function saveListicle() {
    const id = document.getElementById('listicle-id').value;
    const data = {
        title: document.getElementById('title').value,
        slug: document.getElementById('slug').value,
        description: document.getElementById('description').value,
        meta_title: document.getElementById('meta-title').value,
        meta_description: document.getElementById('meta-description').value,
        optimization_mode: document.getElementById('optimization-mode').value,
        auto_reorder: parseInt(document.getElementById('auto-reorder').value)
    };

    try {
        let response;
        if (id) {
            // Update existing
            response = await fetch(`${API_BASE}/admin/listicles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new
            response = await fetch(`${API_BASE}/admin/listicles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            currentListicleId = result.id;
            document.getElementById('listicle-id').value = result.id;
        }

        if (response.ok) {
            alert('Listicle saved successfully!');
            document.getElementById('form-title').textContent = 'Edit Listicle';
            document.getElementById('items-section').style.display = 'block';
            loadItems();
        } else {
            alert('Error saving listicle');
        }
    } catch (error) {
        console.error('Error saving listicle:', error);
        alert('Error saving listicle');
    }
}

async function editListicle(id) {
    try {
        const response = await fetch(`${API_BASE}/admin/listicles`);
        const listicles = await response.json();
        const listicle = listicles.find(l => l.id === id);

        if (!listicle) {
            alert('Listicle not found');
            return;
        }

        // Fill form
        document.getElementById('listicle-id').value = listicle.id;
        document.getElementById('title').value = listicle.title;
        document.getElementById('slug').value = listicle.slug;
        document.getElementById('description').value = listicle.description || '';
        document.getElementById('meta-title').value = listicle.meta_title || '';
        document.getElementById('meta-description').value = listicle.meta_description || '';
        document.getElementById('optimization-mode').value = listicle.optimization_mode;
        document.getElementById('auto-reorder').value = listicle.auto_reorder;

        currentListicleId = listicle.id;

        document.getElementById('form-title').textContent = 'Edit Listicle';
        document.getElementById('items-section').style.display = 'block';

        switchView('create');
        loadItems();

    } catch (error) {
        console.error('Error loading listicle:', error);
        alert('Error loading listicle');
    }
}

async function deleteListicle(id) {
    if (!confirm('Are you sure you want to delete this listicle? This cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/listicles/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Listicle deleted successfully');
            loadListicles();
        } else {
            alert('Error deleting listicle');
        }
    } catch (error) {
        console.error('Error deleting listicle:', error);
        alert('Error deleting listicle');
    }
}

// Items Management
async function loadItems() {
    if (!currentListicleId) return;

    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '<div class="loading">Loading items...</div>';

    try {
        const response = await fetch(`${API_BASE}/listicle/top-10-productivity-tools-2024`);
        const data = await response.json();
        currentItems = data.items || [];

        if (currentItems.length === 0) {
            itemsList.innerHTML = '<p style="color: #64748B;">No items yet. Add your first item!</p>';
            return;
        }

        itemsList.innerHTML = currentItems.map((item, index) => `
            <div class="item-card">
                <div>
                    <h4>${index + 1}. ${item.title}</h4>
                    <div class="item-url">${item.offer_url}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editItem(${item.id})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading items:', error);
        itemsList.innerHTML = '<p style="color: #EF4444;">Error loading items</p>';
    }
}

function openItemModal(item = null) {
    const modal = document.getElementById('item-modal');
    const form = document.getElementById('item-form');

    form.reset();
    document.getElementById('item-id').value = item ? item.id : '';
    document.getElementById('item-listicle-id').value = currentListicleId;

    if (item) {
        document.getElementById('item-modal-title').textContent = 'Edit Item';
        document.getElementById('item-title').value = item.title;
        document.getElementById('item-description').value = item.description || '';
        document.getElementById('item-url').value = item.offer_url;
        document.getElementById('item-price').value = item.price || '';
        document.getElementById('item-rating').value = item.rating || '';
        document.getElementById('item-badge').value = item.badge || '';
        document.getElementById('item-cta').value = item.cta_text || '';
    } else {
        document.getElementById('item-modal-title').textContent = 'Add Item';
    }

    // Reset thumbnails
    document.getElementById('thumbnails-container').innerHTML = '';
    addThumbnailInput();

    modal.classList.add('active');
}

function addThumbnailInput() {
    const container = document.getElementById('thumbnails-container');
    const index = container.children.length;
    const variant = String.fromCharCode(65 + index); // A, B, C, etc.

    const div = document.createElement('div');
    div.className = 'thumbnail-input';
    div.innerHTML = `
        <input type="text" placeholder="Thumbnail ${variant} URL" class="thumbnail-url">
        <input type="text" placeholder="Variant ${variant}" value="${variant}" class="thumbnail-variant">
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

async function saveItem() {
    const id = document.getElementById('item-id').value;
    const listicleId = document.getElementById('item-listicle-id').value;

    const data = {
        listicle_id: parseInt(listicleId),
        title: document.getElementById('item-title').value,
        description: document.getElementById('item-description').value,
        offer_url: document.getElementById('item-url').value,
        price: document.getElementById('item-price').value,
        rating: parseFloat(document.getElementById('item-rating').value) || null,
        badge: document.getElementById('item-badge').value,
        cta_text: document.getElementById('item-cta').value || 'Learn More',
        position: currentItems.length + 1
    };

    try {
        let response;
        if (id) {
            // Update existing
            response = await fetch(`${API_BASE}/admin/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new
            response = await fetch(`${API_BASE}/admin/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                const itemId = result.id;

                // Add thumbnails
                const thumbnailInputs = document.querySelectorAll('.thumbnail-input');
                for (const input of thumbnailInputs) {
                    const url = input.querySelector('.thumbnail-url').value;
                    const variant = input.querySelector('.thumbnail-variant').value;

                    if (url) {
                        await fetch(`${API_BASE}/admin/thumbnails`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                item_id: itemId,
                                image_url: url,
                                variant_name: variant,
                                is_default: input === thumbnailInputs[0] ? 1 : 0
                            })
                        });
                    }
                }
            }
        }

        if (response.ok) {
            alert('Item saved successfully!');
            document.getElementById('item-modal').classList.remove('active');
            loadItems();
        } else {
            alert('Error saving item');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item');
    }
}

async function editItem(id) {
    const item = currentItems.find(i => i.id === id);
    if (item) {
        openItemModal(item);
    }
}

async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;

    try {
        const response = await fetch(`${API_BASE}/admin/items/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Item deleted successfully');
            loadItems();
        } else {
            alert('Error deleting item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
    }
}

// Expose functions to global scope
window.editListicle = editListicle;
window.deleteListicle = deleteListicle;
window.switchView = switchView;
window.editItem = editItem;
window.deleteItem = deleteItem;
