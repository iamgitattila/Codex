import { Protocol, UrgencyLevel, QuizQuestion } from '../constants/protocols';

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  ProtocolList: undefined;
  ProtocolDetail: { protocolId: string };
  VideoPlayer: { protocolId: string };
  Quiz: { protocolId: string };
  KitTracker: undefined;
  TriageMode: undefined;
  Bookmarks: undefined;
};

// User Progress
export interface UserProgress {
  protocolId: string;
  status: 'viewed' | 'studied' | 'mastered';
  viewCount: number;
  lastViewed: string;
  timeSpentSeconds: number;
  bookmarked: boolean;
}

// Quiz Result
export interface QuizResult {
  id: string;
  protocolId: string;
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  timestamp: string;
}

// Kit Inventory
export interface KitInventoryItem {
  id: string;
  materialId: string;
  materialName: string;
  quantityOwned: number;
  quantityNeeded: number;
  dateAcquired?: string;
  expirationDate?: string;
  sourceUrl?: string;
}

// Kit Scenario
export interface KitScenario {
  id: string;
  kitName: string;
  protocolIds: string[];
  completionPercentage: number;
  lastReviewed?: string;
}

// App State
export interface AppState {
  protocols: Protocol[];
  userProgress: Record<string, UserProgress>;
  quizResults: QuizResult[];
  kitInventory: KitInventoryItem[];
  kitScenarios: KitScenario[];
  bookmarks: string[];
  lastSyncDate?: string;
}

// Filter and Search
export interface ProtocolFilters {
  urgencyLevel?: UrgencyLevel[];
  searchQuery?: string;
  bookmarkedOnly?: boolean;
}
