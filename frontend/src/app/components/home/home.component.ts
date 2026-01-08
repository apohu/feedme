import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="hero">
        <h1>Bienvenue sur FeedMe</h1>
        <p>Votre assistant personnel pour une alimentation équilibrée et variée</p>
      </div>

      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">🍳</div>
          <h3>Gestion des Recettes</h3>
          <p>Créez et organisez vos recettes favorites avec informations nutritionnelles</p>
          <a routerLink="/recipes" class="btn">Voir les recettes</a>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <h3>Calendrier Alimentaire</h3>
          <p>Suivez vos repas quotidiens et visualisez votre score nutritionnel</p>
          <a routerLink="/calendar" class="btn">Ouvrir le calendrier</a>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>Suggestions Intelligentes</h3>
          <p>Générez des menus personnalisés selon vos critères et préférences</p>
          <a routerLink="/menu-suggestion" class="btn">Générer un menu</a>
        </div>
      </div>

      <div class="info-section">
        <h2>Fonctionnalités</h2>
        <ul>
          <li>✅ Base de données d'ingrédients avec informations nutritionnelles</li>
          <li>✅ Système de tags pour catégoriser vos recettes</li>
          <li>✅ Algorithme de suggestion basé sur vos préférences</li>
          <li>✅ Score nutritionnel de type Nutriscore (A à E)</li>
          <li>✅ Suivi quotidien, hebdomadaire et mensuel</li>
          <li>✅ Gestion du budget et du temps de préparation</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
      margin-bottom: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .hero h1 {
      font-size: 3em;
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .hero p {
      font-size: 1.3em;
      color: #7f8c8d;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .feature-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .feature-icon {
      font-size: 4em;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      margin: 0 0 15px 0;
      color: #2c3e50;
    }

    .feature-card p {
      color: #7f8c8d;
      margin-bottom: 20px;
    }

    .btn {
      display: inline-block;
      padding: 10px 20px;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .btn:hover {
      background: #2980b9;
    }

    .info-section {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-section h2 {
      margin-top: 0;
      color: #2c3e50;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
    }

    .info-section li {
      padding: 10px 0;
      font-size: 1.1em;
      color: #555;
    }
  `]
})
export class HomeComponent {}
