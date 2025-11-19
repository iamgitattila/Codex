#!/bin/bash
# Setup cron jobs for PrepperCodex Engine

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_PYTHON="$PROJECT_DIR/venv/bin/python"

echo "Setting up cron jobs for PrepperCodex Engine"
echo "Project directory: $PROJECT_DIR"

# Create wrapper scripts
echo "Creating wrapper scripts..."

# Data collection wrapper
cat > "$PROJECT_DIR/scripts/run_data_collection.sh" << EOF
#!/bin/bash
cd $PROJECT_DIR
source venv/bin/activate
python -m engine.data_collector >> logs/cron-collector.log 2>&1
EOF

# Page generation wrapper
cat > "$PROJECT_DIR/scripts/run_page_generation.sh" << EOF
#!/bin/bash
cd $PROJECT_DIR
source venv/bin/activate
python -m engine.page_generator --limit 100 >> logs/cron-generator.log 2>&1
EOF

# Analytics wrapper
cat > "$PROJECT_DIR/scripts/run_analytics.sh" << EOF
#!/bin/bash
cd $PROJECT_DIR
source venv/bin/activate
python -m engine.learning_engine >> logs/cron-analytics.log 2>&1
EOF

chmod +x "$PROJECT_DIR/scripts/run_data_collection.sh"
chmod +x "$PROJECT_DIR/scripts/run_page_generation.sh"
chmod +x "$PROJECT_DIR/scripts/run_analytics.sh"

echo "✓ Wrapper scripts created"

# Generate crontab entries
CRON_FILE="/tmp/preppercodex-cron.txt"

cat > "$CRON_FILE" << EOF
# PrepperCodex pSEO Engine Scheduled Tasks

# Data Collection - Weekly on Sunday at 2 AM
0 2 * * 0 $PROJECT_DIR/scripts/run_data_collection.sh

# Page Generation - Daily at 6 AM (100 pages per day)
0 6 * * * $PROJECT_DIR/scripts/run_page_generation.sh

# Analytics Review - Weekly on Friday at 8 AM
0 8 * * 5 $PROJECT_DIR/scripts/run_analytics.sh

# Log rotation - Monthly
0 0 1 * * find $PROJECT_DIR/logs -name "*.log" -mtime +30 -delete

EOF

echo ""
echo "Cron jobs to be installed:"
echo "=========================================="
cat "$CRON_FILE"
echo "=========================================="
echo ""

# Ask for confirmation
read -p "Install these cron jobs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Backup existing crontab
    crontab -l > /tmp/crontab-backup-$(date +%Y%m%d-%H%M%S).txt 2>/dev/null || true

    # Add new jobs
    (crontab -l 2>/dev/null; cat "$CRON_FILE") | crontab -

    echo "✓ Cron jobs installed"
    echo ""
    echo "Current crontab:"
    crontab -l | grep -A 20 "PrepperCodex"
else
    echo "Cron installation skipped"
    echo "To install manually, run: crontab -e"
    echo "Then add the contents of: $CRON_FILE"
fi

echo ""
echo "Setup complete!"
