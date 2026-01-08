import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CalendarEntry, NutritionScore } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class CalendarService extends ApiService {
  private calendarUrl = `${this.apiUrl}/calendar`;

  getEntriesByDate(date: string): Observable<CalendarEntry[]> {
    return this.http.get<CalendarEntry[]>(`${this.calendarUrl}/date/${date}`);
  }

  getEntriesByDateRange(startDate: string, endDate: string): Observable<CalendarEntry[]> {
    return this.http.get<CalendarEntry[]>(`${this.calendarUrl}/range`, {
      params: { startDate, endDate }
    });
  }

  createEntry(entry: CalendarEntry): Observable<any> {
    return this.http.post(this.calendarUrl, entry);
  }

  updateEntry(id: number, entry: Partial<CalendarEntry>): Observable<any> {
    return this.http.put(`${this.calendarUrl}/${id}`, entry);
  }

  deleteEntry(id: number): Observable<any> {
    return this.http.delete(`${this.calendarUrl}/${id}`);
  }

  calculateScore(startDate: string, endDate: string): Observable<NutritionScore> {
    return this.http.get<NutritionScore>(`${this.calendarUrl}/score`, {
      params: { startDate, endDate }
    });
  }
}
