const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'listicle-optimizer.db');

class Database {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            }
        });
    }

    // Promisify database operations
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // ==================== LISTICLE OPERATIONS ====================

    async getListicle(slug) {
        return this.get('SELECT * FROM listicles WHERE slug = ? AND status = ?', [slug, 'active']);
    }

    async getListicleById(id) {
        return this.get('SELECT * FROM listicles WHERE id = ?', [id]);
    }

    async getAllListicles() {
        return this.all('SELECT * FROM listicles ORDER BY created_at DESC');
    }

    async createListicle(data) {
        const result = await this.run(
            `INSERT INTO listicles (slug, title, description, meta_title, meta_description, template, optimization_mode, auto_reorder, reorder_threshold, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.slug,
                data.title,
                data.description || '',
                data.meta_title || data.title,
                data.meta_description || data.description,
                data.template || 'default',
                data.optimization_mode || 'ctr',
                data.auto_reorder !== undefined ? data.auto_reorder : 1,
                data.reorder_threshold || 100,
                data.status || 'active'
            ]
        );
        return result.id;
    }

    async updateListicle(id, data) {
        const updates = [];
        const values = [];

        if (data.title) {
            updates.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.optimization_mode) {
            updates.push('optimization_mode = ?');
            values.push(data.optimization_mode);
        }
        if (data.auto_reorder !== undefined) {
            updates.push('auto_reorder = ?');
            values.push(data.auto_reorder);
        }
        if (data.status) {
            updates.push('status = ?');
            values.push(data.status);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        return this.run(
            `UPDATE listicles SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    }

    async deleteListicle(id) {
        return this.run('DELETE FROM listicles WHERE id = ?', [id]);
    }

    // ==================== ITEM OPERATIONS ====================

    async getListicleItems(listicleId) {
        return this.all(
            'SELECT * FROM items WHERE listicle_id = ? AND status = ? ORDER BY position ASC',
            [listicleId, 'active']
        );
    }

    async getItem(id) {
        return this.get('SELECT * FROM items WHERE id = ?', [id]);
    }

    async createItem(data) {
        const result = await this.run(
            `INSERT INTO items (listicle_id, title, description, offer_url, position, original_position, cta_text, price, rating, badge, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.listicle_id,
                data.title,
                data.description || '',
                data.offer_url,
                data.position,
                data.position, // original_position same as initial position
                data.cta_text || 'Learn More',
                data.price || null,
                data.rating || null,
                data.badge || null,
                data.status || 'active'
            ]
        );
        return result.id;
    }

    async updateItem(id, data) {
        const updates = [];
        const values = [];

        if (data.title) {
            updates.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.offer_url) {
            updates.push('offer_url = ?');
            values.push(data.offer_url);
        }
        if (data.position !== undefined) {
            updates.push('position = ?');
            values.push(data.position);
        }
        if (data.price !== undefined) {
            updates.push('price = ?');
            values.push(data.price);
        }
        if (data.rating !== undefined) {
            updates.push('rating = ?');
            values.push(data.rating);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        return this.run(
            `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    }

    async deleteItem(id) {
        return this.run('DELETE FROM items WHERE id = ?', [id]);
    }

    async updateItemPosition(id, position) {
        return this.run('UPDATE items SET position = ? WHERE id = ?', [position, id]);
    }

    // ==================== THUMBNAIL OPERATIONS ====================

    async getItemThumbnails(itemId) {
        return this.all('SELECT * FROM thumbnails WHERE item_id = ?', [itemId]);
    }

    async getThumbnail(id) {
        return this.get('SELECT * FROM thumbnails WHERE id = ?', [id]);
    }

    async createThumbnail(data) {
        const result = await this.run(
            `INSERT INTO thumbnails (item_id, image_url, alt_text, variant_name, is_default)
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.item_id,
                data.image_url,
                data.alt_text || '',
                data.variant_name || 'A',
                data.is_default || 0
            ]
        );
        return result.id;
    }

    async deleteThumbnail(id) {
        return this.run('DELETE FROM thumbnails WHERE id = ?', [id]);
    }

    async incrementThumbnailImpressions(thumbnailId) {
        return this.run(
            'UPDATE thumbnails SET impressions = impressions + 1 WHERE id = ?',
            [thumbnailId]
        );
    }

    async incrementThumbnailClicks(thumbnailId) {
        return this.run(
            'UPDATE thumbnails SET clicks = clicks + 1 WHERE id = ?',
            [thumbnailId]
        );
    }

    // ==================== TRACKING OPERATIONS ====================

    async trackImpression(data) {
        return this.run(
            `INSERT INTO impressions (listicle_id, item_id, thumbnail_id, session_id, visitor_id, position, device_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.listicleId,
                data.itemId,
                data.thumbnailId,
                data.sessionId,
                data.visitorId,
                data.position,
                data.deviceType
            ]
        );
    }

    async trackClick(data) {
        return this.run(
            `INSERT INTO clicks (click_id, listicle_id, item_id, thumbnail_id, session_id, visitor_id, position, device_type, user_agent, ip_address, referrer)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.clickId,
                data.listicleId,
                data.itemId,
                data.thumbnailId,
                data.sessionId,
                data.visitorId,
                data.position,
                data.deviceType,
                data.userAgent,
                data.ipAddress,
                data.referrer
            ]
        );
    }

    async getClick(clickId) {
        return this.get(
            `SELECT c.*, i.offer_url
             FROM clicks c
             JOIN items i ON c.item_id = i.id
             WHERE c.click_id = ?`,
            [clickId]
        );
    }

    async trackConversion(data) {
        return this.run(
            `UPDATE clicks
             SET conversion_timestamp = CURRENT_TIMESTAMP, conversion_value = ?
             WHERE click_id = ?`,
            [data.conversionValue, data.clickId]
        );
    }

    // ==================== SESSION OPERATIONS ====================

    async createOrUpdateSession(data) {
        const existing = await this.get(
            'SELECT id FROM sessions WHERE session_id = ?',
            [data.sessionId]
        );

        if (existing) {
            return this.run(
                'UPDATE sessions SET ended_at = CURRENT_TIMESTAMP WHERE session_id = ?',
                [data.sessionId]
            );
        } else {
            return this.run(
                `INSERT INTO sessions (session_id, visitor_id, listicle_id, entry_url, device_type, user_agent, ip_address, referrer)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.sessionId,
                    data.visitorId,
                    data.listicleId,
                    data.entryUrl,
                    data.deviceType,
                    data.userAgent,
                    data.ipAddress,
                    data.referrer
                ]
            );
        }
    }

    async updateSessionClicks(sessionId) {
        return this.run(
            'UPDATE sessions SET total_clicks = total_clicks + 1 WHERE session_id = ?',
            [sessionId]
        );
    }

    // ==================== THOMPSON SAMPLING OPERATIONS ====================

    async getThompsonSamplingState(itemId, thumbnailId) {
        return this.get(
            'SELECT * FROM thompson_sampling_state WHERE item_id = ? AND thumbnail_id = ?',
            [itemId, thumbnailId]
        );
    }

    async updateThompsonSamplingState(itemId, thumbnailId, alpha, beta) {
        return this.run(
            `UPDATE thompson_sampling_state
             SET alpha = ?, beta = ?, last_updated = CURRENT_TIMESTAMP
             WHERE item_id = ? AND thumbnail_id = ?`,
            [alpha, beta, itemId, thumbnailId]
        );
    }

    async initializeThompsonSampling(itemId, thumbnailId) {
        return this.run(
            `INSERT OR IGNORE INTO thompson_sampling_state (item_id, thumbnail_id, alpha, beta)
             VALUES (?, ?, 1, 1)`,
            [itemId, thumbnailId]
        );
    }

    async getAllThompsonStatesForItem(itemId) {
        return this.all(
            `SELECT ts.*, t.variant_name, t.image_url
             FROM thompson_sampling_state ts
             JOIN thumbnails t ON ts.thumbnail_id = t.id
             WHERE ts.item_id = ?`,
            [itemId]
        );
    }
}

module.exports = new Database();
