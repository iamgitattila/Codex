"""
Budget Optimizer - Smart budget allocation based on performance
"""
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from app.models.campaign import Campaign
from app.services.analytics_service import AnalyticsService


class BudgetOptimizer:
    """Service for optimizing budget allocation across campaigns"""

    def __init__(self):
        """Initialize budget optimizer"""
        self.analytics_service = AnalyticsService()

    def optimize_budget_allocation(self, ad_account_id: int, total_budget: float,
                                   optimization_goal: str = 'roas',
                                   min_budget: float = 10.0,
                                   days_lookback: int = 7) -> Dict[int, float]:
        """
        Optimize budget allocation across campaigns

        Args:
            ad_account_id: Ad account ID
            total_budget: Total budget to allocate
            optimization_goal: Metric to optimize (roas, cpa, conversions, etc.)
            min_budget: Minimum budget per campaign
            days_lookback: Number of days to analyze

        Returns:
            Dict mapping campaign_id to recommended budget
        """
        date_from = datetime.utcnow() - timedelta(days=days_lookback)
        date_to = datetime.utcnow()

        # Get all active campaigns
        campaigns = Campaign.query.filter_by(
            ad_account_id=ad_account_id,
            status='ACTIVE'
        ).all()

        if not campaigns:
            return {}

        # Get performance scores for each campaign
        campaign_scores = {}
        for campaign in campaigns:
            score = self._calculate_performance_score(
                campaign.id,
                date_from,
                date_to,
                optimization_goal
            )
            campaign_scores[campaign.id] = score

        # Calculate budget allocation based on scores
        total_score = sum(campaign_scores.values())

        if total_score == 0:
            # Equal distribution if no performance data
            equal_budget = total_budget / len(campaigns)
            return {c.id: max(equal_budget, min_budget) for c in campaigns}

        # Allocate budget proportionally to performance scores
        allocations = {}
        remaining_budget = total_budget

        for campaign_id, score in campaign_scores.items():
            if total_score > 0:
                allocated = (score / total_score) * total_budget
                allocated = max(allocated, min_budget)  # Ensure minimum budget
                allocations[campaign_id] = round(allocated, 2)
                remaining_budget -= allocated

        return allocations

    def _calculate_performance_score(self, campaign_id: int, date_from: datetime,
                                    date_to: datetime, optimization_goal: str) -> float:
        """
        Calculate performance score for a campaign

        Args:
            campaign_id: Campaign ID
            date_from: Start date
            date_to: End date
            optimization_goal: Goal metric

        Returns:
            Performance score
        """
        summary = self.analytics_service.get_summary_metrics(
            campaign_id,
            date_from,
            date_to
        )

        if not summary:
            return 0.0

        # Score based on optimization goal
        if optimization_goal == 'roas':
            # Higher ROAS is better
            return summary.get('roas', 0)
        elif optimization_goal == 'cpa':
            # Lower CPA is better, invert score
            cpa = summary.get('avg_cpa', 999999)
            return 1 / cpa if cpa > 0 else 0
        elif optimization_goal == 'conversions':
            # More conversions is better
            return summary.get('total_conversions', 0)
        elif optimization_goal == 'clicks':
            # More clicks is better
            return summary.get('total_clicks', 0)
        elif optimization_goal == 'ctr':
            # Higher CTR is better
            return summary.get('avg_ctr', 0)
        else:
            return 0.0

    def identify_underperforming_campaigns(self, ad_account_id: int,
                                          threshold_metric: str = 'roas',
                                          threshold_value: float = 1.0,
                                          days_lookback: int = 7) -> List[Dict[str, Any]]:
        """
        Identify campaigns that are underperforming

        Args:
            ad_account_id: Ad account ID
            threshold_metric: Metric to evaluate
            threshold_value: Threshold value (campaigns below this are underperforming)
            days_lookback: Number of days to analyze

        Returns:
            List of underperforming campaigns
        """
        date_from = datetime.utcnow() - timedelta(days=days_lookback)
        date_to = datetime.utcnow()

        campaigns = Campaign.query.filter_by(
            ad_account_id=ad_account_id,
            status='ACTIVE'
        ).all()

        underperforming = []

        for campaign in campaigns:
            summary = self.analytics_service.get_summary_metrics(
                campaign.id,
                date_from,
                date_to
            )

            if not summary:
                continue

            metric_value = summary.get(threshold_metric, 0)

            # Determine if underperforming based on metric
            is_underperforming = False
            if threshold_metric in ['roas', 'ctr', 'conversions', 'clicks']:
                # For these metrics, lower than threshold is bad
                is_underperforming = metric_value < threshold_value
            elif threshold_metric in ['cpa', 'cpc']:
                # For cost metrics, higher than threshold is bad
                is_underperforming = metric_value > threshold_value

            if is_underperforming:
                underperforming.append({
                    'campaign_id': campaign.id,
                    'campaign_name': campaign.name,
                    'metric': threshold_metric,
                    'value': metric_value,
                    'threshold': threshold_value,
                    'summary': summary
                })

        return underperforming

    def recommend_budget_adjustments(self, campaign_id: int,
                                    days_lookback: int = 14) -> Dict[str, Any]:
        """
        Recommend budget adjustments for a campaign

        Args:
            campaign_id: Campaign ID
            days_lookback: Number of days to analyze

        Returns:
            Dict with recommendations
        """
        date_from = datetime.utcnow() - timedelta(days=days_lookback)
        date_to = datetime.utcnow()

        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {'error': 'Campaign not found'}

        summary = self.analytics_service.get_summary_metrics(
            campaign_id,
            date_from,
            date_to
        )

        if not summary:
            return {'error': 'No performance data available'}

        current_budget = campaign.budget or 0
        roas = summary.get('roas', 0)
        cpa = summary.get('avg_cpa', 0)
        conversions = summary.get('total_conversions', 0)

        recommendation = {
            'current_budget': current_budget,
            'recommended_budget': current_budget,
            'adjustment_percentage': 0,
            'action': 'maintain',
            'reason': 'Performance is stable'
        }

        # Make recommendations based on performance
        if roas > 3.0 and conversions > 10:
            # Excellent performance - increase budget
            recommended_budget = current_budget * 1.2
            recommendation.update({
                'recommended_budget': round(recommended_budget, 2),
                'adjustment_percentage': 20,
                'action': 'increase',
                'reason': f'Excellent ROAS ({roas:.2f}). Increase budget to scale.'
            })
        elif roas > 2.0 and conversions > 5:
            # Good performance - small increase
            recommended_budget = current_budget * 1.1
            recommendation.update({
                'recommended_budget': round(recommended_budget, 2),
                'adjustment_percentage': 10,
                'action': 'increase',
                'reason': f'Good ROAS ({roas:.2f}). Modest increase recommended.'
            })
        elif roas < 1.0 or conversions == 0:
            # Poor performance - decrease budget
            recommended_budget = current_budget * 0.7
            recommendation.update({
                'recommended_budget': round(recommended_budget, 2),
                'adjustment_percentage': -30,
                'action': 'decrease',
                'reason': f'Low ROAS ({roas:.2f}). Consider reducing budget or pausing.'
            })

        return recommendation

    def calculate_optimal_bid(self, campaign_id: int, target_cpa: float,
                             days_lookback: int = 7) -> float:
        """
        Calculate optimal bid to achieve target CPA

        Args:
            campaign_id: Campaign ID
            target_cpa: Target cost per acquisition
            days_lookback: Number of days to analyze

        Returns:
            Recommended bid amount
        """
        date_from = datetime.utcnow() - timedelta(days=days_lookback)
        date_to = datetime.utcnow()

        summary = self.analytics_service.get_summary_metrics(
            campaign_id,
            date_from,
            date_to
        )

        if not summary:
            return 0.0

        current_cpa = summary.get('avg_cpa', 0)
        current_cpc = summary.get('avg_cpc', 0)

        if current_cpa == 0 or current_cpc == 0:
            return 0.0

        # Calculate adjustment ratio
        adjustment_ratio = target_cpa / current_cpa

        # Apply to current CPC to get optimal bid
        optimal_bid = current_cpc * adjustment_ratio

        return round(optimal_bid, 2)
