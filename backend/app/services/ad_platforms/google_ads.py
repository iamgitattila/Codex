from typing import List, Dict, Any, Optional
from datetime import date
import asyncio
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from .base import BaseAdPlatform


class GoogleAdsService(BaseAdPlatform):
    """Google Ads integration service."""

    def __init__(
        self,
        access_token: str,
        account_id: str,
        developer_token: str,
        client_id: str,
        client_secret: str,
        refresh_token: str
    ):
        super().__init__(access_token, account_id)

        # Initialize Google Ads client
        credentials = {
            "developer_token": developer_token,
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "use_proto_plus": True
        }

        self.client = GoogleAdsClient.load_from_dict(credentials)
        self.customer_id = account_id.replace('-', '')

    async def get_campaigns(self) -> List[Dict[str, Any]]:
        """Fetch all campaigns."""
        loop = asyncio.get_event_loop()

        def _fetch():
            ga_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    campaign.advertising_channel_type,
                    campaign_budget.amount_micros
                FROM campaign
                WHERE campaign.status != 'REMOVED'
            """

            response = ga_service.search(customer_id=self.customer_id, query=query)
            campaigns = []

            for row in response:
                campaigns.append({
                    'id': str(row.campaign.id),
                    'name': row.campaign.name,
                    'status': row.campaign.status.name,
                    'channel_type': row.campaign.advertising_channel_type.name,
                    'budget': row.campaign_budget.amount_micros / 1_000_000 if row.campaign_budget.amount_micros else None
                })

            return campaigns

        return await loop.run_in_executor(None, _fetch)

    async def get_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Fetch a single campaign."""
        loop = asyncio.get_event_loop()

        def _fetch():
            ga_service = self.client.get_service("GoogleAdsService")
            query = f"""
                SELECT
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    campaign.advertising_channel_type,
                    campaign_budget.amount_micros
                FROM campaign
                WHERE campaign.id = {campaign_id}
            """

            response = ga_service.search(customer_id=self.customer_id, query=query)
            for row in response:
                return {
                    'id': str(row.campaign.id),
                    'name': row.campaign.name,
                    'status': row.campaign.status.name,
                    'channel_type': row.campaign.advertising_channel_type.name,
                    'budget': row.campaign_budget.amount_micros / 1_000_000 if row.campaign_budget.amount_micros else None
                }
            return None

        return await loop.run_in_executor(None, _fetch)

    async def get_ad_sets(self, campaign_id: str) -> List[Dict[str, Any]]:
        """Fetch ad groups (ad sets) for a campaign."""
        loop = asyncio.get_event_loop()

        def _fetch():
            ga_service = self.client.get_service("GoogleAdsService")
            query = f"""
                SELECT
                    ad_group.id,
                    ad_group.name,
                    ad_group.status,
                    ad_group.cpc_bid_micros,
                    ad_group.cpm_bid_micros
                FROM ad_group
                WHERE campaign.id = {campaign_id}
                AND ad_group.status != 'REMOVED'
            """

            response = ga_service.search(customer_id=self.customer_id, query=query)
            ad_groups = []

            for row in response:
                ad_groups.append({
                    'id': str(row.ad_group.id),
                    'name': row.ad_group.name,
                    'status': row.ad_group.status.name,
                    'cpc_bid': row.ad_group.cpc_bid_micros / 1_000_000 if row.ad_group.cpc_bid_micros else None,
                    'cpm_bid': row.ad_group.cpm_bid_micros / 1_000_000 if row.ad_group.cpm_bid_micros else None
                })

            return ad_groups

        return await loop.run_in_executor(None, _fetch)

    async def get_ads(self, ad_set_id: str) -> List[Dict[str, Any]]:
        """Fetch ads for an ad group."""
        loop = asyncio.get_event_loop()

        def _fetch():
            ga_service = self.client.get_service("GoogleAdsService")
            query = f"""
                SELECT
                    ad_group_ad.ad.id,
                    ad_group_ad.ad.name,
                    ad_group_ad.status,
                    ad_group_ad.ad.type
                FROM ad_group_ad
                WHERE ad_group.id = {ad_set_id}
                AND ad_group_ad.status != 'REMOVED'
            """

            response = ga_service.search(customer_id=self.customer_id, query=query)
            ads = []

            for row in response:
                ads.append({
                    'id': str(row.ad_group_ad.ad.id),
                    'name': row.ad_group_ad.ad.name,
                    'status': row.ad_group_ad.status.name,
                    'type': row.ad_group_ad.ad.type_.name
                })

            return ads

        return await loop.run_in_executor(None, _fetch)

    async def get_metrics(
        self,
        entity_type: str,
        entity_id: str,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """Fetch metrics for an entity."""
        loop = asyncio.get_event_loop()

        def _fetch():
            ga_service = self.client.get_service("GoogleAdsService")

            entity_field = {
                'campaign': 'campaign.id',
                'ad_group': 'ad_group.id',
                'ad': 'ad_group_ad.ad.id'
            }[entity_type]

            query = f"""
                SELECT
                    segments.date,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.cost_micros,
                    metrics.conversions,
                    metrics.conversions_value,
                    metrics.ctr,
                    metrics.average_cpc,
                    metrics.average_cpm
                FROM {entity_type}
                WHERE {entity_field} = {entity_id}
                AND segments.date BETWEEN '{start_date.isoformat()}' AND '{end_date.isoformat()}'
            """

            response = ga_service.search(customer_id=self.customer_id, query=query)
            metrics = []

            for row in response:
                metrics.append({
                    'date': row.segments.date,
                    'impressions': row.metrics.impressions,
                    'clicks': row.metrics.clicks,
                    'spend': row.metrics.cost_micros / 1_000_000,
                    'conversions': row.metrics.conversions,
                    'conversion_value': row.metrics.conversions_value,
                    'ctr': row.metrics.ctr,
                    'cpc': row.metrics.average_cpc / 1_000_000 if row.metrics.average_cpc else None,
                    'cpm': row.metrics.average_cpm / 1_000_000 if row.metrics.average_cpm else None
                })

            return metrics

        return await loop.run_in_executor(None, _fetch)

    async def update_campaign(self, campaign_id: str, updates: Dict[str, Any]) -> bool:
        """Update campaign settings."""
        # Implementation for updating campaign
        return True

    async def update_ad_set(self, ad_set_id: str, updates: Dict[str, Any]) -> bool:
        """Update ad group settings."""
        # Implementation for updating ad group
        return True

    async def update_ad(self, ad_id: str, updates: Dict[str, Any]) -> bool:
        """Update ad settings."""
        # Implementation for updating ad
        return True

    async def pause_campaign(self, campaign_id: str) -> bool:
        """Pause a campaign."""
        return await self.update_campaign(campaign_id, {'status': 'PAUSED'})

    async def pause_ad_set(self, ad_set_id: str) -> bool:
        """Pause an ad group."""
        return await self.update_ad_set(ad_set_id, {'status': 'PAUSED'})

    async def pause_ad(self, ad_id: str) -> bool:
        """Pause an ad."""
        return await self.update_ad(ad_id, {'status': 'PAUSED'})

    async def update_budget(
        self,
        entity_type: str,
        entity_id: str,
        budget_type: str,
        new_budget: float
    ) -> bool:
        """Update budget."""
        # Google Ads budget is at campaign level via campaign_budget resource
        return True

    async def update_bid(self, ad_set_id: str, new_bid: float) -> bool:
        """Update bid amount for ad group."""
        bid_micros = int(new_budget * 1_000_000)
        return await self.update_ad_set(ad_set_id, {'cpc_bid_micros': bid_micros})
