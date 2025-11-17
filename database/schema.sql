-- Listicle Optimizer Database Schema
-- Supports multi-variant testing, click tracking, and optimization

-- Listicles table - stores the main listicle configurations
CREATE TABLE IF NOT EXISTS listicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    meta_title TEXT,
    meta_description TEXT,
    template TEXT DEFAULT 'default',
    optimization_mode TEXT DEFAULT 'ctr', -- 'ctr', 'revenue', 'hybrid'
    auto_reorder BOOLEAN DEFAULT 1,
    reorder_threshold INTEGER DEFAULT 100, -- min clicks before reordering
    status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Listicle items - individual items in a listicle
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listicle_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    offer_url TEXT NOT NULL,
    position INTEGER NOT NULL,
    original_position INTEGER, -- track original position for analytics
    cta_text TEXT DEFAULT 'Learn More',
    price TEXT,
    rating DECIMAL(3,2),
    badge TEXT, -- 'Editor\'s Choice', 'Best Value', etc.
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listicle_id) REFERENCES listicles(id) ON DELETE CASCADE
);

-- Thumbnails - support multiple thumbnails per item for A/B testing
CREATE TABLE IF NOT EXISTS thumbnails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    variant_name TEXT, -- 'A', 'B', 'C', etc.
    is_default BOOLEAN DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Click tracking - granular click tracking with metadata
CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listicle_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    thumbnail_id INTEGER,
    session_id TEXT NOT NULL,
    visitor_id TEXT, -- persistent visitor tracking
    click_id TEXT UNIQUE NOT NULL, -- unique click identifier for affiliate tracking
    position INTEGER, -- position when clicked
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    click_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversion_timestamp DATETIME,
    conversion_value DECIMAL(10,2),
    sub_id_1 TEXT, -- affiliate sub IDs
    sub_id_2 TEXT,
    sub_id_3 TEXT,
    sub_id_4 TEXT,
    FOREIGN KEY (listicle_id) REFERENCES listicles(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (thumbnail_id) REFERENCES thumbnails(id)
);

-- Impressions - track when items are shown to users
CREATE TABLE IF NOT EXISTS impressions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listicle_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    thumbnail_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    visitor_id TEXT,
    position INTEGER,
    device_type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listicle_id) REFERENCES listicles(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (thumbnail_id) REFERENCES thumbnails(id)
);

-- Sessions - track visitor sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    visitor_id TEXT,
    listicle_id INTEGER,
    entry_url TEXT,
    device_type TEXT,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    total_clicks INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    FOREIGN KEY (listicle_id) REFERENCES listicles(id)
);

-- Thompson Sampling state - for Bayesian optimization
CREATE TABLE IF NOT EXISTS thompson_sampling_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    thumbnail_id INTEGER NOT NULL,
    alpha INTEGER DEFAULT 1, -- successes + 1 (Bayesian prior)
    beta INTEGER DEFAULT 1, -- failures + 1 (Bayesian prior)
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (thumbnail_id) REFERENCES thumbnails(id) ON DELETE CASCADE,
    UNIQUE(item_id, thumbnail_id)
);

-- Performance cache - pre-computed performance metrics
CREATE TABLE IF NOT EXISTS performance_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- 'item', 'thumbnail', 'position'
    entity_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL, -- 'ctr', 'conversion_rate', 'revenue', 'avg_position'
    metric_value DECIMAL(10,4),
    time_period TEXT DEFAULT 'all_time', -- 'all_time', 'last_7d', 'last_30d'
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, metric_name, time_period)
);

-- A/B test experiments - track formal experiments
CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    listicle_id INTEGER,
    experiment_type TEXT, -- 'thumbnail', 'position', 'layout'
    status TEXT DEFAULT 'running', -- 'running', 'paused', 'completed'
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    winner_id INTEGER,
    confidence_level DECIMAL(5,2),
    FOREIGN KEY (listicle_id) REFERENCES listicles(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clicks_listicle ON clicks(listicle_id);
CREATE INDEX IF NOT EXISTS idx_clicks_item ON clicks(item_id);
CREATE INDEX IF NOT EXISTS idx_clicks_thumbnail ON clicks(thumbnail_id);
CREATE INDEX IF NOT EXISTS idx_clicks_session ON clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON clicks(click_timestamp);
CREATE INDEX IF NOT EXISTS idx_impressions_listicle ON impressions(listicle_id);
CREATE INDEX IF NOT EXISTS idx_impressions_item ON impressions(item_id);
CREATE INDEX IF NOT EXISTS idx_impressions_thumbnail ON impressions(thumbnail_id);
CREATE INDEX IF NOT EXISTS idx_impressions_session ON impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_listicle ON sessions(listicle_id);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_items_listicle ON items(listicle_id);
CREATE INDEX IF NOT EXISTS idx_thumbnails_item ON thumbnails(item_id);
