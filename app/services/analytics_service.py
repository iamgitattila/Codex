"""
Analytics Service - Performance analytics and reporting
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from app import db
from app.models.analytics import Analytics, PerformanceMetric
from app.models.campaign import Campaign
import statistics


class AnalyticsService:
    """Service for analytics and performance reporting"""

    def __init__(self):
        """Initialize analytics service"""
        pass

    def get_campaign_analytics(self, campaign_id: int, date_from: datetime,
                               date_to: datetime) -> List[Dict[str, Any]]:
        """
        Get analytics data for a campaign

        Args:
            campaign_id: Campaign ID
            date_from: Start date
            date_to: End date

        Returns:
            List of analytics dictionaries
        """
        analytics = Analytics.query.filter(
            Analytics.campaign_id == campaign_id,
            Analytics.date >= date_from.date(),
            Analytics.date <= date_to.date()
        ).order_by(Analytics.date).all()

        return [a.to_dict() for a in analytics]

    def get_summary_metrics(self, campaign_id: int, date_from: datetime,
                           date_to: datetime) -> Dict[str, Any]:
        """
        Get summary metrics for a campaign

        Args:
            campaign_id: Campaign ID
            date_from: Start date
            date_to: End date

        Returns:
            Dict of summary metrics
        """
        analytics = Analytics.query.filter(
            Analytics.campaign_id == campaign_id,
            Analytics.date >= date_from.date(),
            Analytics.date <= date_to.date()
        ).all()

        if not analytics:
            return {}

        # Calculate totals and averages
        total_spend = sum(a.spend for a in analytics)
        total_impressions = sum(a.impressions for a in analytics)
        total_clicks = sum(a.clicks for a in analytics)
        total_conversions = sum(a.conversions for a in analytics)
        total_revenue = sum(a.revenue for a in analytics)

        # Calculate derived metrics
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
        avg_cpa = (total_spend / total_conversions) if total_conversions > 0 else 0
        roas = (total_revenue / total_spend) if total_spend > 0 else 0

        return {
            'date_from': date_from.date().isoformat(),
            'date_to': date_to.date().isoformat(),
            'total_spend': round(total_spend, 2),
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_revenue': round(total_revenue, 2),
            'avg_ctr': round(avg_ctr, 2),
            'avg_cpc': round(avg_cpc, 2),
            'avg_cpa': round(avg_cpa, 2),
            'roas': round(roas, 2)
        }

    def get_performance_trends(self, campaign_id: int, metric: str,
                              days: int = 30) -> Dict[str, Any]:
        """
        Get performance trends for a metric

        Args:
            campaign_id: Campaign ID
            metric: Metric name (spend, clicks, conversions, etc.)
            days: Number of days to analyze

        Returns:
            Dict with trend data
        """
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=days)

        analytics = Analytics.query.filter(
            Analytics.campaign_id == campaign_id,
            Analytics.date >= date_from.date(),
            Analytics.date <= date_to.date()
        ).order_by(Analytics.date).all()

        if not analytics:
            return {'trend': 'stable', 'change_percentage': 0, 'data': []}

        # Extract metric values
        values = [getattr(a, metric, 0) for a in analytics]
        dates = [a.date.isoformat() for a in analytics]

        # Calculate trend
        if len(values) >= 2:
            first_half = values[:len(values)//2]
            second_half = values[len(values)//2:]

            avg_first = statistics.mean(first_half) if first_half else 0
            avg_second = statistics.mean(second_half) if second_half else 0

            if avg_first > 0:
                change_percentage = ((avg_second - avg_first) / avg_first) * 100
            else:
                change_percentage = 0

            if change_percentage > 10:
                trend = 'increasing'
            elif change_percentage < -10:
                trend = 'decreasing'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
            change_percentage = 0

        return {
            'metric': metric,
            'trend': trend,
            'change_percentage': round(change_percentage, 2),
            'data': [{'date': d, 'value': v} for d, v in zip(dates, values)]
        }

    def compare_campaigns(self, campaign_ids: List[int], date_from: datetime,
                         date_to: datetime, metrics: List[str]) -> Dict[str, Any]:
        """
        Compare multiple campaigns

        Args:
            campaign_ids: List of campaign IDs
            date_from: Start date
            date_to: End date
            metrics: List of metrics to compare

        Returns:
            Dict with comparison data
        """
        comparison = {}

        for campaign_id in campaign_ids:
            campaign = Campaign.query.get(campaign_id)
            if not campaign:
                continue

            summary = self.get_summary_metrics(campaign_id, date_from, date_to)

            comparison[campaign_id] = {
                'campaign_name': campaign.name,
                'metrics': {metric: summary.get(metric, 0) for metric in metrics}
            }

        return comparison

    def get_top_performers(self, ad_account_id: int, metric: str = 'roas',
                          limit: int = 10, date_from: datetime = None,
                          date_to: datetime = None) -> List[Dict[str, Any]]:
        """
        Get top performing campaigns

        Args:
            ad_account_id: Ad account ID
            metric: Metric to rank by
            limit: Number of top campaigns to return
            date_from: Start date (defaults to last 30 days)
            date_to: End date (defaults to today)

        Returns:
            List of top performing campaigns
        """
        if date_from is None:
            date_from = datetime.utcnow() - timedelta(days=30)
        if date_to is None:
            date_to = datetime.utcnow()

        # Get all campaigns for the account
        campaigns = Campaign.query.filter_by(ad_account_id=ad_account_id).all()

        performers = []
        for campaign in campaigns:
            summary = self.get_summary_metrics(campaign.id, date_from, date_to)
            metric_value = summary.get(metric, 0)

            performers.append({
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'metric': metric,
                'value': metric_value,
                'summary': summary
            })

        # Sort by metric value
        performers.sort(key=lambda x: x['value'], reverse=True)

        return performers[:limit]

    def record_performance_metric(self, campaign_id: int, metric_name: str,
                                 metric_value: float) -> bool:
        """
        Record a performance metric

        Args:
            campaign_id: Campaign ID
            metric_name: Metric name
            metric_value: Metric value

        Returns:
            True if successful, False otherwise
        """
        try:
            metric = PerformanceMetric(
                campaign_id=campaign_id,
                metric_name=metric_name,
                metric_value=metric_value
            )

            db.session.add(metric)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error recording performance metric: {e}")
            db.session.rollback()
            return False

    def get_account_overview(self, ad_account_id: int, date_from: datetime = None,
                            date_to: datetime = None) -> Dict[str, Any]:
        """
        Get overview statistics for an ad account

        Args:
            ad_account_id: Ad account ID
            date_from: Start date
            date_to: End date

        Returns:
            Dict with overview statistics
        """
        if date_from is None:
            date_from = datetime.utcnow() - timedelta(days=30)
        if date_to is None:
            date_to = datetime.utcnow()

        campaigns = Campaign.query.filter_by(ad_account_id=ad_account_id).all()

        overview = {
            'total_campaigns': len(campaigns),
            'active_campaigns': len([c for c in campaigns if c.status == 'ACTIVE']),
            'total_spend': 0,
            'total_impressions': 0,
            'total_clicks': 0,
            'total_conversions': 0,
            'total_revenue': 0,
            'avg_roas': 0
        }

        all_summaries = []
        for campaign in campaigns:
            summary = self.get_summary_metrics(campaign.id, date_from, date_to)
            if summary:
                all_summaries.append(summary)

        if all_summaries:
            overview['total_spend'] = sum(s.get('total_spend', 0) for s in all_summaries)
            overview['total_impressions'] = sum(s.get('total_impressions', 0) for s in all_summaries)
            overview['total_clicks'] = sum(s.get('total_clicks', 0) for s in all_summaries)
            overview['total_conversions'] = sum(s.get('total_conversions', 0) for s in all_summaries)
            overview['total_revenue'] = sum(s.get('total_revenue', 0) for s in all_summaries)

            if overview['total_spend'] > 0:
                overview['avg_roas'] = overview['total_revenue'] / overview['total_spend']

        return overview
