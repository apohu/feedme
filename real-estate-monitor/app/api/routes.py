"""
Routes API FastAPI
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from app.models.database import Database
from app.models.property_listing import PropertyListing
from app.services.config_loader import ConfigLoader
from app.scheduler import ScrapingScheduler
from sqlalchemy.orm import Session

router = APIRouter()

# Variables globales (seront injectées par main.py)
_database: Optional[Database] = None
_config: Optional[ConfigLoader] = None
_scheduler: Optional[ScrapingScheduler] = None


def set_dependencies(database: Database, config: ConfigLoader, scheduler: ScrapingScheduler):
    """Configure les dépendances globales"""
    global _database, _config, _scheduler
    _database = database
    _config = config
    _scheduler = scheduler


# Modèles Pydantic pour les réponses
class ListingResponse(BaseModel):
    id: int
    external_id: str
    source: str
    transaction_type: str
    title: Optional[str]
    city: str
    price: float
    surface: float
    rooms: Optional[int]
    bedrooms: Optional[int]
    url: str
    matches_criteria: bool
    criteria_score: int
    notified: bool

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total: int
    matching_criteria: int
    notified: int
    active: int
    pending_notification: int


# Routes

@router.get("/")
async def root():
    """Route racine"""
    return {
        "name": "Scraping Immobilier API",
        "version": "1.0.0",
        "description": "API de veille immobilière pour Cholet",
    }


@router.get("/health")
async def health():
    """Endpoint de santé"""
    return {"status": "healthy"}


@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    matching_only: bool = False,
    source: Optional[str] = None,
    limit: int = 50,
):
    """
    Récupère la liste des annonces

    Args:
        matching_only: Si True, ne retourne que les annonces qui matchent les critères
        source: Filtrer par source (seloger, foncia, citya)
        limit: Nombre maximum d'annonces à retourner
    """
    if not _database:
        raise HTTPException(status_code=500, detail="Database not initialized")

    with _database.get_session() as session:
        query = session.query(PropertyListing).filter_by(is_active=True)

        if matching_only:
            query = query.filter_by(matches_criteria=True)

        if source:
            query = query.filter_by(source=source)

        query = query.order_by(PropertyListing.scraped_at.desc()).limit(limit)

        listings = query.all()

        return [ListingResponse.from_orm(listing) for listing in listings]


@router.get("/listings/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: int):
    """Récupère une annonce par son ID"""
    if not _database:
        raise HTTPException(status_code=500, detail="Database not initialized")

    with _database.get_session() as session:
        listing = session.query(PropertyListing).filter_by(id=listing_id).first()

        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        return ListingResponse.from_orm(listing)


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Récupère les statistiques"""
    if not _database:
        raise HTTPException(status_code=500, detail="Database not initialized")

    with _database.get_session() as session:
        stats = _database.get_stats(session)
        return StatsResponse(**stats)


@router.post("/scrape/manual")
async def trigger_manual_scraping():
    """
    Déclenche un scraping manuel immédiat

    Returns:
        Message de confirmation
    """
    if not _scheduler:
        raise HTTPException(status_code=500, detail="Scheduler not initialized")

    try:
        _scheduler.run_manual_scraping()
        return {"status": "success", "message": "Manual scraping triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@router.get("/config")
async def get_config():
    """Récupère la configuration actuelle (sans les secrets)"""
    if not _config:
        raise HTTPException(status_code=500, detail="Config not initialized")

    return {
        "location": _config.get_location_config(),
        "criteria": _config.get_criteria_config(),
        "scraping": {
            "interval_minutes": _config.get("scraping.interval_minutes"),
            "timeout_seconds": _config.get("scraping.timeout_seconds"),
        },
        "scrapers_enabled": [s["name"] for s in _config.get_enabled_scrapers()],
    }
