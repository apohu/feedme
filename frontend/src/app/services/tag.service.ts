import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tag, TagCategory } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TagService extends ApiService {
  private tagUrl = `${this.apiUrl}/tags`;

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.tagUrl);
  }

  getTagById(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.tagUrl}/${id}`);
  }

  getTagsByCategory(category: TagCategory): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.tagUrl}/category/${category}`);
  }

  createTag(tag: Tag): Observable<any> {
    return this.http.post(this.tagUrl, tag);
  }

  updateTag(id: number, tag: Partial<Tag>): Observable<any> {
    return this.http.put(`${this.tagUrl}/${id}`, tag);
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete(`${this.tagUrl}/${id}`);
  }
}
