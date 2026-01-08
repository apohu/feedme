import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';
import { RecipeService } from '../../services/recipe.service';
import { CalendarEntry, NutritionScore, Recipe } from '../../models/types';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-container">
      <h2>Mon Calendrier Alimentaire</h2>

      <div class="date-controls">
        <button (click)="previousWeek()">← Semaine précédente</button>
        <span class="current-period">{{ getCurrentWeekDisplay() }}</span>
        <button (click)="nextWeek()">Semaine suivante →</button>
      </div>

      <div class="nutrition-score" *ngIf="nutritionScore">
        <h3>Score Nutritionnel</h3>
        <div class="score-value">{{ nutritionScore.weekly_score.toFixed(1) }}/100</div>
        <div class="score-distribution">
          <div class="score-item" *ngFor="let item of getScoreDistribution()">
            <span class="nutriscore nutriscore-{{ item.grade }}">{{ item.grade }}</span>
            <span>{{ item.count }} repas</span>
          </div>
        </div>
      </div>

      <div class="calendar-grid">
        <div *ngFor="let day of weekDays" class="day-column">
          <h3>{{ day.name }}</h3>
          <p class="date">{{ formatDate(day.date) }}</p>

          <div class="meals">
            <div *ngFor="let mealType of mealTypes" class="meal-slot">
              <h4>{{ getMealTypeLabel(mealType) }}</h4>
              <div class="meal-entry"
                   *ngIf="getMealForDay(day.date, mealType) as meal; else emptyMeal">
                <p>{{ meal.recipe?.name || 'Repas personnalisé' }}</p>
                <span class="nutriscore nutriscore-{{ meal.nutriscore }}">
                  {{ meal.nutriscore }}
                </span>
                <button class="btn-edit" (click)="editMeal(meal)">✏️</button>
              </div>
              <ng-template #emptyMeal>
                <button class="btn-add" (click)="addMeal(day.date, mealType)">
                  + Ajouter
                </button>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'ajout/édition de repas -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ modalMode === 'add' ? 'Ajouter un repas' : 'Modifier le repas' }}</h3>

          <div class="form-group">
            <label>{{ formatDate(modalDate) }} - {{ getMealTypeLabel(modalMealType) }}</label>
          </div>

          <div class="form-group">
            <label>Recette</label>
            <select [(ngModel)]="selectedRecipeId" name="recipe">
              <option value="">Sélectionner une recette</option>
              <option *ngFor="let recipe of availableRecipes" [value]="recipe.id">
                {{ recipe.name }} ({{ recipe.nutriscore }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Nombre de portions</label>
            <input type="number" [(ngModel)]="servings" name="servings" min="1" />
          </div>

          <div class="form-actions">
            <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" (click)="saveMeal()" [disabled]="!selectedRecipeId">
              {{ modalMode === 'add' ? 'Ajouter' : 'Modifier' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
    }

    .date-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0;
    }

    .date-controls button {
      padding: 10px 20px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .nutrition-score {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .score-value {
      font-size: 2em;
      font-weight: bold;
      color: #4CAF50;
      margin: 10px 0;
    }

    .score-distribution {
      display: flex;
      gap: 15px;
      margin-top: 10px;
    }

    .score-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
    }

    .day-column {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }

    .day-column h3 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .date {
      font-size: 0.85em;
      color: #666;
      margin-bottom: 10px;
    }

    .meal-slot {
      margin: 10px 0;
      padding: 10px;
      background: #fafafa;
      border-radius: 4px;
    }

    .meal-slot h4 {
      margin: 0 0 5px 0;
      font-size: 0.9em;
      color: #555;
    }

    .meal-entry {
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }

    .meal-entry p {
      margin: 0 0 5px 0;
      font-size: 0.9em;
    }

    .btn-add {
      width: 100%;
      padding: 8px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-edit {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2em;
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
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-content h3 {
      margin-top: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-primary:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
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
  `]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  weekDays: { name: string; date: Date }[] = [];
  mealTypes = ['lunch', 'dinner'];
  entries: CalendarEntry[] = [];
  nutritionScore: NutritionScore | null = null;

  // Modal properties
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  modalDate: Date = new Date();
  modalMealType: 'lunch' | 'dinner' = 'lunch';
  selectedRecipeId: number | string = '';
  servings = 2;
  availableRecipes: Recipe[] = [];
  editingEntryId?: number;

  constructor(
    private calendarService: CalendarService,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.generateWeekDays();
    this.loadEntries();
    this.loadScore();
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        this.availableRecipes = recipes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des recettes:', error);
      }
    });
  }

  generateWeekDays(): void {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);

    this.weekDays = [];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        name: dayNames[i],
        date: date
      });
    }
  }

  loadEntries(): void {
    const startDate = this.weekDays[0].date.toISOString().split('T')[0];
    const endDate = this.weekDays[6].date.toISOString().split('T')[0];

    this.calendarService.getEntriesByDateRange(startDate, endDate).subscribe({
      next: (entries) => {
        this.entries = entries;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des entrées:', error);
      }
    });
  }

  loadScore(): void {
    const startDate = this.weekDays[0].date.toISOString().split('T')[0];
    const endDate = this.weekDays[6].date.toISOString().split('T')[0];

    this.calendarService.calculateScore(startDate, endDate).subscribe({
      next: (score) => {
        this.nutritionScore = score;
      },
      error: (error) => {
        console.error('Erreur lors du calcul du score:', error);
      }
    });
  }

  getMealForDay(date: Date, mealType: string): CalendarEntry | undefined {
    const dateStr = date.toISOString().split('T')[0];
    return this.entries.find(e =>
      e.date.toString().split('T')[0] === dateStr && e.meal_type === mealType
    );
  }

  getMealTypeLabel(mealType: string): string {
    const labels: any = {
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Snack'
    };
    return labels[mealType] || mealType;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  getCurrentWeekDisplay(): string {
    return `Semaine du ${this.formatDate(this.weekDays[0].date)} au ${this.formatDate(this.weekDays[6].date)}`;
  }

  previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
    this.loadEntries();
    this.loadScore();
  }

  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
    this.loadEntries();
    this.loadScore();
  }

  addMeal(date: Date, mealType: string): void {
    this.modalMode = 'add';
    this.modalDate = date;
    this.modalMealType = mealType;
    this.selectedRecipeId = '';
    this.servings = 2;
    this.editingEntryId = undefined;
    this.showModal = true;
  }

  editMeal(meal: CalendarEntry): void {
    this.modalMode = 'edit';
    this.modalDate = new Date(meal.date);
    this.modalMealType = meal.meal_type;
    this.selectedRecipeId = meal.recipe_id || '';
    this.servings = meal.servings || 2;
    this.editingEntryId = meal.id;
    this.showModal = true;
  }

  saveMeal(): void {
    if (!this.selectedRecipeId) return;

    const recipe = this.availableRecipes.find(r => r.id === Number(this.selectedRecipeId));
    if (!recipe) return;

    const entry: CalendarEntry = {
      date: this.modalDate.toISOString().split('T')[0],
      meal_type: this.modalMealType,
      recipe_id: Number(this.selectedRecipeId),
      servings: this.servings,
      nutriscore: recipe.nutriscore || 'C'
    };

    if (this.modalMode === 'edit' && this.editingEntryId) {
      // Update existing entry
      this.calendarService.updateEntry(this.editingEntryId, entry).subscribe({
        next: () => {
          this.loadEntries();
          this.loadScore();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour du repas');
        }
      });
    } else {
      // Create new entry
      this.calendarService.createEntry(entry).subscribe({
        next: () => {
          this.loadEntries();
          this.loadScore();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          alert('Erreur lors de l\'ajout du repas');
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  getScoreDistribution(): any[] {
    if (!this.nutritionScore) return [];
    const dist = this.nutritionScore.breakdown.nutriscore_distribution;
    return Object.entries(dist).map(([grade, count]) => ({ grade, count }));
  }
}
