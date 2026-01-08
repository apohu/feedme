import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Recipe } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class RecipeService extends ApiService {
  private recipeUrl = `${this.apiUrl}/recipes`;

  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.recipeUrl);
  }

  getRecipeById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.recipeUrl}/${id}`);
  }

  createRecipe(recipe: Recipe): Observable<any> {
    return this.http.post(this.recipeUrl, recipe);
  }

  updateRecipe(id: number, recipe: Partial<Recipe>): Observable<any> {
    return this.http.put(`${this.recipeUrl}/${id}`, recipe);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.recipeUrl}/${id}`);
  }

  searchRecipes(criteria: {
    tags?: number[];
    maxCost?: number;
    maxPrepTime?: number;
    nutriscore?: string[];
    excludeIngredients?: number[];
  }): Observable<Recipe[]> {
    const params: any = {};
    if (criteria.tags) params.tags = criteria.tags.join(',');
    if (criteria.maxCost) params.maxCost = criteria.maxCost;
    if (criteria.maxPrepTime) params.maxPrepTime = criteria.maxPrepTime;
    if (criteria.nutriscore) params.nutriscore = criteria.nutriscore.join(',');
    if (criteria.excludeIngredients) params.excludeIngredients = criteria.excludeIngredients.join(',');

    return this.http.get<Recipe[]>(`${this.recipeUrl}/search`, { params });
  }

  addIngredientToRecipe(recipeId: number, ingredientId: number, quantity: number, unit: string): Observable<any> {
    return this.http.post(`${this.recipeUrl}/${recipeId}/ingredients`, {
      ingredientId,
      quantity,
      unit
    });
  }

  addTagToRecipe(recipeId: number, tagId: number): Observable<any> {
    return this.http.post(`${this.recipeUrl}/${recipeId}/tags`, { tagId });
  }
}
