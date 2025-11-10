from datetime import datetime
from app import db


class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.Integer, primary_key=True)
    ad_account_id = db.Column(db.Integer, db.ForeignKey('ad_accounts.id'), nullable=False)
    platform_campaign_id = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50))  # ACTIVE, PAUSED, ARCHIVED
    objective = db.Column(db.String(100))

    # Budget settings
    budget = db.Column(db.Float)
    budget_type = db.Column(db.String(50))  # DAILY, LIFETIME
    spend = db.Column(db.Float, default=0.0)

    # Performance metrics (cached)
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    ctr = db.Column(db.Float, default=0.0)  # Click-through rate
    cpc = db.Column(db.Float, default=0.0)  # Cost per click
    cpa = db.Column(db.Float, default=0.0)  # Cost per acquisition
    roas = db.Column(db.Float, default=0.0)  # Return on ad spend

    # Dates
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    last_synced_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analytics = db.relationship('Analytics', backref='campaign', lazy='dynamic', cascade='all, delete-orphan')
    performance_metrics = db.relationship('PerformanceMetric', backref='campaign', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Campaign {self.name}>'

    def to_dict(self):
        """Convert campaign to dictionary"""
        return {
            'id': self.id,
            'ad_account_id': self.ad_account_id,
            'platform_campaign_id': self.platform_campaign_id,
            'name': self.name,
            'status': self.status,
            'objective': self.objective,
            'budget': self.budget,
            'budget_type': self.budget_type,
            'spend': self.spend,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'ctr': self.ctr,
            'cpc': self.cpc,
            'cpa': self.cpa,
            'roas': self.roas,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'last_synced_at': self.last_synced_at.isoformat() if self.last_synced_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
