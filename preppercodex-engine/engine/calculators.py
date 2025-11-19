"""
Interactive Calculator Generator
Creates food, water, power, and bug-out bag calculators
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class CalculatorGenerator:
    """Generate interactive HTML/JavaScript calculators"""

    def generate_all_calculators(self, county_name: str, state: str) -> str:
        """Generate all calculators for a county page"""

        html = f"""
<div class="calculators-section">
    <h2>🧮 Survival Calculators for {county_name}, {state}</h2>
    <p>Use these interactive tools to calculate your exact preparedness needs.</p>

    {self.generate_food_calculator()}
    {self.generate_water_calculator()}
    {self.generate_power_calculator()}
    {self.generate_bugout_bag_calculator()}
</div>

<style>
.calculator {{
    background: #f8f9fa;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
}}

.calculator h3 {{
    color: #495057;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
}}

.calculator label {{
    display: block;
    margin: 15px 0 5px 0;
    font-weight: bold;
}}

.calculator input[type="number"],
.calculator input[type="range"] {{
    width: 100%;
    max-width: 300px;
    padding: 8px;
    margin: 5px 0;
    border: 1px solid #ced4da;
    border-radius: 4px;
}}

.calculator button {{
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 15px;
}}

.calculator button:hover {{
    background: #0056b3;
}}

.calc-results {{
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    padding: 15px;
    margin-top: 20px;
}}

.calc-results table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
}}

.calc-results table th,
.calc-results table td {{
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}}

.calc-results table tr.total {{
    font-weight: bold;
    background: #c3e6cb;
}}

.range-value {{
    display: inline-block;
    margin-left: 10px;
    font-weight: bold;
    color: #007bff;
}}
</style>
"""

        return html

    def generate_food_calculator(self) -> str:
        """Generate food storage calculator"""
        return """
<div class="calculator" id="food-calculator">
    <h3>🥫 Food Storage Calculator</h3>
    <p>Calculate exactly how much food you need to store based on your household.</p>

    <label for="food-adults">
        Number of Adults (ages 13+):
        <input type="number" id="food-adults" value="2" min="1" max="20">
    </label>

    <label for="food-children">
        Number of Children (ages 1-12):
        <input type="number" id="food-children" value="0" min="0" max="20">
    </label>

    <label for="food-infants">
        Number of Infants (under 1 year):
        <input type="number" id="food-infants" value="0" min="0" max="5">
    </label>

    <label for="food-months">
        Storage Duration (months): <span id="food-months-display" class="range-value">6</span>
        <input type="range" id="food-months" value="6" min="1" max="24" oninput="document.getElementById('food-months-display').innerText = this.value">
    </label>

    <label>
        <input type="checkbox" id="food-freeze-dried">
        Include freeze-dried options (more expensive, lighter weight)
    </label>

    <label>
        <input type="checkbox" id="food-dietary">
        Account for dietary restrictions
    </label>

    <button onclick="calculateFood()">Calculate My Food Needs</button>

    <div id="food-results" class="calc-results" style="display:none;">
        <h4>📋 Your Food Storage Shopping List</h4>
        <div id="food-shopping-list"></div>
        <p style="margin-top: 15px;">
            <strong>💡 Tip:</strong> Start with a 3-month supply, then expand to 6-12 months.
        </p>
        <a href="#products" class="btn-affiliate" style="display:inline-block; margin-top:10px; padding:10px 20px; background:#28a745; color:white; text-decoration:none; border-radius:4px;">View Recommended Products →</a>
    </div>
</div>

<script>
function calculateFood() {
    const adults = parseInt(document.getElementById('food-adults').value) || 0;
    const children = parseInt(document.getElementById('food-children').value) || 0;
    const infants = parseInt(document.getElementById('food-infants').value) || 0;
    const months = parseInt(document.getElementById('food-months').value) || 6;
    const freezeDried = document.getElementById('food-freeze-dried').checked;

    // Caloric needs per day (averages)
    const adultCalories = 2400;
    const childCalories = 1800;
    const infantCalories = 850;

    const totalDailyCalories = (adults * adultCalories) + (children * childCalories) + (infants * infantCalories);
    const totalMonthlyCalories = totalDailyCalories * 30 * months;

    // Staple food breakdown (in pounds)
    // Assuming ~1600 calories per pound for mixed staples
    const totalPounds = totalMonthlyCalories / 1600;

    const items = [
        {
            category: 'Grains',
            items: [
                { name: 'Rice (white/brown)', lbs: totalPounds * 0.25, price: 0.60 },
                { name: 'Wheat/Flour', lbs: totalPounds * 0.15, price: 0.50 },
                { name: 'Oats', lbs: totalPounds * 0.05, price: 0.80 },
                { name: 'Pasta', lbs: totalPounds * 0.08, price: 0.90 }
            ]
        },
        {
            category: 'Proteins',
            items: [
                { name: 'Dried Beans', lbs: totalPounds * 0.12, price: 1.20 },
                { name: 'Lentils', lbs: totalPounds * 0.05, price: 1.50 },
                { name: 'Canned Meats', lbs: totalPounds * 0.08, price: 4.00 },
                { name: 'Peanut Butter', lbs: totalPounds * 0.04, price: 3.00 }
            ]
        },
        {
            category: 'Fats & Oils',
            items: [
                { name: 'Vegetable Oil', lbs: totalPounds * 0.04, price: 2.50 },
                { name: 'Shortening/Lard', lbs: totalPounds * 0.02, price: 2.00 }
            ]
        },
        {
            category: 'Sweeteners',
            items: [
                { name: 'Sugar', lbs: totalPounds * 0.06, price: 0.70 },
                { name: 'Honey', lbs: totalPounds * 0.03, price: 4.00 }
            ]
        },
        {
            category: 'Dairy',
            items: [
                { name: 'Powdered Milk', lbs: totalPounds * 0.08, price: 3.50 }
            ]
        }
    ];

    let html = '';
    let grandTotal = 0;

    items.forEach(category => {
        html += `<div style="margin: 15px 0;"><h5 style="color: #495057; margin: 10px 0;">${category.category}</h5><table><tr><th>Item</th><th>Amount</th><th>Est. Cost</th></tr>`;

        category.items.forEach(item => {
            const amount = Math.round(item.lbs);
            const cost = item.lbs * item.price;
            grandTotal += cost;

            if (amount > 0) {
                html += `<tr><td>${item.name}</td><td>${amount} lbs</td><td>$${cost.toFixed(2)}</td></tr>`;
            }
        });

        html += '</table></div>';
    });

    html += `<div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 4px;">`;
    html += `<p style="font-size: 18px;"><strong>Total Weight:</strong> ${Math.round(totalPounds)} lbs</p>`;
    html += `<p style="font-size: 18px;"><strong>Estimated Cost:</strong> $${grandTotal.toFixed(2)}</p>`;
    html += `<p style="font-size: 14px; color: #666;">Prices are estimates. Shop sales and buy in bulk to save.</p>`;
    html += `</div>`;

    if (freezeDried) {
        const freezeDriedCost = (adults * 2500 + children * 2000) * months;
        html += `<div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 4px;">`;
        html += `<p><strong>Freeze-Dried Alternative:</strong> ~$${freezeDriedCost.toFixed(0)}</p>`;
        html += `<p style="font-size: 14px;">Lighter weight, longer shelf life (25+ years), but higher upfront cost.</p>`;
        html += `</div>`;
    }

    document.getElementById('food-shopping-list').innerHTML = html;
    document.getElementById('food-results').style.display = 'block';
}
</script>
"""

    def generate_water_calculator(self) -> str:
        """Generate water storage calculator"""
        return """
<div class="calculator" id="water-calculator">
    <h3>💧 Water Storage Calculator</h3>
    <p>Calculate your water storage needs for drinking, cooking, and hygiene.</p>

    <label for="water-people">
        Total Number of People:
        <input type="number" id="water-people" value="2" min="1" max="50">
    </label>

    <label for="water-days">
        Days to Store For: <span id="water-days-display" class="range-value">14</span>
        <input type="range" id="water-days" value="14" min="3" max="90" oninput="document.getElementById('water-days-display').innerText = this.value">
    </label>

    <label>
        <input type="checkbox" id="water-pets" onchange="togglePets()">
        Include pets
    </label>

    <div id="pet-inputs" style="display:none;">
        <label for="water-dogs">
            Number of Dogs:
            <input type="number" id="water-dogs" value="0" min="0" max="10">
        </label>
        <label for="water-dog-size">
            Average Dog Weight (lbs):
            <input type="number" id="water-dog-size" value="50" min="5" max="200">
        </label>
    </div>

    <label for="water-usage">
        Usage Level:
        <select id="water-usage">
            <option value="minimal">Minimal (1 gal/person/day)</option>
            <option value="standard" selected>Standard (2 gal/person/day)</option>
            <option value="comfortable">Comfortable (3 gal/person/day)</option>
        </select>
    </label>

    <button onclick="calculateWater()">Calculate Water Needs</button>

    <div id="water-results" class="calc-results" style="display:none;">
        <h4>💧 Your Water Storage Plan</h4>
        <div id="water-breakdown"></div>
    </div>
</div>

<script>
function togglePets() {
    const petsChecked = document.getElementById('water-pets').checked;
    document.getElementById('pet-inputs').style.display = petsChecked ? 'block' : 'none';
}

function calculateWater() {
    const people = parseInt(document.getElementById('water-people').value) || 0;
    const days = parseInt(document.getElementById('water-days').value) || 14;
    const usage = document.getElementById('water-usage').value;
    const hasPets = document.getElementById('water-pets').checked;

    // Gallons per person per day
    let gallonsPerPersonPerDay = 2;
    if (usage === 'minimal') gallonsPerPersonPerDay = 1;
    if (usage === 'comfortable') gallonsPerPersonPerDay = 3;

    let totalGallons = people * gallonsPerPersonPerDay * days;

    let breakdown = `<p><strong>Human needs:</strong> ${people} people × ${gallonsPerPersonPerDay} gal/day × ${days} days = ${totalGallons.toFixed(0)} gallons</p>`;

    // Add pet water
    if (hasPets) {
        const dogs = parseInt(document.getElementById('water-dogs').value) || 0;
        const dogSize = parseInt(document.getElementById('water-dog-size').value) || 50;
        const petGallons = dogs * (dogSize * 0.0078) * days; // ~1 oz per lb per day
        totalGallons += petGallons;
        breakdown += `<p><strong>Pet needs:</strong> ${dogs} dogs × ~${(dogSize * 0.0078).toFixed(2)} gal/day × ${days} days = ${petGallons.toFixed(0)} gallons</p>`;
    }

    breakdown += `<div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 4px;">`;
    breakdown += `<p style="font-size: 20px;"><strong>TOTAL: ${Math.ceil(totalGallons)} gallons</strong></p>`;
    breakdown += `</div>`;

    // Storage recommendations
    breakdown += `<h5>📦 Recommended Storage Options:</h5>`;

    if (totalGallons <= 50) {
        breakdown += `<p>✅ Use 5-gallon water containers (need ${Math.ceil(totalGallons / 5)} containers)</p>`;
    } else if (totalGallons <= 200) {
        breakdown += `<p>✅ Use 55-gallon drums (need ${Math.ceil(totalGallons / 55)} drums) + water treatment</p>`;
    } else {
        breakdown += `<p>⚠️ Large volume - consider water filtration system instead of pure storage</p>`;
        breakdown += `<p>Recommended: Store 2-week supply + invest in quality water filter (Berkey, LifeStraw Family, etc.)</p>`;
    }

    breakdown += `<p style="margin-top: 15px;"><strong>💡 Pro Tips:</strong></p>`;
    breakdown += `<ul>`;
    breakdown += `<li>Add 1/8 tsp bleach per gallon for long-term storage (unscented, 8.25% sodium hypochlorite)</li>`;
    breakdown += `<li>Store in cool, dark location away from chemicals</li>`;
    breakdown += `<li>Rotate every 6-12 months</li>`;
    breakdown += `<li>Label containers with date stored</li>`;
    breakdown += `</ul>`;

    document.getElementById('water-breakdown').innerHTML = breakdown;
    document.getElementById('water-results').style.display = 'block';
}
</script>
"""

    def generate_power_calculator(self) -> str:
        """Generate backup power calculator"""
        return """
<div class="calculator" id="power-calculator">
    <h3>⚡ Backup Power Calculator</h3>
    <p>Size your generator or solar system for emergency power needs.</p>

    <label for="power-appliances">
        Critical Appliances:
        <div style="margin: 10px 0;">
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="150"> Refrigerator (150W avg)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="100"> Freezer (100W avg)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="60"> LED Lights (60W)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="500"> Well Pump (500W)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="300"> Sump Pump (300W)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="100"> Internet/Communications (100W)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="200"> Laptop/Devices (200W)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="1500"> Space Heater (1500W)</label>
            <label style="display: block; font-weight: normal;"><input type="checkbox" class="appliance" data-watts="800"> Microwave (800W)</label>
        </div>
    </label>

    <label for="power-hours">
        Hours of Operation per Day: <span id="power-hours-display" class="range-value">12</span>
        <input type="range" id="power-hours" value="12" min="4" max="24" oninput="document.getElementById('power-hours-display').innerText = this.value">
    </label>

    <label for="power-type">
        Backup Power Type:
        <select id="power-type">
            <option value="generator">Gas/Propane Generator</option>
            <option value="solar">Solar + Battery</option>
            <option value="both">Hybrid (Solar + Generator backup)</option>
        </select>
    </label>

    <button onclick="calculatePower()">Calculate Power Needs</button>

    <div id="power-results" class="calc-results" style="display:none;">
        <h4>⚡ Your Backup Power System</h4>
        <div id="power-breakdown"></div>
    </div>
</div>

<script>
function calculatePower() {
    // Sum up selected appliances
    let totalWatts = 0;
    document.querySelectorAll('.appliance:checked').forEach(cb => {
        totalWatts += parseInt(cb.dataset.watts);
    });

    const hours = parseInt(document.getElementById('power-hours').value) || 12;
    const powerType = document.getElementById('power-type').value;

    // Daily energy consumption in Wh
    const dailyWh = totalWatts * hours;
    const dailyKwh = (dailyWh / 1000).toFixed(2);

    let breakdown = `<p><strong>Peak Load:</strong> ${totalWatts}W</p>`;
    breakdown += `<p><strong>Daily Energy:</strong> ${dailyKwh} kWh (${dailyWh.toFixed(0)} Wh)</p>`;

    breakdown += `<div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 4px;">`;

    if (powerType === 'generator') {
        const generatorSize = Math.ceil(totalWatts * 1.25 / 1000); // 25% overhead
        const fuelPerDay = dailyKwh * 0.08; // ~0.08 gallons per kWh

        breakdown += `<h5>🔧 Generator Recommendation:</h5>`;
        breakdown += `<p><strong>Minimum Size:</strong> ${generatorSize}kW (${generatorSize * 1000}W)</p>`;
        breakdown += `<p><strong>Fuel Consumption:</strong> ~${fuelPerDay.toFixed(1)} gallons/day</p>`;
        breakdown += `<p><strong>30-Day Fuel Storage:</strong> ${(fuelPerDay * 30).toFixed(0)} gallons</p>`;
        breakdown += `<p style="color: #666; font-size: 14px;">Recommendation: Champion 3400W or Honda EU3200i for smaller loads, or Generac 7kW+ for whole home</p>`;

    } else if (powerType === 'solar') {
        const solarPanels = Math.ceil(dailyWh / 250 / 5); // 250W panels, 5 sun hours avg
        const batteryCapacity = Math.ceil(dailyWh * 2 / 1000); // 2 days autonomy, in kWh

        breakdown += `<h5>☀️ Solar System Recommendation:</h5>`;
        breakdown += `<p><strong>Solar Panels:</strong> ${solarPanels}× 250W panels (${solarPanels * 250}W total)</p>`;
        breakdown += `<p><strong>Battery Bank:</strong> ${batteryCapacity}kWh minimum (2 days backup)</p>`;
        breakdown += `<p><strong>Inverter:</strong> ${Math.ceil(totalWatts * 1.25)}W continuous, ${Math.ceil(totalWatts * 2)}W surge</p>`;
        breakdown += `<p style="color: #666; font-size: 14px;">Estimated Cost: $${((solarPanels * 300) + (batteryCapacity * 1000) + 2000).toFixed(0)}</p>`;

    } else {
        const solarPanels = Math.ceil(dailyWh / 250 / 5 * 0.7); // 70% solar coverage
        const generatorSize = Math.ceil(totalWatts * 1.25 / 1000);
        const batteryCapacity = Math.ceil(dailyWh * 1.5 / 1000);

        breakdown += `<h5>🔄 Hybrid System Recommendation:</h5>`;
        breakdown += `<p><strong>Solar:</strong> ${solarPanels}× 250W panels</p>`;
        breakdown += `<p><strong>Generator Backup:</strong> ${generatorSize}kW</p>`;
        breakdown += `<p><strong>Battery:</strong> ${batteryCapacity}kWh</p>`;
        breakdown += `<p style="color: #666; font-size: 14px;">Best of both: Solar reduces fuel consumption, generator provides backup for cloudy days</p>`;
    }

    breakdown += `</div>`;

    breakdown += `<p><strong>💡 Pro Tips:</strong></p>`;
    breakdown += `<ul>`;
    breakdown += `<li>Reduce loads by improving insulation and using LED lights</li>`;
    breakdown += `<li>Prioritize critical loads: fridge/freezer, water, communications</li>`;
    breakdown += `<li>Consider manual backup options (hand pump for water, etc.)</li>`;
    breakdown += `<li>Store fuel properly: stabilizer + rotation every 6 months</li>`;
    breakdown += `</ul>`;

    document.getElementById('power-breakdown').innerHTML = breakdown;
    document.getElementById('power-results').style.display = 'block';
}
</script>
"""

    def generate_bugout_bag_calculator(self) -> str:
        """Generate bug-out bag calculator"""
        return """
<div class="calculator" id="bob-calculator">
    <h3>🎒 Bug-Out Bag Calculator</h3>
    <p>Build a comprehensive 72-hour survival kit.</p>

    <label for="bob-people">
        Number of People:
        <input type="number" id="bob-people" value="1" min="1" max="10">
    </label>

    <label for="bob-environment">
        Environment/Climate:
        <select id="bob-environment">
            <option value="urban">Urban</option>
            <option value="suburban">Suburban</option>
            <option value="rural">Rural/Wilderness</option>
            <option value="cold">Cold Climate</option>
            <option value="hot">Hot Climate</option>
        </select>
    </label>

    <label>
        <input type="checkbox" id="bob-medical">
        Include advanced medical supplies
    </label>

    <label>
        <input type="checkbox" id="bob-defense">
        Include defensive tools
    </label>

    <button onclick="calculateBOB()">Generate My Checklist</button>

    <div id="bob-results" class="calc-results" style="display:none;">
        <h4>📋 Your 72-Hour Bug-Out Bag Checklist</h4>
        <div id="bob-checklist"></div>
    </div>
</div>

<script>
function calculateBOB() {
    const people = parseInt(document.getElementById('bob-people').value) || 1;
    const environment = document.getElementById('bob-environment').value;
    const medical = document.getElementById('bob-medical').checked;
    const defense = document.getElementById('bob-defense').checked;

    const categories = [
        {
            name: 'Water & Hydration',
            items: [
                { name: 'Water bottles/bladders', qty: `${people * 2}L minimum` },
                { name: 'Water purification tablets', qty: '50 tablets' },
                { name: 'LifeStraw or water filter', qty: '1' },
                { name: 'Metal water bottle/canteen', qty: people }
            ]
        },
        {
            name: 'Food (72 hours)',
            items: [
                { name: 'MREs or freeze-dried meals', qty: people * 6 },
                { name: 'Energy bars', qty: people * 9 },
                { name: 'Trail mix/nuts', qty: `${people} bags` },
                { name: 'Electrolyte packets', qty: people * 6 }
            ]
        },
        {
            name: 'Shelter & Warmth',
            items: [
                { name: 'Emergency blanket (mylar)', qty: people },
                { name: 'Poncho/rain gear', qty: people },
                { name: 'Tarp (10x10)', qty: 1 },
                { name: '550 paracord (100ft)', qty: 1 }
            ]
        },
        {
            name: 'Fire & Light',
            items: [
                { name: 'Lighter(s)', qty: 2 },
                { name: 'Waterproof matches', qty: 1 },
                { name: 'Ferro rod', qty: 1 },
                { name: 'Headlamp + batteries', qty: people },
                { name: 'Flashlight + batteries', qty: 1 }
            ]
        },
        {
            name: 'First Aid',
            items: [
                { name: 'First aid kit (comprehensive)', qty: 1 },
                { name: 'Prescription medications (7 days)', qty: 'as needed' },
                { name: 'Pain relievers (ibuprofen/acetaminophen)', qty: 1 },
                { name: 'Anti-diarrheal medication', qty: 1 },
                { name: 'Bandages, gauze, medical tape', qty: 'assorted' }
            ]
        },
        {
            name: 'Tools & Gear',
            items: [
                { name: 'Multi-tool (Leatherman/Gerber)', qty: 1 },
                { name: 'Fixed blade knife', qty: 1 },
                { name: 'Duct tape', qty: 1 },
                { name: 'Emergency whistle', qty: people },
                { name: 'Compass', qty: 1 },
                { name: 'Local maps (waterproof)', qty: 1 }
            ]
        },
        {
            name: 'Communication & Documents',
            items: [
                { name: 'Hand-crank radio (NOAA weather)', qty: 1 },
                { name: 'Copies of important documents', qty: 1 },
                { name: 'Cash ($500+ in small bills)', qty: 1 },
                { name: 'Emergency contact list', qty: 1 },
                { name: 'Portable battery bank', qty: 1 }
            ]
        },
        {
            name: 'Hygiene & Sanitation',
            items: [
                { name: 'Toilet paper', qty: 1 },
                { name: 'Hand sanitizer', qty: 1 },
                { name: 'Soap/camp soap', qty: 1 },
                { name: 'Toothbrush/toothpaste', qty: people },
                { name: 'Garbage bags (heavy-duty)', qty: 5 }
            ]
        }
    ];

    // Add environment-specific items
    if (environment === 'cold') {
        categories.push({
            name: 'Cold Weather Gear',
            items: [
                { name: 'Insulated jacket', qty: people },
                { name: 'Thermal underwear', qty: people },
                { name: 'Gloves/hand warmers', qty: people },
                { name: 'Wool socks', qty: people * 2 }
            ]
        });
    } else if (environment === 'hot') {
        categories.push({
            name: 'Hot Weather Gear',
            items: [
                { name: 'Sun hat', qty: people },
                { name: 'Sunscreen (SPF 50+)', qty: 1 },
                { name: 'Cooling towel', qty: people },
                { name: 'Extra electrolytes', qty: 'double qty' }
            ]
        });
    }

    // Advanced medical
    if (medical) {
        categories.push({
            name: 'Advanced Medical',
            items: [
                { name: 'Tourniquet (CAT or SOFTT)', qty: 2 },
                { name: 'Israeli bandage', qty: 2 },
                { name: 'QuikClot gauze', qty: 2 },
                { name: 'Chest seal', qty: 2 },
                { name: 'SAM splint', qty: 1 },
                { name: 'Suture kit', qty: 1 }
            ]
        });
    }

    // Defense tools
    if (defense) {
        categories.push({
            name: 'Defensive Tools',
            items: [
                { name: 'Pepper spray', qty: people },
                { name: 'Tactical knife', qty: 1 },
                { name: 'Firearm + ammunition (if legal)', qty: '1 + 100 rounds' }
            ]
        });
    }

    let html = '';

    categories.forEach(category => {
        html += `<div style="margin: 20px 0;">`;
        html += `<h5 style="color: #495057; border-bottom: 1px solid #ddd; padding-bottom: 5px;">${category.name}</h5>`;
        html += `<ul style="list-style: none; padding: 0;">`;

        category.items.forEach(item => {
            html += `<li style="padding: 5px 0;"><input type="checkbox" style="margin-right: 10px;"><strong>${item.name}</strong> — ${item.qty}</li>`;
        });

        html += `</ul></div>`;
    });

    html += `<div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 4px;">`;
    html += `<p><strong>💡 Important Notes:</strong></p>`;
    html += `<ul>`;
    html += `<li>Total weight target: ${people * 35} lbs (35 lbs per person max)</li>`;
    html += `<li>Test your bag: Take it on a weekend hike to identify issues</li>`;
    html += `<li>Rotate food/water every 6 months</li>`;
    html += `<li>Customize for your specific needs and region</li>`;
    html += `<li>Pack in layers: most-used items on top</li>`;
    html += `</ul>`;
    html += `</div>`;

    document.getElementById('bob-checklist').innerHTML = html;
    document.getElementById('bob-results').style.display = 'block';
}
</script>
"""
