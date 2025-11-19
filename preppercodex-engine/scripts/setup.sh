#!/bin/bash
# PrepperCodex pSEO Engine - Setup Script

set -e

echo "========================================"
echo "PrepperCodex pSEO Engine - Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo -e "\n${YELLOW}Checking Python version...${NC}"
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}Error: Python 3.8+ required. Found: $python_version${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $python_version${NC}"

# Create virtual environment
echo -e "\n${YELLOW}Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo -e "\n${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "\n${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install requirements
echo -e "\n${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create necessary directories
echo -e "\n${YELLOW}Creating directory structure...${NC}"
mkdir -p data/{cache,raw,processed,analytics}
mkdir -p logs
mkdir -p config
echo -e "${GREEN}✓ Directories created${NC}"

# Copy configuration template
echo -e "\n${YELLOW}Setting up configuration...${NC}"
if [ ! -f "config.yaml" ]; then
    cp config.example.yaml config.yaml
    echo -e "${YELLOW}⚠️  Please edit config.yaml with your API keys and credentials${NC}"
else
    echo -e "${GREEN}✓ config.yaml already exists${NC}"
fi

# Set up WordPress plugin
echo -e "\n${YELLOW}WordPress plugin setup...${NC}"
echo -e "${YELLOW}To install the WordPress dashboard:${NC}"
echo -e "1. Copy wordpress-plugin/preppercodex-dashboard.php to wp-content/plugins/"
echo -e "2. Activate the plugin in WordPress admin"
echo -e "3. Access dashboard at WordPress Admin > PrepperCodex"

# Create systemd service files (optional)
echo -e "\n${YELLOW}Creating systemd service files...${NC}"
cat > /tmp/preppercodex-collector.service << EOF
[Unit]
Description=PrepperCodex Data Collector
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment="PATH=$(pwd)/venv/bin"
ExecStart=$(pwd)/venv/bin/python -m engine.data_collector
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

cat > /tmp/preppercodex-generator.service << EOF
[Unit]
Description=PrepperCodex Page Generator
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment="PATH=$(pwd)/venv/bin"
ExecStart=$(pwd)/venv/bin/python -m engine.page_generator --limit 100
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Service files created in /tmp/${NC}"
echo -e "${YELLOW}To install services (requires sudo):${NC}"
echo -e "sudo cp /tmp/preppercodex-*.service /etc/systemd/system/"
echo -e "sudo systemctl daemon-reload"
echo -e "sudo systemctl enable preppercodex-collector.timer"

# Test installation
echo -e "\n${YELLOW}Testing installation...${NC}"
python3 -c "
import sys
try:
    from engine.config_loader import ConfigLoader
    from engine.data_collector import DataCollectorDaemon
    from engine.page_generator import PageGeneratorEngine
    print('✓ All core modules imported successfully')
except ImportError as e:
    print(f'✗ Import error: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Installation test passed${NC}"
else
    echo -e "${RED}✗ Installation test failed${NC}"
    exit 1
fi

# Summary
echo -e "\n========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "========================================"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Edit config.yaml with your API keys:"
echo -e "   - OpenAI API key"
echo -e "   - NOAA API key (optional)"
echo -e "   - Census API key (optional)"
echo -e "   - WordPress credentials"
echo -e ""
echo -e "2. Run initial data collection:"
echo -e "   source venv/bin/activate"
echo -e "   python -m engine.data_collector"
echo -e ""
echo -e "3. Generate test pages:"
echo -e "   python -m engine.page_generator --limit 5 --test"
echo -e ""
echo -e "4. Install WordPress plugin (see instructions above)"
echo -e ""
echo -e "5. Set up cron jobs:"
echo -e "   ./scripts/setup_cron.sh"
echo -e ""
echo -e "${GREEN}Documentation: See README.md for full details${NC}"
echo -e "========================================"
