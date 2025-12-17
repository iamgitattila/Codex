import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import * as Models from './models';

// Create the adapter
const adapter = new SQLiteAdapter({
  schema,
  // Optional: enable migrations when schema changes
  // migrations,
  jsi: true, // Use JSI for better performance on newer React Native
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Create the database
export const database = new Database({
  adapter,
  modelClasses: [
    Models.Asset,
    Models.Location,
    Models.Kit,
    Models.KitItem,
    Models.ExpirationAlert,
    Models.ShoppingListItem,
    Models.UserSetting,
  ],
});

// Initialize default data
export const initializeDefaultData = async () => {
  const locationsCount = await database.get('locations').query().fetchCount();

  if (locationsCount === 0) {
    await database.write(async () => {
      const locationsCollection = database.get('locations');

      // Create default locations
      await locationsCollection.create((location: any) => {
        location.name = 'Pantry';
        location.locationType = 'Home';
        location.order = 1;
      });

      await locationsCollection.create((location: any) => {
        location.name = 'Garage';
        location.locationType = 'Home';
        location.order = 2;
      });

      await locationsCollection.create((location: any) => {
        location.name = 'Basement';
        location.locationType = 'Home';
        location.order = 3;
      });

      await locationsCollection.create((location: any) => {
        location.name = 'Vehicle';
        location.locationType = 'Vehicle';
        location.order = 4;
      });

      await locationsCollection.create((location: any) => {
        location.name = 'Cache';
        location.locationType = 'Cache';
        location.order = 5;
      });
    });

    console.log('Default locations created');
  }
};
