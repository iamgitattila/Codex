<?php
/**
 * Plugin Name: PrepperCodex pSEO Engine Dashboard
 * Description: Admin dashboard for monitoring the PrepperCodex content engine
 * Version: 1.0.0
 * Author: PrepperCodex Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class PrepperCodex_Dashboard {

    private $data_dir;

    public function __construct() {
        $this->data_dir = WP_CONTENT_DIR . '/preppercodex-data/';

        // Create data directory if it doesn't exist
        if (!file_exists($this->data_dir)) {
            mkdir($this->data_dir, 0755, true);
        }

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('wp_ajax_preppercodex_get_status', array($this, 'ajax_get_status'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'PrepperCodex Engine',
            'PrepperCodex',
            'manage_options',
            'preppercodex-dashboard',
            array($this, 'render_dashboard'),
            'dashicons-chart-area',
            30
        );
    }

    public function enqueue_admin_assets($hook) {
        if ($hook != 'toplevel_page_preppercodex-dashboard') {
            return;
        }

        wp_enqueue_style(
            'preppercodex-dashboard',
            plugin_dir_url(__FILE__) . 'assets/css/dashboard.css',
            array(),
            '1.0.0'
        );

        wp_enqueue_script(
            'preppercodex-dashboard',
            plugin_dir_url(__FILE__) . 'assets/js/dashboard.js',
            array('jquery'),
            '1.0.0',
            true
        );

        wp_localize_script('preppercodex-dashboard', 'preppercodexAjax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('preppercodex_nonce')
        ));
    }

    public function render_dashboard() {
        ?>
        <div class="wrap preppercodex-dashboard">
            <h1>📊 PrepperCodex pSEO Engine Dashboard</h1>

            <div class="preppercodex-grid">
                <!-- Status Card -->
                <div class="preppercodex-card">
                    <h2>⚙️ Engine Status</h2>
                    <div id="engine-status">
                        <div class="status-item">
                            <span class="status-label">Status:</span>
                            <span class="status-value" id="engine-running">Loading...</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Last Data Sync:</span>
                            <span class="status-value" id="last-sync">Loading...</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Pages Generated:</span>
                            <span class="status-value" id="pages-generated">Loading...</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Errors:</span>
                            <span class="status-value" id="error-count">Loading...</span>
                        </div>
                    </div>
                </div>

                <!-- Performance Card -->
                <div class="preppercodex-card">
                    <h2>📈 Performance</h2>
                    <div id="performance-stats">
                        <div class="stat-item">
                            <div class="stat-label">Top Hazard Category</div>
                            <div class="stat-value" id="top-hazard">Loading...</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Top Converting Product</div>
                            <div class="stat-value" id="top-product">Loading...</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Avg Page CTR</div>
                            <div class="stat-value" id="avg-ctr">Loading...</div>
                        </div>
                    </div>
                </div>

                <!-- Data Sources Card -->
                <div class="preppercodex-card">
                    <h2>🗄️ Data Sources</h2>
                    <div id="data-sources">
                        <div class="source-item">
                            <span class="source-name">FEMA NRI:</span>
                            <span class="source-status" id="fema-status">
                                <span class="status-badge loading">Checking...</span>
                            </span>
                        </div>
                        <div class="source-item">
                            <span class="source-name">USGS Earthquakes:</span>
                            <span class="source-status" id="usgs-status">
                                <span class="status-badge loading">Checking...</span>
                            </span>
                        </div>
                        <div class="source-item">
                            <span class="source-name">NOAA Storms:</span>
                            <span class="source-status" id="noaa-status">
                                <span class="status-badge loading">Checking...</span>
                            </span>
                        </div>
                        <div class="source-item">
                            <span class="source-name">EPA Superfund:</span>
                            <span class="source-status" id="epa-status">
                                <span class="status-badge loading">Checking...</span>
                            </span>
                        </div>
                        <div class="source-item">
                            <span class="source-name">Census Data:</span>
                            <span class="source-status" id="census-status">
                                <span class="status-badge loading">Checking...</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Pending Actions Card -->
                <div class="preppercodex-card">
                    <h2>🔔 Pending Actions</h2>
                    <div id="pending-actions">
                        <p class="loading-message">Loading actions...</p>
                    </div>
                </div>

                <!-- Next Scheduled Tasks Card -->
                <div class="preppercodex-card">
                    <h2>🎯 Next Scheduled Tasks</h2>
                    <div id="scheduled-tasks">
                        <div class="task-item">
                            <span class="task-icon">📥</span>
                            <span class="task-name">Data Sync:</span>
                            <span class="task-time" id="next-sync">Loading...</span>
                        </div>
                        <div class="task-item">
                            <span class="task-icon">📄</span>
                            <span class="task-name">Page Generation:</span>
                            <span class="task-time" id="next-generation">Loading...</span>
                        </div>
                        <div class="task-item">
                            <span class="task-icon">📊</span>
                            <span class="task-name">Analytics Review:</span>
                            <span class="task-time" id="next-analytics">Loading...</span>
                        </div>
                    </div>
                </div>

                <!-- Revenue Card -->
                <div class="preppercodex-card revenue-card">
                    <h2>💰 Revenue This Month</h2>
                    <div id="revenue-stats">
                        <div class="revenue-total">
                            <div class="revenue-amount" id="total-revenue">$0</div>
                            <div class="revenue-label">Total Revenue</div>
                        </div>
                        <div class="revenue-breakdown">
                            <div class="breakdown-item">
                                <span>Affiliate Commissions:</span>
                                <span id="affiliate-revenue">$0</span>
                            </div>
                            <div class="breakdown-item">
                                <span>Recurring Subscriptions:</span>
                                <span id="subscription-revenue">$0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Logs -->
            <div class="preppercodex-card full-width">
                <h2>📋 Recent Activity Log</h2>
                <div id="activity-log">
                    <p class="loading-message">Loading recent activity...</p>
                </div>
            </div>
        </div>
        <?php
    }

    public function ajax_get_status() {
        check_ajax_referer('preppercodex_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
            return;
        }

        // Read status from data directory
        $status = $this->read_engine_status();

        wp_send_json_success($status);
    }

    private function read_engine_status() {
        $status_file = $this->data_dir . 'status.json';

        if (file_exists($status_file)) {
            $status = json_decode(file_get_contents($status_file), true);
            return $status;
        }

        // Return default status
        return array(
            'engine_running' => false,
            'last_sync' => 'Never',
            'pages_generated' => 0,
            'errors' => 0,
            'data_sources' => array(
                'fema' => array('status' => 'unknown', 'last_updated' => 'unknown'),
                'usgs' => array('status' => 'unknown', 'last_updated' => 'unknown'),
                'noaa' => array('status' => 'unknown', 'last_updated' => 'unknown'),
                'epa' => array('status' => 'unknown', 'last_updated' => 'unknown'),
                'census' => array('status' => 'unknown', 'last_updated' => 'unknown'),
            ),
            'performance' => array(
                'top_hazard' => 'N/A',
                'top_product' => 'N/A',
                'avg_ctr' => '0%'
            ),
            'pending_actions' => array(),
            'scheduled_tasks' => array(
                'next_sync' => 'Not scheduled',
                'next_generation' => 'Not scheduled',
                'next_analytics' => 'Not scheduled'
            ),
            'revenue' => array(
                'total' => 0,
                'affiliate' => 0,
                'subscription' => 0
            ),
            'activity_log' => array()
        );
    }
}

// Initialize the dashboard
new PrepperCodex_Dashboard();
