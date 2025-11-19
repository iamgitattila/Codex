#!/bin/bash
# Verify PrepperCodex Engine Installation

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "PrepperCodex Engine - Installation Verification"
echo "========================================"

ERRORS=0

# Check Python version
echo -e "\n${YELLOW}[1/8] Checking Python version...${NC}"
python_version=$(python3 --version 2>&1 | awk '{print $2}')
if [ "$(printf '%s\n' "3.8" "$python_version" | sort -V | head -n1)" = "3.8" ]; then
    echo -e "${GREEN}✓ Python $python_version${NC}"
else
    echo -e "${RED}✗ Python 3.8+ required. Found: $python_version${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check virtual environment
echo -e "\n${YELLOW}[2/8] Checking virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${GREEN}✓ Virtual environment exists${NC}"
else
    echo -e "${RED}✗ Virtual environment not found. Run setup.sh first${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check dependencies
echo -e "\n${YELLOW}[3/8] Checking Python dependencies...${NC}"
source venv/bin/activate
missing_deps=0
for package in pandas openai aiohttp requests pyyaml; do
    if python -c "import $package" 2>/dev/null; then
        echo -e "${GREEN}✓ $package${NC}"
    else
        echo -e "${RED}✗ $package not installed${NC}"
        missing_deps=$((missing_deps+1))
    fi
done
if [ $missing_deps -gt 0 ]; then
    ERRORS=$((ERRORS+1))
fi

# Check configuration
echo -e "\n${YELLOW}[4/8] Checking configuration...${NC}"
if [ -f "config.yaml" ]; then
    echo -e "${GREEN}✓ config.yaml exists${NC}"

    # Check for required keys
    if grep -q "api_key:" config.yaml; then
        echo -e "${GREEN}✓ API keys configured${NC}"
    else
        echo -e "${YELLOW}⚠️  API keys may not be configured${NC}"
    fi
else
    echo -e "${RED}✗ config.yaml not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check directories
echo -e "\n${YELLOW}[5/8] Checking directory structure...${NC}"
for dir in data/cache data/analytics logs; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir${NC}"
    else
        echo -e "${RED}✗ $dir missing${NC}"
        ERRORS=$((ERRORS+1))
    fi
done

# Check engine modules
echo -e "\n${YELLOW}[6/8] Checking engine modules...${NC}"
python3 << 'EOF'
import sys
modules = [
    'engine.config_loader',
    'engine.logger',
    'engine.data_collector',
    'engine.page_generator',
    'engine.calculators',
    'engine.affiliate_mapper',
    'engine.wordpress_publisher',
    'engine.learning_engine'
]

failed = 0
for module in modules:
    try:
        __import__(module)
        print(f'\033[0;32m✓ {module}\033[0m')
    except ImportError as e:
        print(f'\033[0;31m✗ {module}: {e}\033[0m')
        failed += 1

sys.exit(failed)
EOF

if [ $? -ne 0 ]; then
    ERRORS=$((ERRORS+1))
fi

# Check scripts
echo -e "\n${YELLOW}[7/8] Checking scripts...${NC}"
for script in scripts/setup.sh scripts/setup_cron.sh main.py; do
    if [ -x "$script" ]; then
        echo -e "${GREEN}✓ $script (executable)${NC}"
    elif [ -f "$script" ]; then
        echo -e "${YELLOW}⚠️  $script exists but not executable${NC}"
    else
        echo -e "${RED}✗ $script not found${NC}"
        ERRORS=$((ERRORS+1))
    fi
done

# Check WordPress plugin
echo -e "\n${YELLOW}[8/8] Checking WordPress plugin...${NC}"
if [ -f "wordpress-plugin/preppercodex-dashboard.php" ]; then
    echo -e "${GREEN}✓ WordPress plugin exists${NC}"
else
    echo -e "${RED}✗ WordPress plugin not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# Summary
echo -e "\n========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo -e "========================================"
    echo -e "\n${GREEN}Installation verified successfully!${NC}"
    echo -e "\nNext steps:"
    echo -e "1. Configure config.yaml with your API keys"
    echo -e "2. Run: python main.py collect"
    echo -e "3. Run: python main.py generate --limit 3 --test"
else
    echo -e "${RED}✗ $ERRORS CHECKS FAILED${NC}"
    echo -e "========================================"
    echo -e "\n${RED}Installation has issues. Please fix the errors above.${NC}"
    exit 1
fi
