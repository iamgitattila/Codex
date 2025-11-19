"""
Configuration Loader for PrepperCodex Engine
Handles loading and validation of configuration files
"""

import os
import yaml
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)


class ConfigLoader:
    """Load and manage configuration from YAML files"""

    def __init__(self, config_path: str = None):
        """
        Initialize configuration loader

        Args:
            config_path: Path to config.yaml file
        """
        if config_path is None:
            # Try to find config in standard locations
            possible_paths = [
                'config.yaml',
                'config/config.yaml',
                '../config.yaml',
                os.path.expanduser('~/.preppercodex/config.yaml')
            ]

            for path in possible_paths:
                if os.path.exists(path):
                    config_path = path
                    break

            if config_path is None:
                raise FileNotFoundError(
                    "No config.yaml found. Please copy config.example.yaml to config.yaml"
                )

        self.config_path = config_path
        self.config = self._load_config()
        self._validate_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)

            logger.info(f"Configuration loaded from {self.config_path}")
            return config

        except Exception as e:
            logger.error(f"Failed to load configuration: {str(e)}")
            raise

    def _validate_config(self):
        """Validate required configuration keys"""
        required_keys = [
            'openai.api_key',
            'wordpress.site_url',
            'wordpress.api_token',
            'notifications.email.admin_email'
        ]

        missing_keys = []

        for key in required_keys:
            if not self._get_nested_key(key):
                missing_keys.append(key)

        if missing_keys:
            logger.warning(f"Missing configuration keys: {', '.join(missing_keys)}")
            logger.warning("Some features may not work properly")

    def _get_nested_key(self, key: str) -> Any:
        """Get nested configuration value using dot notation"""
        keys = key.split('.')
        value = self.config

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return None

        return value

    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value

        Args:
            key: Configuration key (supports dot notation like 'wordpress.site_url')
            default: Default value if key not found

        Returns:
            Configuration value or default
        """
        value = self._get_nested_key(key)
        return value if value is not None else default

    def get_openai_config(self) -> Dict[str, Any]:
        """Get OpenAI configuration"""
        return self.config.get('openai', {})

    def get_wordpress_config(self) -> Dict[str, Any]:
        """Get WordPress configuration"""
        return self.config.get('wordpress', {})

    def get_data_source_config(self, source_name: str) -> Dict[str, Any]:
        """Get configuration for specific data source"""
        return self.config.get('data_sources', {}).get(source_name, {})

    def get_affiliate_config(self) -> Dict[str, Any]:
        """Get affiliate program configuration"""
        return self.config.get('affiliates', {})

    def get_notification_config(self) -> Dict[str, Any]:
        """Get notification configuration"""
        return self.config.get('notifications', {})

    def is_feature_enabled(self, feature: str) -> bool:
        """Check if a feature is enabled"""
        return self.config.get('features', {}).get(feature, False)


# Global config instance
_config_instance = None


def get_config(config_path: str = None) -> ConfigLoader:
    """Get global configuration instance"""
    global _config_instance

    if _config_instance is None:
        _config_instance = ConfigLoader(config_path)

    return _config_instance
