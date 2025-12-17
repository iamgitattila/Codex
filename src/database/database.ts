import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'survivalskill.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'SurvivalSkill Database';
const DATABASE_SIZE = 200000;

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (databaseInstance) {
    return databaseInstance;
  }

  try {
    databaseInstance = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });

    console.log('✅ Database opened successfully');
    await createTables();
    return databaseInstance;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
};

export const createTables = async () => {
  try {
    const db = await getDatabase();

    // Scenarios table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        display_order INTEGER,
        difficulty_level TEXT,
        is_premium BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tips table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS tips (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        rank INTEGER NOT NULL,
        title TEXT NOT NULL,
        difficulty TEXT,
        time_to_master TEXT,
        instruction_text TEXT,
        success_criteria TEXT,
        common_mistakes TEXT,
        materials_needed TEXT,
        related_tip_ids TEXT,
        illustration_local_path TEXT,
        illustration_url TEXT,
        variations TEXT,
        prerequisites TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
      );
    `);

    // User progress table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        tip_id TEXT NOT NULL,
        status TEXT DEFAULT 'viewed',
        attempts_count INTEGER DEFAULT 0,
        last_attempted TEXT,
        completion_date TEXT,
        FOREIGN KEY (tip_id) REFERENCES tips(id),
        UNIQUE(user_id, tip_id)
      );
    `);

    // Bookmarks table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        tip_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tip_id)
      );
    `);

    // Daily challenges table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        challenge_tip_id TEXT NOT NULL,
        date_assigned TEXT,
        completed BOOLEAN DEFAULT 0,
        completed_at TEXT,
        difficulty_feedback TEXT,
        FOREIGN KEY (challenge_tip_id) REFERENCES tips(id)
      );
    `);

    // Session events table (for analytics)
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS session_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        event_type TEXT,
        scenario_id TEXT,
        tip_id TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        device_info TEXT
      );
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  if (databaseInstance) {
    await databaseInstance.close();
    databaseInstance = null;
    console.log('Database closed');
  }
};

export const dropAllTables = async () => {
  const db = await getDatabase();
  await db.executeSql('DROP TABLE IF EXISTS session_events');
  await db.executeSql('DROP TABLE IF EXISTS daily_challenges');
  await db.executeSql('DROP TABLE IF EXISTS bookmarks');
  await db.executeSql('DROP TABLE IF EXISTS user_progress');
  await db.executeSql('DROP TABLE IF EXISTS tips');
  await db.executeSql('DROP TABLE IF EXISTS scenarios');
  console.log('✅ All tables dropped');
};
