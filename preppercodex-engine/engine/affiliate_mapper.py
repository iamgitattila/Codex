"""
Affiliate Mapper
Maps hazards and needs to contextual product recommendations
"""

import logging
from typing import Dict, Any, List
import pandas as pd

logger = logging.getLogger(__name__)


class AffiliateMapper:
    """Generate contextual affiliate product recommendations"""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize affiliate mapper

        Args:
            config: Affiliate configuration with tracking IDs
        """
        self.config = config
        self.products = self._load_product_database()

    def _load_product_database(self) -> List[Dict[str, Any]]:
        """Load product database with affiliate links"""
        return [
            {
                'name': 'Harvest Right Home Freeze Dryer',
                'category': 'food_storage',
                'priority': 'high',
                'hazards': ['all'],
                'price_range': '$2,500-$5,000',
                'description': 'Preserve fresh food for 25+ years. Turn bulk purchases into shelf-stable meals.',
                'url': 'https://harvestright.com',
                'affiliate_param': f"?ref={self.config.get('harvest_right', {}).get('affiliate_code', 'AFFILIATE')}",
                'commission': 0.05,
                'image': 'harvest-right-freeze-dryer.jpg'
            },
            {
                'name': 'Berkey Water Filter System',
                'category': 'water_filtration',
                'priority': 'critical',
                'hazards': ['flood', 'hurricane', 'earthquake', 'all'],
                'price_range': '$300-$400',
                'description': 'Gravity-fed water filtration. Removes 99.999% of pathogens. No electricity needed.',
                'url': f"https://www.amazon.com/s?k=berkey+water+filter&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'berkey-water-filter.jpg'
            },
            {
                'name': 'ReadyWise Emergency Food Supply',
                'category': 'food_storage',
                'priority': 'high',
                'hazards': ['all'],
                'price_range': '$100-$2,000',
                'description': '25-year shelf life. Complete meals for 1 month to 1 year.',
                'url': f"https://www.amazon.com/s?k=readywise+emergency+food&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'readywise-food.jpg'
            },
            {
                'name': 'Goal Zero Yeti Solar Generator',
                'category': 'power',
                'priority': 'high',
                'hazards': ['hurricane', 'wildfire', 'winter_storm', 'all'],
                'price_range': '$500-$3,000',
                'description': 'Portable solar power station. Charge from solar panels or wall outlet.',
                'url': f"https://www.amazon.com/s?k=goal+zero+yeti&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'goal-zero-yeti.jpg'
            },
            {
                'name': 'MIRA Safety Gas Mask',
                'category': 'protective_equipment',
                'priority': 'medium',
                'hazards': ['wildfire', 'chemical'],
                'price_range': '$300-$400',
                'description': 'NATO-approved full-face respirator. Protection from smoke, chemicals, and airborne hazards.',
                'url': 'https://www.mirasafety.com',
                'affiliate_param': f"?ref={self.config.get('mira_safety', {}).get('affiliate_code', 'AFFILIATE')}",
                'commission': 0.10,
                'image': 'mira-safety-gas-mask.jpg'
            },
            {
                'name': 'Mountain House Freeze-Dried Meals',
                'category': 'food_storage',
                'priority': 'high',
                'hazards': ['all'],
                'price_range': '$10-$150',
                'description': 'Individual freeze-dried meals with 30-year shelf life. Just add water.',
                'url': f"https://www.amazon.com/s?k=mountain+house+freeze+dried&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'mountain-house.jpg'
            },
            {
                'name': 'WaterBrick Storage Containers',
                'category': 'water_storage',
                'priority': 'high',
                'hazards': ['all'],
                'price_range': '$35-$200',
                'description': 'Stackable 3.5-gallon water storage. BPA-free, food-grade plastic.',
                'url': f"https://www.amazon.com/s?k=waterbrick&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'waterbrick.jpg'
            },
            {
                'name': 'Baofeng UV-5R Ham Radio',
                'category': 'communications',
                'priority': 'medium',
                'hazards': ['all'],
                'price_range': '$25-$40',
                'description': 'Dual-band handheld radio. Essential for emergency communications.',
                'url': f"https://www.amazon.com/s?k=baofeng+uv5r&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'baofeng-radio.jpg'
            },
            {
                'name': 'Lifestraw Family Water Purifier',
                'category': 'water_filtration',
                'priority': 'high',
                'hazards': ['flood', 'hurricane', 'earthquake'],
                'price_range': '$60-$100',
                'description': 'High-volume water filter. 18,000 liters capacity.',
                'url': f"https://www.amazon.com/s?k=lifestraw+family&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'lifestraw-family.jpg'
            },
            {
                'name': 'Champion 3400W Inverter Generator',
                'category': 'power',
                'priority': 'high',
                'hazards': ['hurricane', 'winter_storm', 'all'],
                'price_range': '$500-$700',
                'description': 'Quiet inverter generator. 3400W starting, 3100W running. RV-ready.',
                'url': f"https://www.amazon.com/s?k=champion+3400+watt+inverter+generator&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'champion-generator.jpg'
            },
            {
                'name': 'Augason Farms Emergency Food Pail',
                'category': 'food_storage',
                'priority': 'high',
                'hazards': ['all'],
                'price_range': '$70-$150',
                'description': '30-day food supply in sealed bucket. 20-year shelf life.',
                'url': f"https://www.amazon.com/s?k=augason+farms+30+day&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'augason-farms.jpg'
            },
            {
                'name': 'Survivor Filter PRO',
                'category': 'water_filtration',
                'priority': 'medium',
                'hazards': ['all'],
                'price_range': '$60-$80',
                'description': 'Portable water filter. Removes bacteria, viruses, and heavy metals.',
                'url': f"https://www.amazon.com/s?k=survivor+filter+pro&tag={self.config.get('amazon', {}).get('tracking_id', 'AFFILIATE-20')}",
                'affiliate_param': '',
                'commission': 0.04,
                'image': 'survivor-filter.jpg'
            }
        ]

    def generate_contextual_offers(
        self,
        nri_row: pd.Series,
        county_name: str,
        state: str
    ) -> str:
        """
        Generate contextual product recommendations based on county risks

        Args:
            nri_row: County risk data
            county_name: County name
            state: State abbreviation

        Returns:
            HTML with product recommendations
        """
        # Identify top hazards
        hazards = []

        if nri_row.get('WILDFIRE_RISKR', 0) > 50:
            hazards.append('wildfire')
        if nri_row.get('RFLD_RISKR', 0) > 50:
            hazards.append('flood')
        if nri_row.get('HRCN_RISKR', 0) > 50:
            hazards.append('hurricane')
        if nri_row.get('ERQK_RISKR', 0) > 50:
            hazards.append('earthquake')
        if nri_row.get('WNTW_RISKR', 0) > 50:
            hazards.append('winter_storm')

        # Add "all" to show general prep items
        hazards.append('all')

        # Filter products by relevance
        relevant_products = []

        for product in self.products:
            product_hazards = product.get('hazards', [])
            if 'all' in product_hazards or any(h in product_hazards for h in hazards):
                relevant_products.append(product)

        # Sort by priority
        priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        relevant_products.sort(key=lambda p: priority_order.get(p.get('priority', 'low'), 3))

        # Take top 6
        relevant_products = relevant_products[:6]

        html = f"""
<div class="affiliate-section">
    <h2>🛒 Recommended Products for {county_name}, {state}</h2>
    <p>Based on the hazard profile for your county, here are our top product recommendations:</p>

    <div class="product-grid">
"""

        for product in relevant_products:
            full_url = product['url'] + product.get('affiliate_param', '')

            html += f"""
        <div class="affiliate-product">
            <div class="product-image">
                <div style="background: #e9ecef; height: 200px; display: flex; align-items: center; justify-content: center; color: #6c757d;">
                    📦 {product['name'][:20]}...
                </div>
            </div>
            <div class="product-details">
                <h4>{product['name']}</h4>
                <p class="product-category">{product['category'].replace('_', ' ').title()}</p>
                <p class="product-description">{product['description']}</p>
                <p class="product-price"><strong>{product['price_range']}</strong></p>
                <a href="{full_url}" class="btn-affiliate" target="_blank" rel="noopener nofollow">
                    View on Amazon →
                </a>
                <p class="affiliate-disclosure">We earn commission on sales</p>
            </div>
        </div>
"""

        html += """
    </div>

    <div class="affiliate-disclaimer">
        <p><strong>Affiliate Disclosure:</strong> PrepperCodex participates in affiliate programs.
        When you purchase through our links, we earn a small commission at no additional cost to you.
        This helps support our free content and data analysis.</p>
    </div>
</div>

<style>
.affiliate-section {
    margin: 40px 0;
    padding: 30px;
    background: #ffffff;
    border-radius: 8px;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.affiliate-product {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
    background: #f8f9fa;
    transition: transform 0.2s, box-shadow 0.2s;
}

.affiliate-product:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-details h4 {
    color: #212529;
    margin: 10px 0;
    font-size: 18px;
}

.product-category {
    color: #6c757d;
    font-size: 14px;
    text-transform: uppercase;
    font-weight: bold;
    margin: 5px 0;
}

.product-description {
    color: #495057;
    margin: 10px 0;
    line-height: 1.5;
}

.product-price {
    color: #28a745;
    font-size: 18px;
    margin: 10px 0;
}

.btn-affiliate {
    display: inline-block;
    background: #ff9900;
    color: #ffffff;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    transition: background 0.2s;
}

.btn-affiliate:hover {
    background: #e68a00;
}

.affiliate-disclosure {
    font-size: 12px;
    color: #6c757d;
    margin-top: 5px;
}

.affiliate-disclaimer {
    margin-top: 30px;
    padding: 15px;
    background: #e7f3ff;
    border-left: 4px solid #007bff;
    font-size: 14px;
    color: #495057;
}
</style>
"""

        return html
