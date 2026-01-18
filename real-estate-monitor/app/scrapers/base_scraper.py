"""
Classe de base abstraite pour tous les scrapers
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Classe de base pour tous les scrapers immobiliers"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.user_agent = config.get(
            "user_agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        )
        self.timeout = config.get("timeout_seconds", 30)
        self.retry_attempts = config.get("retry_attempts", 3)
        self.delay = config.get("delay_between_requests", 2)

        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": self.user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
        )

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Nom de la source (ex: 'seloger', 'foncia')"""
        pass

    @abstractmethod
    def build_search_url(self, transaction_type: str, criteria: Dict[str, Any]) -> str:
        """
        Construit l'URL de recherche selon les critères

        Args:
            transaction_type: 'achat' ou 'location'
            criteria: dictionnaire des critères de recherche

        Returns:
            URL de la page de recherche
        """
        pass

    @abstractmethod
    def parse_listing_page(self, html: str, transaction_type: str) -> List[Dict[str, Any]]:
        """
        Parse la page de résultats de recherche

        Args:
            html: contenu HTML de la page
            transaction_type: 'achat' ou 'location'

        Returns:
            Liste de dictionnaires contenant les données des annonces
        """
        pass

    def fetch_page(self, url: str) -> Optional[str]:
        """
        Récupère le contenu HTML d'une page avec retry

        Args:
            url: URL à récupérer

        Returns:
            Contenu HTML ou None en cas d'erreur
        """
        for attempt in range(self.retry_attempts):
            try:
                logger.info(f"[{self.source_name}] Fetching URL (attempt {attempt + 1}/{self.retry_attempts}): {url}")

                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()

                # Attendre entre les requêtes
                if self.delay > 0:
                    time.sleep(self.delay)

                return response.text

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"[{self.source_name}] Error fetching URL (attempt {attempt + 1}/{self.retry_attempts}): {e}"
                )

                if attempt < self.retry_attempts - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"[{self.source_name}] Failed to fetch URL after {self.retry_attempts} attempts: {url}")

        return None

    def scrape(self, transaction_type: str, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Lance le scraping pour un type de transaction

        Args:
            transaction_type: 'achat' ou 'location'
            criteria: critères de recherche

        Returns:
            Liste des annonces trouvées
        """
        try:
            logger.info(f"[{self.source_name}] Starting scraping for {transaction_type}")

            # Construire l'URL
            url = self.build_search_url(transaction_type, criteria)

            if not url:
                logger.warning(f"[{self.source_name}] Could not build search URL")
                return []

            # Récupérer la page
            html = self.fetch_page(url)

            if not html:
                logger.warning(f"[{self.source_name}] Could not fetch page")
                return []

            # Parser les annonces
            listings = self.parse_listing_page(html, transaction_type)

            logger.info(f"[{self.source_name}] Found {len(listings)} listings")

            # Ajouter la source à chaque annonce
            for listing in listings:
                listing["source"] = self.source_name
                listing["transaction_type"] = transaction_type
                listing["scraped_at"] = datetime.utcnow()

            return listings

        except Exception as e:
            logger.error(f"[{self.source_name}] Error during scraping: {e}", exc_info=True)
            return []

    def extract_text(self, element, default: str = "") -> str:
        """Extrait le texte d'un élément BeautifulSoup"""
        if element is None:
            return default
        return element.get_text(strip=True) or default

    def extract_number(self, text: str, default: float = 0.0) -> float:
        """Extrait un nombre d'une chaîne de caractères"""
        if not text:
            return default

        # Supprimer tout sauf les chiffres et le point/virgule
        import re

        cleaned = re.sub(r"[^\d.,]", "", text)
        cleaned = cleaned.replace(",", ".")

        try:
            return float(cleaned)
        except ValueError:
            return default

    def extract_int(self, text: str, default: int = 0) -> int:
        """Extrait un entier d'une chaîne de caractères"""
        number = self.extract_number(text, default)
        return int(number)
