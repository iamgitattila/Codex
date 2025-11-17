const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./lib/database');
const optimizer = require('./lib/optimizer');
const analytics = require('./lib/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Session tracking middleware
app.use((req, res, next) => {
    // Get or create visitor ID (persistent across sessions)
    let visitorId = req.cookies.visitor_id;
    if (!visitorId) {
        visitorId = uuidv4();
        res.cookie('visitor_id', visitorId, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    }
    req.visitorId = visitorId;

    // Get or create session ID
    let sessionId = req.cookies.session_id;
    if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('session_id', sessionId, { maxAge: 30 * 60 * 1000 }); // 30 minutes
    }
    req.sessionId = sessionId;

    next();
});

// ==================== PUBLIC API ====================

// Get listicle by slug with optimized content
app.get('/api/listicle/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const deviceType = getDeviceType(req.headers['user-agent']);

        // Get listicle
        const listicle = await db.getListicle(slug);
        if (!listicle) {
            return res.status(404).json({ error: 'Listicle not found' });
        }

        // Get items with optimized thumbnails
        const items = await db.getListicleItems(listicle.id);

        // For each item, select the best performing thumbnail using Thompson Sampling
        const optimizedItems = await Promise.all(items.map(async (item) => {
            const thumbnail = await optimizer.selectOptimalThumbnail(item.id);
            return {
                ...item,
                thumbnail_id: thumbnail.id,
                thumbnail_url: thumbnail.image_url,
                thumbnail_alt: thumbnail.alt_text,
                thumbnail_variant: thumbnail.variant_name
            };
        }));

        // Auto-reorder items if enabled
        let finalItems = optimizedItems;
        if (listicle.auto_reorder) {
            finalItems = await optimizer.reorderItemsByPerformance(
                listicle.id,
                optimizedItems,
                listicle.optimization_mode
            );
        }

        // Create or update session
        await db.createOrUpdateSession({
            sessionId: req.sessionId,
            visitorId: req.visitorId,
            listicleId: listicle.id,
            entryUrl: req.get('Referrer') || req.originalUrl,
            deviceType,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            referrer: req.get('Referrer')
        });

        res.json({
            listicle,
            items: finalItems,
            sessionId: req.sessionId
        });
    } catch (error) {
        console.error('Error fetching listicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track impression
app.post('/api/track/impression', async (req, res) => {
    try {
        const { listicle_id, item_id, thumbnail_id, position } = req.body;
        const deviceType = getDeviceType(req.headers['user-agent']);

        await db.trackImpression({
            listicleId: listicle_id,
            itemId: item_id,
            thumbnailId: thumbnail_id,
            sessionId: req.sessionId,
            visitorId: req.visitorId,
            position,
            deviceType
        });

        // Update thumbnail impression count
        await db.incrementThumbnailImpressions(thumbnail_id);

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking impression:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track click and redirect
app.get('/api/track/click/:clickId', async (req, res) => {
    try {
        const { clickId } = req.params;

        // Get click details
        const click = await db.getClick(clickId);
        if (!click) {
            return res.status(404).send('Click not found');
        }

        // Build redirect URL with affiliate parameters
        const redirectUrl = new URL(click.offer_url);

        // Add sub IDs to URL
        if (click.sub_id_1) redirectUrl.searchParams.set('sub1', click.sub_id_1);
        if (click.sub_id_2) redirectUrl.searchParams.set('sub2', click.sub_id_2);
        if (click.sub_id_3) redirectUrl.searchParams.set('sub3', click.sub_id_3);
        if (click.sub_id_4) redirectUrl.searchParams.set('sub4', click.sub_id_4);

        // Add click ID for tracking conversions
        redirectUrl.searchParams.set('click_id', clickId);

        // Redirect to offer
        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('Error processing click:', error);
        res.status(500).send('Error processing click');
    }
});

// Register click (called before redirect)
app.post('/api/track/click', async (req, res) => {
    try {
        const { listicle_id, item_id, thumbnail_id, position } = req.body;
        const deviceType = getDeviceType(req.headers['user-agent']);
        const clickId = uuidv4();

        // Get item details for redirect URL
        const item = await db.getItem(item_id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Create click record
        await db.trackClick({
            clickId,
            listicleId: listicle_id,
            itemId: item_id,
            thumbnailId: thumbnail_id,
            sessionId: req.sessionId,
            visitorId: req.visitorId,
            position,
            deviceType,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            referrer: req.get('Referrer'),
            offerUrl: item.offer_url
        });

        // Update thumbnail click count
        await db.incrementThumbnailClicks(thumbnail_id);

        // Update Thompson Sampling model (success)
        await optimizer.updateThompsonSampling(item_id, thumbnail_id, true);

        // Update session click count
        await db.updateSessionClicks(req.sessionId);

        // Return click tracking URL
        res.json({
            success: true,
            clickId,
            redirectUrl: `/api/track/click/${clickId}`
        });
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track conversion (called by postback URL from affiliate network)
app.post('/api/track/conversion', async (req, res) => {
    try {
        const { click_id, conversion_value } = req.body;

        await db.trackConversion({
            clickId: click_id,
            conversionValue: parseFloat(conversion_value) || 0
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking conversion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ADMIN API ====================

// Get all listicles
app.get('/api/admin/listicles', async (req, res) => {
    try {
        const listicles = await db.getAllListicles();
        res.json(listicles);
    } catch (error) {
        console.error('Error fetching listicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new listicle
app.post('/api/admin/listicles', async (req, res) => {
    try {
        const listicleId = await db.createListicle(req.body);
        res.json({ success: true, id: listicleId });
    } catch (error) {
        console.error('Error creating listicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update listicle
app.put('/api/admin/listicles/:id', async (req, res) => {
    try {
        await db.updateListicle(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating listicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete listicle
app.delete('/api/admin/listicles/:id', async (req, res) => {
    try {
        await db.deleteListicle(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting listicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add item to listicle
app.post('/api/admin/items', async (req, res) => {
    try {
        const itemId = await db.createItem(req.body);
        res.json({ success: true, id: itemId });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update item
app.put('/api/admin/items/:id', async (req, res) => {
    try {
        await db.updateItem(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete item
app.delete('/api/admin/items/:id', async (req, res) => {
    try {
        await db.deleteItem(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add thumbnail variant
app.post('/api/admin/thumbnails', async (req, res) => {
    try {
        const thumbnailId = await db.createThumbnail(req.body);

        // Initialize Thompson Sampling for new thumbnail
        await optimizer.initializeThompsonSampling(req.body.item_id, thumbnailId);

        res.json({ success: true, id: thumbnailId });
    } catch (error) {
        console.error('Error creating thumbnail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete thumbnail
app.delete('/api/admin/thumbnails/:id', async (req, res) => {
    try {
        await db.deleteThumbnail(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting thumbnail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ANALYTICS API ====================

// Get listicle analytics
app.get('/api/analytics/listicle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { period } = req.query; // 'all_time', 'last_7d', 'last_30d'

        const analyticsData = await analytics.getListicleAnalytics(id, period);
        res.json(analyticsData);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get item performance
app.get('/api/analytics/item/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const performance = await analytics.getItemPerformance(id);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching item performance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get thumbnail performance comparison
app.get('/api/analytics/thumbnails/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const comparison = await analytics.getThumbnailPerformance(itemId);
        res.json(comparison);
    } catch (error) {
        console.error('Error fetching thumbnail performance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get position-based analytics
app.get('/api/analytics/positions/:listicleId', async (req, res) => {
    try {
        const { listicleId } = req.params;
        const positionData = await analytics.getPositionAnalytics(listicleId);
        res.json(positionData);
    } catch (error) {
        console.error('Error fetching position analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get real-time dashboard data
app.get('/api/analytics/dashboard/:listicleId', async (req, res) => {
    try {
        const { listicleId } = req.params;
        const dashboard = await analytics.getDashboardData(listicleId);
        res.json(dashboard);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== UTILITY FUNCTIONS ====================

function getDeviceType(userAgent) {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// ==================== FRONTEND ROUTES ====================

// Serve listicle page
app.get('/listicle/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'listicle.html'));
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`\n🚀 Listicle Optimizer Server running on port ${PORT}\n`);
    console.log(`   📊 Admin Panel:    http://localhost:${PORT}/admin`);
    console.log(`   📈 Analytics:      http://localhost:${PORT}/analytics`);
    console.log(`   🌐 Public View:    http://localhost:${PORT}/listicle/[slug]\n`);
});

module.exports = app;
