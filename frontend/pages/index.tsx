'use client';

import React, { useState, useCallback } from 'react';
import GoogleDriveBrowser from '../components/GoogleDriveBrowser';
import VariationCard from '../components/VariationCard';
import { runPipeline, getJobStatus, logPerformance, getInsights } from '../lib/api';
import type { AdVariation, Insights } from '../lib/api';

type Step = 'upload' | 'configure' | 'processing' | 'results';

export default function Dashboard() {
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [config, setConfig] = useState({
    targetProduct: '',
    targetIndustry: 'SaaS',
    targetAudience: '',
    numVariations: 20,
  });
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
  }, []);

  const handleStartPipeline = async () => {
    if (files.length === 0) {
      setError('Please upload at least one ad image');
      return;
    }

    if (!config.targetProduct || !config.targetAudience) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setStep('processing');
    setProgress(10);

    try {
      const { job_id } = await runPipeline(
        files,
        config.targetProduct,
        config.targetIndustry,
        config.targetAudience,
        config.numVariations
      );

      setJobId(job_id);
      setProgress(20);

      // Poll for results
      const pollInterval = setInterval(async () => {
        const status = await getJobStatus(job_id);

        if (status.status === 'processing') {
          setProgress(prev => Math.min(prev + 10, 90));
        } else if (status.status === 'completed') {
          clearInterval(pollInterval);
          setProgress(100);
          setResults(status.result);
          setStep('results');

          // Fetch insights
          const { insights: insightsData } = await getInsights();
          setInsights(insightsData);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setError(status.error || 'Pipeline failed');
          setStep('configure');
        }
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('configure');
    }
  };

  const handleRateVariation = async (variationId: string, rating: number) => {
    if (!results?.generation_id) return;

    await logPerformance({
      variation_id: variationId,
      generation_id: results.generation_id,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0,
      user_rating: rating,
    });
  };

  const industries = [
    'SaaS',
    'E-commerce',
    'Lead Generation',
    'Healthcare',
    'Financial Services',
    'Education',
  ];

  return (
    <div className="dashboard">
      <header>
        <h1>Ad Replication Engine</h1>
        <p>Transform Winning Ads Into 1000+ Variations</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {step === 'upload' && (
        <section className="step-section">
          <GoogleDriveBrowser onFilesSelected={handleFilesSelected} />

          {files.length > 0 && (
            <button
              className="btn-primary"
              onClick={() => setStep('configure')}
            >
              Continue with {files.length} file(s)
            </button>
          )}
        </section>
      )}

      {step === 'configure' && (
        <section className="step-section">
          <h2>Configure Generation</h2>

          <div className="form-group">
            <label>Target Product *</label>
            <input
              type="text"
              placeholder="e.g., SaaS CRM tool for real estate agents"
              value={config.targetProduct}
              onChange={e => setConfig({ ...config, targetProduct: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Target Industry *</label>
            <select
              value={config.targetIndustry}
              onChange={e => setConfig({ ...config, targetIndustry: e.target.value })}
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Target Audience *</label>
            <input
              type="text"
              placeholder="e.g., Real estate agents, ages 30-55, tech-savvy"
              value={config.targetAudience}
              onChange={e => setConfig({ ...config, targetAudience: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Number of Variations</label>
            <input
              type="number"
              min="5"
              max="100"
              value={config.numVariations}
              onChange={e => setConfig({ ...config, numVariations: parseInt(e.target.value) || 20 })}
            />
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={() => setStep('upload')}>
              Back
            </button>
            <button className="btn-primary" onClick={handleStartPipeline}>
              Generate Variations
            </button>
          </div>
        </section>
      )}

      {step === 'processing' && (
        <section className="step-section processing">
          <h2>Generating Ad Variations</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-text">{progress}% complete</p>
          <div className="processing-steps">
            <div className={`step ${progress >= 20 ? 'active' : ''}`}>
              Analyzing winning ads
            </div>
            <div className={`step ${progress >= 40 ? 'active' : ''}`}>
              Extracting universal principles
            </div>
            <div className={`step ${progress >= 60 ? 'active' : ''}`}>
              Generating variations
            </div>
            <div className={`step ${progress >= 80 ? 'active' : ''}`}>
              Reviewing and scoring
            </div>
          </div>
        </section>
      )}

      {step === 'results' && results && (
        <section className="step-section results">
          <h2>Generated Variations</h2>

          <div className="results-summary">
            <div className="summary-card">
              <span className="value">{results.metadata?.num_winning_ads_analyzed || 0}</span>
              <span className="label">Ads Analyzed</span>
            </div>
            <div className="summary-card">
              <span className="value">{results.generated_variations?.variations?.length || 0}</span>
              <span className="label">Variations Generated</span>
            </div>
            <div className="summary-card">
              <span className="value">{results.reviewed_variations?.top_3_performers?.length || 0}</span>
              <span className="label">Top Performers</span>
            </div>
          </div>

          {results.reviewed_variations?.top_3_performers && (
            <div className="top-performers">
              <h3>Top 3 Recommended Variations</h3>
              <div className="variations-grid">
                {results.reviewed_variations.top_3_performers.map((id: string) => {
                  const variation = results.generated_variations?.variations?.find(
                    (v: AdVariation) => v.variation_id === id
                  );
                  return variation ? (
                    <VariationCard
                      key={id}
                      variation={variation}
                      onRate={(rating) => handleRateVariation(id, rating)}
                    />
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="all-variations">
            <h3>All Variations</h3>
            <div className="variations-grid">
              {results.generated_variations?.variations?.map((variation: AdVariation) => (
                <VariationCard
                  key={variation.variation_id}
                  variation={variation}
                  onRate={(rating) => handleRateVariation(variation.variation_id, rating)}
                />
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={() => setStep('upload')}>
            Start New Analysis
          </button>
        </section>
      )}

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        header {
          text-align: center;
          margin-bottom: 40px;
        }

        header h1 {
          font-size: 36px;
          color: #333;
          margin-bottom: 10px;
        }

        header p {
          font-size: 18px;
          color: #666;
        }

        .error-banner {
          background: #ffebee;
          color: #c62828;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          font-weight: 500;
        }

        .step-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        .step-section h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        .btn-primary {
          background: #0066FF;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: #0052cc;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .processing {
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin: 20px 0;
        }

        .progress-fill {
          height: 100%;
          background: #0066FF;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }

        .processing-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          max-width: 300px;
          margin: 0 auto;
        }

        .processing-steps .step {
          padding: 10px 15px;
          background: #f5f5f5;
          border-radius: 6px;
          color: #999;
        }

        .processing-steps .step.active {
          background: #e3f2fd;
          color: #0066FF;
        }

        .results-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          flex: 1;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-card .value {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: #0066FF;
        }

        .summary-card .label {
          font-size: 14px;
          color: #666;
        }

        .top-performers {
          margin-bottom: 40px;
        }

        .top-performers h3,
        .all-variations h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
        }

        .variations-grid {
          display: grid;
          gap: 20px;
        }
      `}</style>
    </div>
  );
}
