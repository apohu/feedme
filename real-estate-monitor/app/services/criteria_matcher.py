"""
Service de validation des critères de recherche
"""
from typing import Dict, Any, List
from app.models.property_listing import PropertyListing
from app.services.config_loader import ConfigLoader
import re


class CriteriaMatcher:
    """Vérifie si une annonce correspond aux critères de recherche"""

    def __init__(self, config: ConfigLoader):
        self.config = config
        self.location_config = config.get_location_config()
        self.criteria_config = config.get_criteria_config()

    def matches(self, listing: PropertyListing) -> tuple[bool, int]:
        """
        Vérifie si l'annonce correspond aux critères

        Returns:
            tuple: (matches, score) où matches est True si tous les critères obligatoires sont remplis
                   et score est un score de 0 à 100 indiquant la qualité du match
        """
        score = 0
        max_score = 0

        # Vérification de la localisation (CRITIQUE)
        if not self._check_location(listing):
            return False, 0
        score += 20
        max_score += 20

        # Vérification du type de bien (CRITIQUE)
        if not self._check_property_type(listing):
            return False, 0
        score += 10
        max_score += 10

        # Vérification du budget (CRITIQUE)
        if not self._check_budget(listing):
            return False, 0
        score += 20
        max_score += 20

        # Vérification de la surface (CRITIQUE)
        surface_match, surface_score = self._check_surface(listing)
        if not surface_match:
            return False, 0
        score += surface_score
        max_score += 10

        # Vérification des pièces/chambres (CRITIQUE)
        rooms_match, rooms_score = self._check_rooms(listing)
        if not rooms_match:
            return False, 0
        score += rooms_score
        max_score += 15

        # Vérification des critères obligatoires (CRITIQUE)
        if not self._check_required_features(listing):
            return False, 0
        score += 15
        max_score += 15

        # Vérification des critères rédhibitoires (CRITIQUE)
        if self._check_excluded_features(listing):
            return False, 0

        # Vérification des critères préférés (BONUS)
        preferred_score = self._check_preferred_features(listing)
        score += preferred_score
        max_score += 10

        # Normaliser le score sur 100
        final_score = int((score / max_score) * 100) if max_score > 0 else 0

        return True, final_score

    def _check_location(self, listing: PropertyListing) -> bool:
        """Vérifie la localisation"""
        target_city = self.location_config.get("city", "").lower()
        target_postal = self.location_config.get("postal_code", "")
        excluded_cities = [
            c.lower() for c in self.location_config.get("excluded_cities", [])
        ]

        # Vérifier la ville
        if listing.city:
            city_lower = listing.city.lower()

            # Exclure les villes non désirées
            if any(excluded in city_lower for excluded in excluded_cities):
                return False

            # Vérifier que c'est bien Cholet
            if target_city not in city_lower:
                return False

        # Vérifier le code postal si disponible
        if listing.postal_code and target_postal:
            if not listing.postal_code.startswith(target_postal):
                return False

        return True

    def _check_property_type(self, listing: PropertyListing) -> bool:
        """Vérifie le type de bien"""
        target_type = self.criteria_config.get("property_type", "").lower()

        if not listing.property_type:
            return False

        return target_type in listing.property_type.lower()

    def _check_budget(self, listing: PropertyListing) -> bool:
        """Vérifie le budget"""
        if not listing.price:
            return False

        budget_max = self.criteria_config.get("budget_max", {})
        transaction_type = listing.transaction_type or "achat"

        max_price = budget_max.get(transaction_type, 0)

        if max_price > 0:
            return listing.price <= max_price

        return True

    def _check_surface(self, listing: PropertyListing) -> tuple[bool, int]:
        """Vérifie la surface"""
        min_surface = self.criteria_config.get("surface_min_m2", 0)

        if not listing.surface:
            return False, 0

        if listing.surface < min_surface:
            return False, 0

        # Score bonus si surface largement supérieure
        if listing.surface >= min_surface + 20:
            return True, 10
        elif listing.surface >= min_surface + 10:
            return True, 7
        else:
            return True, 5

    def _check_rooms(self, listing: PropertyListing) -> tuple[bool, int]:
        """Vérifie le nombre de pièces/chambres"""
        min_rooms = self.criteria_config.get("rooms_min", 0)
        min_bedrooms = self.criteria_config.get("bedrooms_min", 0)

        # Si on a le nombre de chambres, on le privilégie
        if listing.bedrooms is not None:
            if listing.bedrooms >= min_rooms:
                # 3+ chambres = parfait
                return True, 15
            elif listing.bedrooms >= min_bedrooms and listing.surface and listing.surface >= 70:
                # 2 chambres mais > 70m² = acceptable
                return True, 10
            else:
                return False, 0

        # Sinon on se base sur le nombre de pièces
        if listing.rooms is not None:
            if listing.rooms >= min_rooms:
                return True, 12
            else:
                return False, 0

        # Pas d'info sur les pièces = on rejette
        return False, 0

    def _check_required_features(self, listing: PropertyListing) -> bool:
        """Vérifie les critères obligatoires"""
        required = self.criteria_config.get("required_features", [])

        if not required:
            return True

        if not listing.features:
            return False

        features_str = " ".join(listing.features).lower()

        for feature in required:
            if feature.lower() not in features_str:
                return False

        return True

    def _check_excluded_features(self, listing: PropertyListing) -> bool:
        """Vérifie les critères rédhibitoires"""
        excluded = self.criteria_config.get("excluded_features", [])

        if not excluded:
            return False

        # Vérifier dans les features
        if listing.features:
            features_str = " ".join(listing.features).lower()
            for feature in excluded:
                if feature.lower() in features_str:
                    return True

        # Vérifier dans le titre
        if listing.title:
            title_lower = listing.title.lower()
            for feature in excluded:
                if feature.lower() in title_lower:
                    return True

        # Vérifier dans la description
        if listing.description:
            desc_lower = listing.description.lower()
            for feature in excluded:
                if feature.lower() in desc_lower:
                    return True

        return False

    def _check_preferred_features(self, listing: PropertyListing) -> int:
        """Vérifie les critères préférés et retourne un score"""
        preferred = self.criteria_config.get("preferred_features", [])

        if not preferred:
            return 0

        if not listing.features:
            return 0

        features_str = " ".join(listing.features).lower()
        score = 0
        score_per_feature = 10 // len(preferred) if preferred else 0

        for feature in preferred:
            if feature.lower() in features_str:
                score += score_per_feature

        return score
