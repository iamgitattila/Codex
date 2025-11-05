import * as SQLite from 'expo-sqlite';
import { ALL_TABLES } from './schema';

const DB_NAME = 'burrow_inventory.db';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.seedDefaultData();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const query of ALL_TABLES) {
      await this.db.execAsync(query);
    }
  }

  private async seedDefaultData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if locations already exist
    const result = await this.db.getAllAsync('SELECT COUNT(*) as count FROM locations');
    const count = (result[0] as any).count;

    if (count === 0) {
      // Seed default locations
      const defaultLocations = [
        { id: 'loc-1', name: 'Pantry', type: 'Home', order: 1 },
        { id: 'loc-2', name: 'Garage Shelf A', type: 'Home', order: 2 },
        { id: 'loc-3', name: 'Garage Shelf B', type: 'Home', order: 3 },
        { id: 'loc-4', name: 'Master Bedroom Closet', type: 'Home', order: 4 },
        { id: 'loc-5', name: 'Basement', type: 'Home', order: 5 },
        { id: 'loc-6', name: 'Attic', type: 'Home', order: 6 },
        { id: 'loc-7', name: 'Primary Vehicle', type: 'Vehicle', order: 7 },
        { id: 'loc-8', name: 'Backup Vehicle', type: 'Vehicle', order: 8 },
      ];

      for (const loc of defaultLocations) {
        await this.db.runAsync(
          'INSERT INTO locations (id, name, location_type, "order", created_at) VALUES (?, ?, ?, ?, ?)',
          [loc.id, loc.name, loc.type, loc.order, new Date().toISOString()]
        );
      }

      // Seed default settings
      const defaultSettings = {
        expirationAlertDays: '30',
        enableNotifications: 'true',
        enableBelowParAlerts: 'true',
        enableDailyReminder: 'false',
        dailyReminderTime: '09:00',
        requirePassword: 'false',
        encryptDatabase: 'false',
        theme: 'auto',
      };

      for (const [key, value] of Object.entries(defaultSettings)) {
        await this.db.runAsync(
          'INSERT INTO user_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)',
          [key, value, new Date().toISOString()]
        );
      }

      console.log('Default data seeded successfully');
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  // Transaction support
  async transaction<T>(callback: (tx: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.execAsync('BEGIN TRANSACTION');
      const result = await callback(this.db);
      await this.db.execAsync('COMMIT');
      return result;
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }
}

export const database = new Database();
export default database;
