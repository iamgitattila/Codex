/**
 * PrepperCodex Dashboard JavaScript
 */

(function($) {
    'use strict';

    const PrepperCodexDashboard = {
        init: function() {
            this.loadStatus();
            // Refresh every 30 seconds
            setInterval(() => this.loadStatus(), 30000);
        },

        loadStatus: function() {
            $.ajax({
                url: preppercodexAjax.ajax_url,
                type: 'POST',
                data: {
                    action: 'preppercodex_get_status',
                    nonce: preppercodexAjax.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.updateDashboard(response.data);
                    }
                },
                error: () => {
                    console.error('Failed to load PrepperCodex status');
                }
            });
        },

        updateDashboard: function(data) {
            // Engine Status
            $('#engine-running').html(
                data.engine_running
                    ? '<span class="status-badge ok">✓ RUNNING</span>'
                    : '<span class="status-badge error">✗ STOPPED</span>'
            );
            $('#last-sync').text(data.last_sync);
            $('#pages-generated').text(data.pages_generated.toLocaleString());
            $('#error-count').html(
                data.errors > 0
                    ? `<span class="status-badge warning">${data.errors}</span>`
                    : '<span class="status-badge ok">0</span>'
            );

            // Performance
            $('#top-hazard').text(data.performance.top_hazard);
            $('#top-product').text(data.performance.top_product);
            $('#avg-ctr').text(data.performance.avg_ctr);

            // Data Sources
            this.updateDataSource('fema', data.data_sources.fema);
            this.updateDataSource('usgs', data.data_sources.usgs);
            this.updateDataSource('noaa', data.data_sources.noaa);
            this.updateDataSource('epa', data.data_sources.epa);
            this.updateDataSource('census', data.data_sources.census);

            // Pending Actions
            this.updatePendingActions(data.pending_actions);

            // Scheduled Tasks
            $('#next-sync').text(data.scheduled_tasks.next_sync);
            $('#next-generation').text(data.scheduled_tasks.next_generation);
            $('#next-analytics').text(data.scheduled_tasks.next_analytics);

            // Revenue
            $('#total-revenue').text('$' + data.revenue.total.toLocaleString());
            $('#affiliate-revenue').text('$' + data.revenue.affiliate.toLocaleString());
            $('#subscription-revenue').text('$' + data.revenue.subscription.toLocaleString());

            // Activity Log
            this.updateActivityLog(data.activity_log);
        },

        updateDataSource: function(source, data) {
            const statusEl = $('#' + source + '-status');
            let badge = '';

            if (data.status === 'ok' || data.status === 'OK') {
                badge = `<span class="status-badge ok">✓ Fresh (${data.last_updated})</span>`;
            } else if (data.status === 'stale') {
                badge = `<span class="status-badge warning">⚠️ Stale</span>`;
            } else if (data.status === 'error') {
                badge = `<span class="status-badge error">✗ Error</span>`;
            } else {
                badge = `<span class="status-badge loading">? Unknown</span>`;
            }

            statusEl.html(badge);
        },

        updatePendingActions: function(actions) {
            const container = $('#pending-actions');

            if (!actions || actions.length === 0) {
                container.html('<p style="text-align:center; color:#95a5a6;">✓ No pending actions</p>');
                return;
            }

            let html = '';
            actions.forEach(action => {
                const levelClass = action.level || 'info';
                html += `
                    <div class="action-item ${levelClass}">
                        <div class="action-title">${action.title}</div>
                        <div class="action-description">${action.description}</div>
                    </div>
                `;
            });

            container.html(html);
        },

        updateActivityLog: function(logs) {
            const container = $('#activity-log');

            if (!logs || logs.length === 0) {
                container.html('<p class="loading-message">No recent activity</p>');
                return;
            }

            let html = '';
            logs.slice(0, 20).forEach(log => {
                const levelClass = log.level || 'info';
                html += `
                    <div class="log-entry ${levelClass}">
                        <span class="log-timestamp">${log.timestamp}</span>
                        <span class="log-message">${log.message}</span>
                    </div>
                `;
            });

            container.html(html);
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        if ($('.preppercodex-dashboard').length) {
            PrepperCodexDashboard.init();
        }
    });

})(jQuery);
