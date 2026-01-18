"""
Script de test de la configuration
Vérifie que tout est bien configuré avant de lancer l'application
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()


def test_env_variables():
    """Teste les variables d'environnement"""
    print("🔍 Vérification des variables d'environnement...")

    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if not telegram_token or telegram_token == "your_bot_token_here":
        print("❌ TELEGRAM_BOT_TOKEN non configuré dans .env")
        return False

    if not telegram_chat_id or telegram_chat_id == "your_chat_id_here":
        print("❌ TELEGRAM_CHAT_ID non configuré dans .env")
        return False

    print(f"✅ TELEGRAM_BOT_TOKEN: {telegram_token[:10]}...")
    print(f"✅ TELEGRAM_CHAT_ID: {telegram_chat_id}")

    return True


def test_config_file():
    """Teste le fichier config.yaml"""
    print("\n🔍 Vérification du fichier config.yaml...")

    if not Path("config.yaml").exists():
        print("❌ config.yaml introuvable")
        return False

    print("✅ config.yaml trouvé")

    try:
        from app.services.config_loader import ConfigLoader

        config = ConfigLoader()

        city = config.get("location.city")
        property_type = config.get("criteria.property_type")
        budget_achat = config.get("criteria.budget_max.achat")

        print(f"   Ville: {city}")
        print(f"   Type: {property_type}")
        print(f"   Budget max achat: {budget_achat}€")

        return True

    except Exception as e:
        print(f"❌ Erreur lors du chargement de config.yaml: {e}")
        return False


def test_telegram_connection():
    """Teste la connexion Telegram"""
    print("\n🔍 Test de la connexion Telegram...")

    try:
        import asyncio
        from telegram import Bot

        token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_id = os.getenv("TELEGRAM_CHAT_ID")

        if not token or not chat_id:
            print("❌ Credentials Telegram manquants")
            return False

        async def test_bot():
            bot = Bot(token=token)
            async with bot:
                me = await bot.get_me()
                print(f"✅ Bot connecté: @{me.username}")

                # Envoyer un message de test
                await bot.send_message(chat_id=chat_id, text="✅ Test de connexion réussi !")
                print(f"✅ Message de test envoyé au chat {chat_id}")

        asyncio.run(test_bot())
        return True

    except Exception as e:
        print(f"❌ Erreur lors du test Telegram: {e}")
        print("\nVérifiez que:")
        print("  1. Le token est correct")
        print("  2. Le chat_id est correct (doit être un NOMBRE, pas un username)")
        print("  3. Vous avez démarré une conversation avec le bot sur Telegram")
        return False


def test_database():
    """Teste la création de la base de données"""
    print("\n🔍 Test de la base de données...")

    try:
        from app.models.database import Database

        db = Database("data/test.db")

        print("✅ Base de données créée avec succès")

        # Nettoyer
        import os

        if os.path.exists("data/test.db"):
            os.remove("data/test.db")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de la création de la base: {e}")
        return False


def test_dependencies():
    """Teste les dépendances Python"""
    print("\n🔍 Vérification des dépendances...")

    dependencies = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "beautifulsoup4",
        "requests",
        "apscheduler",
        "telegram",
        "dotenv",
        "yaml",
    ]

    all_ok = True

    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} non installé")
            all_ok = False

    if not all_ok:
        print("\n💡 Installez les dépendances avec: pip install -r requirements.txt")

    return all_ok


def main():
    """Lance tous les tests"""
    print("=" * 60)
    print("🏠 Test de Configuration - Scraping Immobilier")
    print("=" * 60)

    results = {
        "Dépendances": test_dependencies(),
        "Variables d'environnement": test_env_variables(),
        "Fichier config.yaml": test_config_file(),
        "Base de données": test_database(),
        "Connexion Telegram": test_telegram_connection(),
    }

    print("\n" + "=" * 60)
    print("📊 Résumé des Tests")
    print("=" * 60)

    for test_name, result in results.items():
        status = "✅ OK" if result else "❌ ÉCHEC"
        print(f"{test_name}: {status}")

    all_passed = all(results.values())

    print("\n" + "=" * 60)

    if all_passed:
        print("✅ Tous les tests sont passés ! Vous pouvez lancer l'application.")
        print("\nCommandes de démarrage:")
        print("  - Local: ./start.sh")
        print("  - Docker: ./start-docker.sh")
        sys.exit(0)
    else:
        print("❌ Certains tests ont échoué. Corrigez les erreurs avant de continuer.")
        sys.exit(1)


if __name__ == "__main__":
    main()
