"""Logging configuration"""

import sys
from pathlib import Path
from loguru import logger
from typing import Optional


def setup_logger(
    level: str = "INFO",
    log_file: Optional[str] = None,
    rotation: str = "10 MB",
    retention: str = "1 week",
) -> None:
    """
    Setup logger with console and file output

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (optional)
        rotation: When to rotate log file
        retention: How long to keep old logs
    """
    # Remove default handler
    logger.remove()

    # Console handler with colors
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=level,
        colorize=True,
    )

    # File handler (if specified)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        logger.add(
            log_file,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level=level,
            rotation=rotation,
            retention=retention,
            compression="zip",
        )


def get_logger(name: str):
    """Get a logger instance for a specific module"""
    return logger.bind(name=name)
