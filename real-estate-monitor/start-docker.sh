#!/bin/bash

# Script de démarrage Docker

echo "🏠 Real Estate Monitoring - Démarrage Docker"
echo "============================================"

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé. Copie de .env.example..."
    cp .env.example .env
    echo "✅ Fichier .env créé. Veuillez le configurer avec vos credentials Telegram."
    echo ""
    echo "Pour obtenir un token Telegram Bot:"
    echo "1. Ouvrez Telegram et cherchez @BotFather"
    echo "2. Envoyez /newbot et suivez les instructions"
    echo "3. Copiez le token et collez-le dans .env"
    echo ""
    echo "Pour obtenir votre CHAT_ID:"
    echo "1. Cherchez @userinfobot sur Telegram"
    echo "2. Démarrez une conversation"
    echo "3. Copiez votre ID et collez-le dans .env"
    echo ""
    exit 1
fi

# Créer les dossiers nécessaires
mkdir -p data logs

echo "🐋 Construction et démarrage des containers Docker..."
docker-compose up --build -d

echo ""
echo "✅ Application démarrée !"
echo ""
echo "📊 API disponible sur: http://localhost:8000"
echo "📖 Documentation API: http://localhost:8000/docs"
echo ""
echo "📝 Commandes utiles:"
echo "  - Voir les logs: docker-compose logs -f"
echo "  - Arrêter: docker-compose down"
echo "  - Redémarrer: docker-compose restart"
echo ""
