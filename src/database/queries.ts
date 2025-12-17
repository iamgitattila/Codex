import { getDatabase } from './database';
import { Scenario, Tip, UserProgress, Bookmark, DailyChallenge } from '../types';

// ================= SCENARIOS =================

export const getAllScenarios = async (): Promise<Scenario[]> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM scenarios ORDER BY display_order ASC'
  );

  const scenarios: Scenario[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    scenarios.push(results.rows.item(i));
  }
  return scenarios;
};

export const getScenarioById = async (id: string): Promise<Scenario | null> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM scenarios WHERE id = ?',
    [id]
  );

  if (results.rows.length > 0) {
    return results.rows.item(0);
  }
  return null;
};

export const insertScenario = async (scenario: Scenario): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO scenarios
    (id, title, description, icon, display_order, difficulty_level, is_premium)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      scenario.id,
      scenario.title,
      scenario.description,
      scenario.icon,
      scenario.display_order,
      scenario.difficulty_level,
      scenario.is_premium ? 1 : 0,
    ]
  );
};

// ================= TIPS =================

export const getTipsByScenarioId = async (scenarioId: string): Promise<Tip[]> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM tips WHERE scenario_id = ? ORDER BY rank ASC',
    [scenarioId]
  );

  const tips: Tip[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    tips.push({
      ...row,
      common_mistakes: row.common_mistakes ? JSON.parse(row.common_mistakes) : [],
      materials_needed: row.materials_needed ? JSON.parse(row.materials_needed) : [],
      related_tip_ids: row.related_tip_ids ? JSON.parse(row.related_tip_ids) : [],
      variations: row.variations ? JSON.parse(row.variations) : [],
      prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    });
  }
  return tips;
};

export const getTipById = async (id: string): Promise<Tip | null> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM tips WHERE id = ?',
    [id]
  );

  if (results.rows.length > 0) {
    const row = results.rows.item(0);
    return {
      ...row,
      common_mistakes: row.common_mistakes ? JSON.parse(row.common_mistakes) : [],
      materials_needed: row.materials_needed ? JSON.parse(row.materials_needed) : [],
      related_tip_ids: row.related_tip_ids ? JSON.parse(row.related_tip_ids) : [],
      variations: row.variations ? JSON.parse(row.variations) : [],
      prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    };
  }
  return null;
};

export const insertTip = async (tip: Tip): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO tips
    (id, scenario_id, rank, title, difficulty, time_to_master,
     instruction_text, success_criteria, common_mistakes, materials_needed,
     related_tip_ids, illustration_local_path, illustration_url, variations, prerequisites)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tip.id,
      tip.scenario_id,
      tip.rank,
      tip.title,
      tip.difficulty,
      tip.time_to_master,
      tip.instruction_text,
      tip.success_criteria,
      JSON.stringify(tip.common_mistakes || []),
      JSON.stringify(tip.materials_needed || []),
      JSON.stringify(tip.related_tip_ids || []),
      tip.illustration_local_path || null,
      tip.illustration_url || null,
      JSON.stringify(tip.variations || []),
      JSON.stringify(tip.prerequisites || []),
    ]
  );
};

// ================= USER PROGRESS =================

export const getUserProgress = async (userId: string = 'default_user'): Promise<UserProgress[]> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM user_progress WHERE user_id = ?',
    [userId]
  );

  const progress: UserProgress[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    progress.push(results.rows.item(i));
  }
  return progress;
};

export const updateUserProgress = async (
  tipId: string,
  status: 'viewed' | 'attempted' | 'mastered',
  userId: string = 'default_user'
): Promise<void> => {
  const db = await getDatabase();
  const id = `${userId}_${tipId}`;

  await db.executeSql(
    `INSERT OR REPLACE INTO user_progress
    (id, user_id, tip_id, status, attempts_count, last_attempted)
    VALUES (?, ?, ?, ?,
      COALESCE((SELECT attempts_count FROM user_progress WHERE id = ?), 0) + 1,
      datetime('now'))`,
    [id, userId, tipId, status, id]
  );
};

export const markTipAsCompleted = async (
  tipId: string,
  userId: string = 'default_user'
): Promise<void> => {
  const db = await getDatabase();
  const id = `${userId}_${tipId}`;

  await db.executeSql(
    `UPDATE user_progress
    SET status = 'mastered', completion_date = datetime('now')
    WHERE id = ?`,
    [id]
  );
};

// ================= BOOKMARKS =================

export const getBookmarks = async (userId: string = 'default_user'): Promise<Bookmark[]> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  const bookmarks: Bookmark[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    bookmarks.push(results.rows.item(i));
  }
  return bookmarks;
};

export const addBookmark = async (
  tipId: string,
  userId: string = 'default_user'
): Promise<void> => {
  const db = await getDatabase();
  const id = `${userId}_${tipId}_${Date.now()}`;

  await db.executeSql(
    `INSERT OR IGNORE INTO bookmarks (id, user_id, tip_id)
    VALUES (?, ?, ?)`,
    [id, userId, tipId]
  );
};

export const removeBookmark = async (
  tipId: string,
  userId: string = 'default_user'
): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    'DELETE FROM bookmarks WHERE user_id = ? AND tip_id = ?',
    [userId, tipId]
  );
};

export const isBookmarked = async (
  tipId: string,
  userId: string = 'default_user'
): Promise<boolean> => {
  const db = await getDatabase();
  const [results] = await db.executeSql(
    'SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ? AND tip_id = ?',
    [userId, tipId]
  );

  return results.rows.item(0).count > 0;
};

// ================= DAILY CHALLENGES =================

export const getTodayChallenge = async (
  userId: string = 'default_user'
): Promise<DailyChallenge | null> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const [results] = await db.executeSql(
    'SELECT * FROM daily_challenges WHERE user_id = ? AND date_assigned = ?',
    [userId, today]
  );

  if (results.rows.length > 0) {
    return results.rows.item(0);
  }
  return null;
};

export const createDailyChallenge = async (
  tipId: string,
  userId: string = 'default_user'
): Promise<void> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const id = `${userId}_${today}`;

  await db.executeSql(
    `INSERT OR REPLACE INTO daily_challenges
    (id, user_id, challenge_tip_id, date_assigned)
    VALUES (?, ?, ?, ?)`,
    [id, userId, tipId, today]
  );
};

export const completeDailyChallenge = async (
  challengeId: string,
  feedback: string
): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `UPDATE daily_challenges
    SET completed = 1, completed_at = datetime('now'), difficulty_feedback = ?
    WHERE id = ?`,
    [feedback, challengeId]
  );
};

// ================= ANALYTICS =================

export const logEvent = async (
  eventType: string,
  scenarioId?: string,
  tipId?: string,
  userId: string = 'default_user'
): Promise<void> => {
  const db = await getDatabase();
  const id = `${userId}_${Date.now()}`;

  await db.executeSql(
    `INSERT INTO session_events
    (id, user_id, event_type, scenario_id, tip_id, device_info)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, eventType, scenarioId || null, tipId || null, '{}']
  );
};
