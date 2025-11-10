from typing import List, Dict, Any
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...models.metric import Metric
from ...models.campaign import Campaign
from ...models.ad_set import AdSet
from ...models.ad import Ad


class MetricsService:
    """Service for tracking and analyzing metrics."""

    def __init__(self, db: Session):
        self.db = db

    def calculate_derived_metrics(self, metric: Metric) -> None:
        """Calculate derived metrics (CTR, CPC, etc.) from base metrics."""
        # CTR = (Clicks / Impressions) * 100
        if metric.impressions > 0:
            metric.ctr = (metric.clicks / metric.impressions) * 100
        else:
            metric.ctr = 0

        # CPC = Spend / Clicks
        if metric.clicks > 0:
            metric.cpc = metric.spend / metric.clicks
        else:
            metric.cpc = 0

        # CPM = (Spend / Impressions) * 1000
        if metric.impressions > 0:
            metric.cpm = (metric.spend / metric.impressions) * 1000
        else:
            metric.cpm = 0

        # CPA = Spend / Conversions
        if metric.conversions > 0:
            metric.cpa = metric.spend / metric.conversions
        else:
            metric.cpa = 0

        # ROAS = Conversion Value / Spend
        if metric.spend > 0:
            metric.roas = metric.conversion_value / metric.spend
        else:
            metric.roas = 0

    def store_metrics(
        self,
        entity_type: str,
        entity_id: int,
        metrics_data: Dict[str, Any],
        metric_date: date
    ) -> Metric:
        """Store metrics for an entity."""
        # Check if metric already exists for this date
        query = self.db.query(Metric).filter(Metric.date == metric_date)

        if entity_type == 'campaign':
            query = query.filter(Metric.campaign_id == entity_id)
        elif entity_type == 'ad_set':
            query = query.filter(Metric.ad_set_id == entity_id)
        elif entity_type == 'ad':
            query = query.filter(Metric.ad_id == entity_id)

        metric = query.first()

        if metric:
            # Update existing metric
            for key, value in metrics_data.items():
                if hasattr(metric, key):
                    setattr(metric, key, value)
        else:
            # Create new metric
            metric_kwargs = {
                'date': metric_date,
                **metrics_data
            }

            if entity_type == 'campaign':
                metric_kwargs['campaign_id'] = entity_id
            elif entity_type == 'ad_set':
                metric_kwargs['ad_set_id'] = entity_id
            elif entity_type == 'ad':
                metric_kwargs['ad_id'] = entity_id

            metric = Metric(**metric_kwargs)
            self.db.add(metric)

        # Calculate derived metrics
        self.calculate_derived_metrics(metric)

        self.db.commit()
        self.db.refresh(metric)

        return metric

    def get_metrics_summary(
        self,
        entity_type: str,
        entity_id: int,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Get aggregated metrics summary for an entity."""
        query = self.db.query(
            func.sum(Metric.impressions).label('total_impressions'),
            func.sum(Metric.clicks).label('total_clicks'),
            func.sum(Metric.spend).label('total_spend'),
            func.sum(Metric.conversions).label('total_conversions'),
            func.sum(Metric.conversion_value).label('total_conversion_value')
        ).filter(
            Metric.date >= start_date,
            Metric.date <= end_date
        )

        if entity_type == 'campaign':
            query = query.filter(Metric.campaign_id == entity_id)
        elif entity_type == 'ad_set':
            query = query.filter(Metric.ad_set_id == entity_id)
        elif entity_type == 'ad':
            query = query.filter(Metric.ad_id == entity_id)

        result = query.first()

        # Calculate averages
        total_impressions = result.total_impressions or 0
        total_clicks = result.total_clicks or 0
        total_spend = result.total_spend or 0
        total_conversions = result.total_conversions or 0
        total_conversion_value = result.total_conversion_value or 0

        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
        avg_cpm = (total_spend / total_impressions * 1000) if total_impressions > 0 else 0
        avg_cpa = (total_spend / total_conversions) if total_conversions > 0 else 0
        avg_roas = (total_conversion_value / total_spend) if total_spend > 0 else 0

        return {
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_spend': round(total_spend, 2),
            'total_conversions': total_conversions,
            'total_conversion_value': round(total_conversion_value, 2),
            'avg_ctr': round(avg_ctr, 2),
            'avg_cpc': round(avg_cpc, 2),
            'avg_cpm': round(avg_cpm, 2),
            'avg_cpa': round(avg_cpa, 2),
            'avg_roas': round(avg_roas, 2)
        }

    def get_time_series_metrics(
        self,
        entity_type: str,
        entity_id: int,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """Get time-series metrics data."""
        query = self.db.query(Metric).filter(
            Metric.date >= start_date,
            Metric.date <= end_date
        )

        if entity_type == 'campaign':
            query = query.filter(Metric.campaign_id == entity_id)
        elif entity_type == 'ad_set':
            query = query.filter(Metric.ad_set_id == entity_id)
        elif entity_type == 'ad':
            query = query.filter(Metric.ad_id == entity_id)

        metrics = query.order_by(Metric.date).all()

        return [{
            'date': m.date.isoformat(),
            'impressions': m.impressions,
            'clicks': m.clicks,
            'spend': m.spend,
            'conversions': m.conversions,
            'ctr': m.ctr,
            'cpc': m.cpc,
            'cpm': m.cpm,
            'roas': m.roas
        } for m in metrics]
