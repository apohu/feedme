"""
Scraper pour SeLoger.com (avec Playwright pour contourner l'anti-bot)
"""
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from .browser_scraper import BrowserScraper
import logging

logger = logging.getLogger(__name__)


class SeLogerScraper(BrowserScraper):
    """
    Scraper pour le site SeLoger.com

    Utilise Playwright (navigateur headless) pour contourner les protections anti-bot.
    SeLoger bloque les scrapers simples avec un 403 Forbidden.
    """

    @property
    def source_name(self) -> str:
        return "seloger"

    def build_search_url(self, transaction_type: str, criteria: Dict[str, Any]) -> str:
        """
        Construit l'URL de recherche SeLoger (nouvelle version 2026)

        Basé sur la structure réelle: classified-search
        """
        # Type de transaction: Buy ou Rent
        distribution_type = "Buy" if transaction_type == "achat" else "Rent"

        # Type de bien: House (maison)
        estate_type = "House"

        # Cholet: code location AD08FR18635
        location_code = "AD08FR18635"

        # Prix max
        budget_max = criteria.get("budget_max", {})
        max_price = budget_max.get(transaction_type, 135000 if transaction_type == "achat" else 700)

        # Surface min
        min_surface = criteria.get("surface_min_m2", 70)

        # Pièces et chambres min
        min_rooms = criteria.get("rooms_min", 2)  # Adapté à 2 au lieu de 3
        min_bedrooms = criteria.get("bedrooms_min", 2)

        # Features: Parking/Garage et Jardin
        features = "Parking_Garage,Garden"

        # Construction de l'URL (nouvelle structure SeLoger 2026)
        url = (
            f"https://www.seloger.com/classified-search"
            f"?distributionTypes={distribution_type}"
            f"&estateTypes={estate_type}"
            f"&featuresIncluded={features}"
            f"&locations={location_code}"
            f"&numberOfBedroomsMin={min_bedrooms}"
            f"&numberOfRoomsMin={min_rooms}"
            f"&priceMax={max_price}"
            f"&spaceMin={min_surface}"
            f"&order=PriceAsc"  # Tri par prix croissant
        )

        return url

    def parse_listing_page(self, html: str, transaction_type: str) -> List[Dict[str, Any]]:
        """
        Parse la page de résultats SeLoger

        Note: Les sélecteurs CSS devront être ajustés selon la structure réelle du HTML.
        Cette implémentation est un exemple de structure.
        """
        soup = BeautifulSoup(html, "html.parser")
        listings = []

        # Trouver toutes les annonces
        # Sélecteur à ajuster selon la structure réelle de SeLoger
        cards = soup.select("article.CardList") or soup.select("div[data-test='sl.card']")

        if not cards:
            logger.warning(f"[{self.source_name}] No listing cards found. Selectors may need adjustment.")
            return []

        for card in cards:
            try:
                listing = self._parse_card(card, transaction_type)
                if listing:
                    listings.append(listing)
            except Exception as e:
                logger.error(f"[{self.source_name}] Error parsing card: {e}")
                continue

        return listings

    def _parse_card(self, card, transaction_type: str) -> Dict[str, Any]:
        """Parse une carte d'annonce individuelle"""

        # Extraire l'ID et l'URL
        link = card.select_one("a[href*='/annonces/']") or card.select_one("a")
        if not link:
            return None

        url = link.get("href", "")
        if url and not url.startswith("http"):
            url = f"https://www.seloger.com{url}"

        # ID unique (depuis l'URL)
        external_id = url.split("/")[-1].split(".")[0] if url else ""

        # Titre
        title_elem = card.select_one("h2") or card.select_one(".title")
        title = self.extract_text(title_elem)

        # Prix
        price_elem = card.select_one("[class*='price']") or card.select_one(".price")
        price_text = self.extract_text(price_elem)
        price = self.extract_number(price_text)

        # Surface
        surface_elem = card.select_one("[class*='surface']") or card.select_one(".surface")
        surface_text = self.extract_text(surface_elem)
        surface = self.extract_number(surface_text)

        # Pièces
        rooms_elem = card.select_one("[class*='room']") or card.select_one(".rooms")
        rooms_text = self.extract_text(rooms_elem)
        rooms = self.extract_int(rooms_text)

        # Localisation
        location_elem = card.select_one("[class*='location']") or card.select_one(".city")
        location = self.extract_text(location_elem)

        # Extraire ville et code postal de la localisation
        city = "Cholet"
        postal_code = "49300"

        if location:
            # Format typique: "Cholet (49300)" ou "49300 Cholet"
            if "(" in location:
                parts = location.split("(")
                city = parts[0].strip()
                postal_code = parts[1].replace(")", "").strip()
            elif location[0].isdigit():
                parts = location.split(None, 1)
                postal_code = parts[0]
                city = parts[1] if len(parts) > 1 else "Cholet"

        # Image principale
        img = card.select_one("img")
        main_image = img.get("src") or img.get("data-src") if img else ""

        # Description courte
        desc_elem = card.select_one("[class*='description']") or card.select_one(".description")
        description = self.extract_text(desc_elem)

        # Features (à extraire du texte)
        features = []
        text_content = card.get_text().lower()

        if "jardin" in text_content:
            features.append("jardin")
        if "parking" in text_content or "garage" in text_content:
            features.append("parking")
        if "terrasse" in text_content:
            features.append("terrasse")

        return {
            "external_id": external_id or f"seloger_{hash(url)}",
            "url": url,
            "title": title,
            "description": description,
            "property_type": "maison",
            "price": price,
            "surface": surface,
            "rooms": rooms,
            "bedrooms": None,  # SeLoger ne distingue pas toujours
            "city": city,
            "postal_code": postal_code,
            "address": location,
            "features": features,
            "main_image": main_image,
            "images": [main_image] if main_image else [],
            "published_date": None,  # À extraire si disponible
        }
