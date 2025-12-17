import { Scenario, Tip } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'fire_mastery',
    title: 'Fire Mastery',
    description: '10 ways to start fire without matches or lighters',
    icon: '🔥',
    display_order: 1,
    difficulty_level: 'Intermediate',
    is_premium: false,
  },
  {
    id: 'water_procurement',
    title: 'Water Procurement',
    description: '10 methods to find, collect, and purify water',
    icon: '💧',
    display_order: 2,
    difficulty_level: 'Beginner',
    is_premium: false,
  },
  {
    id: 'emergency_shelter',
    title: 'Emergency Shelter',
    description: '10 rapid shelter-building techniques',
    icon: '🏕️',
    display_order: 3,
    difficulty_level: 'Intermediate',
    is_premium: true,
  },
  {
    id: 'signaling_rescue',
    title: 'Signaling & Rescue',
    description: '10 methods to signal for help',
    icon: '🚨',
    display_order: 4,
    difficulty_level: 'Beginner',
    is_premium: true,
  },
  {
    id: 'edible_plants',
    title: 'Edible Plants & Foraging',
    description: '10 safe plants + identification methods',
    icon: '🌿',
    display_order: 5,
    difficulty_level: 'Advanced',
    is_premium: true,
  },
  {
    id: 'rope_knots',
    title: 'Rope Work & Knots',
    description: '10 essential knots for survival situations',
    icon: '🪢',
    display_order: 6,
    difficulty_level: 'Beginner',
    is_premium: true,
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: '10 methods to orient without GPS/compass',
    icon: '🧭',
    display_order: 7,
    difficulty_level: 'Intermediate',
    is_premium: true,
  },
  {
    id: 'first_aid',
    title: 'First Aid Essentials',
    description: '10 critical injury/illness responses',
    icon: '⚕️',
    display_order: 8,
    difficulty_level: 'Intermediate',
    is_premium: true,
  },
  {
    id: 'improvised_tools',
    title: 'Improvised Tools & Weapons',
    description: '10 DIY survival tools',
    icon: '🔨',
    display_order: 9,
    difficulty_level: 'Advanced',
    is_premium: true,
  },
  {
    id: 'weather_hazards',
    title: 'Weather & Wilderness Hazards',
    description: '10 threat recognition + mitigation tactics',
    icon: '⛈️',
    display_order: 10,
    difficulty_level: 'Advanced',
    is_premium: true,
  },
];

export const TIPS: Tip[] = [
  // FIRE MASTERY TIPS (Free)
  {
    id: 'fire_1',
    scenario_id: 'fire_mastery',
    rank: 1,
    title: 'Friction Fire: Bow Drill Method',
    difficulty: 'Advanced',
    time_to_master: '2-3 hours',
    instruction_text: `The bow drill is one of the most effective friction fire methods.

**Steps:**
1. Find a dry, flat piece of softwood for your fireboard (cedar, willow, poplar work best)
2. Create a spindle from a straight hardwood stick about 8-10 inches long
3. Make a bow using a flexible branch and cord/string
4. Carve a small depression in the fireboard where the spindle will rotate
5. Prepare tinder bundle from dry grass, bark, or plant fibers
6. Place spindle in depression, wrap bow string around it
7. Apply downward pressure with a hand socket (stone or wood with depression)
8. Use bow in sawing motion to rotate spindle rapidly
9. Create friction until smoke appears and coal forms
10. Transfer coal to tinder bundle and blow gently to create flame

**Key:** Consistent speed and pressure are critical. The motion should be smooth and rhythmic.`,
    success_criteria: 'You should see smoke within 30 seconds and produce a glowing ember within 2-3 minutes of proper technique',
    common_mistakes: [
      'Using green or damp wood',
      'Applying too much downward pressure (spindle won\'t spin)',
      'Inconsistent bow speed',
      'Not preparing a proper tinder bundle beforehand',
      'Giving up too early - takes practice!',
    ],
    materials_needed: [
      'Softwood fireboard (8x3 inches)',
      'Hardwood spindle (8-10 inches)',
      'Flexible branch for bow',
      'Cord or natural fiber string',
      'Hand socket (stone or wood)',
      'Dry tinder bundle',
    ],
    related_tip_ids: ['fire_2', 'fire_3'],
    variations: [
      'Hand drill method: similar but uses hands to rotate spindle',
      'Fire plow: drag hardwood along groove in softwood',
    ],
    prerequisites: [],
  },
  {
    id: 'fire_2',
    scenario_id: 'fire_mastery',
    rank: 2,
    title: 'Flint and Steel Method',
    difficulty: 'Beginner',
    time_to_master: '15-30 minutes',
    instruction_text: `Create sparks by striking steel against flint rock.

**Steps:**
1. Gather char cloth, punk wood, or dry tinder fungus
2. Hold flint firmly in one hand
3. Strike steel (knife back, steel striker) at 30-degree angle against sharp flint edge
4. Direct sparks onto char cloth or tinder
5. Once spark catches, blow gently to create ember
6. Transfer to larger tinder bundle
7. Build up gradually with kindling

**Key:** Strike with authority - sparks need to be hot and directed at tinder.`,
    success_criteria: 'Generate visible sparks within 5 strikes; catch spark on char cloth within 1 minute',
    common_mistakes: [
      'Using wrong type of rock (need flint, chert, or quartz)',
      'Weak strikes that produce few sparks',
      'Tinder too far from spark zone',
      'Not having char cloth prepared',
    ],
    materials_needed: [
      'Flint, chert, or quartz rock',
      'Steel striker or carbon steel knife',
      'Char cloth or tinder fungus',
      'Dry tinder bundle',
    ],
    related_tip_ids: ['fire_1', 'fire_4'],
    variations: [
      'Use battery and steel wool for instant ignition',
      'Ferrocerium rod (modern alternative)',
    ],
    prerequisites: [],
  },
  {
    id: 'fire_3',
    scenario_id: 'fire_mastery',
    rank: 3,
    title: 'Magnifying Glass / Lens Method',
    difficulty: 'Beginner',
    time_to_master: '5 minutes',
    instruction_text: `Use sunlight focused through a lens to ignite tinder.

**Steps:**
1. Need direct sunlight (won't work on cloudy days)
2. Prepare fine, dry tinder (char cloth ideal)
3. Hold lens 2-6 inches above tinder
4. Adjust distance until light focuses to smallest, brightest point
5. Hold steady - should see smoke within 10-30 seconds
6. Once ember forms, transfer to tinder bundle
7. Blow to flame

**Lens sources:** eyeglasses, camera lens, clear water in plastic bag, ice lens, bottom of soda can (polished).`,
    success_criteria: 'Focused light should create visible smoke within 30 seconds on dry tinder',
    common_mistakes: [
      'Moving lens around instead of holding steady',
      'Tinder too thick or damp',
      'Sun not bright enough (cloudy, early/late day)',
      'Focal point too large (need intense concentration of light)',
    ],
    materials_needed: [
      'Magnifying glass or clear lens',
      'Bright sunlight',
      'Very fine, dry tinder',
    ],
    related_tip_ids: ['fire_4', 'fire_5'],
    variations: [
      'Ice lens: freeze clear water in curved mold',
      'Water-filled clear bag or balloon',
      'Polished soda can bottom (parabolic reflector)',
    ],
    prerequisites: [],
  },

  // WATER PROCUREMENT TIPS (Free)
  {
    id: 'water_1',
    scenario_id: 'water_procurement',
    rank: 1,
    title: 'Boiling Water Purification',
    difficulty: 'Beginner',
    time_to_master: '10 minutes',
    instruction_text: `Boiling is the most reliable water purification method.

**Steps:**
1. Collect water from best available source (clear, flowing water preferred)
2. Filter through cloth if water is cloudy
3. Bring water to a rolling boil
4. Boil for 1 minute at sea level (3 minutes above 6,500 feet)
5. Let cool before drinking
6. Improve taste by pouring between containers (aerates water)

**Why it works:** Boiling kills bacteria, viruses, and parasites. Temperature of 212°F (100°C) destroys all pathogens.`,
    success_criteria: 'Water reaches visible rolling boil and maintains for full minute',
    common_mistakes: [
      'Not boiling long enough',
      'Assuming hot water = boiling (must see vigorous bubbling)',
      'Contaminating purified water with dirty container',
      'Not adjusting boil time for altitude',
    ],
    materials_needed: [
      'Heat source (fire)',
      'Metal container or pot',
      'Water source',
      'Optional: cloth for pre-filtering',
    ],
    related_tip_ids: ['water_2', 'water_3'],
    variations: [
      'Rock boiling: heat rocks in fire, drop into wooden container of water',
      'Solar pasteurization: heat water to 149°F for 6 hours',
    ],
    prerequisites: ['fire_1'],
  },
  {
    id: 'water_2',
    scenario_id: 'water_procurement',
    rank: 2,
    title: 'Solar Still Construction',
    difficulty: 'Intermediate',
    time_to_master: '1 hour',
    instruction_text: `Create fresh water from moisture in soil or vegetation.

**Steps:**
1. Dig hole 3 feet wide, 2 feet deep in sunny location
2. Place collection container in center bottom
3. Fill area around container with vegetation (green plants, cacti, non-potable water)
4. Cover hole with clear plastic sheet
5. Seal edges with soil
6. Place small rock in center of plastic above container
7. Plastic should form inverted cone shape
8. Let solar heat evaporate moisture, which condenses on plastic and drips into container

**Yield:** 1-3 cups water per day depending on conditions.`,
    success_criteria: 'Condensation visible on plastic within 2 hours; water collecting in container after 4-6 hours',
    common_mistakes: [
      'Plastic sheet not clear (reduces solar heating)',
      'Poor seal around edges (moisture escapes)',
      'Container too small or tips over',
      'Not using enough vegetation for moisture',
      'Checking too frequently (breaks seal)',
    ],
    materials_needed: [
      'Clear plastic sheet (6x6 feet)',
      'Collection container',
      'Digging tool or hands',
      'Green vegetation or moisture source',
      'Small weight (rock)',
    ],
    related_tip_ids: ['water_1', 'water_4'],
    variations: [
      'Transpiration bag: tie plastic bag around leafy branch',
      'Above-ground still using tarp and vegetation',
    ],
    prerequisites: [],
  },
  {
    id: 'water_3',
    scenario_id: 'water_procurement',
    rank: 3,
    title: 'Natural Water Filtration',
    difficulty: 'Beginner',
    time_to_master: '30 minutes',
    instruction_text: `Build multi-layer filter to remove particles and some pathogens.

**Steps:**
1. Cut bottom off plastic bottle or use hollow log
2. Create layers from bottom to top:
   - Clean cloth or coffee filter
   - Fine sand (2 inches)
   - Crushed charcoal (2 inches) - from fire
   - Fine sand (2 inches)
   - Gravel or small rocks (2 inches)
   - Coarse stones (1 inch)
3. Pour water slowly through top
4. Collect filtered water from bottom
5. **IMPORTANT:** This removes particles but NOT all pathogens
6. Still boil or chemically treat filtered water before drinking

**Note:** Filtration improves taste and removes sediment, but is NOT sufficient purification alone.`,
    success_criteria: 'Water runs clear through filter; significantly reduced visible particles',
    common_mistakes: [
      'Trusting filter alone (still must purify!)',
      'Not packing layers tightly enough',
      'Using dirty materials',
      'Not replacing charcoal layer (loses effectiveness)',
      'Pouring water too fast (reduces filtration)',
    ],
    materials_needed: [
      'Container (bottle, bamboo, or hollow log)',
      'Layers: cloth, sand, charcoal, gravel',
      'Clean collection container',
    ],
    related_tip_ids: ['water_1', 'water_2'],
    variations: [
      'Tripod filter: suspend filter using sticks',
      'Ground seepage: dig hole near water source, let water filter through soil',
    ],
    prerequisites: [],
  },

  // EMERGENCY SHELTER TIPS (Premium - just first 3 for demo)
  {
    id: 'shelter_1',
    scenario_id: 'emergency_shelter',
    rank: 1,
    title: 'Lean-To Shelter',
    difficulty: 'Beginner',
    time_to_master: '45 minutes',
    instruction_text: `Quick, simple shelter for mild weather.

**Steps:**
1. Find two trees 6-8 feet apart (or drive stakes)
2. Place strong ridge pole between trees at 4-5 feet height
3. Lean branches at 45-degree angle against ridge pole
4. Layer with leaves, bark, grass working bottom to top (like shingles)
5. Build thick - need 12+ inches of debris for insulation
6. Optional: build fire in front for warmth and wind block
7. Face opening away from wind

**Protection:** Good for rain, moderate wind, and sun. NOT suitable for extreme cold.`,
    success_criteria: 'Shelter sheds water; no gaps in debris layer; comfortable sitting/lying space',
    common_mistakes: [
      'Not enough debris (need 12+ inches)',
      'Opening faces wind',
      'Ridge pole too low (cramped) or too high (heat loss)',
      'Branches too sparse',
    ],
    materials_needed: [
      'Ridge pole (strong branch 8-10 feet)',
      'Support poles or trees',
      'Dozens of lean-to branches',
      'Large amount of debris (leaves, bark, grass)',
    ],
    related_tip_ids: ['shelter_2', 'shelter_3'],
    variations: [
      'A-frame: cover both sides for better weather protection',
      'Use tarp or emergency blanket if available',
    ],
    prerequisites: [],
  },
  {
    id: 'shelter_2',
    scenario_id: 'emergency_shelter',
    rank: 2,
    title: 'Debris Hut',
    difficulty: 'Intermediate',
    time_to_master: '2-3 hours',
    instruction_text: `Full-coverage shelter excellent for cold weather survival.

**Steps:**
1. Find or create strong ridge pole 9-10 feet long
2. Prop one end 3-4 feet high against tree or forked support
3. Create ribbing: lean branches at 45° angle along both sides
4. Add lattice of smaller sticks across ribs
5. Pile debris 2-3 feet thick all around (except entrance)
6. Create door plug from debris
7. Fill interior with dry leaves for insulation

**Concept:** You're building a "sleeping bag" shelter. Should be just big enough to fit your body.`,
    success_criteria: 'Interior stays dry in rain; body heat warms space; no drafts; can seal entrance completely',
    common_mistakes: [
      'Building too large (can\'t retain body heat)',
      'Not enough debris thickness (need 2-3 feet)',
      'Poor entrance seal',
      'Ridge pole too high or too low',
      'Interior not insulated with dry material',
    ],
    materials_needed: [
      'Ridge pole (9-10 feet)',
      'Rib branches (6-8 feet, dozens needed)',
      'Huge amount of debris (leaves, grass, pine needles)',
      'Smaller sticks for lattice',
    ],
    related_tip_ids: ['shelter_1', 'shelter_3'],
    variations: [
      'Snow version: use snow instead of debris',
      'Two-person size: wider ridge pole, larger entrance',
    ],
    prerequisites: [],
  },
  {
    id: 'shelter_3',
    scenario_id: 'emergency_shelter',
    rank: 3,
    title: 'Tarp/Poncho Shelter',
    difficulty: 'Beginner',
    time_to_master: '15 minutes',
    instruction_text: `Fastest shelter if you have tarp, poncho, or emergency blanket.

**Configurations:**

**A-Frame:**
1. Tie cordage between two trees at chest height
2. Drape tarp over cord
3. Stake corners to ground
4. Creates two-sided rain protection

**Lean-To:**
1. Tie one edge high between trees
2. Stake opposite edge to ground at 45° angle
3. Open side faces away from wind

**Diamond/Flying Diamond:**
1. Stake one corner to ground
2. Pull opposite corner up to tree
3. Stake side corners out
4. Creates spacious overhead coverage

**Use rocks, logs, or pack to hold edges if no stakes available.**`,
    success_criteria: 'Tarp taut (no water pooling); stakes secure; adequate coverage from elements',
    common_mistakes: [
      'Not tightening tarp enough (water pools)',
      'Stakes pull out in wind',
      'Opening faces wind/rain',
      'Not using all available attachment points',
    ],
    materials_needed: [
      'Tarp, poncho, or emergency blanket',
      'Cordage or paracord',
      'Stakes (or rocks/logs)',
      'Trees or trekking poles for support',
    ],
    related_tip_ids: ['shelter_1', 'shelter_4'],
    variations: [
      'Burrito wrap: wrap tarp around yourself in emergency',
      'Group shelter: larger tarp can cover multiple people',
    ],
    prerequisites: [],
  },
];

// Function to seed the database
export const seedDatabase = async () => {
  const { insertScenario, insertTip } = require('./database/queries');

  try {
    // Insert all scenarios
    for (const scenario of SCENARIOS) {
      await insertScenario(scenario);
    }

    // Insert all tips
    for (const tip of TIPS) {
      await insertTip(tip);
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};
