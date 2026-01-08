import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/types';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="recipes-container">
      <h2>Mes Recettes</h2>

      <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Annuler' : 'Nouvelle Recette' }}
      </button>

      <div *ngIf="showCreateForm" class="create-form">
        <h3>Créer une nouvelle recette</h3>
        <form (ngSubmit)="createRecipe()">
          <div class="form-group">
            <label>Nom de la recette *</label>
            <input type="text" [(ngModel)]="newRecipe.name" name="name" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="newRecipe.description" name="description" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Temps de préparation (min)</label>
              <input type="number" [(ngModel)]="newRecipe.prep_time_minutes" name="prep_time" min="0" />
            </div>

            <div class="form-group">
              <label>Temps de cuisson (min)</label>
              <input type="number" [(ngModel)]="newRecipe.cook_time_minutes" name="cook_time" min="0" />
            </div>

            <div class="form-group">
              <label>Portions</label>
              <input type="number" [(ngModel)]="newRecipe.servings" name="servings" min="1" value="2" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Coût estimé (€)</label>
              <input type="number" [(ngModel)]="newRecipe.estimated_cost" name="cost" min="0" step="0.5" />
            </div>

            <div class="form-group">
              <label>Nutriscore</label>
              <select [(ngModel)]="newRecipe.nutriscore" name="nutriscore">
                <option value="A">A (Excellent)</option>
                <option value="B">B (Bon)</option>
                <option value="C" selected>C (Moyen)</option>
                <option value="D">D (Médiocre)</option>
                <option value="E">E (Mauvais)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Instructions</label>
            <textarea [(ngModel)]="newRecipe.instructions" name="instructions" rows="6"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancelCreate()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="!newRecipe.name">Créer</button>
          </div>
        </form>
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

    .create-form h3 {
      margin-top: 0;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-secondary {
      background: #999;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #777;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class RecipesComponent implements OnInit {
  recipes: Recipe[] = [];
  showCreateForm = false;
  newRecipe: Recipe = {
    name: '',
    description: '',
    instructions: '',
    prep_time_minutes: undefined,
    cook_time_minutes: undefined,
    servings: 2,
    estimated_cost: undefined,
    nutriscore: 'C'
  };

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

  createRecipe(): void {
    if (!this.newRecipe.name) return;

    this.recipeService.createRecipe(this.newRecipe).subscribe({
      next: (response) => {
        console.log('Recette créée:', response);
        this.loadRecipes();
        this.cancelCreate();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de la recette');
      }
    });
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newRecipe = {
      name: '',
      description: '',
      instructions: '',
      prep_time_minutes: undefined,
      cook_time_minutes: undefined,
      servings: 2,
      estimated_cost: undefined,
      nutriscore: 'C'
    };
  }
}
