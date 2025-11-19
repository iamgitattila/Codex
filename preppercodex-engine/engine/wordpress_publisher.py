"""
WordPress Publisher
Publishes pages to WordPress via REST API
"""

import logging
import aiohttp
import json
from typing import Dict, Any
import base64

logger = logging.getLogger(__name__)


class WordPressPublisher:
    """Publish content to WordPress via REST API"""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize WordPress publisher

        Args:
            config: WordPress configuration with site_url and credentials
        """
        self.config = config
        self.site_url = config.get('site_url', '').rstrip('/')
        self.username = config.get('username')
        self.application_password = config.get('application_password')

        # Create auth header
        if self.username and self.application_password:
            credentials = f"{self.username}:{self.application_password}"
            token = base64.b64encode(credentials.encode()).decode()
            self.auth_header = f"Basic {token}"
        else:
            self.auth_header = None
            logger.warning("WordPress credentials not configured")

    async def publish_page(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish a page to WordPress

        Args:
            page_data: Page data dictionary with title, content, etc.

        Returns:
            Response from WordPress API
        """
        if not self.auth_header:
            raise ValueError("WordPress authentication not configured")

        # Prepare post payload
        post_payload = {
            'title': page_data.get('title', 'Untitled'),
            'content': self._wrap_content(page_data),
            'excerpt': page_data.get('excerpt', ''),
            'status': 'publish',
            'slug': page_data.get('slug', ''),
            'meta': page_data.get('meta', {}),
            'tags': page_data.get('tags', []),
            'categories': await self._get_or_create_category(page_data.get('category', 'County Guides'))
        }

        headers = {
            'Authorization': self.auth_header,
            'Content-Type': 'application/json'
        }

        api_url = f"{self.site_url}/wp-json/wp/v2/posts"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(api_url, json=post_payload, headers=headers, timeout=30) as response:
                    if response.status == 201:
                        result = await response.json()
                        post_id = result.get('id')

                        # Add schema markup as custom field
                        if page_data.get('schema_markup'):
                            await self._add_schema_markup(post_id, page_data['schema_markup'])

                        logger.info(f"✅ Published post ID {post_id}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"WordPress API error ({response.status}): {error_text}")
                        raise Exception(f"WordPress publish failed: {response.status}")

        except Exception as e:
            logger.error(f"Failed to publish to WordPress: {str(e)}")
            raise

    def _wrap_content(self, page_data: Dict[str, Any]) -> str:
        """
        Wrap content with necessary HTML structure

        Args:
            page_data: Page data

        Returns:
            Complete HTML content
        """
        content = page_data.get('content', '')

        # Add Leaflet CSS/JS if maps are included
        if 'maps-section' in content:
            content = """
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

""" + content

        # Add schema markup as JSON-LD
        if page_data.get('schema_markup'):
            schema_scripts = ''
            for schema_type, schema_data in page_data['schema_markup'].items():
                schema_scripts += f"""
<script type="application/ld+json">
{json.dumps(schema_data, indent=2)}
</script>
"""
            content = schema_scripts + content

        return content

    async def _get_or_create_category(self, category_name: str) -> list:
        """
        Get or create a WordPress category

        Args:
            category_name: Category name

        Returns:
            List of category IDs
        """
        if not self.auth_header:
            return []

        headers = {
            'Authorization': self.auth_header,
            'Content-Type': 'application/json'
        }

        # Search for existing category
        search_url = f"{self.site_url}/wp-json/wp/v2/categories?search={category_name}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(search_url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        categories = await response.json()
                        if categories:
                            return [categories[0]['id']]

                # Create new category if not found
                create_url = f"{self.site_url}/wp-json/wp/v2/categories"
                payload = {'name': category_name, 'slug': category_name.lower().replace(' ', '-')}

                async with session.post(create_url, json=payload, headers=headers, timeout=10) as response:
                    if response.status == 201:
                        result = await response.json()
                        logger.info(f"Created category: {category_name} (ID: {result['id']})")
                        return [result['id']]

        except Exception as e:
            logger.warning(f"Failed to get/create category: {str(e)}")

        return []

    async def _add_schema_markup(self, post_id: int, schema_markup: Dict[str, Any]):
        """
        Add schema markup to post as custom fields

        Args:
            post_id: WordPress post ID
            schema_markup: Schema markup data
        """
        if not self.auth_header:
            return

        headers = {
            'Authorization': self.auth_header,
            'Content-Type': 'application/json'
        }

        update_url = f"{self.site_url}/wp-json/wp/v2/posts/{post_id}"

        # Store schema as meta
        meta_update = {
            'meta': {
                '_schema_markup': json.dumps(schema_markup)
            }
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(update_url, json=meta_update, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        logger.debug(f"Added schema markup to post {post_id}")
                    else:
                        logger.warning(f"Failed to add schema markup: {response.status}")

        except Exception as e:
            logger.warning(f"Failed to add schema markup: {str(e)}")

    async def update_page(self, post_id: int, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing WordPress page

        Args:
            post_id: WordPress post ID to update
            page_data: Updated page data

        Returns:
            Response from WordPress API
        """
        if not self.auth_header:
            raise ValueError("WordPress authentication not configured")

        post_payload = {
            'title': page_data.get('title'),
            'content': self._wrap_content(page_data),
            'excerpt': page_data.get('excerpt'),
            'status': 'publish'
        }

        headers = {
            'Authorization': self.auth_header,
            'Content-Type': 'application/json'
        }

        api_url = f"{self.site_url}/wp-json/wp/v2/posts/{post_id}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(api_url, json=post_payload, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Updated post ID {post_id}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"WordPress update error ({response.status}): {error_text}")
                        raise Exception(f"WordPress update failed: {response.status}")

        except Exception as e:
            logger.error(f"Failed to update WordPress page: {str(e)}")
            raise

    async def check_if_page_exists(self, slug: str) -> Optional[int]:
        """
        Check if a page with the given slug already exists

        Args:
            slug: Page slug to check

        Returns:
            Post ID if exists, None otherwise
        """
        if not self.auth_header:
            return None

        headers = {
            'Authorization': self.auth_header
        }

        search_url = f"{self.site_url}/wp-json/wp/v2/posts?slug={slug}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(search_url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        posts = await response.json()
                        if posts:
                            return posts[0]['id']

        except Exception as e:
            logger.warning(f"Failed to check if page exists: {str(e)}")

        return None
