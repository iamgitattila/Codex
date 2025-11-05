// Type definitions for Prisma enums (as strings for SQLite compatibility)

export type UserRole = 'STUDENT' | 'PARENT' | 'ADMIN';

export type NeurodivergentType =
  | 'ADHD'
  | 'AUTISM'
  | 'DYSLEXIA'
  | 'DYSCALCULIA'
  | 'DYSGRAPHIA'
  | 'MIXED'
  | 'OTHER';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
