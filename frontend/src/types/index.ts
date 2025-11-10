export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface Campaign {
  id: number;
  ad_account_id: number;
  platform_campaign_id: string;
  name: string;
  status: string;
  objective?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdSet {
  id: number;
  campaign_id: number;
  platform_ad_set_id: string;
  name: string;
  status: string;
  daily_budget?: number;
  lifetime_budget?: number;
  bid_amount?: number;
  is_active: boolean;
  created_at: string;
}

export interface Ad {
  id: number;
  ad_set_id: number;
  platform_ad_id: string;
  name: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

export interface MetricsSummary {
  total_impressions: number;
  total_clicks: number;
  total_spend: number;
  total_conversions: number;
  total_conversion_value: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_cpm: number;
  avg_cpa: number;
  avg_roas: number;
}

export interface MetricsTimeSeries {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
}

export interface AutomationRule {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  target_type: string;
  target_ids?: string[];
  conditions: any;
  actions: any[];
  check_frequency: number;
  max_executions_per_day?: number;
  execution_count_today: number;
  last_checked_at?: string;
  next_check_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ActionLog {
  id: number;
  rule_id: number;
  action_type: string;
  target_type: string;
  target_id: string;
  status: string;
  error_message?: string;
  conditions_met: any;
  action_details: any;
  executed_at: string;
}
