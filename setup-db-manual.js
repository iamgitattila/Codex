const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure prisma directory exists
const prismaDir = path.join(__dirname, 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir);
}

const dbPath = path.join(prismaDir, 'dev.db');

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new Database(dbPath);
console.log('Created SQLite database at:', dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
console.log('Creating database schema...');

db.exec(`
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "neurodivergentType" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gradeLevel" TEXT,
    "preferences" TEXT,
    "strengths" TEXT,
    "challenges" TEXT,
    "parentId" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("parentId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "LearningModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "neurodivergentType" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "pointsReward" INTEGER NOT NULL DEFAULT 10,
    "content" TEXT NOT NULL,
    "activities" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "lastAccessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE,
    UNIQUE("userId", "moduleId")
);

CREATE TABLE IF NOT EXISTS "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "LearningSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "durationMinutes" INTEGER,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "aiCoachingUsed" INTEGER NOT NULL DEFAULT 0,
    "coachingInteractions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE
);
`);

console.log('Schema created successfully!');

// Generate CUIDs (simple version)
function cuid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Seed data
console.log('Seeding database...');

const hashedPassword = bcrypt.hashSync('demo123', 10);

// Create demo users
const student1Id = cuid();
const insertStudent1 = db.prepare(`
  INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertStudent1.run(student1Id, 'alex@example.com', 'Alex Student', hashedPassword, 'STUDENT');

const student2Id = cuid();
const insertStudent2 = db.prepare(`
  INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertStudent2.run(student2Id, 'jamie@example.com', 'Jamie Student', hashedPassword, 'STUDENT');

const parentId = cuid();
const insertParent = db.prepare(`
  INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertParent.run(parentId, 'parent@example.com', 'Parent Guardian', hashedPassword, 'PARENT');

console.log('Created demo users');

// Create profiles
const profile1Id = cuid();
const insertProfile1 = db.prepare(`
  INSERT INTO Profile (id, userId, neurodivergentType, age, gradeLevel, preferences, strengths, challenges, totalPoints, level, streak, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertProfile1.run(
  profile1Id,
  student1Id,
  'ADHD',
  12,
  '6th Grade',
  JSON.stringify({ visualLearner: true, shortSessions: true, reminders: true }),
  JSON.stringify(['Creative thinking', 'Problem solving']),
  JSON.stringify(['Sustained attention', 'Organization']),
  150,
  2,
  3
);

const profile2Id = cuid();
const insertProfile2 = db.prepare(`
  INSERT INTO Profile (id, userId, neurodivergentType, age, gradeLevel, preferences, strengths, challenges, totalPoints, level, streak, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertProfile2.run(
  profile2Id,
  student2Id,
  'AUTISM',
  10,
  '4th Grade',
  JSON.stringify({ structuredRoutines: true, clearInstructions: true, quietEnvironment: true }),
  JSON.stringify(['Pattern recognition', 'Detail-oriented']),
  JSON.stringify(['Social communication', 'Flexibility']),
  280,
  3,
  7
);

console.log('Created profiles');

// Create learning modules
const modules = [
  {
    title: 'Focus Foundations',
    description: 'Learn techniques to improve focus and concentration through engaging activities',
    neurodivergentType: 'ADHD',
    difficultyLevel: 'BEGINNER',
    category: 'Focus & Attention',
    estimatedDuration: 15,
    pointsReward: 20,
    order: 1,
    content: JSON.stringify({
      introduction: 'Welcome to Focus Foundations! This module will help you build your focus muscles.',
      sections: [
        {
          title: 'Understanding Your Focus',
          content: "Everyone focuses differently. Let's discover what works best for you!",
          mediaType: 'video',
        },
        {
          title: 'The Pomodoro Technique',
          content: 'Work in focused bursts with breaks in between.',
          tips: ['Set a timer for 15 minutes', 'Focus on one task', 'Take a 5-minute break'],
        },
      ],
    }),
    activities: JSON.stringify([
      {
        type: 'timer-challenge',
        title: 'Focus Sprint',
        description: 'Complete a task in 10 minutes without distractions',
        points: 10,
      },
      {
        type: 'quiz',
        title: 'Focus Knowledge Check',
        questions: [
          {
            question: 'What is the Pomodoro Technique?',
            options: ['Working in timed intervals', 'A type of tomato', 'A video game'],
            correct: 0,
          },
        ],
        points: 10,
      },
    ]),
  },
  {
    title: 'Organization Station',
    description: 'Master organization skills with fun, interactive tools and strategies',
    neurodivergentType: 'ADHD',
    difficultyLevel: 'BEGINNER',
    category: 'Organization',
    estimatedDuration: 20,
    pointsReward: 25,
    order: 2,
    content: JSON.stringify({
      introduction: "Getting organized doesn't have to be boring. Let's make it fun!",
      sections: [
        {
          title: 'Creating Your Command Center',
          content: 'Set up a space that helps you stay organized',
        },
      ],
    }),
    activities: JSON.stringify([
      {
        type: 'drag-drop',
        title: 'Organize the Desk',
        description: 'Drag items to their proper places',
        points: 15,
      },
    ]),
  },
  {
    title: 'Communication Confidence',
    description: 'Build social communication skills at your own pace',
    neurodivergentType: 'AUTISM',
    difficultyLevel: 'BEGINNER',
    category: 'Social Skills',
    estimatedDuration: 20,
    pointsReward: 25,
    order: 1,
    content: JSON.stringify({
      introduction: "Communication comes in many forms. Let's find what works for you!",
      sections: [
        {
          title: 'Understanding Body Language',
          content: 'Learn to recognize and interpret non-verbal cues',
        },
      ],
    }),
    activities: JSON.stringify([
      {
        type: 'scenario',
        title: 'Conversation Practice',
        description: 'Practice different conversation scenarios',
        points: 15,
      },
    ]),
  },
];

const insertModule = db.prepare(`
  INSERT INTO LearningModule (id, title, description, neurodivergentType, difficultyLevel, category, estimatedDuration, pointsReward, content, activities, "order", isPublished, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

const moduleIds = [];
modules.forEach(module => {
  const moduleId = cuid();
  moduleIds.push(moduleId);
  insertModule.run(
    moduleId,
    module.title,
    module.description,
    module.neurodivergentType,
    module.difficultyLevel,
    module.category,
    module.estimatedDuration,
    module.pointsReward,
    module.content,
    module.activities,
    module.order,
    1
  );
});

console.log('Created learning modules');

// Create some progress
const progress1Id = cuid();
const insertProgress = db.prepare(`
  INSERT INTO Progress (id, userId, moduleId, status, progressPercentage, score, attemptsCount, timeSpentMinutes, startedAt, completedAt, lastAccessedAt, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
`);
insertProgress.run(progress1Id, student1Id, moduleIds[0], 'COMPLETED', 100, 95, 1, 18, '2024-11-01', '2024-11-01');

const progress2Id = cuid();
insertProgress.run(progress2Id, student1Id, moduleIds[1], 'IN_PROGRESS', 60, null, 1, 12, '2024-11-04', null);

console.log('Created progress records');

// Create achievements
const achievement1Id = cuid();
const insertAchievement = db.prepare(`
  INSERT INTO Achievement (id, userId, type, title, description, icon, pointsAwarded, unlockedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);
insertAchievement.run(achievement1Id, student1Id, 'BADGE', 'First Steps', 'Completed your first module!', '🎯', 50);

const achievement2Id = cuid();
insertAchievement.run(achievement2Id, student2Id, 'STREAK', 'Week Warrior', 'Maintained a 7-day streak!', '🔥', 100);

console.log('Created achievements');

db.close();

console.log('\n✅ Database setup complete!');
console.log('\nDemo accounts:');
console.log('- ADHD Student: alex@example.com / demo123');
console.log('- Autism Student: jamie@example.com / demo123');
console.log('- Parent: parent@example.com / demo123');
console.log('\nYou can now start the development server with: npm run dev');
