/**
 * API client for Ad Replication Engine
 */
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AnalysisResult {
  success: boolean;
  analysis: {
    individual_analyses: any[];
    common_patterns: {
      shared_patterns: {
        design: string[];
        copywriting: string[];
        cro: string[];
      };
      universal_principles: string[];
      winning_formula: string;
      confidence_level: number;
    };
  };
}

export interface GenerationResult {
  success: boolean;
  variations: {
    variations: AdVariation[];
    generation_notes: string;
    recommended_test_order: string[];
    ab_test_strategy: string;
  };
}

export interface AdVariation {
  variation_id: string;
  framework: string;
  headline: string;
  subheadline: string;
  body_copy: string;
  cta_text: string;
  visual_description: string;
  psychological_triggers: string[];
  target_pain_point: string;
  unique_angle: string;
  power_words_used: string[];
  design_recommendations: {
    primary_color: string;
    secondary_color: string;
    font_style: string;
    layout: string;
  };
  predicted_metrics: {
    estimated_ctr: string;
    estimated_conversion_rate: string;
    confidence: number;
  };
  why_this_works: string;
}

export interface JobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface Insights {
  framework_performance: Array<{
    framework: string;
    avg_conversion_rate: number;
    sample_size: number;
  }>;
  industry_framework_fit: Array<{
    industry: string;
    framework: string;
    avg_conversion_rate: number;
  }>;
  top_performers: Array<{
    variation_id: string;
    headline: string;
    framework: string;
    ctr: number;
    conversion_rate: number;
    roas: number;
  }>;
  recommendations: string[];
}

/**
 * Analyze uploaded ad images
 */
export async function analyzeAds(files: File[], context?: string): Promise<AnalysisResult> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  if (context) formData.append('context', context);

  const response = await api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Run the full pipeline (async)
 */
export async function runPipeline(
  files: File[],
  targetProduct: string,
  targetIndustry: string,
  targetAudience: string,
  numVariations: number = 20
): Promise<{ job_id: string }> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('target_product', targetProduct);
  formData.append('target_industry', targetIndustry);
  formData.append('target_audience', targetAudience);
  formData.append('num_variations', numVariations.toString());

  const response = await api.post('/api/pipeline', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Check job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await api.get(`/api/job/${jobId}`);
  return response.data;
}

/**
 * Log performance data
 */
export async function logPerformance(data: {
  variation_id: string;
  generation_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  user_rating?: number;
}): Promise<void> {
  await api.post('/api/performance', data);
}

/**
 * Get insights
 */
export async function getInsights(): Promise<{ insights: Insights }> {
  const response = await api.get('/api/insights');
  return response.data;
}

/**
 * Get best framework for industry
 */
export async function getBestFramework(industry: string): Promise<{ recommended_framework: string }> {
  const response = await api.get(`/api/best-framework/${industry}`);
  return response.data;
}

export default api;
