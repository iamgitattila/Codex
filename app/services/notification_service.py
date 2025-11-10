"""
Notification Service - Handle email, Slack, and in-app notifications
"""
from typing import List, Dict, Any
import os
from datetime import datetime
from app import db
from app.models.notification import Notification


class NotificationService:
    """Service for managing notifications across multiple channels"""

    def __init__(self):
        """Initialize notification service"""
        self.slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')
        self.slack_bot_token = os.getenv('SLACK_BOT_TOKEN')
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.sendgrid_from_email = os.getenv('SENDGRID_FROM_EMAIL')

        # Initialize clients if credentials available
        self.slack_initialized = bool(self.slack_webhook_url or self.slack_bot_token)
        self.email_initialized = bool(self.sendgrid_api_key and self.sendgrid_from_email)

    def send_notification(self, title: str, message: str, channels: List[str],
                          user_id: int = None, severity: str = 'info',
                          related_type: str = None, related_id: int = None) -> Dict[str, Any]:
        """
        Send notification across multiple channels

        Args:
            title: Notification title
            message: Notification message
            channels: List of channels (email, slack, in_app)
            user_id: User ID for in-app notifications
            severity: Notification severity (info, warning, error, success)
            related_type: Related entity type
            related_id: Related entity ID

        Returns:
            Dict with delivery results
        """
        results = {
            'success': True,
            'channels': {},
            'timestamp': datetime.utcnow().isoformat()
        }

        # Send to each channel
        for channel in channels:
            if channel == 'email':
                results['channels']['email'] = self._send_email(title, message)
            elif channel == 'slack':
                results['channels']['slack'] = self._send_slack(title, message, severity)
            elif channel == 'in_app' and user_id:
                results['channels']['in_app'] = self._create_in_app_notification(
                    user_id, title, message, severity, related_type, related_id
                )

        # Check if any channel failed
        if any(not result.get('success', False) for result in results['channels'].values()):
            results['success'] = False

        return results

    def _send_email(self, title: str, message: str, to_email: str = None) -> Dict[str, Any]:
        """
        Send email notification

        Args:
            title: Email subject
            message: Email body
            to_email: Recipient email

        Returns:
            Dict with send result
        """
        if not self.email_initialized:
            return {
                'success': False,
                'message': 'Email service not configured'
            }

        try:
            # In a real implementation, use SendGrid API
            print(f"[Email] Sending: {title} - {message}")
            return {
                'success': True,
                'message': 'Email sent successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Email send failed: {str(e)}'
            }

    def _send_slack(self, title: str, message: str, severity: str = 'info') -> Dict[str, Any]:
        """
        Send Slack notification

        Args:
            title: Notification title
            message: Notification message
            severity: Message severity for color coding

        Returns:
            Dict with send result
        """
        if not self.slack_initialized:
            return {
                'success': False,
                'message': 'Slack service not configured'
            }

        try:
            # Color code by severity
            colors = {
                'info': '#36a64f',      # Green
                'warning': '#ff9900',   # Orange
                'error': '#ff0000',     # Red
                'success': '#00ff00'    # Bright green
            }

            color = colors.get(severity, '#36a64f')

            # In a real implementation, use Slack SDK
            print(f"[Slack] Sending [{severity}]: {title} - {message}")
            return {
                'success': True,
                'message': 'Slack message sent successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Slack send failed: {str(e)}'
            }

    def _create_in_app_notification(self, user_id: int, title: str, message: str,
                                    severity: str, related_type: str = None,
                                    related_id: int = None) -> Dict[str, Any]:
        """
        Create in-app notification

        Args:
            user_id: User ID
            title: Notification title
            message: Notification message
            severity: Notification severity
            related_type: Related entity type
            related_id: Related entity ID

        Returns:
            Dict with creation result
        """
        try:
            notification = Notification(
                user_id=user_id,
                notification_type='in_app',
                title=title,
                message=message,
                severity=severity,
                related_type=related_type,
                related_id=related_id,
                delivery_status='delivered'
            )

            db.session.add(notification)
            db.session.commit()

            return {
                'success': True,
                'message': 'In-app notification created',
                'notification_id': notification.id
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'In-app notification failed: {str(e)}'
            }

    def get_user_notifications(self, user_id: int, unread_only: bool = False,
                              limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get notifications for a user

        Args:
            user_id: User ID
            unread_only: Only return unread notifications
            limit: Maximum number of notifications

        Returns:
            List of notification dictionaries
        """
        query = Notification.query.filter_by(user_id=user_id)

        if unread_only:
            query = query.filter_by(is_read=False)

        notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()

        return [notif.to_dict() for notif in notifications]

    def mark_as_read(self, notification_id: int) -> bool:
        """
        Mark notification as read

        Args:
            notification_id: Notification ID

        Returns:
            True if successful, False otherwise
        """
        try:
            notification = Notification.query.get(notification_id)
            if notification:
                notification.mark_as_read()
                db.session.commit()
                return True
            return False
        except Exception as e:
            print(f"Error marking notification as read: {e}")
            return False

    def send_rule_alert(self, rule_name: str, target_name: str, actions_taken: List[str],
                       user_id: int, channels: List[str] = None) -> Dict[str, Any]:
        """
        Send alert when a rule is triggered

        Args:
            rule_name: Name of the rule
            target_name: Name of the affected target
            actions_taken: List of actions taken
            user_id: User ID
            channels: Notification channels (defaults to in_app)

        Returns:
            Dict with send results
        """
        if channels is None:
            channels = ['in_app']

        title = f"Rule Triggered: {rule_name}"
        message = f"Rule '{rule_name}' was triggered for {target_name}.\n\n"
        message += "Actions taken:\n"
        for action in actions_taken:
            message += f"• {action}\n"

        return self.send_notification(
            title=title,
            message=message,
            channels=channels,
            user_id=user_id,
            severity='info',
            related_type='rule',
            related_id=None
        )
