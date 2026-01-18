"""
Chargement de la configuration depuis config.yaml
"""
import yaml
from pathlib import Path
from typing import Any, Dict


class ConfigLoader:
    """Charge et gère la configuration de l'application"""

    def __init__(self, config_path: str = "config.yaml"):
        self.config_path = Path(config_path)
        self.config: Dict[str, Any] = {}
        self.load_config()

    def load_config(self):
        """Charge la configuration depuis le fichier YAML"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

        with open(self.config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)

    def get(self, key: str, default: Any = None) -> Any:
        """
        Récupère une valeur de configuration avec support des clés imbriquées

        Usage:
            config.get("location.city")
            config.get("criteria.budget_max.achat")
        """
        keys = key.split(".")
        value = self.config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

            if value is None:
                return default

        return value

    def get_location_config(self) -> Dict[str, Any]:
        """Récupère la configuration de localisation"""
        return self.config.get("location", {})

    def get_criteria_config(self) -> Dict[str, Any]:
        """Récupère les critères de recherche"""
        return self.config.get("criteria", {})

    def get_scrapers_config(self) -> Dict[str, Any]:
        """Récupère la configuration des scrapers"""
        return self.config.get("scrapers", {})

    def get_scraping_config(self) -> Dict[str, Any]:
        """Récupère la configuration de scraping"""
        return self.config.get("scraping", {})

    def get_notifications_config(self) -> Dict[str, Any]:
        """Récupère la configuration des notifications"""
        return self.config.get("notifications", {})

    def get_enabled_scrapers(self) -> list[dict]:
        """Récupère la liste des scrapers activés"""
        scrapers_config = self.get_scrapers_config()
        priority = scrapers_config.get("priority", [])
        return [s for s in priority if s.get("enabled", False)]
