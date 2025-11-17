const db = require('./database');

/**
 * Analytics Module
 * Provides comprehensive performance analytics for listicles, items, thumbnails, and positions
 */

class Analytics {
    /**
     * Get comprehensive analytics for a listicle
     */
    async getListicleAnalytics(listicleId, period = 'all_time') {
        const { dateFilter, dateParams } = this.getDateFilter(period);

        // Overall metrics
        const overview = await db.get(
            `SELECT
                COUNT(DISTINCT s.session_id) as total_sessions,
                COUNT(DISTINCT s.visitor_id) as unique_visitors,
                COUNT(DISTINCT c.click_id) as total_clicks,
                SUM(COALESCE(c.conversion_value, 0)) as total_revenue,
                COUNT(DISTINCT CASE WHEN c.conversion_timestamp IS NOT NULL THEN c.click_id END) as total_conversions,
                AVG(s.total_clicks) as avg_clicks_per_session,
                COUNT(i.id) as total_impressions
             FROM sessions s
             LEFT JOIN clicks c ON s.session_id = c.session_id ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
             LEFT JOIN impressions i ON s.session_id = i.session_id ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
             WHERE s.listicle_id = ?`,
            [listicleId, ...dateParams]
        );

        // Calculate derived metrics
        const ctr = overview.total_impressions > 0
            ? (overview.total_clicks / overview.total_impressions) * 100
            : 0;

        const conversionRate = overview.total_clicks > 0
            ? (overview.total_conversions / overview.total_clicks) * 100
            : 0;

        const revenuePerVisitor = overview.unique_visitors > 0
            ? overview.total_revenue / overview.unique_visitors
            : 0;

        const revenuePerClick = overview.total_clicks > 0
            ? overview.total_revenue / overview.total_clicks
            : 0;

        // Top performing items
        const topItems = await db.all(
            `SELECT
                i.id,
                i.title,
                i.position,
                COUNT(DISTINCT c.click_id) as clicks,
                COUNT(DISTINCT imp.id) as impressions,
                SUM(COALESCE(c.conversion_value, 0)) as revenue,
                COUNT(DISTINCT CASE WHEN c.conversion_timestamp IS NOT NULL THEN c.click_id END) as conversions
             FROM items i
             LEFT JOIN clicks c ON i.id = c.item_id ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
             LEFT JOIN impressions imp ON i.id = imp.item_id ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
             WHERE i.listicle_id = ?
             GROUP BY i.id
             ORDER BY clicks DESC
             LIMIT 10`,
            [listicleId, ...dateParams]
        );

        // Device breakdown
        const deviceBreakdown = await db.all(
            `SELECT
                device_type,
                COUNT(DISTINCT click_id) as clicks,
                COUNT(DISTINCT session_id) as sessions
             FROM clicks
             WHERE listicle_id = ? ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
             GROUP BY device_type`,
            [listicleId, ...dateParams]
        );

        // Time series data (clicks over time)
        const timeSeries = await this.getTimeSeriesData(listicleId, period);

        return {
            overview: {
                ...overview,
                ctr: ctr.toFixed(2),
                conversionRate: conversionRate.toFixed(2),
                revenuePerVisitor: revenuePerVisitor.toFixed(2),
                revenuePerClick: revenuePerClick.toFixed(2)
            },
            topItems,
            deviceBreakdown,
            timeSeries
        };
    }

    /**
     * Get performance data for a specific item
     */
    async getItemPerformance(itemId) {
        const item = await db.getItem(itemId);
        if (!item) {
            throw new Error('Item not found');
        }

        // Overall item metrics
        const metrics = await db.get(
            `SELECT
                COUNT(DISTINCT c.click_id) as total_clicks,
                COUNT(DISTINCT i.id) as total_impressions,
                SUM(COALESCE(c.conversion_value, 0)) as total_revenue,
                COUNT(DISTINCT CASE WHEN c.conversion_timestamp IS NOT NULL THEN c.click_id END) as total_conversions
             FROM items it
             LEFT JOIN clicks c ON it.id = c.item_id
             LEFT JOIN impressions i ON it.id = i.item_id
             WHERE it.id = ?`,
            [itemId]
        );

        // Thumbnail performance comparison
        const thumbnails = await db.all(
            `SELECT
                t.id,
                t.variant_name,
                t.image_url,
                t.clicks,
                t.impressions,
                CASE WHEN t.impressions > 0 THEN CAST(t.clicks AS FLOAT) / t.impressions ELSE 0 END as ctr,
                ts.alpha,
                ts.beta,
                CASE WHEN (ts.alpha + ts.beta) > 0 THEN CAST(ts.alpha AS FLOAT) / (ts.alpha + ts.beta) ELSE 0 END as expected_ctr
             FROM thumbnails t
             LEFT JOIN thompson_sampling_state ts ON t.id = ts.thumbnail_id
             WHERE t.item_id = ?
             ORDER BY ctr DESC`,
            [itemId]
        );

        // Position history
        const positionHistory = await db.all(
            `SELECT
                DATE(click_timestamp) as date,
                AVG(position) as avg_position,
                COUNT(*) as clicks
             FROM clicks
             WHERE item_id = ?
             GROUP BY DATE(click_timestamp)
             ORDER BY date DESC
             LIMIT 30`,
            [itemId]
        );

        return {
            item,
            metrics,
            thumbnails,
            positionHistory
        };
    }

    /**
     * Get thumbnail performance comparison for an item
     */
    async getThumbnailPerformance(itemId) {
        const thumbnails = await db.all(
            `SELECT
                t.id,
                t.variant_name,
                t.image_url,
                t.clicks,
                t.impressions,
                t.conversions,
                t.revenue,
                CASE WHEN t.impressions > 0 THEN CAST(t.clicks AS FLOAT) / t.impressions * 100 ELSE 0 END as ctr,
                CASE WHEN t.clicks > 0 THEN CAST(t.conversions AS FLOAT) / t.clicks * 100 ELSE 0 END as conversion_rate,
                ts.alpha,
                ts.beta,
                CASE WHEN (ts.alpha + ts.beta - 2) > 0 THEN CAST(ts.alpha - 1 AS FLOAT) / (ts.alpha + ts.beta - 2) ELSE 0 END as expected_ctr
             FROM thumbnails t
             LEFT JOIN thompson_sampling_state ts ON t.id = ts.thumbnail_id
             WHERE t.item_id = ?
             ORDER BY ctr DESC`,
            [itemId]
        );

        // Calculate confidence intervals for each thumbnail
        const optimizer = require('./optimizer');
        const thumbnailsWithCI = thumbnails.map(thumb => {
            const ci = optimizer.wilsonScoreInterval(thumb.clicks, thumb.impressions);
            return {
                ...thumb,
                ctr_lower: (ci.lower * 100).toFixed(2),
                ctr_upper: (ci.upper * 100).toFixed(2),
                ctr: thumb.ctr.toFixed(2),
                conversion_rate: thumb.conversion_rate.toFixed(2),
                expected_ctr: (thumb.expected_ctr * 100).toFixed(2)
            };
        });

        return {
            thumbnails: thumbnailsWithCI,
            hasEnoughData: thumbnails.every(t => t.impressions >= 100)
        };
    }

    /**
     * Get position-based analytics
     */
    async getPositionAnalytics(listicleId) {
        const positionData = await db.all(
            `SELECT
                c.position,
                COUNT(DISTINCT c.click_id) as clicks,
                COUNT(DISTINCT i.id) as impressions,
                CASE WHEN COUNT(DISTINCT i.id) > 0 THEN CAST(COUNT(DISTINCT c.click_id) AS FLOAT) / COUNT(DISTINCT i.id) ELSE 0 END as ctr
             FROM impressions i
             LEFT JOIN clicks c ON i.item_id = c.item_id AND i.position = c.position
             WHERE i.listicle_id = ?
             GROUP BY c.position
             ORDER BY c.position ASC`,
            [listicleId]
        );

        return positionData.map(p => ({
            ...p,
            ctr: ((p.ctr || 0) * 100).toFixed(2)
        }));
    }

    /**
     * Get real-time dashboard data
     */
    async getDashboardData(listicleId) {
        // Last 24 hours metrics
        const last24h = await this.getListicleAnalytics(listicleId, 'last_24h');

        // Last 7 days metrics
        const last7d = await this.getListicleAnalytics(listicleId, 'last_7d');

        // All-time metrics
        const allTime = await this.getListicleAnalytics(listicleId, 'all_time');

        // Recent clicks (last 100)
        const recentClicks = await db.all(
            `SELECT
                c.click_timestamp,
                c.device_type,
                i.title as item_title,
                t.variant_name,
                c.conversion_timestamp IS NOT NULL as converted,
                c.conversion_value
             FROM clicks c
             JOIN items i ON c.item_id = i.id
             LEFT JOIN thumbnails t ON c.thumbnail_id = t.id
             WHERE c.listicle_id = ?
             ORDER BY c.click_timestamp DESC
             LIMIT 100`,
            [listicleId]
        );

        // Active experiments
        const activeExperiments = await db.all(
            `SELECT * FROM experiments WHERE listicle_id = ? AND status = 'running'`,
            [listicleId]
        );

        // Top referrers
        const topReferrers = await db.all(
            `SELECT
                referrer,
                COUNT(DISTINCT session_id) as sessions,
                COUNT(DISTINCT c.click_id) as clicks
             FROM sessions s
             LEFT JOIN clicks c ON s.session_id = c.session_id
             WHERE s.listicle_id = ? AND referrer IS NOT NULL AND referrer != ''
             GROUP BY referrer
             ORDER BY sessions DESC
             LIMIT 10`,
            [listicleId]
        );

        return {
            last24h,
            last7d,
            allTime,
            recentClicks,
            activeExperiments,
            topReferrers
        };
    }

    /**
     * Get time series data for clicks
     */
    async getTimeSeriesData(listicleId, period) {
        let groupBy, limit;

        switch (period) {
            case 'last_24h':
                groupBy = "strftime('%Y-%m-%d %H:00', click_timestamp)";
                limit = 24;
                break;
            case 'last_7d':
                groupBy = "DATE(click_timestamp)";
                limit = 7;
                break;
            case 'last_30d':
                groupBy = "DATE(click_timestamp)";
                limit = 30;
                break;
            default:
                groupBy = "DATE(click_timestamp)";
                limit = 90;
        }

        const { dateFilter, dateParams } = this.getDateFilter(period);

        const timeSeries = await db.all(
            `SELECT
                ${groupBy} as time_bucket,
                COUNT(DISTINCT click_id) as clicks,
                COUNT(DISTINCT session_id) as sessions,
                SUM(COALESCE(conversion_value, 0)) as revenue
             FROM clicks
             WHERE listicle_id = ? ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
             GROUP BY time_bucket
             ORDER BY time_bucket DESC
             LIMIT ?`,
            [listicleId, ...dateParams, limit]
        );

        return timeSeries.reverse();
    }

    /**
     * Get heat map data (position x item performance)
     */
    async getHeatMapData(listicleId) {
        return db.all(
            `SELECT
                i.title,
                c.position,
                COUNT(DISTINCT c.click_id) as clicks,
                COUNT(DISTINCT imp.id) as impressions
             FROM items i
             LEFT JOIN clicks c ON i.id = c.item_id
             LEFT JOIN impressions imp ON i.id = imp.item_id
             WHERE i.listicle_id = ?
             GROUP BY i.id, c.position
             ORDER BY i.position, c.position`,
            [listicleId]
        );
    }

    /**
     * Get date filter for different time periods
     */
    getDateFilter(period) {
        switch (period) {
            case 'last_24h':
                return {
                    dateFilter: "WHERE click_timestamp >= datetime('now', '-24 hours')",
                    dateParams: []
                };
            case 'last_7d':
                return {
                    dateFilter: "WHERE click_timestamp >= datetime('now', '-7 days')",
                    dateParams: []
                };
            case 'last_30d':
                return {
                    dateFilter: "WHERE click_timestamp >= datetime('now', '-30 days')",
                    dateParams: []
                };
            default:
                return { dateFilter: '', dateParams: [] };
        }
    }

    /**
     * Calculate growth rate between two periods
     */
    calculateGrowth(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(2);
    }
}

module.exports = new Analytics();
