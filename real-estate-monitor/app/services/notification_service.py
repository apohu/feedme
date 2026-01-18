"""
Service de gestion des notifications
"""
import logging
from typing import List
from app.models.database import Database
from app.models.property_listing import PropertyListing
from app.services.telegram_notifier import TelegramNotifier
from app.services.config_loader import ConfigLoader

logger = logging.getLogger(__name__)


class NotificationService:
    """Service qui gère l'envoi des notifications pour les nouvelles annonces"""

    def __init__(self, config: ConfigLoader, database: Database):
        self.config = config
        self.database = database
        self.telegram = TelegramNotifier(config)

    def process_pending_notifications(self) -> int:
        """
        Traite toutes les annonces en attente de notification

        Returns:
            Nombre de notifications envoyées
        """
        logger.info("Processing pending notifications...")

        sent_count = 0

        with self.database.get_session() as session:
            # Récupérer les annonces non notifiées qui matchent les critères
            listings = self.database.get_unnotified_listings(session)

            if not listings:
                logger.info("No pending notifications")
                return 0

            logger.info(f"Found {len(listings)} listings to notify")

            for listing in listings:
                try:
                    # Envoyer la notification
                    success = self.telegram.send_listing_notification(listing)

                    if success:
                        # Marquer comme notifié
                        self.database.mark_as_notified(session, listing.id)
                        sent_count += 1
                        logger.info(
                            f"Notified: {listing.source} - {listing.city} - {listing.price}€"
                        )
                    else:
                        logger.warning(
                            f"Failed to notify: {listing.source} - {listing.external_id}"
                        )

                except Exception as e:
                    logger.error(f"Error processing notification for {listing.external_id}: {e}")

        logger.info(f"Sent {sent_count} notifications")
        return sent_count

    def send_daily_summary(self) -> bool:
        """
        Envoie un résumé quotidien des annonces

        Returns:
            True si envoyé avec succès
        """
        try:
            with self.database.get_session() as session:
                stats = self.database.get_stats(session)

            return self.telegram.send_stats_summary(stats)

        except Exception as e:
            logger.error(f"Error sending daily summary: {e}")
            return False
