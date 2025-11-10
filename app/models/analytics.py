from datetime import datetime
from app import db


class Analytics(db.Model):
    __tablename__ = 'analytics'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)

    # Engagement metrics
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    reach = db.Column(db.Integer, default=0)

    # Cost metrics
    spend = db.Column(db.Float, default=0.0)
    cpc = db.Column(db.Float, default=0.0)  # Cost per click
    cpm = db.Column(db.Float, default=0.0)  # Cost per mille (1000 impressions)
    cpa = db.Column(db.Float, default=0.0)  # Cost per acquisition
    ctr = db.Column(db.Float, default=0.0)  # Click-through rate

    # Revenue metrics
    revenue = db.Column(db.Float, default=0.0)
    roas = db.Column(db.Float, default=0.0)  # Return on ad spend

    # Additional metrics
    video_views = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Float, default=0.0)
    frequency = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('campaign_id', 'date', name='unique_campaign_date'),
    )

    def __repr__(self):
        return f'<Analytics {self.campaign_id}:{self.date}>'

    def to_dict(self):
        """Convert analytics to dictionary"""
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'date': self.date.isoformat() if self.date else None,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'reach': self.reach,
            'spend': self.spend,
            'cpc': self.cpc,
            'cpm': self.cpm,
            'cpa': self.cpa,
            'ctr': self.ctr,
            'revenue': self.revenue,
            'roas': self.roas,
            'video_views': self.video_views,
            'engagement_rate': self.engagement_rate,
            'frequency': self.frequency
        }


class PerformanceMetric(db.Model):
    __tablename__ = 'performance_metrics'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<PerformanceMetric {self.metric_name}:{self.metric_value}>'

    def to_dict(self):
        """Convert metric to dictionary"""
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'metric_name': self.metric_name,
            'metric_value': self.metric_value,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }
