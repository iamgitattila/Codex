from datetime import datetime
from app import db
import json


class ABTest(db.Model):
    __tablename__ = 'ab_tests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    platform = db.Column(db.String(50), nullable=False)

    # Test configuration
    test_type = db.Column(db.String(50), nullable=False)  # creative, audience, placement, etc.
    variants = db.Column(db.Text, nullable=False)  # JSON array of variant configurations
    traffic_split = db.Column(db.Text)  # JSON object with traffic allocation per variant

    # Status
    status = db.Column(db.String(50), default='draft')  # draft, running, paused, completed
    is_active = db.Column(db.Boolean, default=False)

    # Results
    winner_variant = db.Column(db.String(100))
    confidence_level = db.Column(db.Float)
    results = db.Column(db.Text)  # JSON object with detailed results

    # Dates
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_variants(self):
        """Parse variants from JSON"""
        if self.variants:
            return json.loads(self.variants)
        return []

    def set_variants(self, variants_list):
        """Set variants as JSON"""
        self.variants = json.dumps(variants_list)

    def get_traffic_split(self):
        """Parse traffic split from JSON"""
        if self.traffic_split:
            return json.loads(self.traffic_split)
        return {}

    def set_traffic_split(self, split_dict):
        """Set traffic split as JSON"""
        self.traffic_split = json.dumps(split_dict)

    def get_results(self):
        """Parse results from JSON"""
        if self.results:
            return json.loads(self.results)
        return {}

    def set_results(self, results_dict):
        """Set results as JSON"""
        self.results = json.dumps(results_dict)

    def __repr__(self):
        return f'<ABTest {self.name}>'

    def to_dict(self):
        """Convert A/B test to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'platform': self.platform,
            'test_type': self.test_type,
            'variants': self.get_variants(),
            'traffic_split': self.get_traffic_split(),
            'status': self.status,
            'is_active': self.is_active,
            'winner_variant': self.winner_variant,
            'confidence_level': self.confidence_level,
            'results': self.get_results(),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
