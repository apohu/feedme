import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { TagService } from '../../services/tag.service';
import { IngredientService } from '../../services/ingredient.service';
import { MenuSuggestionCriteria, Recipe, Tag, Ingredient } from '../../models/types';

@Component({
  selector: 'app-menu-suggestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="suggestion-container">
      <h2>Générer un Menu</h2>

      <div class="criteria-form">
        <h3>Critères de suggestion</h3>

        <div class="form-group">
          <label>Nombre de jours</label>
          <input type="number" [(ngModel)]="criteria.cycle_days" min="1" max="30" />
        </div>

        <div class="form-group">
          <label>Nombre de repas végétariens par cycle</label>
          <input type="number" [(ngModel)]="criteria.vegetarian_meals_count" min="0" />
        </div>

        <div class="form-group">
          <label>Budget maximum par repas (€)</label>
          <input type="number" [(ngModel)]="criteria.budget_per_meal" min="0" step="0.5" />
        </div>

        <div class="form-group">
          <label>Temps de préparation maximum (min)</label>
          <input type="number" [(ngModel)]="criteria.max_prep_time" min="0" step="5" />
        </div>

        <div class="form-group">
          <label>Nombre de convives par repas</label>
          <input type="number" [(ngModel)]="criteria.servings_per_meal" min="1" />
        </div>

        <div class="form-group">
          <label>Régimes alimentaires</label>
          <div class="checkbox-group">
            <label *ngFor="let tag of dietTags">
              <input type="checkbox"
                     [checked]="isDietTagSelected(tag.id!)"
                     (change)="toggleDietTag(tag.id!)" />
              {{ tag.name }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Styles de cuisine</label>
          <div class="checkbox-group">
            <label *ngFor="let tag of cuisineTags">
              <input type="checkbox"
                     [checked]="isCuisineTagSelected(tag.id!)"
                     (change)="toggleCuisineTag(tag.id!)" />
              {{ tag.name }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Ingrédients à exclure</label>
          <select [(ngModel)]="selectedIngredient" (change)="addExcludedIngredient()">
            <option value="">Sélectionner un ingrédient</option>
            <option *ngFor="let ing of ingredients" [value]="ing.id">{{ ing.name }}</option>
          </select>
          <div class="excluded-list">
            <span *ngFor="let id of criteria.excluded_ingredients" class="excluded-item">
              {{ getIngredientName(id) }}
              <button (click)="removeExcludedIngredient(id)">×</button>
            </span>
          </div>
        </div>

        <button class="btn-generate" (click)="generateSuggestion()" [disabled]="isLoading">
          {{ isLoading ? 'Génération en cours...' : 'Générer le menu' }}
        </button>
      </div>

      <div class="suggestions-result" *ngIf="suggestedRecipes.length > 0">
        <h3>Menu Suggéré ({{ criteria.cycle_days }} jours)</h3>

        <div class="distribution-view" *ngIf="distribution">
          <div *ngFor="let day of getDistributionDays()" class="day-menu">
            <h4>Jour {{ day }}</h4>
            <div class="day-meals">
              <div *ngFor="let mealType of getMealTypes(day)" class="meal-item">
                <strong>{{ getMealTypeLabel(mealType) }}:</strong>
                {{ distribution[day][mealType].name }}
                <span class="nutriscore nutriscore-{{ distribution[day][mealType].nutriscore }}">
                  {{ distribution[day][mealType].nutriscore }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-save" (click)="saveMenu()">
          Enregistrer ce menu
        </button>
      </div>
    </div>
  `,
  styles: [`
    .suggestion-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .criteria-form {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input[type="number"],
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: normal;
    }

    .excluded-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .excluded-item {
      background: #ff5252;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .excluded-item button {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.2em;
    }

    .btn-generate {
      width: 100%;
      padding: 15px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1em;
      font-weight: 500;
    }

    .btn-generate:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-generate:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .suggestions-result {
      margin-top: 30px;
    }

    .distribution-view {
      display: grid;
      gap: 20px;
      margin: 20px 0;
    }

    .day-menu {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: white;
    }

    .day-menu h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .day-meals {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meal-item {
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-save {
      width: 100%;
      padding: 15px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1em;
    }

    .nutriscore {
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
      color: white;
      font-size: 0.8em;
    }

    .nutriscore-A { background: #038141; }
    .nutriscore-B { background: #85BB2F; }
    .nutriscore-C { background: #FECB02; color: #333; }
    .nutriscore-D { background: #EE8100; }
    .nutriscore-E { background: #E63E11; }
  `]
})
export class MenuSuggestionComponent implements OnInit {
  criteria: MenuSuggestionCriteria = {
    cycle_days: 7,
    vegetarian_meals_count: 3,
    excluded_ingredients: [],
    diet_tags: [],
    cuisine_preference: [],
    budget_per_meal: 10,
    servings_per_meal: 2,
    max_prep_time: 45,
    criteria_weights: {
      nutriscore: 2.0,
      budget: 1.5,
      prep_time: 1.0,
      cuisine: 1.2,
      vegetarian: 1.0
    }
  };

  dietTags: Tag[] = [];
  cuisineTags: Tag[] = [];
  ingredients: Ingredient[] = [];
  selectedIngredient = '';
  suggestedRecipes: Recipe[] = [];
  distribution: any = null;
  isLoading = false;

  constructor(
    private menuService: MenuService,
    private tagService: TagService,
    private ingredientService: IngredientService
  ) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadIngredients();
  }

  loadTags(): void {
    this.tagService.getTagsByCategory('diet').subscribe(tags => {
      this.dietTags = tags;
    });
    this.tagService.getTagsByCategory('cuisine').subscribe(tags => {
      this.cuisineTags = tags;
    });
  }

  loadIngredients(): void {
    this.ingredientService.getAllIngredients().subscribe(ingredients => {
      this.ingredients = ingredients;
    });
  }

  isDietTagSelected(id: number): boolean {
    return this.criteria.diet_tags?.includes(id) || false;
  }

  toggleDietTag(id: number): void {
    if (!this.criteria.diet_tags) this.criteria.diet_tags = [];
    const index = this.criteria.diet_tags.indexOf(id);
    if (index > -1) {
      this.criteria.diet_tags.splice(index, 1);
    } else {
      this.criteria.diet_tags.push(id);
    }
  }

  isCuisineTagSelected(id: number): boolean {
    return this.criteria.cuisine_preference?.includes(id) || false;
  }

  toggleCuisineTag(id: number): void {
    if (!this.criteria.cuisine_preference) this.criteria.cuisine_preference = [];
    const index = this.criteria.cuisine_preference.indexOf(id);
    if (index > -1) {
      this.criteria.cuisine_preference.splice(index, 1);
    } else {
      this.criteria.cuisine_preference.push(id);
    }
  }

  addExcludedIngredient(): void {
    if (this.selectedIngredient) {
      const id = parseInt(this.selectedIngredient);
      if (!this.criteria.excluded_ingredients?.includes(id)) {
        if (!this.criteria.excluded_ingredients) this.criteria.excluded_ingredients = [];
        this.criteria.excluded_ingredients.push(id);
      }
      this.selectedIngredient = '';
    }
  }

  removeExcludedIngredient(id: number): void {
    if (this.criteria.excluded_ingredients) {
      const index = this.criteria.excluded_ingredients.indexOf(id);
      if (index > -1) {
        this.criteria.excluded_ingredients.splice(index, 1);
      }
    }
  }

  getIngredientName(id: number): string {
    return this.ingredients.find(i => i.id === id)?.name || '';
  }

  generateSuggestion(): void {
    this.isLoading = true;
    this.menuService.generateSuggestion(this.criteria).subscribe({
      next: (result) => {
        this.suggestedRecipes = result.recipes;
        this.distribution = result.distribution;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la génération:', error);
        this.isLoading = false;
      }
    });
  }

  getDistributionDays(): number[] {
    if (!this.distribution) return [];
    return Object.keys(this.distribution).map(Number).sort((a, b) => a - b);
  }

  getMealTypes(day: number): string[] {
    if (!this.distribution || !this.distribution[day]) return [];
    return Object.keys(this.distribution[day]);
  }

  getMealTypeLabel(mealType: string): string {
    const labels: any = {
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Snack'
    };
    return labels[mealType] || mealType;
  }

  saveMenu(): void {
    console.log('Enregistrer le menu');
    // À implémenter: sauvegarder le menu
  }
}
