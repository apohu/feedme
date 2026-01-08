import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { IngredientService } from '../../services/ingredient.service';
import { Recipe, Ingredient } from '../../models/types';

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

          <div class="ingredients-form-section">
            <h4>Ingrédients (optionnel)</h4>
            <div *ngIf="tempIngredients.length > 0" class="temp-ingredients-list">
              <div *ngFor="let ing of tempIngredients; let i = index" class="temp-ingredient-item">
                {{ ing.quantity }} {{ ing.unit }} {{ getIngredientNameById(ing.ingredientId) }}
                <button type="button" (click)="removeTempIngredient(i)" class="btn-remove">×</button>
              </div>
            </div>
            <div class="add-temp-ingredient">
              <select [(ngModel)]="newTempIngredient.ingredientId" name="tempIng">
                <option value="">Sélectionner un ingrédient</option>
                <option *ngFor="let ing of availableIngredients" [value]="ing.id">{{ ing.name }}</option>
              </select>
              <input type="number" [(ngModel)]="newTempIngredient.quantity" placeholder="Quantité" min="0" step="0.1" />
              <input type="text" [(ngModel)]="newTempIngredient.unit" placeholder="Unité" />
              <button type="button" class="btn-add-ing" (click)="addTempIngredient()" [disabled]="!newTempIngredient.ingredientId">+</button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancelCreate()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="!newRecipe.name">Créer</button>
          </div>
        </form>
      </div>

      <div class="recipes-list">
        <div *ngFor="let recipe of recipes" class="recipe-card" (click)="viewRecipeDetails(recipe)">
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

      <!-- Modal détails de recette -->
      <div *ngIf="showDetailsModal" class="modal-overlay" (click)="closeDetailsModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ selectedRecipe?.name }}</h3>

          <div class="recipe-details">
            <p><strong>Description:</strong> {{ selectedRecipe?.description || 'Non renseignée' }}</p>
            <p><strong>Instructions:</strong> {{ selectedRecipe?.instructions || 'Non renseignées' }}</p>

            <div class="detail-row">
              <span><strong>Temps de préparation:</strong> {{ selectedRecipe?.prep_time_minutes || 'N/A' }} min</span>
              <span><strong>Temps de cuisson:</strong> {{ selectedRecipe?.cook_time_minutes || 'N/A' }} min</span>
            </div>

            <div class="detail-row">
              <span><strong>Portions:</strong> {{ selectedRecipe?.servings || 'N/A' }}</span>
              <span><strong>Coût estimé:</strong> {{ selectedRecipe?.estimated_cost || 'N/A' }}€</span>
              <span class="nutriscore nutriscore-{{ selectedRecipe?.nutriscore }}">
                {{ selectedRecipe?.nutriscore }}
              </span>
            </div>

            <div class="ingredients-section">
              <h4>Ingrédients</h4>
              <div *ngIf="selectedRecipe && selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0">
                <div *ngFor="let ing of selectedRecipe.ingredients" class="ingredient-item">
                  {{ ing.quantity }} {{ ing.unit }} {{ ing.ingredient_name || 'Ingrédient inconnu' }}
                </div>
              </div>
              <p *ngIf="!selectedRecipe || !selectedRecipe.ingredients || selectedRecipe.ingredients.length === 0">
                Aucun ingrédient ajouté
              </p>

              <div class="add-ingredient-form">
                <h5>Ajouter un ingrédient</h5>
                <select [(ngModel)]="newIngredient.ingredientId" name="ingredient">
                  <option value="">Sélectionner un ingrédient</option>
                  <option *ngFor="let ing of availableIngredients" [value]="ing.id">
                    {{ ing.name }}
                  </option>
                </select>
                <input type="number" [(ngModel)]="newIngredient.quantity" placeholder="Quantité" min="0" step="0.1" />
                <input type="text" [(ngModel)]="newIngredient.unit" placeholder="Unité (g, ml, pièce...)" />
                <button class="btn-primary" (click)="addIngredient()" [disabled]="!newIngredient.ingredientId">
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeDetailsModal()">Fermer</button>
          </div>
        </div>
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
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .recipe-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
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

    .ingredients-form-section {
      margin: 20px 0;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .ingredients-form-section h4 {
      margin-top: 0;
    }

    .temp-ingredients-list {
      margin: 10px 0;
    }

    .temp-ingredient-item {
      padding: 8px;
      margin: 5px 0;
      background: white;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-remove {
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 1.2em;
    }

    .add-temp-ingredient {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 10px;
    }

    .add-temp-ingredient select,
    .add-temp-ingredient input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .add-temp-ingredient select {
      flex: 2;
    }

    .add-temp-ingredient input[type="number"] {
      flex: 1;
    }

    .add-temp-ingredient input[type="text"] {
      flex: 1;
    }

    .btn-add-ing {
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 1.2em;
    }

    .btn-add-ing:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-add-ing:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 700px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .recipe-details {
      margin: 20px 0;
    }

    .detail-row {
      display: flex;
      gap: 20px;
      margin: 10px 0;
      align-items: center;
    }

    .ingredients-section {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .ingredient-item {
      padding: 8px;
      margin: 5px 0;
      background: white;
      border-radius: 4px;
    }

    .add-ingredient-form {
      margin-top: 15px;
      padding: 15px;
      background: #fff;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .add-ingredient-form h5 {
      margin-top: 0;
    }

    .add-ingredient-form select,
    .add-ingredient-form input {
      width: calc(25% - 10px);
      margin-right: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .add-ingredient-form button {
      width: auto;
      margin: 0;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
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

  // Ingrédients temporaires pour le formulaire de création
  tempIngredients: Array<{ingredientId: string, quantity: number, unit: string}> = [];
  newTempIngredient = {
    ingredientId: '',
    quantity: 0,
    unit: ''
  };

  // Modal détails
  showDetailsModal = false;
  selectedRecipe: Recipe | null = null;
  availableIngredients: Ingredient[] = [];
  newIngredient = {
    ingredientId: '',
    quantity: 0,
    unit: ''
  };

  constructor(
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.loadIngredients();
  }

  loadIngredients(): void {
    this.ingredientService.getAllIngredients().subscribe({
      next: (ingredients) => {
        this.availableIngredients = ingredients;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ingrédients:', error);
      }
    });
  }

  loadRecipes(): void {
    console.log('🔄 loadRecipes() appelé');
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        console.log('✅ Recettes reçues du backend:', recipes);
        console.log('📊 Nombre de recettes:', recipes.length);
        this.recipes = recipes;
        console.log('📦 this.recipes après assignation:', this.recipes);
        console.log('🔄 Forçage de la détection de changement...');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des recettes:', error);
      }
    });
  }

  createRecipe(): void {
    if (!this.newRecipe.name) return;

    this.recipeService.createRecipe(this.newRecipe).subscribe({
      next: (response) => {
        console.log('Recette créée:', response);
        const recipeId = response.id;

        // Ajouter les ingrédients si présents
        if (this.tempIngredients.length > 0) {
          this.addIngredientsToNewRecipe(recipeId);
        } else {
          this.cancelCreate();
          this.loadRecipes();
          alert('✅ Recette créée avec succès !');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        alert('❌ Erreur lors de la création de la recette: ' + (error.error?.error || error.message));
      }
    });
  }

  addIngredientsToNewRecipe(recipeId: number): void {
    let completed = 0;
    const total = this.tempIngredients.length;

    this.tempIngredients.forEach(ing => {
      this.recipeService.addIngredientToRecipe(
        recipeId,
        Number(ing.ingredientId),
        ing.quantity,
        ing.unit
      ).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.cancelCreate();
            this.loadRecipes();
            alert(`✅ Recette créée avec ${total} ingrédient(s) !`);
          }
        },
        error: (error) => {
          console.error('Erreur ajout ingrédient:', error);
          completed++;
          if (completed === total) {
            this.cancelCreate();
            this.loadRecipes();
            alert('⚠️ Recette créée mais certains ingrédients n\'ont pas pu être ajoutés');
          }
        }
      });
    });
  }

  addTempIngredient(): void {
    if (!this.newTempIngredient.ingredientId) return;
    this.tempIngredients.push({...this.newTempIngredient});
    this.newTempIngredient = { ingredientId: '', quantity: 0, unit: '' };
  }

  removeTempIngredient(index: number): void {
    this.tempIngredients.splice(index, 1);
  }

  getIngredientNameById(id: string): string {
    return this.availableIngredients.find(i => i.id === Number(id))?.name || 'Inconnu';
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
    this.tempIngredients = [];
    this.newTempIngredient = { ingredientId: '', quantity: 0, unit: '' };
  }

  viewRecipeDetails(recipe: Recipe): void {
    // Charger les détails complets de la recette avec ingrédients et tags
    this.recipeService.getRecipeById(recipe.id!).subscribe({
      next: (fullRecipe) => {
        this.selectedRecipe = fullRecipe;
        this.showDetailsModal = true;
        this.resetNewIngredient();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        alert('Erreur lors du chargement des détails de la recette');
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRecipe = null;
    this.resetNewIngredient();
  }

  addIngredient(): void {
    if (!this.newIngredient.ingredientId || !this.selectedRecipe?.id) return;

    this.recipeService.addIngredientToRecipe(
      this.selectedRecipe.id,
      Number(this.newIngredient.ingredientId),
      this.newIngredient.quantity,
      this.newIngredient.unit
    ).subscribe({
      next: () => {
        // Recharger les détails de la recette pour afficher le nouvel ingrédient
        this.viewRecipeDetails(this.selectedRecipe!);
        this.resetNewIngredient();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de l\'ingrédient:', error);
        alert('Erreur lors de l\'ajout de l\'ingrédient');
      }
    });
  }

  resetNewIngredient(): void {
    this.newIngredient = {
      ingredientId: '',
      quantity: 0,
      unit: ''
    };
  }
}
