import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Menu, MenuSuggestionCriteria } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends ApiService {
  private menuUrl = `${this.apiUrl}/menus`;

  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.menuUrl);
  }

  getMenuById(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${this.menuUrl}/${id}`);
  }

  createMenu(menu: Menu): Observable<any> {
    return this.http.post(this.menuUrl, menu);
  }

  updateMenu(id: number, menu: Partial<Menu>): Observable<any> {
    return this.http.put(`${this.menuUrl}/${id}`, menu);
  }

  deleteMenu(id: number): Observable<any> {
    return this.http.delete(`${this.menuUrl}/${id}`);
  }

  generateSuggestion(criteria: MenuSuggestionCriteria): Observable<any> {
    return this.http.post(`${this.menuUrl}/suggest`, criteria);
  }
}
