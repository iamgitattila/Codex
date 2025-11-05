import { database } from './index';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addMonths, format } from 'date-fns';

export async function seedSampleData() {
  const db = database.getDatabase();

  // Check if data already exists
  const existingAssets = await db.getAllAsync('SELECT COUNT(*) as count FROM assets');
  if ((existingAssets[0] as any).count > 0) {
    console.log('Sample data already exists, skipping seed');
    return;
  }

  console.log('Seeding sample data...');

  const now = new Date().toISOString();

  // Get locations
  const locations = await db.getAllAsync('SELECT id FROM locations LIMIT 3');
  const pantryId = (locations[0] as any).id;
  const garageId = (locations[1] as any).id;
  const vehicleId = (locations[2] as any).id;

  // Sample consumables
  const sampleAssets = [
    {
      id: uuidv4(),
      name: 'Black Beans - #10 Can',
      category: 'Consumable',
      subcategory: 'Food',
      description: 'Organic black beans, 15oz can',
      quantityOwned: 12,
      quantityPar: 20,
      unitType: 'cans',
      locationId: pantryId,
      expirationDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
      dateAcquired: format(addDays(new Date(), -60), 'yyyy-MM-dd'),
      costUsd: 2.99,
      sourceUrl: 'Walmart',
      condition: 'Sealed',
      rotationStatus: 'Active',
    },
    {
      id: uuidv4(),
      name: 'Canned Soup - Tomato',
      category: 'Consumable',
      subcategory: 'Food',
      description: 'Tomato soup, 10oz can',
      quantityOwned: 8,
      quantityPar: 15,
      unitType: 'cans',
      locationId: pantryId,
      expirationDate: format(addDays(new Date(), 18), 'yyyy-MM-dd'),
      dateAcquired: format(addDays(new Date(), -90), 'yyyy-MM-dd'),
      costUsd: 1.49,
      sourceUrl: 'Amazon',
      condition: 'Sealed',
      rotationStatus: 'Active',
    },
    {
      id: uuidv4(),
      name: 'Water - 1 Gallon',
      category: 'Consumable',
      subcategory: 'Water',
      description: 'Purified drinking water',
      quantityOwned: 24,
      quantityPar: 30,
      unitType: 'gallons',
      locationId: garageId,
      expirationDate: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
      dateAcquired: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
      costUsd: 0.99,
      sourceUrl: 'Costco',
      condition: 'Sealed',
      rotationStatus: 'Active',
    },
    {
      id: uuidv4(),
      name: 'First Aid Kit',
      category: 'Gear',
      subcategory: 'FirstAid',
      description: 'Complete first aid kit with bandages, antiseptic, etc.',
      quantityOwned: 1,
      quantityPar: 1,
      unitType: 'kit',
      locationId: vehicleId,
      dateAcquired: format(addDays(new Date(), -180), 'yyyy-MM-dd'),
      lastVerified: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
      costUsd: 45.00,
      sourceUrl: 'Amazon',
      condition: 'Functional',
      rotationStatus: 'Active',
    },
    {
      id: uuidv4(),
      name: 'Flashlight - LED',
      category: 'Gear',
      subcategory: 'SurvivalGear',
      description: 'High-power LED flashlight, waterproof',
      quantityOwned: 3,
      quantityPar: 5,
      unitType: 'pieces',
      locationId: garageId,
      dateAcquired: format(addDays(new Date(), -120), 'yyyy-MM-dd'),
      lastVerified: format(addDays(new Date(), -15), 'yyyy-MM-dd'),
      costUsd: 24.99,
      sourceUrl: 'Amazon',
      condition: 'Functional',
      rotationStatus: 'Active',
    },
    {
      id: uuidv4(),
      name: 'Iodine Tablets',
      category: 'Consumable',
      subcategory: 'Medicine',
      description: 'Water purification tablets',
      quantityOwned: 20,
      quantityPar: 30,
      unitType: 'tablets',
      locationId: pantryId,
      expirationDate: format(addDays(new Date(), 25), 'yyyy-MM-dd'),
      dateAcquired: format(addDays(new Date(), -200), 'yyyy-MM-dd'),
      costUsd: 12.00,
      sourceUrl: 'REI',
      condition: 'Sealed',
      rotationStatus: 'Active',
    },
    {
      id: uuidv4(),
      name: 'AA Batteries',
      category: 'Gear',
      subcategory: 'Power',
      description: 'Alkaline AA batteries, 24-pack',
      quantityOwned: 48,
      quantityPar: 60,
      unitType: 'pieces',
      locationId: garageId,
      expirationDate: format(addMonths(new Date(), 24), 'yyyy-MM-dd'),
      dateAcquired: format(addDays(new Date(), -45), 'yyyy-MM-dd'),
      costUsd: 18.99,
      sourceUrl: 'Costco',
      condition: 'Sealed',
      rotationStatus: 'Active',
    },
  ];

  // Insert sample assets
  for (const asset of sampleAssets) {
    await db.runAsync(`
      INSERT INTO assets (
        id, name, category, subcategory, description,
        quantity_owned, quantity_par, unit_type, location_id,
        expiration_date, date_acquired, last_verified, cost_usd,
        source_url, condition, rotation_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      asset.id, asset.name, asset.category, asset.subcategory || null,
      asset.description, asset.quantityOwned, asset.quantityPar, asset.unitType,
      asset.locationId, asset.expirationDate || null, asset.dateAcquired || null,
      (asset as any).lastVerified || null, asset.costUsd, asset.sourceUrl,
      asset.condition, asset.rotationStatus, now, now
    ]);
  }

  // Create sample kits
  const bobKitId = uuidv4();
  await db.runAsync(
    'INSERT INTO kits (id, name, description, kit_type, location_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [bobKitId, 'Bug-Out Bag Alpha', 'Primary 72-hour emergency kit', 'BOB', vehicleId, now]
  );

  const firstAidKitId = uuidv4();
  await db.runAsync(
    'INSERT INTO kits (id, name, description, kit_type, location_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [firstAidKitId, 'Home First Aid Kit', 'Complete home medical supplies', 'FirstAid', pantryId, now]
  );

  console.log('Sample data seeded successfully');
}
