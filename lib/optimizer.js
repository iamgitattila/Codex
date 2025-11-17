const db = require('./database');

/**
 * Optimizer Module
 * Implements Thompson Sampling (Bayesian Multi-Armed Bandit) for thumbnail optimization
 * and item reordering based on performance metrics
 */

class Optimizer {
    /**
     * Select optimal thumbnail for an item using Thompson Sampling
     * Thompson Sampling is superior to A/B testing because it:
     * 1. Automatically balances exploration vs exploitation
     * 2. Converges faster to the best variant
     * 3. Minimizes regret (lost clicks from showing suboptimal variants)
     */
    async selectOptimalThumbnail(itemId) {
        const thumbnails = await db.getItemThumbnails(itemId);

        if (thumbnails.length === 0) {
            throw new Error(`No thumbnails found for item ${itemId}`);
        }

        if (thumbnails.length === 1) {
            return thumbnails[0];
        }

        // Get Thompson Sampling state for all thumbnails
        const states = await db.getAllThompsonStatesForItem(itemId);

        // Sample from Beta distribution for each thumbnail
        let bestThumbnail = null;
        let bestSample = -1;

        for (const state of states) {
            // Sample from Beta(alpha, beta) distribution
            const sample = this.betaSample(state.alpha, state.beta);

            if (sample > bestSample) {
                bestSample = sample;
                bestThumbnail = thumbnails.find(t => t.id === state.thumbnail_id);
            }
        }

        // Update impressions for non-selected thumbnails (exploration penalty)
        for (const thumbnail of thumbnails) {
            if (thumbnail.id !== bestThumbnail.id) {
                await this.updateThompsonSampling(itemId, thumbnail.id, false);
            }
        }

        return bestThumbnail;
    }

    /**
     * Beta distribution sampler using gamma distribution
     * Beta(α, β) = Gamma(α, 1) / (Gamma(α, 1) + Gamma(β, 1))
     */
    betaSample(alpha, beta) {
        const gammaAlpha = this.gammaSample(alpha, 1);
        const gammaBeta = this.gammaSample(beta, 1);
        return gammaAlpha / (gammaAlpha + gammaBeta);
    }

    /**
     * Gamma distribution sampler using Marsaglia and Tsang's method
     */
    gammaSample(shape, scale) {
        if (shape < 1) {
            // Use shape augmentation for shape < 1
            return this.gammaSample(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
        }

        const d = shape - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);

        while (true) {
            let x, v;
            do {
                x = this.normalSample(0, 1);
                v = 1 + c * x;
            } while (v <= 0);

            v = v * v * v;
            const u = Math.random();
            const x2 = x * x;

            if (u < 1 - 0.0331 * x2 * x2) {
                return d * v * scale;
            }

            if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
                return d * v * scale;
            }
        }
    }

    /**
     * Normal distribution sampler using Box-Muller transform
     */
    normalSample(mean, stdDev) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + stdDev * z0;
    }

    /**
     * Update Thompson Sampling state after an impression/click
     */
    async updateThompsonSampling(itemId, thumbnailId, success) {
        const state = await db.getThompsonSamplingState(itemId, thumbnailId);

        if (!state) {
            await db.initializeThompsonSampling(itemId, thumbnailId);
            return;
        }

        // Update Bayesian posterior
        // If success (click): increment alpha (successes)
        // If failure (impression without click): increment beta (failures)
        const newAlpha = success ? state.alpha + 1 : state.alpha;
        const newBeta = success ? state.beta : state.beta + 1;

        await db.updateThompsonSamplingState(itemId, thumbnailId, newAlpha, newBeta);
    }

    /**
     * Initialize Thompson Sampling for a new thumbnail
     */
    async initializeThompsonSampling(itemId, thumbnailId) {
        await db.initializeThompsonSampling(itemId, thumbnailId);
    }

    /**
     * Reorder items based on performance
     * Uses Upper Confidence Bound (UCB) or pure CTR depending on confidence level
     */
    async reorderItemsByPerformance(listicleId, items, optimizationMode = 'ctr') {
        // Get performance metrics for each item
        const itemsWithMetrics = await Promise.all(items.map(async (item) => {
            const metrics = await this.getItemMetrics(item.id);
            return { ...item, metrics };
        }));

        // Sort by optimization metric
        itemsWithMetrics.sort((a, b) => {
            let scoreA, scoreB;

            switch (optimizationMode) {
                case 'ctr':
                    scoreA = this.calculateUCBScore(a.metrics.clicks, a.metrics.impressions);
                    scoreB = this.calculateUCBScore(b.metrics.clicks, b.metrics.impressions);
                    break;
                case 'revenue':
                    scoreA = a.metrics.revenue / Math.max(a.metrics.clicks, 1);
                    scoreB = b.metrics.revenue / Math.max(b.metrics.clicks, 1);
                    break;
                case 'hybrid':
                    const ctrA = this.calculateUCBScore(a.metrics.clicks, a.metrics.impressions);
                    const ctrB = this.calculateUCBScore(b.metrics.clicks, b.metrics.impressions);
                    const revenueA = a.metrics.revenue / Math.max(a.metrics.clicks, 1);
                    const revenueB = b.metrics.revenue / Math.max(b.metrics.clicks, 1);
                    scoreA = ctrA * 0.7 + revenueA * 0.3;
                    scoreB = ctrB * 0.7 + revenueB * 0.3;
                    break;
                default:
                    scoreA = a.position;
                    scoreB = b.position;
            }

            return scoreB - scoreA; // Higher score = better position
        });

        // Update positions in database
        for (let i = 0; i < itemsWithMetrics.length; i++) {
            if (itemsWithMetrics[i].position !== i + 1) {
                await db.updateItemPosition(itemsWithMetrics[i].id, i + 1);
                itemsWithMetrics[i].position = i + 1;
            }
        }

        return itemsWithMetrics;
    }

    /**
     * Calculate Upper Confidence Bound (UCB) score
     * Balances exploitation (high CTR) with exploration (low sample size)
     */
    calculateUCBScore(clicks, impressions) {
        if (impressions === 0) {
            return 1; // Maximum exploration for items with no data
        }

        const ctr = clicks / impressions;
        const exploration = Math.sqrt((2 * Math.log(impressions + 1)) / impressions);
        return ctr + exploration;
    }

    /**
     * Get performance metrics for an item
     */
    async getItemMetrics(itemId) {
        const clicksData = await db.all(
            `SELECT COUNT(*) as clicks, SUM(COALESCE(conversion_value, 0)) as revenue
             FROM clicks
             WHERE item_id = ?`,
            [itemId]
        );

        const impressionsData = await db.get(
            'SELECT COUNT(*) as impressions FROM impressions WHERE item_id = ?',
            [itemId]
        );

        return {
            clicks: clicksData[0].clicks || 0,
            impressions: impressionsData?.impressions || 0,
            revenue: clicksData[0].revenue || 0,
            ctr: impressionsData?.impressions
                ? (clicksData[0].clicks || 0) / impressionsData.impressions
                : 0
        };
    }

    /**
     * Get thumbnail performance metrics
     */
    async getThumbnailMetrics(thumbnailId) {
        const data = await db.get(
            `SELECT
                clicks,
                impressions,
                conversions,
                revenue,
                CASE WHEN impressions > 0 THEN CAST(clicks AS FLOAT) / impressions ELSE 0 END as ctr,
                CASE WHEN clicks > 0 THEN CAST(conversions AS FLOAT) / clicks ELSE 0 END as conversion_rate
             FROM thumbnails
             WHERE id = ?`,
            [thumbnailId]
        );

        return data;
    }

    /**
     * Calculate confidence interval for a CTR
     * Uses Wilson score interval (more accurate than normal approximation)
     */
    wilsonScoreInterval(clicks, impressions, confidence = 0.95) {
        if (impressions === 0) {
            return { lower: 0, upper: 1, ctr: 0 };
        }

        const z = confidence === 0.95 ? 1.96 : 2.576; // z-score for 95% or 99%
        const phat = clicks / impressions;
        const denominator = 1 + z * z / impressions;

        const centerAdjustment = phat + z * z / (2 * impressions);
        const marginOfError = z * Math.sqrt((phat * (1 - phat) + z * z / (4 * impressions)) / impressions);

        return {
            ctr: phat,
            lower: (centerAdjustment - marginOfError) / denominator,
            upper: (centerAdjustment + marginOfError) / denominator
        };
    }

    /**
     * Determine if we have a statistically significant winner
     */
    async hasStatisticalWinner(itemId, minImpressions = 100, minConfidence = 0.95) {
        const thumbnails = await db.getItemThumbnails(itemId);

        if (thumbnails.length < 2) {
            return null;
        }

        let bestThumbnail = null;
        let bestCTR = -1;

        for (const thumbnail of thumbnails) {
            if (thumbnail.impressions < minImpressions) {
                return null; // Not enough data yet
            }

            const ctr = thumbnail.clicks / thumbnail.impressions;
            if (ctr > bestCTR) {
                bestCTR = ctr;
                bestThumbnail = thumbnail;
            }
        }

        // Check if the best thumbnail's confidence interval doesn't overlap with others
        const bestInterval = this.wilsonScoreInterval(
            bestThumbnail.clicks,
            bestThumbnail.impressions,
            minConfidence
        );

        for (const thumbnail of thumbnails) {
            if (thumbnail.id === bestThumbnail.id) continue;

            const interval = this.wilsonScoreInterval(
                thumbnail.clicks,
                thumbnail.impressions,
                minConfidence
            );

            // If intervals overlap, no clear winner yet
            if (interval.upper >= bestInterval.lower) {
                return null;
            }
        }

        return bestThumbnail;
    }
}

module.exports = new Optimizer();
