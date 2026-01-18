"""
Scheduler pour le scraping périodique
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.config_loader import ConfigLoader
from app.services.scraping_service import ScrapingService
from app.services.notification_service import NotificationService
from app.models.database import Database

logger = logging.getLogger(__name__)


class ScrapingScheduler:
    """Scheduler qui orchestre le scraping périodique et les notifications"""

    def __init__(self, config: ConfigLoader, database: Database):
        self.config = config
        self.database = database

        # Services
        self.scraping_service = ScrapingService(config, database)
        self.notification_service = NotificationService(config, database)

        # Scheduler
        self.scheduler = BackgroundScheduler()

        # Configuration
        self.interval_minutes = config.get("scraping.interval_minutes", 5)

    def start(self):
        """Démarre le scheduler"""
        logger.info("Starting scheduler...")

        # Job de scraping périodique
        self.scheduler.add_job(
            func=self.run_scraping_cycle,
            trigger=IntervalTrigger(minutes=self.interval_minutes),
            id="scraping_job",
            name="Scraping périodique",
            replace_existing=True,
        )

        # Job de notification (toutes les minutes pour traiter rapidement les nouvelles annonces)
        self.scheduler.add_job(
            func=self.run_notification_cycle,
            trigger=IntervalTrigger(minutes=1),
            id="notification_job",
            name="Traitement des notifications",
            replace_existing=True,
        )

        self.scheduler.start()

        logger.info(f"Scheduler started. Scraping every {self.interval_minutes} minutes")

        # Lancer immédiatement un premier cycle
        logger.info("Running initial scraping cycle...")
        self.run_scraping_cycle()

    def stop(self):
        """Arrête le scheduler"""
        logger.info("Stopping scheduler...")
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")

    def run_scraping_cycle(self):
        """Exécute un cycle de scraping complet"""
        try:
            logger.info("🔄 Starting scraping cycle")

            # Lancer le scraping
            stats = self.scraping_service.run_full_scraping()

            # Log des résultats
            logger.info(
                f"✅ Scraping completed: {stats['new_listings']} new listings, "
                f"{stats['matching_criteria']} matching criteria"
            )

        except Exception as e:
            logger.error(f"❌ Error during scraping cycle: {e}", exc_info=True)

    def run_notification_cycle(self):
        """Traite les notifications en attente"""
        try:
            sent_count = self.notification_service.process_pending_notifications()

            if sent_count > 0:
                logger.info(f"📧 Sent {sent_count} notifications")

        except Exception as e:
            logger.error(f"❌ Error during notification cycle: {e}", exc_info=True)

    def run_manual_scraping(self):
        """Lance un scraping manuel (pour API)"""
        return self.run_scraping_cycle()
