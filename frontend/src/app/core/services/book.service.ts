import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Book, BookRequest } from '../models/book.model';
import { PageResponse } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/v1/books`;

  list(query: string = '', page: number = 0, size: number = 20): Observable<PageResponse<Book>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (query) {
      params = params.set('q', query);
    }
    return this.http.get<PageResponse<Book>>(this.base, { params });
  }

  get(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.base}/${id}`);
  }

  create(request: BookRequest): Observable<Book> {
    return this.http.post<Book>(this.base, request);
  }

  update(id: number, request: BookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
