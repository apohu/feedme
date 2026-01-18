"""
Point d'entrée principal de l'application de veille immobilière
"""
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent))

from app.models.database import Database
from app.services.config_loader import ConfigLoader
from app.scheduler import ScrapingScheduler
from app.api.routes import router, set_dependencies

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/app.log"),
    ],
)

logger = logging.getLogger(__name__)

# Créer le dossier logs s'il n'existe pas
Path("logs").mkdir(exist_ok=True)


def create_app() -> FastAPI:
    """Crée et configure l'application FastAPI"""

    app = FastAPI(
        title="Scraping Immobilier API",
        description="API de veille immobilière pour Cholet",
        version="1.0.0",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Charger la configuration
    config = ConfigLoader("config.yaml")
    logger.info("Configuration loaded")

    # Initialiser la base de données
    db_path = os.getenv("DATABASE_PATH", "data/real_estate.db")
    database = Database(db_path)
    logger.info(f"Database initialized: {db_path}")

    # Initialiser le scheduler
    scheduler = ScrapingScheduler(config, database)
    logger.info("Scheduler initialized")

    # Injecter les dépendances dans les routes
    set_dependencies(database, config, scheduler)

    # Ajouter les routes
    app.include_router(router, prefix="/api")

    # Events
    @app.on_event("startup")
    async def startup_event():
        """Démarrage de l'application"""
        logger.info("=" * 80)
        logger.info("🚀 Starting Real Estate Monitoring Application")
        logger.info("=" * 80)

        # Démarrer le scheduler
        scheduler.start()

        logger.info("Application started successfully")

    @app.on_event("shutdown")
    async def shutdown_event():
        """Arrêt de l'application"""
        logger.info("Shutting down application...")
        scheduler.stop()
        logger.info("Application stopped")

    return app


def main():
    """Lance l'application"""
    app = create_app()

    # Configuration du serveur
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    logger.info(f"Starting server on {host}:{port}")

    # Lancer le serveur
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    main()
