'use client';

import React from 'react';
import type { AdVariation } from '../lib/api';

interface VariationCardProps {
  variation: AdVariation;
  onRate?: (rating: number) => void;
}

export default function VariationCard({ variation, onRate }: VariationCardProps) {
  return (
    <div className="variation-card">
      <div className="card-header">
        <span className="framework-badge">{variation.framework}</span>
        <span className="variation-id">{variation.variation_id}</span>
      </div>

      <div className="card-content">
        <h3 className="headline">{variation.headline}</h3>
        <p className="subheadline">{variation.subheadline}</p>
        <p className="body-copy">{variation.body_copy}</p>

        <button className="cta-preview">
          {variation.cta_text}
        </button>
      </div>

      <div className="card-details">
        <div className="section">
          <h4>Visual Description</h4>
          <p>{variation.visual_description}</p>
        </div>

        <div className="section">
          <h4>Psychological Triggers</h4>
          <div className="tags">
            {variation.psychological_triggers.map((trigger, i) => (
              <span key={i} className="tag">{trigger}</span>
            ))}
          </div>
        </div>

        <div className="section">
          <h4>Pain Point</h4>
          <p>{variation.target_pain_point}</p>
        </div>

        <div className="section">
          <h4>Design Recommendations</h4>
          <div className="design-info">
            <div className="color-swatch">
              <div
                className="swatch"
                style={{ backgroundColor: variation.design_recommendations.primary_color }}
              />
              <span>Primary</span>
            </div>
            <div className="color-swatch">
              <div
                className="swatch"
                style={{ backgroundColor: variation.design_recommendations.secondary_color }}
              />
              <span>Secondary</span>
            </div>
          </div>
          <p><strong>Font:</strong> {variation.design_recommendations.font_style}</p>
          <p><strong>Layout:</strong> {variation.design_recommendations.layout}</p>
        </div>
      </div>

      <div className="card-metrics">
        <div className="metric">
          <span className="metric-value">{variation.predicted_metrics.estimated_ctr}</span>
          <span className="metric-label">Est. CTR</span>
        </div>
        <div className="metric">
          <span className="metric-value">{variation.predicted_metrics.estimated_conversion_rate}</span>
          <span className="metric-label">Est. Conv.</span>
        </div>
        <div className="metric">
          <span className="metric-value">{(variation.predicted_metrics.confidence * 100).toFixed(0)}%</span>
          <span className="metric-label">Confidence</span>
        </div>
      </div>

      <div className="why-it-works">
        <h4>Why This Works</h4>
        <p>{variation.why_this_works}</p>
      </div>

      {onRate && (
        <div className="rating-section">
          <span>Rate this variation:</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => onRate(star)} className="star-btn">
                ★
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .variation-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .framework-badge {
          background: #0066FF;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .variation-id {
          color: #999;
          font-size: 12px;
        }

        .card-content {
          margin-bottom: 20px;
        }

        .headline {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .subheadline {
          font-size: 16px;
          color: #666;
          margin-bottom: 12px;
        }

        .body-copy {
          font-size: 14px;
          color: #444;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .cta-preview {
          background: #FF6B00;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .card-details {
          border-top: 1px solid #eee;
          padding-top: 15px;
        }

        .section {
          margin-bottom: 15px;
        }

        .section h4 {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .section p {
          font-size: 14px;
          color: #444;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          background: #f0f0f0;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
        }

        .design-info {
          display: flex;
          gap: 15px;
          margin-bottom: 10px;
        }

        .color-swatch {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .swatch {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .card-metrics {
          display: flex;
          gap: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 15px 0;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #0066FF;
        }

        .metric-label {
          font-size: 12px;
          color: #999;
        }

        .why-it-works {
          background: #fff8e6;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .why-it-works h4 {
          font-size: 12px;
          color: #b38600;
          margin-bottom: 6px;
        }

        .why-it-works p {
          font-size: 13px;
          color: #665200;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .rating-section span {
          font-size: 14px;
          color: #666;
        }

        .stars {
          display: flex;
          gap: 4px;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #ddd;
          cursor: pointer;
          transition: color 0.2s;
        }

        .star-btn:hover {
          color: #FFD700;
        }
      `}</style>
    </div>
  );
}
