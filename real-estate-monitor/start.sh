#!/bin/bash

# Script de démarrage rapide

echo "🏠 Real Estate Monitoring - Démarrage"
echo "======================================"

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

echo "📦 Installation des dépendances..."
pip install -r requirements.txt

echo ""
echo "🚀 Lancement de l'application..."
python main.py
