export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  is_premium: boolean;
  created_at?: string;
}

export interface Tip {
  id: string;
  scenario_id: string;
  rank: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  time_to_master: string;
  instruction_text: string;
  success_criteria: string;
  common_mistakes: string[];
  materials_needed: string[];
  related_tip_ids: string[];
  illustration_local_path?: string;
  illustration_url?: string;
  variations: string[];
  prerequisites: string[];
  created_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  tip_id: string;
  status: 'viewed' | 'attempted' | 'mastered';
  attempts_count: number;
  last_attempted?: string;
  completion_date?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  tip_id: string;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  user_id: string;
  challenge_tip_id: string;
  date_assigned: string;
  completed: boolean;
  completed_at?: string;
  difficulty_feedback?: string;
}

export interface SessionEvent {
  id: string;
  user_id: string;
  event_type: string;
  scenario_id?: string;
  tip_id?: string;
  timestamp: string;
  device_info: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  ScenarioList: undefined;
  ScenarioDetail: { scenarioId: string };
  TipDetail: { tipId: string };
  DailyChallenge: undefined;
  Profile: undefined;
  Bookmarks: undefined;
  Settings: undefined;
  Paywall: { scenarioId?: string };
};
