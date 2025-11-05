// Database initialization and utilities for Burrow: The Digital Ledger
import * as SQLite from 'expo-sqlite';
import { ALL_CREATE_STATEMENTS, ALL_SEED_STATEMENTS } from './schema';

const DATABASE_NAME = 'burrow_inventory.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    if (db) {
      return db;
    }

    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('Database opened successfully');

    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables and indexes
    for (const statement of ALL_CREATE_STATEMENTS) {
      await db.execAsync(statement);
    }
    console.log('Tables and indexes created successfully');

    // Seed default data
    for (const statement of ALL_SEED_STATEMENTS) {
      await db.execAsync(statement);
    }
    console.log('Default data seeded successfully');

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Get the database instance
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    return await initDatabase();
  }
  return db;
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database closed');
  }
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get current ISO timestamp
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Execute a raw SQL query
 */
export const executeQuery = async <T>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<T>(query, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

/**
 * Execute a raw SQL statement (for INSERT, UPDATE, DELETE)
 */
export const executeStatement = async (
  statement: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(statement, params);
    return result;
  } catch (error) {
    console.error('Error executing statement:', error);
    throw error;
  }
};

/**
 * Begin a transaction
 */
export const beginTransaction = async (): Promise<void> => {
  const database = await getDatabase();
  await database.execAsync('BEGIN TRANSACTION;');
};

/**
 * Commit a transaction
 */
export const commitTransaction = async (): Promise<void> => {
  const database = await getDatabase();
  await database.execAsync('COMMIT;');
};

/**
 * Rollback a transaction
 */
export const rollbackTransaction = async (): Promise<void> => {
  const database = await getDatabase();
  await database.execAsync('ROLLBACK;');
};

/**
 * Reset the database (WARNING: Deletes all data)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    const database = await getDatabase();

    // Drop all tables
    await database.execAsync(`
      DROP TABLE IF EXISTS expiration_alerts;
      DROP TABLE IF EXISTS shopping_list;
      DROP TABLE IF EXISTS kit_items;
      DROP TABLE IF EXISTS kits;
      DROP TABLE IF EXISTS assets;
      DROP TABLE IF EXISTS locations;
      DROP TABLE IF EXISTS user_settings;
    `);

    console.log('All tables dropped');

    // Reinitialize
    for (const statement of ALL_CREATE_STATEMENTS) {
      await database.execAsync(statement);
    }

    for (const statement of ALL_SEED_STATEMENTS) {
      await database.execAsync(statement);
    }

    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  generateUUID,
  getCurrentTimestamp,
  executeQuery,
  executeStatement,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  resetDatabase,
};
