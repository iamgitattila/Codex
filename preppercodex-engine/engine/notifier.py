"""
Notification system for PrepperCodex Engine
Handles email, Slack, and dashboard notifications
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
import requests
from datetime import datetime

logger = logging.getLogger(__name__)


class Notifier:
    """Send notifications via multiple channels"""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize notifier

        Args:
            config: Notification configuration
        """
        self.config = config
        self.email_config = config.get('email', {})
        self.slack_config = config.get('slack', {})

    async def send_notification(
        self,
        message: str,
        level: str = 'info',
        subject: str = None,
        channels: list = None
    ):
        """
        Send notification across configured channels

        Args:
            message: Notification message
            level: Notification level (info, warning, error, critical)
            subject: Email subject (optional)
            channels: List of channels to send to (default: all enabled)
        """
        if channels is None:
            channels = []
            if self.email_config.get('enabled', False):
                channels.append('email')
            if self.slack_config.get('enabled', False):
                channels.append('slack')

        # Add emoji prefix based on level
        emoji_map = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'critical': '🔴'
        }
        emoji = emoji_map.get(level.lower(), 'ℹ️')

        formatted_message = f"{emoji} {message}"

        # Send to each channel
        if 'email' in channels:
            await self._send_email(formatted_message, subject or f"PrepperCodex Engine - {level.upper()}")

        if 'slack' in channels:
            await self._send_slack(formatted_message, level)

        # Always log to console
        logger_method = getattr(logger, level.lower(), logger.info)
        logger_method(message)

    async def _send_email(self, message: str, subject: str):
        """Send email notification"""
        try:
            if not self.email_config.get('enabled', False):
                return

            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.email_config.get('from_address', 'engine@preppercodex.com')
            msg['To'] = self.email_config.get('admin_email')

            # Plain text version
            text_part = MIMEText(message, 'plain')
            msg.attach(text_part)

            # HTML version
            html_message = f"""
            <html>
                <body style="font-family: monospace; padding: 20px;">
                    <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
                        <pre style="margin: 0;">{message}</pre>
                    </div>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Sent by PrepperCodex pSEO Engine at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                    </p>
                </body>
            </html>
            """
            html_part = MIMEText(html_message, 'html')
            msg.attach(html_part)

            # Send via SMTP
            with smtplib.SMTP(
                self.email_config.get('smtp_host', 'smtp.gmail.com'),
                self.email_config.get('smtp_port', 587)
            ) as server:
                server.starttls()
                server.login(
                    self.email_config.get('username'),
                    self.email_config.get('password')
                )
                server.send_message(msg)

            logger.debug(f"Email sent to {self.email_config.get('admin_email')}")

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")

    async def _send_slack(self, message: str, level: str):
        """Send Slack notification"""
        try:
            if not self.slack_config.get('enabled', False):
                return

            webhook_url = self.slack_config.get('webhook_url')
            if not webhook_url:
                return

            # Map level to Slack color
            color_map = {
                'info': '#36a64f',
                'success': '#2eb886',
                'warning': '#ff9900',
                'error': '#ff0000',
                'critical': '#8b0000'
            }

            payload = {
                'attachments': [{
                    'color': color_map.get(level.lower(), '#36a64f'),
                    'text': message,
                    'footer': 'PrepperCodex pSEO Engine',
                    'ts': int(datetime.now().timestamp())
                }]
            }

            response = requests.post(webhook_url, json=payload)
            response.raise_for_status()

            logger.debug("Slack notification sent")

        except Exception as e:
            logger.error(f"Failed to send Slack notification: {str(e)}")

    async def alert_data_quality_issue(self, source: str, issues: list):
        """Send alert about data quality issues"""
        message = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DATA QUALITY ISSUE DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Source: {source}

Issues Found:
{chr(10).join(f'  • {issue}' for issue in issues)}

Action Required:
Check data source configuration and re-run collection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        await self.send_notification(message, level='warning')

    async def alert_collection_complete(self, stats: Dict[str, Any]):
        """Send alert when data collection completes"""
        message = f"""
✅ Data Collection Complete

Sources Fetched: {stats.get('sources_fetched', 0)}
Errors: {stats.get('errors', 0)}
Duration: {stats.get('duration', 0):.2f} seconds

Next scheduled run: {stats.get('next_run', 'Not scheduled')}
"""
        await self.send_notification(message, level='success')

    async def alert_new_source_needed(self, source_name: str, reason: str, estimated_effort: str):
        """Alert when engine needs a new data source"""
        message = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 NEW DATA SOURCE NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Source: {source_name}

Why: {reason}

Estimated Effort: {estimated_effort}

Action Required:
1. Review the data source requirements
2. Obtain API key if needed
3. Add configuration to config.yaml
4. Restart the data collector

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        await self.send_notification(message, level='critical', subject='NEW DATA SOURCE REQUIRED')

    async def alert_performance_insights(self, insights: Dict[str, Any]):
        """Send weekly performance insights"""
        message = f"""
📊 WEEKLY PERFORMANCE INSIGHTS

Pages Generated: {insights.get('pages_generated', 0)}
Top Performing Hazard: {insights.get('top_hazard', 'N/A')}
Affiliate Revenue: ${insights.get('revenue', 0):,.2f}
Average CTR: {insights.get('avg_ctr', 0):.2f}%

Recommendations:
{chr(10).join(f'  • {rec}' for rec in insights.get('recommendations', []))}
"""
        await self.send_notification(message, level='info', subject='Weekly Performance Report')
