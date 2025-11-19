"""
Schema Builder
Creates JSON-LD structured data for SEO
"""

from datetime import datetime
from typing import Dict, List, Any


class SchemaBuilder:
    """Builds JSON-LD schema markup for various content types"""

    def __init__(self, organization_name: str = "Homeowner.wiki"):
        self.organization_name = organization_name
        self.organization_url = "https://homeowner.wiki"
        self.logo_url = "https://homeowner.wiki/logo.png"

    def build_article_schema(
        self,
        title: str,
        description: str,
        author: str,
        date_published: str,
        date_modified: str = None,
        image: str = None,
    ) -> Dict[str, Any]:
        """Build Article schema"""
        if date_modified is None:
            date_modified = date_published

        schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "author": {
                "@type": "Organization",
                "name": author,
                "url": self.organization_url,
            },
            "publisher": {
                "@type": "Organization",
                "name": self.organization_name,
                "logo": {"@type": "ImageObject", "url": self.logo_url},
            },
            "datePublished": date_published,
            "dateModified": date_modified,
        }

        if image:
            schema["image"] = image

        return schema

    def build_faq_schema(self, faqs: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Build FAQPage schema

        Args:
            faqs: List of {"question": "...", "answer": "..."} dicts
        """
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": faq["question"],
                    "acceptedAnswer": {"@type": "Answer", "text": faq["answer"]},
                }
                for faq in faqs
            ],
        }

    def build_howto_schema(
        self,
        name: str,
        description: str,
        steps: List[Dict[str, str]],
        total_time: str = None,
        estimated_cost: str = None,
    ) -> Dict[str, Any]:
        """
        Build HowTo schema

        Args:
            name: Name of the how-to
            description: Description
            steps: List of {"name": "Step 1", "text": "Description"} dicts
            total_time: ISO 8601 duration (e.g., "PT2H" for 2 hours)
            estimated_cost: Money amount (e.g., "$500")
        """
        schema = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": name,
            "description": description,
            "step": [
                {"@type": "HowToStep", "name": step["name"], "text": step["text"]}
                for step in steps
            ],
        }

        if total_time:
            schema["totalTime"] = total_time

        if estimated_cost:
            schema["estimatedCost"] = {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": estimated_cost,
            }

        return schema

    def build_local_business_schema(
        self,
        name: str,
        address: Dict[str, str],
        phone: str = None,
        url: str = None,
    ) -> Dict[str, Any]:
        """
        Build LocalBusiness schema (for contractor listings, etc.)

        Args:
            name: Business name
            address: {"street": "...", "city": "...", "state": "...", "zip": "..."}
            phone: Phone number
            url: Website URL
        """
        schema = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": name,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": address.get("street", ""),
                "addressLocality": address.get("city", ""),
                "addressRegion": address.get("state", ""),
                "postalCode": address.get("zip", ""),
                "addressCountry": "US",
            },
        }

        if phone:
            schema["telephone"] = phone

        if url:
            schema["url"] = url

        return schema

    def build_breadcrumb_schema(self, breadcrumbs: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Build BreadcrumbList schema

        Args:
            breadcrumbs: List of {"name": "Home", "url": "https://..."} dicts
        """
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": crumb["name"],
                    "item": crumb["url"],
                }
                for i, crumb in enumerate(breadcrumbs)
            ],
        }

    def build_aggregate_rating_schema(
        self,
        item_name: str,
        rating_value: float,
        review_count: int,
        best_rating: int = 5,
        worst_rating: int = 1,
    ) -> Dict[str, Any]:
        """Build AggregateRating schema"""
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": item_name,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": rating_value,
                "reviewCount": review_count,
                "bestRating": best_rating,
                "worstRating": worst_rating,
            },
        }
