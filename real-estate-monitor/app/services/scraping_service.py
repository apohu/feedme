"""
Service d'orchestration du scraping
"""
import logging
from typing import List, Dict, Any
from app.models.database import Database
from app.models.property_listing import PropertyListing
from app.services.config_loader import ConfigLoader
from app.services.criteria_matcher import CriteriaMatcher
from app.scrapers import SeLogerScraper, FonciaScraper, CityaScraper
from datetime import datetime

logger = logging.getLogger(__name__)


class ScrapingService:
    """Service qui orchestre le scraping de tous les sites"""

    def __init__(self, config: ConfigLoader, database: Database):
        self.config = config
        self.database = database
        self.criteria_matcher = CriteriaMatcher(config)

        # Initialiser les scrapers
        scraping_config = config.get_scraping_config()
        self.scrapers = {
            "seloger": SeLogerScraper(scraping_config),
            "foncia": FonciaScraper(scraping_config),
            "citya": CityaScraper(scraping_config),
        }

    def run_full_scraping(self) -> Dict[str, Any]:
        """
        Lance le scraping complet de tous les sites activés

        Returns:
            Statistiques du scraping
        """
        logger.info("=" * 80)
        logger.info("Starting full scraping cycle")
        logger.info("=" * 80)

        stats = {
            "total_scraped": 0,
            "new_listings": 0,
            "matching_criteria": 0,
            "by_source": {},
            "start_time": datetime.utcnow().isoformat(),
        }

        # Récupérer les scrapers activés
        enabled_scrapers = self.config.get_enabled_scrapers()

        if not enabled_scrapers:
            logger.warning("No scrapers enabled in config")
            return stats

        # Récupérer les critères
        criteria = self.config.get_criteria_config()

        # Pour chaque scraper activé
        for scraper_config in enabled_scrapers:
            scraper_name = scraper_config.get("name")

            if scraper_name not in self.scrapers:
                logger.warning(f"Scraper '{scraper_name}' not implemented yet")
                continue

            scraper = self.scrapers[scraper_name]

            # Scraper pour achat et location
            for transaction_type in ["achat", "location"]:
                try:
                    logger.info(f"Scraping {scraper_name} for {transaction_type}")

                    listings = scraper.scrape(transaction_type, criteria)

                    # Sauvegarder les annonces
                    scraper_stats = self._save_listings(listings)

                    # Mettre à jour les statistiques
                    stats["total_scraped"] += scraper_stats["total"]
                    stats["new_listings"] += scraper_stats["new"]
                    stats["matching_criteria"] += scraper_stats["matching"]

                    if scraper_name not in stats["by_source"]:
                        stats["by_source"][scraper_name] = {
                            "total": 0,
                            "new": 0,
                            "matching": 0,
                        }

                    stats["by_source"][scraper_name]["total"] += scraper_stats["total"]
                    stats["by_source"][scraper_name]["new"] += scraper_stats["new"]
                    stats["by_source"][scraper_name]["matching"] += scraper_stats["matching"]

                except Exception as e:
                    logger.error(f"Error scraping {scraper_name} for {transaction_type}: {e}", exc_info=True)

        stats["end_time"] = datetime.utcnow().isoformat()

        logger.info("=" * 80)
        logger.info(f"Scraping cycle completed: {stats['new_listings']} new, {stats['matching_criteria']} matching")
        logger.info("=" * 80)

        return stats

    def _save_listings(self, listings: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Sauvegarde les annonces en base de données

        Returns:
            Statistiques: total, new, matching
        """
        stats = {"total": 0, "new": 0, "matching": 0}

        with self.database.get_session() as session:
            for listing_data in listings:
                try:
                    # Vérifier si l'annonce existe déjà
                    external_id = listing_data.get("external_id")
                    source = listing_data.get("source")

                    if not external_id or not source:
                        logger.warning("Listing missing external_id or source")
                        continue

                    listing, created = self.database.get_or_create_listing(
                        session, external_id, source
                    )

                    # Mettre à jour les données
                    for key, value in listing_data.items():
                        if hasattr(listing, key) and key not in ["id", "external_id", "source"]:
                            setattr(listing, key, value)

                    # Vérifier les critères
                    matches, score = self.criteria_matcher.matches(listing)
                    listing.matches_criteria = matches
                    listing.criteria_score = score

                    if created:
                        stats["new"] += 1
                        logger.info(
                            f"[NEW] {source} - {listing.city} - {listing.price}€ - "
                            f"{listing.surface}m² - Match: {matches} (score: {score})"
                        )

                    if matches:
                        stats["matching"] += 1

                    stats["total"] += 1

                except Exception as e:
                    logger.error(f"Error saving listing: {e}", exc_info=True)

        return stats
