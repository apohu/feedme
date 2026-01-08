import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Ingredient } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class IngredientService extends ApiService {
  private ingredientUrl = `${this.apiUrl}/ingredients`;

  getAllIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.ingredientUrl);
  }

  getIngredientById(id: number): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.ingredientUrl}/${id}`);
  }

  createIngredient(ingredient: Ingredient): Observable<any> {
    return this.http.post(this.ingredientUrl, ingredient);
  }

  updateIngredient(id: number, ingredient: Partial<Ingredient>): Observable<any> {
    return this.http.put(`${this.ingredientUrl}/${id}`, ingredient);
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${this.ingredientUrl}/${id}`);
  }

  searchIngredients(name: string): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.ingredientUrl}/search`, {
      params: { name }
    });
  }
}
