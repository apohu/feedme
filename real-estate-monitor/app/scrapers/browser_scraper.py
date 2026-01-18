"""
Classe de base pour les scrapers utilisant Playwright (navigateur headless)
"""
from abc import ABC
from typing import Optional
import logging
import concurrent.futures
from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class BrowserScraper(BaseScraper, ABC):
    """
    Classe de base pour les scrapers utilisant un navigateur headless (Playwright)

    Utilise Playwright pour contourner les protections anti-bot et exécuter le JavaScript.
    Idéal pour les sites modernes comme SeLoger qui bloquent les scrapers simples.
    """

    def __init__(self, config: dict):
        super().__init__(config)
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.headless = config.get("headless", True)  # Navigateur invisible par défaut

    def _init_browser(self):
        """Initialise le navigateur Playwright"""
        if not self.playwright:
            logger.info(f"[{self.source_name}] Initializing Playwright browser...")
            self.playwright = sync_playwright().start()

            # Lancer Chromium (peut être changé pour firefox ou webkit)
            self.browser = self.playwright.chromium.launch(
                headless=self.headless,
                args=[
                    '--disable-blink-features=AutomationControlled',  # Cache qu'on est un bot
                    '--disable-dev-shm-usage',
                    '--no-sandbox',
                ]
            )

            # Créer un contexte avec un vrai user-agent
            self.context = self.browser.new_context(
                user_agent=self.user_agent,
                viewport={'width': 1920, 'height': 1080},
                locale='fr-FR',
                timezone_id='Europe/Paris',
                # Simule un vrai navigateur
                extra_http_headers={
                    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                }
            )

            logger.info(f"[{self.source_name}] Browser initialized successfully")

    def _close_browser(self):
        """Ferme le navigateur Playwright"""
        if self.context:
            self.context.close()
            self.context = None

        if self.browser:
            self.browser.close()
            self.browser = None

        if self.playwright:
            self.playwright.stop()
            self.playwright = None

    def _fetch_with_browser(self, url: str) -> Optional[str]:
        """
        Fonction interne qui fait le vrai scraping avec Playwright.
        S'exécute dans un thread séparé pour éviter les conflits avec asyncio.
        """
        page: Optional[Page] = None
        try:
            # Initialiser le navigateur si nécessaire
            self._init_browser()

            # Ouvrir une nouvelle page
            page = self.context.new_page()

            # Naviguer vers l'URL avec un timeout
            response = page.goto(url, wait_until='domcontentloaded', timeout=self.timeout * 1000)

            # Vérifier le status code
            if response and response.status >= 400:
                logger.warning(
                    f"[{self.source_name}] HTTP {response.status} for URL: {url}"
                )
                page.close()
                return None

            # Attendre un peu que le JS se charge
            page.wait_for_timeout(2000)  # 2 secondes

            # Récupérer le HTML
            html = page.content()

            # Fermer la page
            page.close()

            logger.info(f"[{self.source_name}] Successfully fetched page")

            return html

        except Exception as e:
            if page:
                page.close()
            raise e

    def fetch_page(self, url: str) -> Optional[str]:
        """
        Récupère le contenu HTML d'une page avec Playwright

        Override de la méthode BaseScraper pour utiliser un vrai navigateur
        au lieu de requests. Exécute dans un thread séparé pour éviter
        les conflits avec la boucle asyncio de FastAPI.

        Args:
            url: URL à récupérer

        Returns:
            Contenu HTML ou None en cas d'erreur
        """
        for attempt in range(self.retry_attempts):
            try:
                logger.info(
                    f"[{self.source_name}] Fetching URL with browser "
                    f"(attempt {attempt + 1}/{self.retry_attempts}): {url}"
                )

                # Exécuter dans un thread séparé pour éviter le conflit avec asyncio
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(self._fetch_with_browser, url)
                    html = future.result(timeout=self.timeout + 10)

                # Délai entre les requêtes
                if self.delay > 0:
                    import time
                    time.sleep(self.delay)

                return html

            except Exception as e:
                logger.warning(
                    f"[{self.source_name}] Error fetching URL "
                    f"(attempt {attempt + 1}/{self.retry_attempts}): {e}"
                )

                if attempt < self.retry_attempts - 1:
                    import time
                    time.sleep(2 ** attempt)
                else:
                    logger.error(
                        f"[{self.source_name}] Failed to fetch URL after "
                        f"{self.retry_attempts} attempts: {url}"
                    )

        return None

    def __del__(self):
        """Destructeur : ferme le navigateur proprement"""
        try:
            self._close_browser()
        except:
            pass
