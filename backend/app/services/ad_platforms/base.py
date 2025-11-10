from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import date


class BaseAdPlatform(ABC):
    """Base class for ad platform integrations."""

    def __init__(self, access_token: str, account_id: str):
        self.access_token = access_token
        self.account_id = account_id

    @abstractmethod
    async def get_campaigns(self) -> List[Dict[str, Any]]:
        """Fetch all campaigns from the platform."""
        pass

    @abstractmethod
    async def get_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Fetch a single campaign."""
        pass

    @abstractmethod
    async def get_ad_sets(self, campaign_id: str) -> List[Dict[str, Any]]:
        """Fetch ad sets for a campaign."""
        pass

    @abstractmethod
    async def get_ads(self, ad_set_id: str) -> List[Dict[str, Any]]:
        """Fetch ads for an ad set."""
        pass

    @abstractmethod
    async def get_metrics(
        self,
        entity_type: str,
        entity_id: str,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """Fetch metrics for an entity."""
        pass

    @abstractmethod
    async def update_campaign(self, campaign_id: str, updates: Dict[str, Any]) -> bool:
        """Update campaign settings."""
        pass

    @abstractmethod
    async def update_ad_set(self, ad_set_id: str, updates: Dict[str, Any]) -> bool:
        """Update ad set settings."""
        pass

    @abstractmethod
    async def update_ad(self, ad_id: str, updates: Dict[str, Any]) -> bool:
        """Update ad settings."""
        pass

    @abstractmethod
    async def pause_campaign(self, campaign_id: str) -> bool:
        """Pause a campaign."""
        pass

    @abstractmethod
    async def pause_ad_set(self, ad_set_id: str) -> bool:
        """Pause an ad set."""
        pass

    @abstractmethod
    async def pause_ad(self, ad_id: str) -> bool:
        """Pause an ad."""
        pass

    @abstractmethod
    async def update_budget(
        self,
        entity_type: str,
        entity_id: str,
        budget_type: str,
        new_budget: float
    ) -> bool:
        """Update budget for campaign or ad set."""
        pass

    @abstractmethod
    async def update_bid(self, ad_set_id: str, new_bid: float) -> bool:
        """Update bid amount for ad set."""
        pass
