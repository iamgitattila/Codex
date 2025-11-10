from datetime import datetime
from app import db


class AdAccount(db.Model):
    __tablename__ = 'ad_accounts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # facebook, google, tiktok, snapchat
    account_id = db.Column(db.String(100), nullable=False)
    account_name = db.Column(db.String(255))
    access_token = db.Column(db.Text)
    refresh_token = db.Column(db.Text)
    token_expires_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    currency = db.Column(db.String(10), default='USD')
    timezone = db.Column(db.String(50), default='UTC')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    campaigns = db.relationship('Campaign', backref='ad_account', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<AdAccount {self.platform}:{self.account_id}>'

    def to_dict(self):
        """Convert ad account to dictionary"""
        return {
            'id': self.id,
            'platform': self.platform,
            'account_id': self.account_id,
            'account_name': self.account_name,
            'is_active': self.is_active,
            'currency': self.currency,
            'timezone': self.timezone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
