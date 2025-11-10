from typing import List, Dict, Any, Optional
from datetime import date
import asyncio
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.adsinsights import AdsInsights
from .base import BaseAdPlatform


class FacebookAdsService(BaseAdPlatform):
    """Facebook/Meta Ads integration service."""

    def __init__(self, access_token: str, account_id: str, app_id: str = None, app_secret: str = None):
        super().__init__(access_token, account_id)
        self.app_id = app_id
        self.app_secret = app_secret

        # Initialize Facebook API
        if app_id and app_secret:
            FacebookAdsApi.init(app_id, app_secret, access_token)
        else:
            FacebookAdsApi.init(access_token=access_token)

        self.ad_account = AdAccount(f'act_{account_id}')

    async def get_campaigns(self) -> List[Dict[str, Any]]:
        """Fetch all campaigns."""
        loop = asyncio.get_event_loop()
        campaigns = await loop.run_in_executor(
            None,
            lambda: self.ad_account.get_campaigns(fields=[
                Campaign.Field.id,
                Campaign.Field.name,
                Campaign.Field.status,
                Campaign.Field.objective,
                Campaign.Field.daily_budget,
                Campaign.Field.lifetime_budget,
                Campaign.Field.start_time,
                Campaign.Field.stop_time,
            ])
        )

        return [dict(campaign) for campaign in campaigns]

    async def get_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Fetch a single campaign."""
        loop = asyncio.get_event_loop()
        campaign = await loop.run_in_executor(
            None,
            lambda: Campaign(campaign_id).api_get(fields=[
                Campaign.Field.id,
                Campaign.Field.name,
                Campaign.Field.status,
                Campaign.Field.objective,
                Campaign.Field.daily_budget,
                Campaign.Field.lifetime_budget,
            ])
        )
        return dict(campaign)

    async def get_ad_sets(self, campaign_id: str) -> List[Dict[str, Any]]:
        """Fetch ad sets for a campaign."""
        loop = asyncio.get_event_loop()
        ad_sets = await loop.run_in_executor(
            None,
            lambda: Campaign(campaign_id).get_ad_sets(fields=[
                AdSet.Field.id,
                AdSet.Field.name,
                AdSet.Field.status,
                AdSet.Field.daily_budget,
                AdSet.Field.lifetime_budget,
                AdSet.Field.bid_amount,
                AdSet.Field.targeting,
            ])
        )
        return [dict(ad_set) for ad_set in ad_sets]

    async def get_ads(self, ad_set_id: str) -> List[Dict[str, Any]]:
        """Fetch ads for an ad set."""
        loop = asyncio.get_event_loop()
        ads = await loop.run_in_executor(
            None,
            lambda: AdSet(ad_set_id).get_ads(fields=[
                Ad.Field.id,
                Ad.Field.name,
                Ad.Field.status,
                Ad.Field.creative,
            ])
        )
        return [dict(ad) for ad in ads]

    async def get_metrics(
        self,
        entity_type: str,
        entity_id: str,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """Fetch metrics for an entity."""
        loop = asyncio.get_event_loop()

        params = {
            'time_range': {
                'since': start_date.isoformat(),
                'until': end_date.isoformat()
            },
            'level': 'ad' if entity_type == 'ad' else entity_type,
            'time_increment': 1,
        }

        fields = [
            AdsInsights.Field.impressions,
            AdsInsights.Field.clicks,
            AdsInsights.Field.spend,
            AdsInsights.Field.actions,
            AdsInsights.Field.action_values,
            AdsInsights.Field.ctr,
            AdsInsights.Field.cpc,
            AdsInsights.Field.cpm,
        ]

        if entity_type == 'campaign':
            entity = Campaign(entity_id)
        elif entity_type == 'adset':
            entity = AdSet(entity_id)
        else:
            entity = Ad(entity_id)

        insights = await loop.run_in_executor(
            None,
            lambda: entity.get_insights(fields=fields, params=params)
        )

        return [dict(insight) for insight in insights]

    async def update_campaign(self, campaign_id: str, updates: Dict[str, Any]) -> bool:
        """Update campaign settings."""
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: Campaign(campaign_id).api_update(updates)
            )
            return True
        except Exception as e:
            print(f"Error updating campaign: {e}")
            return False

    async def update_ad_set(self, ad_set_id: str, updates: Dict[str, Any]) -> bool:
        """Update ad set settings."""
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: AdSet(ad_set_id).api_update(updates)
            )
            return True
        except Exception as e:
            print(f"Error updating ad set: {e}")
            return False

    async def update_ad(self, ad_id: str, updates: Dict[str, Any]) -> bool:
        """Update ad settings."""
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: Ad(ad_id).api_update(updates)
            )
            return True
        except Exception as e:
            print(f"Error updating ad: {e}")
            return False

    async def pause_campaign(self, campaign_id: str) -> bool:
        """Pause a campaign."""
        return await self.update_campaign(campaign_id, {Campaign.Field.status: Campaign.Status.paused})

    async def pause_ad_set(self, ad_set_id: str) -> bool:
        """Pause an ad set."""
        return await self.update_ad_set(ad_set_id, {AdSet.Field.status: AdSet.Status.paused})

    async def pause_ad(self, ad_id: str) -> bool:
        """Pause an ad."""
        return await self.update_ad(ad_id, {Ad.Field.status: Ad.Status.paused})

    async def update_budget(
        self,
        entity_type: str,
        entity_id: str,
        budget_type: str,
        new_budget: float
    ) -> bool:
        """Update budget for campaign or ad set."""
        # Convert to cents for Facebook API
        budget_cents = int(new_budget * 100)

        if entity_type == 'campaign':
            field = Campaign.Field.daily_budget if budget_type == 'daily' else Campaign.Field.lifetime_budget
            return await self.update_campaign(entity_id, {field: budget_cents})
        elif entity_type == 'adset':
            field = AdSet.Field.daily_budget if budget_type == 'daily' else AdSet.Field.lifetime_budget
            return await self.update_ad_set(entity_id, {field: budget_cents})

        return False

    async def update_bid(self, ad_set_id: str, new_bid: float) -> bool:
        """Update bid amount for ad set."""
        bid_cents = int(new_bid * 100)
        return await self.update_ad_set(ad_set_id, {AdSet.Field.bid_amount: bid_cents})
