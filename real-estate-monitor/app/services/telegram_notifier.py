"""
Service de notification via Telegram
"""
import os
import logging
import asyncio
from typing import Optional
from telegram import Bot
from telegram.error import TelegramError
from app.models.property_listing import PropertyListing
from app.services.config_loader import ConfigLoader

logger = logging.getLogger(__name__)


class TelegramNotifier:
    """Service d'envoi de notifications Telegram"""

    def __init__(self, config: ConfigLoader):
        self.config = config
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID")

        if not self.bot_token or not self.chat_id:
            logger.warning("Telegram credentials not configured")
            self.bot = None
        else:
            try:
                self.bot = Bot(token=self.bot_token)
                logger.info("Telegram bot initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Telegram bot: {e}")
                self.bot = None

        # Configuration des notifications
        notif_config = config.get_notifications_config()
        self.telegram_config = notif_config.get("telegram", {})
        self.enabled = self.telegram_config.get("enabled", True)
        self.template = self.telegram_config.get("template", "")

    def send_listing_notification(self, listing: PropertyListing) -> bool:
        """
        Envoie une notification pour une nouvelle annonce

        Returns:
            True si la notification a été envoyée avec succès
        """
        if not self.enabled:
            logger.debug("Telegram notifications disabled")
            return False

        if not self.bot:
            logger.warning("Telegram bot not initialized")
            return False

        try:
            # Formater le message
            message = self._format_message(listing)

            # Fonction async pour envoyer
            async def send_async():
                async with self.bot:
                    # Envoyer l'image si disponible
                    if self.telegram_config.get("include_images", True) and listing.main_image:
                        try:
                            await self.bot.send_photo(
                                chat_id=self.chat_id,
                                photo=listing.main_image,
                                caption=message,
                                parse_mode="Markdown",
                            )
                        except TelegramError as e:
                            logger.warning(f"Failed to send image, sending text only: {e}")
                            # Si l'image échoue, envoyer juste le texte
                            await self.bot.send_message(
                                chat_id=self.chat_id, text=message, parse_mode="Markdown"
                            )
                    else:
                        # Envoyer juste le texte
                        await self.bot.send_message(
                            chat_id=self.chat_id, text=message, parse_mode="Markdown"
                        )

            # Exécuter de manière synchrone
            asyncio.run(send_async())

            logger.info(f"Telegram notification sent for listing {listing.external_id}")
            return True

        except TelegramError as e:
            logger.error(f"Failed to send Telegram notification: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending notification: {e}", exc_info=True)
            return False

    def _format_message(self, listing: PropertyListing) -> str:
        """Formate le message de notification"""

        # Prix avec type (CC pour charges comprises)
        price_type = ""
        if listing.transaction_type == "location":
            price_type = "/mois CC"

        # Features
        features_list = listing.features or []
        features = ", ".join(features_list) if features_list else "Non spécifié"

        # Date de publication
        pub_date = "Aujourd'hui"
        if listing.published_date:
            pub_date = listing.published_date.strftime("%d/%m/%Y")

        # Chambres
        bedrooms = listing.bedrooms if listing.bedrooms else "?"

        # Construire le message
        if self.template:
            # Utiliser le template personnalisé
            message = self.template.format(
                address=listing.address or listing.city or "Non spécifié",
                price=int(listing.price) if listing.price else 0,
                price_type=price_type,
                surface=int(listing.surface) if listing.surface else 0,
                rooms=listing.rooms or "?",
                bedrooms=bedrooms,
                features=features,
                url=listing.url or "",
                date=pub_date,
                source=listing.source.upper(),
            )
        else:
            # Message par défaut
            message = f"""
🏠 *Nouvelle annonce à Cholet !*

📍 *Adresse* : {listing.address or listing.city or "Non spécifié"}
💰 *Prix* : {int(listing.price) if listing.price else 0}€{price_type}
📐 *Surface* : {int(listing.surface) if listing.surface else 0}m²
🚪 *Pièces* : {listing.rooms or "?"}
🛏️ *Chambres* : {bedrooms}

✅ *Critères* : {features}
⭐ *Score* : {listing.criteria_score}/100

🔗 [Voir l'annonce]({listing.url})

📅 Publiée le {pub_date}
🏢 Source : {listing.source.upper()}
"""

        return message.strip()

    def send_stats_summary(self, stats: dict) -> bool:
        """
        Envoie un résumé des statistiques de scraping

        Args:
            stats: dictionnaire des statistiques

        Returns:
            True si envoyé avec succès
        """
        if not self.enabled or not self.bot:
            return False

        try:
            message = f"""
📊 *Résumé du scraping*

🔍 Total annonces scrapées : {stats.get('total_scraped', 0)}
🆕 Nouvelles annonces : {stats.get('new_listings', 0)}
✅ Correspondant aux critères : {stats.get('matching_criteria', 0)}

🏢 *Par source* :
"""

            by_source = stats.get("by_source", {})
            for source, source_stats in by_source.items():
                message += f"\n• {source.upper()} : {source_stats.get('new', 0)} nouvelles, {source_stats.get('matching', 0)} matching"

            async def send_async():
                async with self.bot:
                    await self.bot.send_message(chat_id=self.chat_id, text=message, parse_mode="Markdown")

            asyncio.run(send_async())

            logger.info("Stats summary sent to Telegram")
            return True

        except Exception as e:
            logger.error(f"Failed to send stats summary: {e}")
            return False

    def test_connection(self) -> bool:
        """
        Teste la connexion Telegram

        Returns:
            True si la connexion fonctionne
        """
        if not self.bot:
            logger.error("Bot not initialized")
            return False

        try:
            async def test_async():
                async with self.bot:
                    me = await self.bot.get_me()
                    logger.info(f"Telegram bot connected: @{me.username}")

                    # Envoyer un message de test
                    await self.bot.send_message(
                        chat_id=self.chat_id,
                        text="✅ Bot de veille immobilière connecté avec succès !",
                    )

            asyncio.run(test_async())
            return True

        except TelegramError as e:
            logger.error(f"Telegram connection test failed: {e}")
            return False
