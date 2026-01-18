"""
Modèle de données pour les annonces immobilières
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class PropertyListing(Base):
    """Modèle représentant une annonce immobilière"""

    __tablename__ = "property_listings"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Identifiant unique de l'annonce (URL ou ID du site source)
    external_id = Column(String(255), unique=True, nullable=False, index=True)

    # Source de l'annonce
    source = Column(String(100), nullable=False, index=True)  # seloger, foncia, etc.

    # Type de transaction
    transaction_type = Column(String(20), nullable=False)  # achat, location

    # Informations de base
    title = Column(String(500))
    description = Column(Text)
    property_type = Column(String(50))  # maison, appartement

    # Localisation
    address = Column(String(500))
    city = Column(String(100), index=True)
    postal_code = Column(String(10))

    # Prix et surface
    price = Column(Float, nullable=False, index=True)
    price_per_m2 = Column(Float)
    surface = Column(Float, index=True)  # m²

    # Pièces
    rooms = Column(Integer, index=True)  # nombre de pièces
    bedrooms = Column(Integer, index=True)  # nombre de chambres

    # Caractéristiques (JSON)
    features = Column(JSON)  # jardin, parking, garage, etc.

    # Images
    images = Column(JSON)  # liste des URLs d'images
    main_image = Column(String(1000))

    # URL de l'annonce
    url = Column(String(1000), nullable=False)

    # Dates
    published_date = Column(DateTime)
    scraped_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Notification
    notified = Column(Boolean, default=False, index=True)
    notified_at = Column(DateTime)

    # Validation des critères
    matches_criteria = Column(Boolean, default=False, index=True)
    criteria_score = Column(Integer, default=0)  # score de matching

    # Statut
    is_active = Column(Boolean, default=True, index=True)

    def __repr__(self):
        return f"<PropertyListing {self.source} - {self.city} - {self.price}€ - {self.surface}m²>"

    def to_dict(self):
        """Convertit l'objet en dictionnaire"""
        return {
            "id": self.id,
            "external_id": self.external_id,
            "source": self.source,
            "transaction_type": self.transaction_type,
            "title": self.title,
            "description": self.description,
            "property_type": self.property_type,
            "address": self.address,
            "city": self.city,
            "postal_code": self.postal_code,
            "price": self.price,
            "price_per_m2": self.price_per_m2,
            "surface": self.surface,
            "rooms": self.rooms,
            "bedrooms": self.bedrooms,
            "features": self.features,
            "images": self.images,
            "main_image": self.main_image,
            "url": self.url,
            "published_date": self.published_date.isoformat() if self.published_date else None,
            "scraped_at": self.scraped_at.isoformat() if self.scraped_at else None,
            "notified": self.notified,
            "notified_at": self.notified_at.isoformat() if self.notified_at else None,
            "matches_criteria": self.matches_criteria,
            "criteria_score": self.criteria_score,
            "is_active": self.is_active,
        }
