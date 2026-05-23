import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Member, MemberRequest } from '../models/member.model';
import { PageResponse } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/v1/members`;

  list(query: string = '', page: number = 0, size: number = 20): Observable<PageResponse<Member>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (query) {
      params = params.set('q', query);
    }
    return this.http.get<PageResponse<Member>>(this.base, { params });
  }

  get(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.base}/${id}`);
  }

  create(request: MemberRequest): Observable<Member> {
    return this.http.post<Member>(this.base, request);
  }

  update(id: number, request: MemberRequest): Observable<Member> {
    return this.http.put<Member>(`${this.base}/${id}`, request);
  }

  deactivate(id: number): Observable<Member> {
    return this.http.post<Member>(`${this.base}/${id}/deactivate`, {});
  }
}
