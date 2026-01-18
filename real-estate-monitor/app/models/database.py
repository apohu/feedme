"""
Gestion de la base de données SQLite
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator
from .property_listing import Base, PropertyListing


class Database:
    """Gestionnaire de base de données"""

    def __init__(self, database_path: str = "data/real_estate.db"):
        self.database_path = database_path

        # Créer le dossier data s'il n'existe pas
        os.makedirs(os.path.dirname(database_path), exist_ok=True)

        # Créer l'engine SQLite
        self.engine = create_engine(
            f"sqlite:///{database_path}",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )

        # Créer le sessionmaker
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

        # Créer les tables
        self.create_tables()

    def create_tables(self):
        """Crée toutes les tables dans la base de données"""
        Base.metadata.create_all(bind=self.engine)

    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        """
        Context manager pour obtenir une session de base de données

        Usage:
            with db.get_session() as session:
                session.query(PropertyListing).all()
        """
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_or_create_listing(
        self, session: Session, external_id: str, source: str
    ) -> tuple[PropertyListing, bool]:
        """
        Récupère ou crée une annonce

        Returns:
            tuple: (listing, created) où created est True si l'annonce a été créée
        """
        listing = (
            session.query(PropertyListing)
            .filter_by(external_id=external_id, source=source)
            .first()
        )

        if listing:
            return listing, False

        listing = PropertyListing(external_id=external_id, source=source)
        session.add(listing)
        return listing, True

    def get_unnotified_listings(self, session: Session) -> list[PropertyListing]:
        """Récupère toutes les annonces non notifiées qui matchent les critères"""
        return (
            session.query(PropertyListing)
            .filter_by(notified=False, matches_criteria=True, is_active=True)
            .order_by(PropertyListing.scraped_at.desc())
            .all()
        )

    def mark_as_notified(self, session: Session, listing_id: int):
        """Marque une annonce comme notifiée"""
        from datetime import datetime

        listing = session.query(PropertyListing).filter_by(id=listing_id).first()
        if listing:
            listing.notified = True
            listing.notified_at = datetime.utcnow()
            session.commit()

    def get_stats(self, session: Session) -> dict:
        """Récupère des statistiques sur les annonces"""
        total = session.query(PropertyListing).count()
        matching = (
            session.query(PropertyListing).filter_by(matches_criteria=True).count()
        )
        notified = session.query(PropertyListing).filter_by(notified=True).count()
        active = session.query(PropertyListing).filter_by(is_active=True).count()

        return {
            "total": total,
            "matching_criteria": matching,
            "notified": notified,
            "active": active,
            "pending_notification": matching - notified,
        }
