from datetime import datetime
from app import db
import json


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # email, slack, in_app
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(50), default='info')  # info, warning, error, success
    is_read = db.Column(db.Boolean, default=False)

    # Related entities
    related_type = db.Column(db.String(50))  # campaign, rule, etc.
    related_id = db.Column(db.Integer)

    # Delivery settings
    delivery_channels = db.Column(db.Text)  # JSON array of channels
    sent_at = db.Column(db.DateTime)
    delivery_status = db.Column(db.String(50), default='pending')  # pending, sent, failed

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)

    def get_delivery_channels(self):
        """Parse delivery channels from JSON"""
        if self.delivery_channels:
            return json.loads(self.delivery_channels)
        return []

    def set_delivery_channels(self, channels):
        """Set delivery channels as JSON"""
        self.delivery_channels = json.dumps(channels)

    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()

    def __repr__(self):
        return f'<Notification {self.title}>'

    def to_dict(self):
        """Convert notification to dictionary"""
        return {
            'id': self.id,
            'notification_type': self.notification_type,
            'title': self.title,
            'message': self.message,
            'severity': self.severity,
            'is_read': self.is_read,
            'related_type': self.related_type,
            'related_id': self.related_id,
            'delivery_channels': self.get_delivery_channels(),
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivery_status': self.delivery_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }
