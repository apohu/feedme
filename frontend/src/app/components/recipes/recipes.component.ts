import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/types';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recipes-container">
      <h2>Mes Recettes</h2>

      <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Annuler' : 'Nouvelle Recette' }}
      </button>

      <div *ngIf="showCreateForm" class="create-form">
        <h3>Créer une nouvelle recette</h3>
        <!-- Formulaire de création à implémenter -->
        <p>Formulaire à implémenter</p>
      </div>

      <div class="recipes-list">
        <div *ngFor="let recipe of recipes" class="recipe-card">
          <h3>{{ recipe.name }}</h3>
          <p>{{ recipe.description }}</p>
          <div class="recipe-meta">
            <span class="nutriscore nutriscore-{{ recipe.nutriscore }}">
              {{ recipe.nutriscore }}
            </span>
            <span *ngIf="recipe.estimated_cost" class="cost">
              {{ recipe.estimated_cost }}€
            </span>
            <span *ngIf="recipe.prep_time_minutes" class="time">
              ⏱️ {{ recipe.prep_time_minutes }}min
            </span>
          </div>
          <div class="tags">
            <span *ngFor="let tag of recipe.tags" class="tag">{{ tag.name }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="recipes.length === 0" class="empty-state">
        <p>Aucune recette trouvée. Créez votre première recette !</p>
      </div>
    </div>
  `,
  styles: [`
    .recipes-container {
      padding: 20px;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 20px;
    }

    .btn-primary:hover {
      background: #45a049;
    }

    .recipes-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .recipe-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .recipe-card h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .recipe-meta {
      display: flex;
      gap: 10px;
      align-items: center;
      margin: 10px 0;
    }

    .nutriscore {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      color: white;
    }

    .nutriscore-A { background: #038141; }
    .nutriscore-B { background: #85BB2F; }
    .nutriscore-C { background: #FECB02; }
    .nutriscore-D { background: #EE8100; }
    .nutriscore-E { background: #E63E11; }

    .tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .tag {
      background: #e0e0e0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .create-form {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  `]
})
export class RecipesComponent implements OnInit {
  recipes: Recipe[] = [];
  showCreateForm = false;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des recettes:', error);
      }
    });
  }
}
