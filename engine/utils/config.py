"""Configuration management"""

import os
import yaml
from pathlib import Path
from typing import Any, Dict, Optional
from functools import lru_cache


class Config:
    """Configuration manager for the pSEO engine"""

    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = os.getenv("PSEO_CONFIG_PATH", "config/config.yaml")

        self.config_path = Path(config_path)
        self._config: Dict[str, Any] = {}
        self._load_config()

    def _load_config(self) -> None:
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            raise FileNotFoundError(
                f"Configuration file not found: {self.config_path}\n"
                f"Copy config.example.yaml to config.yaml and fill in your values."
            )

        with open(self.config_path, "r") as f:
            self._config = yaml.safe_load(f)

        # Override with environment variables
        self._apply_env_overrides()

    def _apply_env_overrides(self) -> None:
        """Override config values with environment variables"""
        # API keys
        if os.getenv("OPENAI_API_KEY"):
            self._config.setdefault("api_keys", {})["openai_api_key"] = os.getenv(
                "OPENAI_API_KEY"
            )

        if os.getenv("ANTHROPIC_API_KEY"):
            self._config.setdefault("api_keys", {})["anthropic_api_key"] = os.getenv(
                "ANTHROPIC_API_KEY"
            )

        if os.getenv("CENSUS_API_KEY"):
            self._config.setdefault("api_keys", {})["census_api_key"] = os.getenv(
                "CENSUS_API_KEY"
            )

        if os.getenv("NOAA_API_KEY"):
            self._config.setdefault("api_keys", {})["noaa_api_key"] = os.getenv("NOAA_API_KEY")

        # Database
        if os.getenv("DATABASE_URL"):
            self._config.setdefault("database", {})["url"] = os.getenv("DATABASE_URL")

        # Site URL
        if os.getenv("SITE_URL"):
            self._config.setdefault("site", {})["url"] = os.getenv("SITE_URL")

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-notation key"""
        keys = key.split(".")
        value = self._config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

            if value is None:
                return default

        return value

    def __getitem__(self, key: str) -> Any:
        """Allow dictionary-style access"""
        value = self.get(key)
        if value is None:
            raise KeyError(f"Configuration key not found: {key}")
        return value

    @property
    def api_keys(self) -> Dict[str, str]:
        """Get all API keys"""
        return self._config.get("api_keys", {})

    @property
    def database(self) -> Dict[str, Any]:
        """Get database configuration"""
        return self._config.get("database", {})

    @property
    def cache(self) -> Dict[str, Any]:
        """Get cache configuration"""
        return self._config.get("cache", {})

    @property
    def site(self) -> Dict[str, Any]:
        """Get site configuration"""
        return self._config.get("site", {})


# Global config instance
_config: Optional[Config] = None


@lru_cache(maxsize=1)
def load_config(config_path: Optional[str] = None) -> Config:
    """Load configuration (cached)"""
    global _config
    _config = Config(config_path)
    return _config


def get_config() -> Config:
    """Get the global configuration instance"""
    global _config
    if _config is None:
        _config = load_config()
    return _config
