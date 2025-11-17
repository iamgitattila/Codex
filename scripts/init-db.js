const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'listicle-optimizer.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema.sql');

// Create database directory if it doesn't exist
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✓ Connected to SQLite database');
});

// Read and execute schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error creating schema:', err.message);
        process.exit(1);
    }
    console.log('✓ Database schema created successfully');

    // Insert sample data
    insertSampleData();
});

function insertSampleData() {
    console.log('\n📝 Inserting sample data...\n');

    // Create a sample listicle
    db.run(`INSERT INTO listicles (slug, title, description, meta_title, meta_description, template, optimization_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            'top-10-productivity-tools-2024',
            'Top 10 Productivity Tools That Will Transform Your Work in 2024',
            'Discover the best productivity tools that successful entrepreneurs use daily',
            'Top 10 Productivity Tools 2024 - Boost Your Efficiency',
            'Compare the best productivity tools of 2024. Increase your efficiency with these game-changing apps and software.',
            'default',
            'ctr'
        ],
        function(err) {
            if (err) {
                console.error('Error inserting listicle:', err.message);
                return;
            }
            console.log(`✓ Created sample listicle (ID: ${this.lastID})`);
            const listicleId = this.lastID;

            // Create sample items
            const items = [
                {
                    title: 'Notion - All-in-One Workspace',
                    description: 'Combine notes, tasks, wikis, and databases in one powerful app',
                    url: 'https://notion.so',
                    price: '$10/month',
                    rating: 4.8,
                    badge: "Editor's Choice"
                },
                {
                    title: 'Todoist - Smart Task Manager',
                    description: 'Organize your work and life with this intelligent to-do list',
                    url: 'https://todoist.com',
                    price: '$5/month',
                    rating: 4.6,
                    badge: 'Best Value'
                },
                {
                    title: 'Zapier - Automation Platform',
                    description: 'Connect your apps and automate workflows without coding',
                    url: 'https://zapier.com',
                    price: '$20/month',
                    rating: 4.7,
                    badge: null
                },
                {
                    title: 'Grammarly - Writing Assistant',
                    description: 'AI-powered writing tool that helps you write clearly and error-free',
                    url: 'https://grammarly.com',
                    price: '$12/month',
                    rating: 4.5,
                    badge: null
                },
                {
                    title: 'Calendly - Scheduling Made Easy',
                    description: 'Eliminate back-and-forth emails and schedule meetings effortlessly',
                    url: 'https://calendly.com',
                    price: 'Free',
                    rating: 4.7,
                    badge: 'Free Tier'
                }
            ];

            items.forEach((item, index) => {
                db.run(`INSERT INTO items (listicle_id, title, description, offer_url, position, original_position, price, rating, badge)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [listicleId, item.title, item.description, item.url, index + 1, index + 1, item.price, item.rating, item.badge],
                    function(err) {
                        if (err) {
                            console.error('Error inserting item:', err.message);
                            return;
                        }
                        const itemId = this.lastID;
                        console.log(`  ✓ Item ${index + 1}: ${item.title}`);

                        // Create multiple thumbnail variants for A/B testing
                        const thumbnails = [
                            { variant: 'A', url: `https://via.placeholder.com/400x300/4A90E2/ffffff?text=${encodeURIComponent(item.title.split(' ')[0])}+A` },
                            { variant: 'B', url: `https://via.placeholder.com/400x300/7B68EE/ffffff?text=${encodeURIComponent(item.title.split(' ')[0])}+B` },
                            { variant: 'C', url: `https://via.placeholder.com/400x300/50C878/ffffff?text=${encodeURIComponent(item.title.split(' ')[0])}+C` }
                        ];

                        thumbnails.forEach((thumb, thumbIndex) => {
                            db.run(`INSERT INTO thumbnails (item_id, image_url, alt_text, variant_name, is_default)
                                    VALUES (?, ?, ?, ?, ?)`,
                                [itemId, thumb.url, `${item.title} - Variant ${thumb.variant}`, thumb.variant, thumbIndex === 0 ? 1 : 0],
                                function(err) {
                                    if (err) {
                                        console.error('Error inserting thumbnail:', err.message);
                                        return;
                                    }

                                    // Initialize Thompson Sampling state for each thumbnail
                                    db.run(`INSERT INTO thompson_sampling_state (item_id, thumbnail_id, alpha, beta)
                                            VALUES (?, ?, 1, 1)`,
                                        [itemId, this.lastID],
                                        (err) => {
                                            if (err) {
                                                console.error('Error initializing Thompson Sampling:', err.message);
                                            }
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            });

            console.log('\n✓ Sample data inserted successfully');
            console.log('\n🎉 Database initialization complete!\n');
            console.log('You can now start the server with: npm start\n');
        }
    );
}

db.on('close', () => {
    console.log('Database connection closed');
});
