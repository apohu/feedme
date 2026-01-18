"""
Scraper pour Citya.com
"""
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class CityaScraper(BaseScraper):
    """Scraper pour le site Citya.com"""

    @property
    def source_name(self) -> str:
        return "citya"

    def build_search_url(self, transaction_type: str, criteria: Dict[str, Any]) -> str:
        """
        Construit l'URL de recherche Citya

        Note: Structure d'URL à ajuster selon le site réel
        """
        # Type: vente ou location
        search_type = "location" if transaction_type == "location" else "vente"

        # Type de bien: maison
        property_type = "maison"

        # Ville
        city = "cholet"

        # Prix max
        budget_max = criteria.get("budget_max", {})
        max_price = budget_max.get(transaction_type, 135000)

        # Surface min
        min_surface = criteria.get("surface_min_m2", 70)

        # Pièces min
        min_rooms = criteria.get("rooms_min", 3)

        # Construction de l'URL Citya
        url = (
            f"https://www.citya.com/recherche"
            f"?type={search_type}"
            f"&typeBien={property_type}"
            f"&ville={city}"
            f"&prixMax={max_price}"
            f"&surfaceMin={min_surface}"
            f"&piecesMin={min_rooms}"
            f"&tri=date"
        )

        return url

    def parse_listing_page(self, html: str, transaction_type: str) -> List[Dict[str, Any]]:
        """
        Parse la page de résultats Citya

        Note: Sélecteurs à ajuster selon la structure HTML réelle
        """
        soup = BeautifulSoup(html, "html.parser")
        listings = []

        # Trouver toutes les annonces
        cards = (
            soup.select("div.annonce")
            or soup.select("article.property")
            or soup.select("div[class*='card']")
        )

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

        # Lien
        link = card.select_one("a[href*='/annonce/']") or card.select_one("a")
        if not link:
            return None

        url = link.get("href", "")
        if url and not url.startswith("http"):
            url = f"https://www.citya.com{url}"

        # ID
        external_id = url.split("/")[-1].split("?")[0] if url else ""

        # Titre
        title_elem = card.select_one("h2") or card.select_one("h3") or card.select_one(".titre")
        title = self.extract_text(title_elem)

        # Prix
        price_elem = card.select_one("[class*='prix']") or card.select_one(".price")
        price_text = self.extract_text(price_elem)
        price = self.extract_number(price_text)

        # Surface
        surface_elem = card.select_one("[class*='surface']") or card.select_one(".surface")
        surface_text = self.extract_text(surface_elem)
        surface = self.extract_number(surface_text)

        # Pièces
        rooms_elem = card.select_one("[class*='piece']") or card.select_one(".pieces")
        rooms_text = self.extract_text(rooms_elem)
        rooms = self.extract_int(rooms_text)

        # Chambres
        bedrooms_elem = card.select_one("[class*='chambre']")
        bedrooms = self.extract_int(self.extract_text(bedrooms_elem)) if bedrooms_elem else None

        # Localisation
        location_elem = card.select_one("[class*='localisation']") or card.select_one(".ville")
        location = self.extract_text(location_elem)

        city = "Cholet"
        postal_code = "49300"

        if location:
            if "Cholet" in location or "49300" in location:
                # Extraction ville/code postal
                if "(" in location:
                    parts = location.split("(")
                    city = parts[0].strip()
                    postal_code = parts[1].replace(")", "").strip()

        # Adresse
        address_elem = card.select_one("[class*='adresse']")
        address = self.extract_text(address_elem) if address_elem else location

        # Image
        img = card.select_one("img")
        main_image = ""
        if img:
            main_image = img.get("src") or img.get("data-src") or img.get("data-lazy") or ""

        # Description
        desc_elem = card.select_one("[class*='description']") or card.select_one("p")
        description = self.extract_text(desc_elem)

        # Features
        features = []
        text_content = card.get_text().lower()

        if "jardin" in text_content:
            features.append("jardin")
        if "parking" in text_content:
            features.append("parking")
        if "garage" in text_content:
            features.append("garage")
        if "terrasse" in text_content:
            features.append("terrasse")
        if "cave" in text_content:
            features.append("cave")

        return {
            "external_id": external_id or f"citya_{hash(url)}",
            "url": url,
            "title": title,
            "description": description,
            "property_type": "maison",
            "price": price,
            "surface": surface,
            "rooms": rooms,
            "bedrooms": bedrooms,
            "city": city,
            "postal_code": postal_code,
            "address": address,
            "features": features,
            "main_image": main_image,
            "images": [main_image] if main_image else [],
            "published_date": None,
        }
