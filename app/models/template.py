from datetime import datetime
from app import db
import json


class AutomationTemplate(db.Model):
    __tablename__ = 'automation_templates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  # budget_optimization, performance, safety, etc.
    platform = db.Column(db.String(50))  # facebook, google, tiktok, snapchat, all
    is_public = db.Column(db.Boolean, default=True)

    # Template configuration
    config = db.Column(db.Text, nullable=False)  # JSON configuration for the rule

    # Usage statistics
    usage_count = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_config(self):
        """Parse config from JSON"""
        if self.config:
            return json.loads(self.config)
        return {}

    def set_config(self, config_dict):
        """Set config as JSON"""
        self.config = json.dumps(config_dict)

    def increment_usage(self):
        """Increment usage counter"""
        self.usage_count += 1

    def __repr__(self):
        return f'<AutomationTemplate {self.name}>'

    def to_dict(self):
        """Convert template to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'platform': self.platform,
            'is_public': self.is_public,
            'config': self.get_config(),
            'usage_count': self.usage_count,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
