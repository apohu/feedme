import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-brand">
          <h1>🍽️ FeedMe</h1>
          <p class="tagline">Gérez votre alimentation intelligemment</p>
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              Accueil
            </a>
          </li>
          <li>
            <a routerLink="/recipes" routerLinkActive="active">
              Recettes
            </a>
          </li>
          <li>
            <a routerLink="/calendar" routerLinkActive="active">
              Calendrier
            </a>
          </li>
          <li>
            <a routerLink="/menu-suggestion" routerLinkActive="active">
              Suggestion de Menu
            </a>
          </li>
        </ul>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p>© 2026 FeedMe - Application de gestion alimentaire</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: #2c3e50;
      color: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 2em;
    }

    .tagline {
      margin: 5px 0 0 0;
      font-size: 0.9em;
      opacity: 0.8;
    }

    .nav-links {
      list-style: none;
      padding: 0;
      margin: 20px 0 0 0;
      display: flex;
      gap: 20px;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .nav-links a:hover {
      background: rgba(255,255,255,0.1);
    }

    .nav-links a.active {
      background: #3498db;
    }

    .main-content {
      flex: 1;
      background: #ecf0f1;
      padding: 20px;
    }

    .footer {
      background: #34495e;
      color: white;
      text-align: center;
      padding: 20px;
    }

    .footer p {
      margin: 0;
    }
  `]
})
export class AppComponent {
  title = 'FeedMe';
}
